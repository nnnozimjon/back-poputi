import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CallbackDto, DcCallbackDto } from './dto/callback.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post('create')
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const { id: user_id } = req["user"]
    return this.ordersService.create(user_id, dto);
  } 

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('my-orders')
  getMyOrders(@Req() req: Request) {
    const { id: user_id } = req["user"]
    return this.ordersService.getUserOrders(user_id);
  }

  @Post('callback')
  callback(@Body() dto: CallbackDto) {
    return this.ordersService.callback(dto);
  }

  @Post('callback-dc')
  dccallback(@Body() dto: DcCallbackDto) {
    return this.ordersService.dccallback(dto);
  }

  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.ordersService.refundOrder(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Get(':id/details')
  getOrderDetails(@Param('id') id: string) {
    return this.ordersService.getOrderDetails(id);
  }

  @Get('trip/:tripId/driver-info')
  getTripWithDriverInfo(@Param('tripId') tripId: string) {
    return this.ordersService.getTripWithDriverInfo(tripId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
