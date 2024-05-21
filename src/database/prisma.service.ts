import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

export function exclude<Data, Key extends keyof Data>(
  data: Data,
  keys: Key[],
): Omit<Data, Key> {
  // @ts-ignore
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(data).filter(([key]) => !keys.includes(key)),
  );
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? [
              {
                emit: 'stdout',
                level: 'query',
              },
              {
                emit: 'stdout',
                level: 'error',
              },
              {
                emit: 'stdout',
                level: 'info',
              },
              {
                emit: 'stdout',
                level: 'warn',
              },
            ]
          : [],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    // @ts-ignore
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: this.configService.get('DATABASE_URL'),
      },
    },
  });
}
