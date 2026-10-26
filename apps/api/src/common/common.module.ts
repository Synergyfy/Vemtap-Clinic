import { Module, Global } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PaymentService } from './services/payment.service';
import { FileStorageService } from './services/file-storage.service';

@Global()
@Module({
  providers: [
    EmailService,
    SmsService,
    PaymentService,
    FileStorageService,
  ],
  exports: [
    EmailService,
    SmsService,
    PaymentService,
    FileStorageService,
  ],
})
export class CommonModule {}