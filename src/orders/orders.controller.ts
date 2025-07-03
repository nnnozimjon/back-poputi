import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post('create')
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const { id: user_id } = req["user"]
    return this.ordersService.create(user_id, dto);
  } 

  @Get('callback')
  callback(@Body() dto: any) {
    return this.ordersService.callback(dto);
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
