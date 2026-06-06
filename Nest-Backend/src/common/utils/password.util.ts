import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../constants/app.constants';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function comparePassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
