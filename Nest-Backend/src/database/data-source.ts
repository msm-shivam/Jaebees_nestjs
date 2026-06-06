import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity';
import { UserSession } from '../modules/users/entities/user-session.entity';
import { AdminUser } from '../modules/admin/entities/admin-user.entity';
import { AdminSession } from '../modules/admin/entities/admin-session.entity';
import { Role } from '../modules/rbac/entities/role.entity';
import { Permission } from '../modules/rbac/entities/permission.entity';
import { OtpVerification } from '../modules/auth/entities/otp-verification.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'sport_ecommerce',
  entities: [
    User,
    UserSession,
    AdminUser,
    AdminSession,
    Role,
    Permission,
    OtpVerification,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
