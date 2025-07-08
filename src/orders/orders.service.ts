import {
    BadGatewayException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CallbackDto, DcCallbackDto } from './dto/callback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository, In } from 'typeorm';
import { Trip } from 'src/trips/entities/trip.entity';
import { TripSeat } from 'src/trip-seats/entities/trip-seat.entity';
import * as md5 from 'md5';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Trip)
        private readonly tripRepository: Repository<Trip>,
        @InjectRepository(TripSeat)
        private readonly tripSeatRepository: Repository<TripSeat>,
        private readonly smsService: SmsService,
    ) { }

    async create(
        user_id: string,
        createOrderDto: CreateOrderDto,
    ): Promise<any> {
        const trip = await this.tripRepository.findOne({
            where: {
                id: createOrderDto.trip_id,
            },
        });

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        const tripSeats = await this.tripRepository
            .createQueryBuilder('trip')
            .leftJoinAndSelect('trip.tripSeats', 'tripSeats')
            .where('trip.id = :tripId', { tripId: createOrderDto.trip_id })
            .andWhere('tripSeats.seat_id IN (:...seatIds)', {
                seatIds: createOrderDto.seat_ids,
            })
            .getOne();

        const seatsTotalPrice = tripSeats.tripSeats.reduce(
            (sum, seat) => Number(sum) + Number(seat.price),
            0,
        );
        const bookingFee = 0 * tripSeats.tripSeats.length;
        const total_price = seatsTotalPrice + bookingFee;

        const order = this.orderRepository.create({
            user_id: user_id,
            user_phone: createOrderDto.user_phone,
            seat_ids: createOrderDto.seat_ids,
            trip_id: createOrderDto.trip_id,
            total_price: total_price,
            gate: createOrderDto.gate,
            status: 'pending',
        });

        const newOrder = await this.orderRepository.save(order);
        const order_id = newOrder.id;

        if (createOrderDto.gate === 'dc') {
            const merchant = '200038';
            const secretKey = 'E8EpMSmmEDw7';
            const sign = md5(merchant + order_id + secretKey);

            const payload = {
                merchant,
                order_id,
                exp_time: 40,
                currency: 'TJS',
                amount: Number(total_price) * 100,
                phone: createOrderDto.user_phone.replace(/[^0-9]/g, ''),
                description: 'Оплата за билет',
                callback_url:
                    'https://test-api.poputi.tj/api/client/orders/callback-dc',
                sign,
            };

            try {
                const response = await fetch(
                    'https://invoice.dc.tj/v1/create',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    },
                );

                const data = await response.json();

                if (data.code !== 200) {
                    throw new Error(data.message || 'Invoice creation failed');
                }

                return {
                    success: true,
                    redirect_url: data.invoice_url.replace(' ', '%20'),
                };
            } catch (error) {
                console.error('DC Invoice creation error:', error);
                throw new Error('Failed to create DC invoice');
            }
        } else if (createOrderDto.gate === 'alif') {
            const key = '107632';
            const password = '8ETnInFmCMw2TAFx8ECP';
            const callbackUrl =
                'https://test-api.poputi.tj/api/client/orders/callback';
            const returnUrl = 'https://poputi.tj/';
            const gate = 'wallet';
            const info = 'Оплата за билет';

            return {
                success: true,
                data: {
                    key,
                    callbackUrl,
                    returnUrl,
                    amount: total_price,
                    orderId: order_id,
                    gate,
                    info,
                    password,
                    phone: createOrderDto.user_phone.replace(/[^0-9]/g, ''),
                },
            };
        }

        return new BadGatewayException('Payment gateway not supported');
    }

    async callback(dto: CallbackDto) {
        console.log('Alif Callback', dto);
        try {
            const order = await this.orderRepository.findOne({
                where: { id: dto.orderId },
            });

            if (!order) {
                console.error('Заказ не найден', dto.orderId);
                return { success: false, message: 'Заказ не найден' };
            }

            if (order.status === 'paid') {
                return { success: true, message: 'Заказ уже оплачен' };
            }

            if (dto.status === 'ok' || dto.amount == order.total_price) {
                const tripSeats = await this.tripSeatRepository.find({
                    where: {
                        trip_id: order.trip_id,
                        seat_id: In(order.seat_ids),
                        status: 'available',
                    },
                });

                if (tripSeats.length !== order.seat_ids.length) {
                    await this.orderRepository.update(order.id, {
                        status: 'failed',
                        transaction_id: dto.transactionId,
                    });
                    return {
                        success: false,
                        message: 'Некоторые места уже заняты',
                    };
                }

                await this.orderRepository.update(order.id, {
                    status: 'paid',
                    transaction_id: dto.transactionId,
                    pay_date: new Date(),
                });

                await this.bookTripSeats(order.trip_id, order.seat_ids);

                const driverInfo = await this.getDriverInfo(order.trip_id);

                if (driverInfo) {
                    const {
                        driverName,
                        phoneNumber,
                        carBrand,
                        carModel,
                        carColor,
                        plateNumber,
                    } = driverInfo;

                    const smsMessage = `
Вы успешно оплатили дорожный сбор.
Водитель: ${driverName}
Телефон: ${phoneNumber}
Авто: ${carBrand} ${carModel}, ${carColor}, номер ${plateNumber}
Приятной поездки`;

                    console.log('Sending SMS with driver details:', {
                        driverName,
                        phone: phoneNumber,
                        car: `${carBrand} ${carModel}`,
                        plateNumber,
                    });

                    this.smsService.sendSms(
                        phoneNumber,
                        `Пасажир: ${order.user_phone} успешно оплатил дорожный сбор.`,
                    );
                    this.smsService.sendSms(order.user_phone, smsMessage);
                } else {
                    const fallbackSms = `
Вы успешно оплатили дорожный сбор.
Ваш заказ подтвержден.
Приятной поездки`;

                    console.log(
                        'Sending fallback SMS - driver info not available',
                    );
                    this.smsService.sendSms(order.user_phone, fallbackSms);
                }

                return { success: true, message: 'Оплата прошла успешно' };
            } else {
                console.log('Оплата не прошла', dto);
                await this.orderRepository.update(order.id, {
                    status: 'failed',
                    transaction_id: dto.transactionId,
                });

                return { success: false, message: 'Оплата не прошла' };
            }
        } catch (error) {
            console.error('Ошибка при обработке оплаты', error);
            return { success: false, message: 'Ошибка при обработке оплаты' };
        }
    }

    async dccallback(dto: DcCallbackDto) {
        console.log('DC CallBack', dto);
        try {
            const order = await this.orderRepository.findOne({
                where: { id: dto.order_id },
            });

            if (!order) {
                console.error('Заказ не найден', dto.order_id);
                return { success: false, message: 'Заказ не найден' };
            }

            if (order.status === 'paid') {
                return { success: true, message: 'Заказ уже оплачен' };
            }

            if (dto.amount == order.total_price || dto.status === 'Paid') {
                const tripSeats = await this.tripSeatRepository.find({
                    where: {
                        trip_id: order.trip_id,
                        seat_id: In(order.seat_ids),
                        status: 'available',
                    },
                });

                if (tripSeats.length !== order.seat_ids.length) {
                    await this.orderRepository.update(order.id, {
                        status: 'failed',
                        transaction_id: dto.payid,
                    });
                    return {
                        success: false,
                        message: 'Некоторые места уже заняты',
                    };
                }

                await this.orderRepository.update(order.id, {
                    status: 'paid',
                    transaction_id: dto.payid,
                    pay_date: new Date(),
                });

                await this.bookTripSeats(order.trip_id, order.seat_ids);

                const driverInfo = await this.getDriverInfo(order.trip_id);

                if (driverInfo) {
                    const {
                        driverName,
                        phoneNumber,
                        carBrand,
                        carModel,
                        carColor,
                        plateNumber,
                    } = driverInfo;

                    const smsMessage = `
Вы успешно оплатили дорожный сбор.
Водитель: ${driverName}
Телефон: ${phoneNumber}
Авто: ${carBrand} ${carModel}, ${carColor}, номер ${plateNumber}
Приятной поездки`;

                    console.log('Sending SMS with driver details:', {
                        driverName,
                        phone: phoneNumber,
                        car: `${carBrand} ${carModel}`,
                        plateNumber,
                    });

                    this.smsService.sendSms(
                        phoneNumber,
                        `Пасажир: ${order.user_phone} успешно оплатил дорожный сбор.`,
                    );
                    this.smsService.sendSms(order.user_phone, smsMessage);
                } else {
                    const fallbackSms = `
Вы успешно оплатили дорожный сбор.
Ваш заказ подтвержден.
Приятной поездки`;

                    console.log(
                        'Sending fallback SMS - driver info not available',
                    );
                    this.smsService.sendSms(order.user_phone, fallbackSms);
                }

                return { success: true, message: 'Оплата прошла успешно' };
            } else {
                console.log('Оплата не прошла', dto);
                await this.orderRepository.update(order.id, {
                    status: 'failed',
                    transaction_id: dto.payid,
                });

                return { success: false, message: 'Оплата не прошла' };
            }
        } catch (error) {
            console.error('Ошибка при обработке оплаты', error);
            return { success: false, message: 'Ошибка при обработке оплаты' };
        }
    }

    private async getDriverInfo(tripId: string) {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId },
            relations: [
                'driver',
                'driver.user',
                'driver.carBrand',
                'driver.carModel',
                'driver.carColor',
            ],
        });

        if (!trip || !trip.driver) {
            return null;
        }

        const driverInfo = trip.driver;
        return {
            driverName: driverInfo.user.fullname,
            phoneNumber: driverInfo.user.phone_number,
            carBrand: driverInfo.carBrand.name,
            carModel: driverInfo.carModel.name,
            carColor: driverInfo.carColor.name,
            plateNumber: driverInfo.plate_number,
        };
    }

    private async bookTripSeats(tripId: string, seatIds: number[]) {
        await this.tripSeatRepository
            .createQueryBuilder()
            .update(TripSeat)
            .set({ status: 'booked' })
            .where('trip_id = :tripId', { tripId })
            .andWhere('seat_id IN (:...seatIds)', { seatIds })
            .execute();
    }

    findOne(id: number) {
        return this.orderRepository.findOne({
            where: { id: id.toString() },
            relations: ['trip'],
        });
    }

    async getOrderDetails(orderId: string) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['trip'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Get trip seats information
        const tripSeats = await this.tripSeatRepository.find({
            where: {
                trip_id: order.trip_id,
                seat_id: In(order.seat_ids),
            },
        });

        // Get driver information
        const driverInfo = await this.getDriverInfo(order.trip_id);

        return {
            ...order,
            tripSeats,
            driverInfo,
        };
    }

    update(id: number, updateOrderDto: UpdateOrderDto) {
        return `This action updates a #${id} order`;
    }

    remove(id: number) {
        return `This action removes a #${id} order`;
    }

    async refundOrder(orderId: string) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== 'paid') {
            throw new BadGatewayException(
                'Order is not paid and cannot be refunded',
            );
        }

        // Update order status to refunded
        await this.orderRepository.update(orderId, {
            status: 'refunded',
        });

        // Free up the seats
        await this.tripSeatRepository
            .createQueryBuilder()
            .update(TripSeat)
            .set({ status: 'available' })
            .where('trip_id = :tripId', { tripId: order.trip_id })
            .andWhere('seat_id IN (:...seatIds)', { seatIds: order.seat_ids })
            .execute();

        console.log('Order refunded and seats freed up');
        return { success: true, message: 'Order refunded successfully' };
    }

    async getUserOrders(userId: string) {
        return this.orderRepository.find({
            where: { user_id: userId },
            relations: ['trip'],
            order: { created_at: 'DESC' },
        });
    }

    async findAll() {
        return this.orderRepository.find({
            relations: ['trip'],
            order: { created_at: 'DESC' },
        });
    }

    async getTripWithDriverInfo(tripId: string) {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId },
            relations: [
                'driver',
                'driver.user',
                'driver.carBrand',
                'driver.carModel',
                'driver.carColor',
                'tripSeats',
            ],
        });

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        return trip;
    }
}
