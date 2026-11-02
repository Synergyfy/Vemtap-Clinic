import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const appConfig = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3001),
    CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
    FRONTEND_URL: Joi.string().default('http://localhost:3000'),
    FILE_STORAGE_PROVIDER: Joi.string().valid('local', 'cloudinary').default('local'),
    CLOUDINARY_CLOUD_NAME: Joi.string().when('FILE_STORAGE_PROVIDER', {
      is: 'cloudinary',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    CLOUDINARY_API_KEY: Joi.string().when('FILE_STORAGE_PROVIDER', {
      is: 'cloudinary',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    CLOUDINARY_API_SECRET: Joi.string().when('FILE_STORAGE_PROVIDER', {
      is: 'cloudinary',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    CLOUDINARY_UPLOAD_PRESET: Joi.string().optional(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    SMTP_HOST: Joi.string().optional(),
    SMTP_PORT: Joi.number().optional(),
    SMTP_SECURE: Joi.boolean().optional(),
    SMTP_USER: Joi.string().optional(),
    SMTP_PASSWORD: Joi.string().optional(),
    SMTP_FROM: Joi.string().default('noreply@localhost'),
  }),
});
