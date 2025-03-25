import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: false, // Используем TLS (порт 2525)
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
            tls: {
                rejectUnauthorized: false, // Игнорируем самоподписанные сертификаты (если есть)
            },
        });
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const mailOptions = {
            from: this.configService.get<string>('SMTP_USER'),
            to,
            subject: 'Ваш код OTP',
            text: `Ваш код OTP: ${otp}`,
            html: `
      <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 400px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2>Ваш код OTP</h2>
          <p>Используйте этот код для подтверждения:</p>
          <div style="font-size: 24px; font-weight: bold; color: #333; background: #f8f8f8; padding: 10px; display: inline-block; margin: 10px 0; border-radius: 5px;">
            ${otp}
          </div>
          <p>Этот код действителен в течение 10 минут.</p>
          <p>Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
          <div style="margin-top: 20px; font-size: 12px; color: #777;">С уважением, <br> Poputi.tj</div>
        </div>
      </div>
    `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`OTP отправлен на ${to}`);
        } catch (error) {
            console.error('Ошибка при отправке OTP:', error);
            throw new Error(
                `Не удалось отправить OTP ${this.configService.get<string>(
                    'SMTP_USER',
                )}`,
            );
        }
    }
}
