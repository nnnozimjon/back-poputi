import {
    Injectable,
    BadRequestException,
    NotFoundException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class OtpService {
    constructor(
        @InjectRepository(Otp)
        private otpRepo: Repository<Otp>,
        private readonly smsService: SmsService,
    ) {}

    private generateOtp(length = 6): string {
        return Math.floor(100000 + Math.random() * 900000)
            .toString()
            .substring(0, length);
    }

    private getExpiryDate(minutes = 2): Date {
        const now = new Date();
        now.setMinutes(now.getMinutes() + minutes);
        return now;
    }

    async sendOtp(target: string, type: string): Promise<void> {
        const cleanedPhoneNumber = target
            .replace(/\D/g, '')
            .replace(/^992/, '');

        const now = new Date();

        // Find latest OTP that hasn't expired
        const existingOtp = await this.otpRepo.findOne({
            where: {
                target: cleanedPhoneNumber,
                type,
                expiresAt: MoreThan(now),
            },
            order: { expiresAt: 'DESC' }, // In case there are multiple
        });

        if (existingOtp) {
            const timeLeft =
                (existingOtp.expiresAt.getTime() - now.getTime()) / 1000;
            console.log(
                `OTP already sent. Try again in ${Math.ceil(
                    timeLeft,
                )} seconds.`,
            );
            throw new HttpException(
                {
                  statusCode: HttpStatus.TOO_MANY_REQUESTS,
                  message: `Пожалуйста, подождите ${Math.ceil(timeLeft)} секунд(ы) перед повторной отправкой кода.`
                },
                HttpStatus.TOO_MANY_REQUESTS
              );
        }

        const code = this.generateOtp();
        const expiresAt = this.getExpiryDate(); // 2 minutes later

        await this.otpRepo.save({
            target: cleanedPhoneNumber,
            type,
            code,
            expiresAt,
        });

        await this.smsService.sendSms(target, `Ваш код подтверждения: ${code}`);
        console.log(`Sent OTP ${code} to ${target} for ${type}`);
    }

    async resendOtp(target: string, type: string): Promise<void> {
        await this.otpRepo.delete({ target, type });
        await this.sendOtp(target, type);
    }

    async verifyOtp(
        target: string,
        type: string,
        code: string,
    ): Promise<boolean> {
        const cleanedPhoneNumber = target
            .replace(/\D/g, '')
            .replace(/^992/, '');
        const otp = await this.otpRepo.findOne({
            where: { target: cleanedPhoneNumber, type, code },
            order: { expiresAt: 'DESC' },
        });

        if (!otp) {
            throw new NotFoundException('Неверный код OTP');
        }

        if (otp.expiresAt < new Date()) {
            throw new BadRequestException('Срок действия OTP истёк');
        }

        await this.otpRepo.delete(otp.id);
        return true;
    }
}
