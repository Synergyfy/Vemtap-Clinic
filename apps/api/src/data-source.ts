import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { getDatabaseConfig } from './database.config';

/**
 * DataSource for the TypeORM CLI (migration:generate / migration:run).
 * Reuses the app's connection logic so DATABASE_URL, discrete DB_* vars
 * and SSL resolve exactly as they do at runtime — no hardcoded fallbacks.
 */
const config = new ConfigService(process.env);

const hasConnection =
  config.get<string>('DATABASE_URL') ||
  (config.get<string>('DB_HOST') &&
    config.get<string>('DB_USERNAME') &&
    config.get<string>('DB_PASSWORD') &&
    config.get<string>('DB_DATABASE'));

if (!hasConnection) {
  throw new Error(
    'Database not configured: set DATABASE_URL, or DB_HOST, DB_USERNAME, DB_PASSWORD and DB_DATABASE.',
  );
}

export const AppDataSource = new DataSource({
  ...(getDatabaseConfig(config) as DataSourceOptions),
  synchronize: false, // migrations must never auto-sync
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
