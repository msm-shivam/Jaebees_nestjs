import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequest } from '../entities/return-request.entity';
import { ReturnItem } from '../entities/return-item.entity';
import { ReturnRequestStatus } from '../enums/return-request-status.enum';

@Injectable()
export class ReturnAnalyticsService {
  constructor(
    @InjectRepository(ReturnRequest)
    private readonly returnRepo: Repository<ReturnRequest>,
    @InjectRepository(ReturnItem)
    private readonly returnItemRepo: Repository<ReturnItem>,
  ) {}

  async getSummary() {
    const totalReturns = await this.returnRepo.count();
    const totalRefundAmount = await this.returnRepo
      .createQueryBuilder('r')
      .select('COALESCE(SUM(r.totalRefundAmount), 0)', 'total')
      .getRawOne();

    const pendingCount = await this.returnRepo.count({
      where: { status: ReturnRequestStatus.REQUESTED },
    });
    const approvedCount = await this.returnRepo.count({
      where: { status: ReturnRequestStatus.APPROVED },
    });
    const rejectedCount = await this.returnRepo.count({
      where: { status: ReturnRequestStatus.REJECTED },
    });
    const refundedCount = await this.returnRepo.count({
      where: { status: ReturnRequestStatus.REFUNDED },
    });

    const avgProcessingTime = await this.returnRepo
      .createQueryBuilder('r')
      .select(
        'AVG(EXTRACT(EPOCH FROM (r.completed_at - r.requested_at)) / 3600)',
        'avgHours',
      )
      .where('r.completed_at IS NOT NULL')
      .getRawOne();

    return {
      totalReturns,
      totalRefundAmount: Number(totalRefundAmount?.total || 0),
      returnRate: 0,
      averageProcessingTimeHours: Math.round(
        Number(avgProcessingTime?.avgHours || 0),
      ),
      pendingReturns: pendingCount,
      approvedReturns: approvedCount,
      rejectedReturns: rejectedCount,
      refundedReturns: refundedCount,
    };
  }

  async getReturnReasons() {
    return this.returnRepo
      .createQueryBuilder('r')
      .select('r.reason', 'reason')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.reason')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async getReturnedProducts() {
    return this.returnItemRepo
      .createQueryBuilder('ri')
      .select('ri.orderItemId', 'orderItemId')
      .addSelect('COUNT(*)', 'returnCount')
      .addSelect('SUM(ri.quantity)', 'totalReturned')
      .groupBy('ri.orderItemId')
      .orderBy('returnCount', 'DESC')
      .limit(20)
      .getRawMany();
  }

  async getRefundAnalytics() {
    const monthlyRefunds = await this.returnRepo
      .createQueryBuilder('r')
      .select("TO_CHAR(r.requested_at, 'YYYY-MM')", 'month')
      .addSelect('SUM(r.totalRefundAmount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('r.status IN (:...statuses)', {
        statuses: [ReturnRequestStatus.REFUNDED, ReturnRequestStatus.COMPLETED],
      })
      .groupBy("TO_CHAR(r.requested_at, 'YYYY-MM')")
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    return { monthlyRefunds };
  }
}
