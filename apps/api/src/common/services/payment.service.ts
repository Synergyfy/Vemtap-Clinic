import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface PaymentInitData {
  amount: number;
  currency: string;
  reference: string;
  customerEmail: string;
  customerName: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentVerifyData {
  reference: string;
}

export interface PaymentInitResult {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  error?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  paidAt?: Date;
  channel?: string;
  error?: string;
}

export interface RefundData {
  reference: string;
  amount: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  status?: string;
  error?: string;
}

@Injectable()
export class PaymentService {
  private secretKey: string;
  public publicKey: string;
  private baseUrl = 'https://api.paystack.co';
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    const publicKey = this.configService.get('PAYSTACK_PUBLIC_KEY');
    
    if (secretKey && publicKey) {
      this.secretKey = secretKey;
      this.publicKey = publicKey;
      this.isConfigured = true;
    } else {
      console.warn('⚠️ PAYSTACK_SECRET_KEY or PAYSTACK_PUBLIC_KEY not configured - payment service will not work');
      this.secretKey = '';
      this.publicKey = '';
      this.isConfigured = false;
    }
  }

  async initializePayment(data: PaymentInitData): Promise<{ success: boolean; authorizationUrl?: string; accessCode?: string; reference: string; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Paystack not configured', reference: data.reference };
    }

    try {
      console.log('💳 [PAYSTACK] Initializing payment:', data.reference);

      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: Math.round(data.amount * 100),
          currency: data.currency || 'NGN',
          reference: data.reference,
          email: data.customerEmail,
          callback_url: data.callbackUrl,
          metadata: data.metadata,
        },
        {
          headers: { Authorization: `Bearer ${this.secretKey}`, 'Content-Type': 'application/json' },
        }
      );

      return {
        success: true,
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: data.reference,
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message, reference: data.reference };
    }
  }

  async verifyPayment(data: PaymentVerifyData): Promise<PaymentVerifyResult> {
    if (!this.secretKey) throw new Error('Paystack secret key not configured');

    try {
      const response = await axios.get(`${this.baseUrl}/transaction/verify/${data.reference}`, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      });

      const responseData = response.data.data;
      return {
        success: true,
        status: responseData.status,
        amount: responseData.amount / 100,
        currency: responseData.currency,
        reference: responseData.reference,
        paidAt: responseData.paid_at ? new Date(responseData.paid_at) : undefined,
        channel: responseData.channel,
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message, reference: data.reference };
    }
  }

  async processRefund(data: { reference: string; amount: number; reason?: string }): Promise<{ success: boolean; refundId?: string; status?: string; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Paystack not configured' };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/refund`,
        {
          transaction: data.reference,
          amount: Math.round(data.amount * 100),
          note: data.reason,
        },
        {
          headers: { Authorization: `Bearer ${this.secretKey}`, 'Content-Type': 'application/json' },
        }
      );

      return {
        success: true,
        refundId: response.data.data.id,
        status: response.data.data.status,
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }
}