import { Module, Global } from '@nestjs/common';
import { LocalFileStorageService } from './services/local-file-storage.service';
import { MockEmailService } from './services/mock-email.service';
import { MockSmsService } from './services/mock-sms.service';
import { MockPaymentService } from './services/mock-payment.service';

@Global()
@Module({
  providers: [
    LocalFileStorageService,
    MockEmailService,
    MockSmsService,
    MockPaymentService,
  ],
  exports: [
    LocalFileStorageService,
    MockEmailService,
    MockSmsService,
    MockPaymentService,
  ],
})
export class CommonModule {}