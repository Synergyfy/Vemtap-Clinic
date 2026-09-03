import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientFeedback } from '../entities/patient-feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(@InjectRepository(PatientFeedback) private feedbackRepo: Repository<PatientFeedback>) {}

  async create(data: Partial<PatientFeedback>): Promise<PatientFeedback> {
    const feedback = this.feedbackRepo.create(data);
    return this.feedbackRepo.save(feedback);
  }

  async findAll(clinicId: string): Promise<PatientFeedback[]> {
    return this.feedbackRepo.find({ where: { clinicId }, relations: ['patient', 'staff'], order: { createdAt: 'DESC' } });
  }

  async getStats(clinicId: string) {
    const feedbacks = await this.feedbackRepo.find({ where: { clinicId } });
    const avgRating = feedbacks.length ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length : 0;
    return { total: feedbacks.length, averageRating: Math.round(avgRating * 10) / 10 };
  }

  async remove(id: string): Promise<void> {
    await this.feedbackRepo.delete(id);
  }
}
