import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SmsModule } from 'src/sms/sms.module';
import { DriversModule } from 'src/drivers/drivers.module';
import { CarSeatsModule } from 'src/car-seats/car-seats.module';
import { ImageModule } from 'src/images/image.module';
@Module({
    imports: [
      TypeOrmModule.forFeature([User, Otp]),
      JwtModule.registerAsync({
        imports: [ConfigModule], // Import ConfigModule to use ConfigService
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET'), // Fetch secret from .env
          signOptions: { expiresIn: '1d' },
        }),
        inject: [ConfigService], // Inject ConfigService
      }),
      SmsModule,
      DriversModule,
      CarSeatsModule,
      ImageModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
