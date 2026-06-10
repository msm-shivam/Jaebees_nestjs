import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { redisConfig } from './redis.config';
import { rabbitmqConfig } from './rabbitmq.config';
import { mailerConfig } from './mailer.config';
import { validateEnv } from './env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, rabbitmqConfig, mailerConfig],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
