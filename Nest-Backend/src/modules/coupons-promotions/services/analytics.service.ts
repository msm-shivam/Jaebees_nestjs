import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CouponUsage } from '../entities/coupon-usage.entity';
import { Promotion } from '../entities/promotion.entity';
import { Campaign } from '../entities/campaign.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
  ) {}

  async getCouponAnalytics(): Promise<any> {
    const totalCoupons = await this.couponRepository.count();
    const activeCoupons = await this.couponRepository.count({ where: { isActive: true } });
    const expiredCoupons = await this.couponRepository.count({ where: { isActive: false } });
    const totalRedemptions = await this.couponUsageRepository.count();
    const revenueResult = await this.couponUsageRepository
      .createQueryBuilder('cu')
      .select('COALESCE(SUM(cu.discountAmount), 0)', 'total')
      .getRawOne();
    const totalDiscount = parseFloat(revenueResult?.total || '0');
    const avgDiscount = totalRedemptions > 0 ? totalDiscount / totalRedemptions : 0;

    const topCoupons = await this.couponUsageRepository
      .createQueryBuilder('cu')
      .select('cu.couponId', 'couponId')
      .addSelect('COUNT(*)', 'usageCount')
      .addSelect('SUM(cu.discountAmount)', 'totalDiscount')
      .groupBy('cu.couponId')
      .orderBy('"usageCount"', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalRedemptions,
      totalDiscount,
      averageDiscount: Math.round(avgDiscount * 100) / 100,
      topCoupons,
    };
  }

  async getPromotionAnalytics(): Promise<any> {
    const totalPromotions = await this.promotionRepository.count();
    const activePromotions = await this.promotionRepository.count({ where: { isActive: true } });
    const flashSales = await this.promotionRepository.count({ where: { isActive: true } });

    return {
      totalPromotions,
      activePromotions,
      flashSales,
    };
  }

  async getCampaignAnalytics(): Promise<any> {
    const totalCampaigns = await this.campaignRepository.count();
    const activeCampaigns = await this.campaignRepository.count({ where: { isActive: true } });
    const byType = await this.campaignRepository
      .createQueryBuilder('c')
      .select('c.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.type')
      .getRawMany();

    return {
      totalCampaigns,
      activeCampaigns,
      byType,
    };
  }
}
