import { Module } from '@nestjs/common';
import { CarBodyTypeService } from './car-body-type.service';
import { CarBodyTypeController } from './car-body-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarBodyType } from './entities/car-body-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarBodyType])],
  controllers: [CarBodyTypeController],
  providers: [CarBodyTypeService],
})
export class CarBodyTypeModule {}
