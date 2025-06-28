import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import * as md5 from 'md5';
import { SmsService } from './sms/sms.service';

interface CreateInvoiceDto {
    order_id: string;
    amount: number;
    phone?: string;
    currency?: string;
    exp_time?: number;
    description: string;
  }
  

@Injectable()
export class AppService {
    constructor(private readonly httpService: HttpService,
        private readonly smsService: SmsService
    ) {}
    private readonly merchant = '100101';
    private readonly secretKey = 'test123';
    private readonly callbackUrl = 'https://yourdomain.com/api/payments/dc-callback'; 


    async createOrder() {
        const key = '107632';
        const password = 't9gOKZYjjlKSCQ3G88Qm';
        const orderId = Math.floor(Math.random() * 1000000).toString();
        const amount = '100';
        const callbackUrl = 'https://yourdomain.com/callback';
        const returnUrl = 'https://yourdomain.com/success';
        const gate = 'wallet';
        const info = 'Headphones and USB Cable';
        const email = 'test@mail.ru';
        const phone = '992900099669';

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
        };

        // Convert formData to URLSearchParams for x-www-form-urlencoded
        const urlEncodedData = new URLSearchParams();
        Object.entries(formData).forEach(([k, v]) => {
            urlEncodedData.append(k, v);
        });

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    'https://web.alif.tj',
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

    async postCreateDcOrder(): Promise<string> {
            const order_id = '12394896';
            const amount = 500;
            const phone = '992900099669';
            const currency = 'TJS';
            const description = 'Пополнение счет 45447';
        
            const sign = md5(this.merchant + order_id + this.secretKey);
        
            const payload = {
              merchant: this.merchant,
              order_id,
              currency,
              amount,
              phone,
              description,
              callback_url: this.callbackUrl,
              sign,
            };
        
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
              this.smsService.sendSms(phone, data.invoice_url);
        
              return data;
            } catch (error) {
              console.error('DC Invoice creation error:', error);
              throw new Error('Failed to create DC invoice');
            }
          }
        
          async handleCallback(callbackBody: any): Promise<void> {
            const {
              merchant,
              order_id,
              invoice_id,
              amount,
              currency,
              payer,
              payid,
              pay_date,
              sign,
            } = callbackBody;
        
            const expectedSign = md5(merchant + order_id + this.secretKey);
            if (sign !== expectedSign) {
              throw new Error('Invalid signature from DC callback');
            }
        
            // TODO: handle successful payment (e.g. update database, send confirmation, etc.)
            console.log('✅ Payment successful:', callbackBody);
      }
      

        getHello(): string {
            return 'Hello World!';
        }
    }
