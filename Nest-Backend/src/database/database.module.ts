import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { UserSession } from '../modules/users/entities/user-session.entity';
import { AdminUser } from '../modules/admin/entities/admin-user.entity';
import { AdminSession } from '../modules/admin/entities/admin-session.entity';
import { Role } from '../modules/rbac/entities/role.entity';
import { Permission } from '../modules/rbac/entities/permission.entity';
import { OtpVerification } from '../modules/auth/entities/otp-verification.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        entities: [
          User,
          UserSession,
          AdminUser,
          AdminSession,
          Role,
          Permission,
          OtpVerification,
        ],
        migrations: ['dist/database/migrations/*.js'],
        synchronize: false,
        logging: config.get<string>('app.nodeEnv') === 'development',
        ssl:
          config.get<string>('app.nodeEnv') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
  ],
})
export class DatabaseModule {}
