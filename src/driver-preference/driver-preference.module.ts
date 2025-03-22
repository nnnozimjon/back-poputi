import { Module } from '@nestjs/common';
import { DriverPreferenceService } from './driver-preference.service';
import { DriverPreferenceController } from './driver-preference.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverPreference } from './entities/driver-preference.entity';
import { Driver } from 'src/drivers/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverPreference, Driver])],
  controllers: [DriverPreferenceController],
  providers: [DriverPreferenceService],
})
export class DriverPreferenceModule {}
