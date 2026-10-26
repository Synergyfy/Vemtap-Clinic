import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const appConfig = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3001),
    CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
    // Either a full connection string (e.g. Supabase)...
    // Note: must not reference DB_HOST here — Joi rejects circular .when() dependencies.
    DATABASE_URL: Joi.string().uri({ scheme: /^postgres(ql)?$/ }).optional(),
    DB_SSL: Joi.string().valid('disable', 'allow', 'require', 'verify-ca', 'verify-full').optional(),
    // ...or discrete connection fields for a local database.
    DB_HOST: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    DB_PASSWORD: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    DB_DATABASE: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    // Email: Resend API or SMTP (e.g. Brevo). smtp is also auto-selected when SMTP_HOST is set.
    EMAIL_PROVIDER: Joi.string().valid('resend', 'smtp').optional(),
    EMAIL_FROM: Joi.string().optional(),
    EMAIL_FROM_NAME: Joi.string().optional(),
    SMTP_HOST: Joi.string()
      .when('EMAIL_PROVIDER', { is: 'smtp', then: Joi.required(), otherwise: Joi.optional() }),
    SMTP_PORT: Joi.number().default(587),
    SMTP_SECURE: Joi.string().valid('true', 'false').default('false'),
    SMTP_USER: Joi.string()
      .when('EMAIL_PROVIDER', { is: 'smtp', then: Joi.required(), otherwise: Joi.optional() }),
    SMTP_PASS: Joi.string()
      .when('EMAIL_PROVIDER', { is: 'smtp', then: Joi.required(), otherwise: Joi.optional() }),
    RESEND_API_KEY: Joi.string().optional(),
  }),
});
