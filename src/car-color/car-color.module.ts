import { Module } from '@nestjs/common';
import { CarColorService } from './car-color.service';
import { CarColorController } from './car-color.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarColor } from './entities/car-color.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarColor])],
  controllers: [CarColorController],
  providers: [CarColorService],
})
export class CarColorModule {}
