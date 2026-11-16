import { Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';

/**
 * Public Paystack webhook. Authenticity comes from the HMAC signature, not a
 * JWT, so this route is deliberately unguarded. `rawBody` is enabled in
 * main.ts so the signature can be verified against the exact bytes sent.
 */
@ApiTags('Subscription')
@Controller('subscription/webhook')
export class SubscriptionWebhookController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Post('paystack')
  @HttpCode(200)
  @ApiOperation({ summary: 'Paystack payment webhook (signature verified)' })
  paystack(
    @Headers('x-paystack-signature') signature: string | undefined,
    @Req() request: Request & { rawBody?: Buffer }
  ) {
    return this.subscriptions.handlePaystackWebhook(signature, request.rawBody);
  }
}
