import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const appConfig = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3001),
    CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  }),
});
