import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Coupon } from '../../modules/coupons-promotions/entities/coupon.entity';
import { CouponType } from '../../modules/coupons-promotions/enums/coupon-type.enum';

async function main() {
  const ds = await AppDataSource.initialize();
  try {
    const enums = await ds.query(`SELECT typname, enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'coupons_type_enum'`);
    console.log('Enum values:', enums.map((r: any) => r.enumlabel).join(', '));

    const repo = ds.getRepository(Coupon);
    const c = repo.create({ code: 'TEST101', type: CouponType.PERCENTAGE, value: 10, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), isActive: true });
    await repo.save(c);
    console.log('OK');
  } catch(e: any) {
    console.error('FAIL:', e.message);
  }
  await ds.destroy();
}
main();
