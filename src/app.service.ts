import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class AppService {
    constructor(private readonly httpService: HttpService) {}

    async createOrder() {
        const key = '870304';
        const password = 'VkAAAvYeujSvcMfpp9Rv';
        const orderId = Math.floor(Math.random() * 1000000).toString();
        const amount = '20.00';
        const callbackUrl = 'https://yourdomain.com/callback';
        const returnUrl = 'https://yourdomain.com/success';
        const gate = 'wallet';
        const info = 'Headphones and USB Cable';
        const email = 'client@example.com';
        const phone = '900099669';

        // Generate hashed password using HMAC-SHA256
        const hashedPassword = crypto
            .createHmac('sha256', key)
            .update(password)
            .digest('hex');

        // Generate token using HMAC-SHA256 with hashedPassword as the secret
        const token = crypto
            .createHmac('sha256', hashedPassword)
            .update(key + orderId + amount + callbackUrl)
            .digest('hex');

        // Prepare form-data payload
        const formData = {
            key,
            token,
            callbackUrl,
            returnUrl,
            amount,
            orderId,
            gate,
            info,
            email,
            phone,
            is_market_place: "false"
        };

        // Convert formData to URLSearchParams for x-www-form-urlencoded
        const urlEncodedData = new URLSearchParams();
        Object.entries(formData).forEach(([k, v]) => {
            urlEncodedData.append(k, v);
        });

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    'https://test-web.alif.tj/v2',
                    urlEncodedData,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    },
                ),
            );
            console.log('Response from AlifPay:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error from AlifPay:', error?.response?.data || error.message);
            throw error;
        }
    }

    getHello(): string {
        return 'Hello World!';
    }
}
