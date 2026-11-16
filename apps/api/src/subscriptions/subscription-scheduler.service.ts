import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

const SWEEP_INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Lightweight scheduler: no @nestjs/schedule dependency. Runs the expiry sweep
 * on boot and every 6 hours, and never keeps the process alive on its own.
 */
@Injectable()
export class SubscriptionSchedulerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly subscriptions: SubscriptionsService) {}

  onApplicationBootstrap(): void {
    void this.runSweep();
    this.timer = setInterval(() => void this.runSweep(), SWEEP_INTERVAL_MS);
    this.timer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async runSweep(): Promise<void> {
    try {
      const { processed } = await this.subscriptions.sweepExpirations();
      if (processed > 0) {
        this.logger.log(`Subscription expiry sweep updated ${processed} subscription(s)`);
      }
    } catch (error) {
      this.logger.error(`Subscription expiry sweep failed: ${(error as Error).message}`);
    }
  }
}
