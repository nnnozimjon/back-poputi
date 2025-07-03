import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { Trip } from 'src/trips/entities/trip.entity';
import * as crypto from 'crypto';
import * as md5 from 'md5';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly httpService: HttpService,
  ) { }

  async create(user_id: string, createOrderDto: CreateOrderDto): Promise<any> {
    console.log(user_id, createOrderDto)
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
      .andWhere('tripSeats.seat_id IN (:...seatIds)', { seatIds: createOrderDto.seat_ids })
      .getOne();

    const seatsTotalPrice = tripSeats.tripSeats.reduce((sum, seat) => Number(sum) + Number(seat.price), 0);
    const bookingFee = 3 * tripSeats.tripSeats.length
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
      console.log(createOrderDto.gate)
      const merchant = '200038';
      const secretKey = 'E8EpMSmmEDw7';
      const sign = md5(merchant + order_id + secretKey);

      const payload = {
        merchant,
        order_id,
        amount: Number(total_price) * 100,
        phone: createOrderDto.user_phone.replace(/[^0-9]/g, ''),
        currency: 'TJS',
        description: 'Оплата за билет',
        callback_url: 'https://api.poputi.tj/api/client/orders/callback',
        sign,
      }
      console.log(payload)
      try {
        const response = await fetch('https://invoice.dc.tj/v1/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.code !== 200) {
          throw new Error(data.message || 'Invoice creation failed');
        }

        console.log('DC Invoice created:', data);
        // this.smsService.sendSms(phone, data.invoice_url);

        return {
          success: true,
          redirect_url: data.invoice_url.replace(" ", "%20"),
        };
      } catch (error) {
        console.error('DC Invoice creation error:', error);
        throw new Error('Failed to create DC invoice');
      }
    }

    else if (createOrderDto.gate === 'alif') {
      const key = '107632';
      const password = '8ETnInFmCMw2TAFx8ECP';
      const callbackUrl = 'https://test-api.poputi.tj/api/client/orders/callback';
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
        }
      }

    }

    return new BadGatewayException('Payment gateway not supported')
  }

  callback(dto: any) {
    console.log(dto)
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
