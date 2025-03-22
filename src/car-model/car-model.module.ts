import { Module } from '@nestjs/common';
import { CarModelService } from './car-model.service';
import { CarModelController } from './car-model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModel } from './entities/car-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarModel])],
  controllers: [CarModelController],
  providers: [CarModelService],
})
export class CarModelModule {}
