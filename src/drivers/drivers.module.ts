import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, User]),
  JwtModule.registerAsync({
    imports: [ConfigModule], // Import ConfigModule to use ConfigService
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'), // Fetch secret from .env
      signOptions: { expiresIn: '1d' },
    }),
    inject: [ConfigService], // Inject ConfigService
  }),],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
