import { Module } from '@nestjs/common';
import { CarSeatsService } from './car-seats.service';
import { CarSeatsController } from './car-seats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarSeat } from './entities/car-seat.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarSeat, Driver, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to use ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Fetch secret from .env
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
  ],
  controllers: [CarSeatsController],  
  providers: [CarSeatsService],
  exports: [CarSeatsService],
})
export class CarSeatsModule {}
