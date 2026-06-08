import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponUsage } from '../entities/coupon-usage.entity';

@Injectable()
export class CouponUsageService {
  constructor(
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
  ) {}

  async recordUsage(
    couponId: string,
    userId: string,
    orderId: string,
    discountAmount: number,
  ): Promise<CouponUsage> {
    const usage = this.couponUsageRepository.create({
      couponId,
      userId,
      orderId,
      discountAmount,
    });
    return this.couponUsageRepository.save(usage);
  }

  async getUserUsageCount(couponId: string, userId: string): Promise<number> {
    return this.couponUsageRepository.count({
      where: { couponId, userId },
    });
  }

  async findByOrder(orderId: string): Promise<CouponUsage[]> {
    return this.couponUsageRepository.find({
      where: { orderId },
      relations: { coupon: true },
    });
  }

  async findByUser(userId: string): Promise<CouponUsage[]> {
    return this.couponUsageRepository.find({
      where: { userId },
      relations: { coupon: true, order: true },
      order: { usedAt: 'DESC' },
    });
  }
}
