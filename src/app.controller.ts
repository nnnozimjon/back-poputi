import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('create-order')
    create() {
        return this.appService.createOrder();
    }

    @Post('create-dc-order')
    postCreateDcOrder() {
        return this.appService.postCreateDcOrder();
    }

    @Get('create-order')
    get() {
        return this.appService.createOrder();
    }
}
