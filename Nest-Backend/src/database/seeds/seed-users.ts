/**
 * Seed script - 3 customer users with different creation dates
 * Run: npm run seed:users
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

dotenv.config();

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const now = new Date();

const USERS = [
  { firstName: 'Ahmed', lastName: 'Ali', email: 'ahmed@example.com', mobile: '+971501111111', createdAt: addDays(now, -95) },
  { firstName: 'Sara', lastName: 'Mohammed', email: 'sara@example.com', mobile: '+971502222222', createdAt: addDays(now, -60) },
  { firstName: 'Omar', lastName: 'Hassan', email: 'omar@example.com', mobile: '+971503333333', createdAt: addDays(now, -30) },
];

async function seed() {
  console.log('Connecting...');
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('Customer@123', 12);

  for (const d of USERS) {
    const existing = await userRepo.findOne({
      where: [{ email: d.email }, { mobile: d.mobile }],
    });
    if (existing) {
      existing.firstName = d.firstName;
      existing.lastName = d.lastName;
      existing.email = d.email;
      existing.mobile = d.mobile;
      existing.passwordHash = passwordHash;
      existing.isEmailVerified = true;
      existing.isActive = true;
      await userRepo.save(existing);
      console.log(`  Updated: ${d.email}`);
    } else {
      const user = userRepo.create({
        ...d, passwordHash, isEmailVerified: true, isActive: true,
      });
      user.createdAt = d.createdAt;
      user.updatedAt = d.createdAt;
      await userRepo.save(user);
      console.log(`  Created: ${d.email} (${d.createdAt.toISOString().slice(0, 10)})`);
    }
  }

  await AppDataSource.destroy();
  console.log('\nUsers seeded!');
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
