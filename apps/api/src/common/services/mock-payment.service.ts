import { Injectable, BadRequestException } from '@nestjs/common';

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
export class MockPaymentService {
  private payments: Map<string, {
    data: PaymentInitData;
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    paidAt?: Date;
    channel?: string;
  }> = new Map();

  private refunds: Map<string, { data: RefundData; status: string }> = new Map();

  async initializePayment(data: PaymentInitData): Promise<PaymentInitResult> {
    const reference = data.reference || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('💳 [MOCK PAYMENT] Initializing payment:');
    console.log(`   Reference: ${reference}`);
    console.log(`   Amount: ${data.currency} ${data.amount}`);
    console.log(`   Customer: ${data.customerName} (${data.customerEmail})`);
    console.log(`   Callback: ${data.callbackUrl}`);

    this.payments.set(reference, {
      data,
      status: 'pending',
    });

    const authUrl = `http://localhost:3000/mock-payment?reference=${reference}&amount=${data.amount}&currency=${data.currency}`;

    return {
      success: true,
      authorizationUrl: authUrl,
      accessCode: `mock-access-${Date.now()}`,
      reference,
    };
  }

  async verifyPayment(data: PaymentVerifyData): Promise<PaymentVerifyResult> {
    const payment = this.payments.get(data.reference);
    
    if (!payment) {
      return { success: false, error: 'Payment not found', reference: data.reference };
    }

    console.log('💳 [MOCK PAYMENT] Verifying payment:', data.reference);

    if (payment.status === 'pending') {
      payment.status = 'success';
      payment.paidAt = new Date();
      payment.channel = 'mock_bank_transfer';
    }

    return {
      success: true,
      status: payment.status,
      amount: payment.data.amount,
      currency: payment.data.currency,
      reference: payment.data.reference,
      paidAt: payment.paidAt,
      channel: payment.channel,
    };
  }

  async processRefund(data: RefundData): Promise<RefundResult> {
    const payment = this.payments.get(data.reference);
    
    if (!payment) {
      return { success: false, error: 'Original payment not found' };
    }

    if (payment.status !== 'success') {
      return { success: false, error: 'Cannot refund unsuccessful payment' };
    }

    const refundId = `refund-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('💳 [MOCK PAYMENT] Processing refund:', data.reference, 'Amount:', data.amount);

    this.refunds.set(refundId, { data, status: 'completed' });

    return {
      success: true,
      refundId,
      status: 'completed',
    };
  }

  getPayment(reference: string) {
    return this.payments.get(reference);
  }

  getAllPayments() {
    return Array.from(this.payments.entries()).map(([ref, p]) => ({ reference: ref, ...p }));
  }

  clearAll(): void {
    this.payments.clear();
    this.refunds.clear();
  }

  async simulateWebhook(reference: string, status: 'success' | 'failed'): Promise<void> {
    const payment = this.payments.get(reference);
    if (payment) {
      payment.status = status;
      payment.paidAt = status === 'success' ? new Date() : undefined;
      payment.channel = 'mock_webhook';
      console.log(`💳 [MOCK PAYMENT] Webhook received for ${reference}: ${status}`);
    }
  }
}