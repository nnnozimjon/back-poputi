import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CitiesModule } from './cities/cities.module';
import { UsersModule } from './users/users.module';
import { CarBrandModule } from './car-brand/car-brand.module';
import { CarModelModule } from './car-model/car-model.module';
import { CarBodyTypeModule } from './car-body-type/car-body-type.module';
import { JwtService } from '@nestjs/jwt';
import { JwtMiddleware } from './jwt.middleware';
import { CarColorModule } from './car-color/car-color.module';
import { DriversModule } from './drivers/drivers.module';
import { CarSeatsModule } from './car-seats/car-seats.module';
import { TripsModule } from './trips/trips.module';
import { BookingModule } from './booking/booking.module';
import { TripSeatsModule } from './trip-seats/trip-seats.module';
import { DriverPreferenceModule } from './driver-preference/driver-preference.module';
import { PreferencesModule } from './preferences/preferences.module';
import { ImageModule } from './images/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
        // do NOT use synchronize: true in real projects
        synchronize: true,
      }),
    }),
    CitiesModule,
    UsersModule,
    CarBrandModule,
    CarModelModule,
    CarBodyTypeModule,
    CarColorModule,
    DriversModule,
    CarSeatsModule,
    TripsModule,
    BookingModule,
    TripSeatsModule,
    DriverPreferenceModule,
    PreferencesModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, ConfigService],
})



export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .exclude(
        { path: 'trips', method: RequestMethod.GET }, 
        { path: 'trips/:id', method: RequestMethod.GET } 
      )
      .forRoutes('driver-preference', 'drivers/vehicle-details', 'car-seats', 'trips', 'booking', 'drivers/update', 'drivers', 'images'); // Apply to all routes, or specify specific routes
  }
}
