import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientFeedback } from '../entities/patient-feedback.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PatientFeedback])],
  providers: [FeedbackService],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
