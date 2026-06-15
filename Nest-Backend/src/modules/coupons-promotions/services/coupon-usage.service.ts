import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponUsage } from '../entities/coupon-usage.entity';

@Injectable()
export class CouponUsageService {
  constructor(
    @InjectRepository(CouponUsage)
    private readonly usageRepository: Repository<CouponUsage>,
  ) {}

  async recordUsage(
    couponId: string,
    userId: string,
    orderId: string,
    discountAmount: number,
  ): Promise<CouponUsage> {
    const usage = this.usageRepository.create({
      couponId,
      userId,
      orderId,
      discountAmount,
    });
    return this.usageRepository.save(usage);
  }

  async getUserUsageCount(couponId: string, userId: string): Promise<number> {
    return this.usageRepository.count({ where: { couponId, userId } });
  }

  async findByOrder(orderId: string): Promise<CouponUsage[]> {
    return this.usageRepository.find({
      where: { orderId },
      relations: { coupon: true },
    });
  }

  async findByUser(userId: string): Promise<CouponUsage[]> {
    return this.usageRepository.find({
      where: { userId },
      relations: { coupon: true, order: true },
      order: { usedAt: 'DESC' },
    });
  }

  async getTotalRedemptions(): Promise<number> {
    return this.usageRepository.count();
  }

  async getTotalDiscountAmount(): Promise<number> {
    const result = await this.usageRepository
      .createQueryBuilder('cu')
      .select('COALESCE(SUM(cu.discountAmount), 0)', 'total')
      .getRawOne();
    return parseFloat(result?.total || '0');
  }
}
