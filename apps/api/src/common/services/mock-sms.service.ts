import { Injectable } from '@nestjs/common';

export interface SmsOptions {
  to: string;
  message: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class MockSmsService {
  private sentMessages: Array<{ options: SmsOptions; timestamp: Date }> = [];

  async sendSms(options: SmsOptions): Promise<SmsResult> {
    const messageId = `mock-sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📱 [MOCK SMS] Sending SMS:');
    console.log(`   To: ${options.to}`);
    console.log(`   Message: ${options.message}`);
    console.log(`   MessageId: ${messageId}`);

    this.sentMessages.push({ options, timestamp: new Date() });

    return { success: true, messageId };
  }

  async sendOtpSms(phone: string, code: string, expiryMinutes: number = 10): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      message: `Your Vemtap Clinic verification code is: ${code}. Valid for ${expiryMinutes} minutes. Do not share.`,
    });
  }

  async sendAppointmentReminder(phone: string, data: { patientName: string; date: string; time: string; doctor: string }): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      message: `Reminder: ${data.patientName}, you have an appointment with Dr. ${data.doctor} on ${data.date} at ${data.time}. Please arrive 15 mins early. - Vemtap Clinic`,
    });
  }

  async sendPaymentConfirmation(phone: string, data: { amount: string; reference: string }): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      message: `Payment of ${data.amount} received (Ref: ${data.reference}). Thank you! - Vemtap Clinic`,
    });
  }

  async sendClaimStatusUpdate(phone: string, data: { claimNumber: string; status: string }): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      message: `HMO Claim ${data.claimNumber} status: ${data.status}. Contact clinic for details. - Vemtap Clinic`,
    });
  }

  getSentMessages(): Array<{ options: SmsOptions; timestamp: Date }> {
    return this.sentMessages;
  }

  clearSentMessages(): void {
    this.sentMessages = [];
  }
}