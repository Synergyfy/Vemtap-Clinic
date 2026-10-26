import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Parses a Postgres connection string (e.g. Supabase's `postgresql://...`)
 * into discrete connection fields. Query params (sslmode) are handled
 * separately so TypeORM/pg never receive conflicting SSL settings.
 */
const parseDatabaseUrl = (
  url: string,
): {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  sslmode: string | null;
} => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    sslmode: parsed.searchParams.get('sslmode'),
  };
};

/**
 * Resolves SSL settings for the connection.
 * - DB_SSL env var wins when set (disable | require | verify-full)
 * - Otherwise: `?sslmode=` from the URL, else enabled for remote hosts
 *   (Supabase), disabled for localhost.
 */
const resolveSsl = (
  configService: ConfigService,
  sslmode: string | null,
  host: string | undefined,
): { rejectUnauthorized: boolean } | false => {
  const raw = configService.get<string>('DB_SSL') ?? sslmode ?? '';
  const mode = raw.toLowerCase();

  if (mode === 'disable' || mode === 'false' || mode === 'allow') return false;
  if (mode === 'verify-full' || mode === 'verify-ca' || mode === 'true') {
    return { rejectUnauthorized: true };
  }
  // `require` (Supabase default) or a remote host without explicit sslmode
  if (mode === 'require') return { rejectUnauthorized: false };
  const isLocal = !host || host === 'localhost' || host === '127.0.0.1' || host === '::1';
  return isLocal ? false : { rejectUnauthorized: false };
};

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  const connection = databaseUrl
    ? parseDatabaseUrl(databaseUrl)
    : {
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        sslmode: null as string | null,
      };

  const ssl = resolveSsl(configService, connection.sslmode, connection.host);

  return {
    type: 'postgres',
    host: connection.host,
    port: connection.port,
    username: connection.username,
    password: connection.password,
    database: connection.database,
    ...(ssl ? { ssl } : {}),
    entities: [__dirname + '/entities/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
  };
};
