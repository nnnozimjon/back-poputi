import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';

@Module({
  providers: [SmsService],
  exports: [SmsService], // <- Make it available to other modules
})
export class SmsModule {}
