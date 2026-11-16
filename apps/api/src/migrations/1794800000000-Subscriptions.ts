import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * §16 Clinic subscription and account control.
 *
 * The subscription belongs to the clinic organization (one row per clinic), not
 * to a staff member, so staff changes never affect billing. Plans, invoices,
 * payments, an audit trail and metered usage counters live alongside it.
 *
 * Existing clinics are backfilled at bootstrap (`SubscriptionsService`) rather
 * than here, because plan rows are seeded by the application.
 */
export class Subscriptions1794800000000 implements MigrationInterface {
  name = 'Subscriptions1794800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------------------------------------------------------------- enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."clinic_subscriptions_status_enum" AS ENUM(
          'trialing', 'active', 'past_due', 'grace', 'expired', 'cancelled'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."clinic_subscriptions_billingcycle_enum" AS ENUM('monthly', 'yearly');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."clinic_subscriptions_pendingbillingcycle_enum" AS ENUM('monthly', 'yearly');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."subscription_invoices_status_enum" AS ENUM(
          'draft', 'pending', 'paid', 'failed', 'overdue', 'void'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."subscription_payments_status_enum" AS ENUM(
          'pending', 'success', 'failed', 'refunded'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."subscription_payments_provider_enum" AS ENUM('paystack', 'manual');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."subscription_events_type_enum" AS ENUM(
          'created', 'upgraded', 'downgraded', 'renewed', 'cancelled', 'past_due',
          'grace_started', 'expired', 'payment_failed', 'limit_reached',
          'reminder_sent', 'override'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."usage_counters_metric_enum" AS ENUM(
          'patients', 'staff', 'branches', 'ocr', 'whatsapp', 'storage_mb'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // ---------------------------------------------------------------- plans
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(50) NOT NULL,
        "name" character varying(120) NOT NULL,
        "description" text,
        "monthlyPrice" numeric(12,2) NOT NULL DEFAULT 0,
        "yearlyPrice" numeric(12,2) NOT NULL DEFAULT 0,
        "currency" character varying(3) NOT NULL DEFAULT 'NGN',
        "limits" jsonb NOT NULL DEFAULT '{}',
        "features" jsonb NOT NULL DEFAULT '[]',
        "sortOrder" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_plans" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subscription_plans_code" UNIQUE ("code")
      );
    `);

    // -------------------------------------------------------- subscriptions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clinic_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clinicId" uuid NOT NULL,
        "planId" uuid NOT NULL,
        "status" "public"."clinic_subscriptions_status_enum" NOT NULL DEFAULT 'active',
        "billingCycle" "public"."clinic_subscriptions_billingcycle_enum" NOT NULL DEFAULT 'monthly',
        "pendingPlanId" uuid,
        "pendingBillingCycle" "public"."clinic_subscriptions_pendingbillingcycle_enum",
        "pendingPlanAwaitingPayment" boolean NOT NULL DEFAULT false,
        "currentPeriodStart" TIMESTAMP WITH TIME ZONE,
        "currentPeriodEnd" TIMESTAMP WITH TIME ZONE,
        "renewalDate" TIMESTAMP WITH TIME ZONE,
        "trialEndsAt" TIMESTAMP WITH TIME ZONE,
        "graceEndsAt" TIMESTAMP WITH TIME ZONE,
        "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false,
        "cancelledAt" TIMESTAMP WITH TIME ZONE,
        "priceSnapshot" numeric(12,2) NOT NULL DEFAULT 0,
        "currency" character varying(3) NOT NULL DEFAULT 'NGN',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clinic_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_clinic_subscriptions_clinicId" UNIQUE ("clinicId")
      );
    `);

    // ------------------------------------------------------------ invoices
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_invoices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "invoiceNumber" character varying(60) NOT NULL,
        "clinicId" uuid NOT NULL,
        "subscriptionId" uuid,
        "amount" numeric(12,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'NGN',
        "status" "public"."subscription_invoices_status_enum" NOT NULL DEFAULT 'pending',
        "periodStart" TIMESTAMP WITH TIME ZONE,
        "periodEnd" TIMESTAMP WITH TIME ZONE,
        "dueDate" TIMESTAMP WITH TIME ZONE,
        "paidAt" TIMESTAMP WITH TIME ZONE,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_invoices" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subscription_invoices_invoiceNumber" UNIQUE ("invoiceNumber")
      );
    `);

    // ------------------------------------------------------------ payments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "invoiceId" uuid NOT NULL,
        "clinicId" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "method" character varying(30) NOT NULL DEFAULT 'paystack',
        "provider" "public"."subscription_payments_provider_enum" NOT NULL DEFAULT 'paystack',
        "reference" character varying(120),
        "status" "public"."subscription_payments_status_enum" NOT NULL DEFAULT 'pending',
        "paidAt" TIMESTAMP WITH TIME ZONE,
        "recordedById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_payments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subscription_payments_reference" UNIQUE ("reference")
      );
    `);

    // -------------------------------------------------------------- events
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clinicId" uuid NOT NULL,
        "subscriptionId" uuid,
        "type" "public"."subscription_events_type_enum" NOT NULL,
        "actorId" uuid,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_events" PRIMARY KEY ("id")
      );
    `);

    // ------------------------------------------------------ usage counters
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "usage_counters" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clinicId" uuid NOT NULL,
        "metric" "public"."usage_counters_metric_enum" NOT NULL,
        "period" character varying(7) NOT NULL,
        "used" integer NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_usage_counters" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_usage_counters_clinic_metric_period" UNIQUE ("clinicId", "metric", "period")
      );
    `);

    // ---------------------------------------------------------- foreign keys
    await queryRunner.query(`
      ALTER TABLE "clinic_subscriptions"
      DROP CONSTRAINT IF EXISTS "FK_clinic_subscriptions_clinicId";
      ALTER TABLE "clinic_subscriptions"
      ADD CONSTRAINT "FK_clinic_subscriptions_clinicId"
      FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
      ALTER TABLE "clinic_subscriptions"
      DROP CONSTRAINT IF EXISTS "FK_clinic_subscriptions_planId";
      ALTER TABLE "clinic_subscriptions"
      ADD CONSTRAINT "FK_clinic_subscriptions_planId"
      FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
      ALTER TABLE "clinic_subscriptions"
      DROP CONSTRAINT IF EXISTS "FK_clinic_subscriptions_pendingPlanId";
      ALTER TABLE "clinic_subscriptions"
      ADD CONSTRAINT "FK_clinic_subscriptions_pendingPlanId"
      FOREIGN KEY ("pendingPlanId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
      ALTER TABLE "subscription_invoices"
      DROP CONSTRAINT IF EXISTS "FK_subscription_invoices_clinicId";
      ALTER TABLE "subscription_invoices"
      ADD CONSTRAINT "FK_subscription_invoices_clinicId"
      FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
      ALTER TABLE "subscription_invoices"
      DROP CONSTRAINT IF EXISTS "FK_subscription_invoices_subscriptionId";
      ALTER TABLE "subscription_invoices"
      ADD CONSTRAINT "FK_subscription_invoices_subscriptionId"
      FOREIGN KEY ("subscriptionId") REFERENCES "clinic_subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      DROP CONSTRAINT IF EXISTS "FK_subscription_payments_invoiceId";
      ALTER TABLE "subscription_payments"
      ADD CONSTRAINT "FK_subscription_payments_invoiceId"
      FOREIGN KEY ("invoiceId") REFERENCES "subscription_invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
      ALTER TABLE "subscription_payments"
      DROP CONSTRAINT IF EXISTS "FK_subscription_payments_clinicId";
      ALTER TABLE "subscription_payments"
      ADD CONSTRAINT "FK_subscription_payments_clinicId"
      FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
      ALTER TABLE "subscription_events"
      DROP CONSTRAINT IF EXISTS "FK_subscription_events_clinicId";
      ALTER TABLE "subscription_events"
      ADD CONSTRAINT "FK_subscription_events_clinicId"
      FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
      ALTER TABLE "subscription_events"
      DROP CONSTRAINT IF EXISTS "FK_subscription_events_subscriptionId";
      ALTER TABLE "subscription_events"
      ADD CONSTRAINT "FK_subscription_events_subscriptionId"
      FOREIGN KEY ("subscriptionId") REFERENCES "clinic_subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    `);

    // -------------------------------------------------------------- indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_clinic_subscriptions_status" ON "clinic_subscriptions" ("status");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_clinic_subscriptions_planId" ON "clinic_subscriptions" ("planId");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_clinic_created" ON "subscription_invoices" ("clinicId", "createdAt");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_status" ON "subscription_invoices" ("status");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscription_payments_invoiceId" ON "subscription_payments" ("invoiceId");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscription_events_clinic_created" ON "subscription_events" ("clinicId", "createdAt");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_usage_counters_clinic_period" ON "usage_counters" ("clinicId", "period");`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "usage_counters";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_events";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_payments";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_invoices";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clinic_subscriptions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plans";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."usage_counters_metric_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."subscription_events_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."subscription_payments_provider_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."subscription_payments_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."subscription_invoices_status_enum";`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."clinic_subscriptions_pendingbillingcycle_enum";`
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."clinic_subscriptions_billingcycle_enum";`
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."clinic_subscriptions_status_enum";`);
  }
}
