import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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
export class SmsService {
  private provider: string;
  private config: Record<string, any>;

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get('SMS_PROVIDER') || 'twilio';
    this.config = {
      twilio: {
        accountSid: this.configService.get('TWILIO_ACCOUNT_SID'),
        authToken: this.configService.get('TWILIO_AUTH_TOKEN'),
        phoneNumber: this.configService.get('TWILIO_PHONE_NUMBER'),
      },
      termii: {
        apiKey: this.configService.get('TERMII_API_KEY'),
        senderId: this.configService.get('TERMII_SENDER_ID', 'VemtapClinic'),
      },
      africastalking: {
        username: this.configService.get('AFRICAS_TALKING_USERNAME'),
        apiKey: this.configService.get('AFRICAS_TALKING_API_KEY'),
      },
    };
  }

  async sendSms(options: { to: string; message: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.sendViaTwilio(options);
        case 'termii':
          return await this.sendViaTermii(options);
        case 'africastalking':
          return await this.sendViaAfricasTalking(options);
        default:
          throw new BadRequestException(`Unsupported SMS provider: ${this.provider}`);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async sendViaTwilio(options: { to: string; message: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { accountSid, authToken, phoneNumber } = this.config.twilio;
    if (!accountSid || !authToken || !phoneNumber) {
      throw new BadRequestException('Twilio credentials not configured');
    }

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: phoneNumber,
        To: options.to,
        Body: options.message,
      }),
      {
        auth: { username: accountSid, password: authToken },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    return { success: true, messageId: response.data.sid };
  }

  private async sendViaTermii(options: { to: string; message: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { apiKey, senderId } = this.config.termii;
    if (!apiKey) {
      throw new BadRequestException('Termii API key not configured');
    }

    const response = await axios.post(
      'https://api.ng.termii.com/api/sms/send',
      {
        to: options.to,
        from: senderId,
        sms: options.message,
        type: 'plain',
        channel: 'generic',
        api_key: apiKey,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return { success: true, messageId: response.data.message_id };
  }

  private async sendViaAfricasTalking(options: { to: string; message: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { username, apiKey } = this.config.africastalking;
    if (!username || !apiKey) {
      throw new BadRequestException('Africa\'s Talking credentials not configured');
    }

    const response = await axios.post(
      'https://api.africastalking.com/version1/messaging',
      new URLSearchParams({
        username,
        to: options.to,
        message: options.message,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey,
        },
      }
    );

    return { success: true, messageId: response.data.SMSMessageData?.Recipients?.[0]?.messageId };
  }

  async sendOtpSms(phone: string, code: string, expiryMinutes: number = 10): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSms({
      to: phone,
      message: `Your Vemtap Clinic verification code is: ${code}. Valid for ${expiryMinutes} minutes. Do not share.`,
    });
  }

  async sendAppointmentReminder(phone: string, data: { patientName: string; date: string; time: string; doctor: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSms({
      to: phone,
      message: `Reminder: ${data.patientName}, you have an appointment with Dr. ${data.doctor} on ${data.date} at ${data.time}. Please arrive 15 mins early. - Vemtap Clinic`,
    });
  }

  async sendPaymentConfirmation(phone: string, data: { amount: string; reference: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSms({
      to: phone,
      message: `Payment of ${data.amount} received (Ref: ${data.reference}). Thank you! - Vemtap Clinic`,
    });
  }

  async sendClaimStatusUpdate(phone: string, data: { claimNumber: string; status: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSms({
      to: phone,
      message: `HMO Claim ${data.claimNumber} status: ${data.status}. Contact clinic for details. - Vemtap Clinic`,
    });
  }
}