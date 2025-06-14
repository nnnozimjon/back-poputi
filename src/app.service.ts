import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class AppService {
    constructor(private readonly httpService: HttpService) {}

    async createOrder() {
        const key = '870304';
        const password = 'hpfkdMw6l4PLysBnbCaS';
        const orderId = '123461';
        const amount = '3.50';
        const callbackUrl = 'https://yourdomain.com/callback';
        const returnUrl = 'https://yourdomain.com/success';
        const gate = 'km';
        const info = 'Headphones and USB Cable';
        const email = 'client@example.com';
        const phone = '900099669';
        const invoices = [
            { name: 'Headphones', quantity: 1, price: 250000 },
            { name: 'USB Cable', quantity: 2, price: 50000 },
        ];

        // 1. Generate token
        const hashedPassword = crypto
            .createHmac('sha256', key) // key is the secret
            .update(password) // password is the message
            .digest('hex');

        // 2. Generate token using HMAC-SHA256 with hashedPassword as the secret
        const token = crypto
            .createHmac('sha256', hashedPassword) // hashed password is the secret
            .update(key + orderId + amount + callbackUrl) // concatenated string as message
            .digest('hex');

        // 2. Prepare request payload
        const payload = new URLSearchParams();
        payload.append('key', key);
        payload.append('token', token);
        payload.append('callbackUrl', callbackUrl);
        payload.append('returnUrl', returnUrl);
        payload.append('amount', amount);
        payload.append('orderId', orderId);
        payload.append('gate', gate);
        payload.append('info', info);
        payload.append('email', email);
        payload.append('phone', phone);
        payload.append('invoices', JSON.stringify(invoices));

        // 3. Send request to AlifPay test server
        const response: any = await firstValueFrom(
            this.httpService.post(
                'https://test-web.alif.tj',
                payload.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            ),
        );
        console.log('Response from AlifPay:', response.data);
        return response.data;
    }

    getHello(): string {
        return 'Hello World!';
    }
}
