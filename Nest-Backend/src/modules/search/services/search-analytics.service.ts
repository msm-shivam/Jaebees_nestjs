import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Not, IsNull } from 'typeorm';
import { SearchLog } from '../entities/search-log.entity';

@Injectable()
export class SearchAnalyticsService {
  constructor(
    @InjectRepository(SearchLog)
    private readonly searchLogRepo: Repository<SearchLog>,
  ) {}

  private getDateRange(period: '7d' | '30d' | '90d'): Date {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  async getAnalytics(period: '7d' | '30d' | '90d' = '30d') {
    const since = this.getDateRange(period);
    const totalSearches = await this.searchLogRepo.count({
      where: { createdAt: MoreThan(since) },
    });

    const uniqueKeywords = await this.searchLogRepo
      .createQueryBuilder('log')
      .select('DISTINCT log.keyword')
      .where('log.created_at > :since', { since })
      .getRawMany();

    const searchesWithClicks = await this.searchLogRepo.count({
      where: { createdAt: MoreThan(since), clickedProductId: Not(IsNull()) },
    });

    const searchesWithNoResults = await this.searchLogRepo.count({
      where: { createdAt: MoreThan(since), resultsCount: 0 },
    });

    const searchesWithConversion = await this.searchLogRepo.count({
      where: { createdAt: MoreThan(since), convertedOrderId: Not(IsNull()) },
    });

    const clickThroughRate =
      totalSearches > 0
        ? Number(((searchesWithClicks / totalSearches) * 100).toFixed(2))
        : 0;

    const conversionRate =
      totalSearches > 0
        ? Number(((searchesWithConversion / totalSearches) * 100).toFixed(2))
        : 0;

    return {
      totalSearches,
      uniqueSearches: uniqueKeywords.length,
      searchesWithClicks,
      searchesWithNoResults,
      searchesWithConversion,
      clickThroughRate,
      conversionRate,
      period,
    };
  }

  async getTopKeywords(period: '7d' | '30d' | '90d' = '30d', limit = 20) {
    const since = this.getDateRange(period);
    const results = await this.searchLogRepo
      .createQueryBuilder('log')
      .select('log.keyword', 'keyword')
      .addSelect('COUNT(*)', 'count')
      .where('log.created_at > :since', { since })
      .groupBy('log.keyword')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
    return results.map((r) => ({
      keyword: r.keyword,
      count: parseInt(r.count, 10),
    }));
  }

  async getTrendingKeywords(limit = 20) {
    const last7d = this.getDateRange('7d');
    const last30d = this.getDateRange('30d');

    const recent = await this.searchLogRepo
      .createQueryBuilder('log')
      .select('log.keyword', 'keyword')
      .addSelect('COUNT(*)', 'count')
      .where('log.created_at > :since', { since: last7d })
      .groupBy('log.keyword')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    const trending = await Promise.all(
      recent.map(async (r) => {
        const prevCount = await this.searchLogRepo
          .createQueryBuilder('log')
          .where('log.keyword = :keyword', { keyword: r.keyword })
          .andWhere('log.created_at > :from', { from: last30d })
          .andWhere('log.created_at < :to', { to: last7d })
          .getCount();
        const growthRate =
          prevCount > 0
            ? Number(
                (
                  ((parseInt(r.count, 10) - prevCount) / prevCount) *
                  100
                ).toFixed(2),
              )
            : 100;
        return {
          keyword: r.keyword,
          count: parseInt(r.count, 10),
          growthRate,
        };
      }),
    );

    return trending.sort(
      (a, b) => b.growthRate - a.growthRate || b.count - a.count,
    );
  }

  async getNoResultKeywords(period: '7d' | '30d' | '90d' = '30d', limit = 20) {
    const since = this.getDateRange(period);
    const results = await this.searchLogRepo
      .createQueryBuilder('log')
      .select('log.keyword', 'keyword')
      .addSelect('COUNT(*)', 'count')
      .where('log.created_at > :since AND log.results_count = 0', { since })
      .groupBy('log.keyword')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
    return results.map((r) => ({
      keyword: r.keyword,
      count: parseInt(r.count, 10),
    }));
  }

  async logSearch(data: {
    userId?: string;
    keyword: string;
    resultsCount: number;
    ipAddress?: string;
  }): Promise<string> {
    const log = new SearchLog();
    log.userId = data.userId ?? null;
    log.keyword = data.keyword.toLowerCase().trim();
    log.resultsCount = data.resultsCount;
    log.ipAddress = data.ipAddress ?? null;
    const saved = await this.searchLogRepo.save(log);
    return saved.id;
  }

  async logClick(searchLogId: string, productId: string): Promise<void> {
    await this.searchLogRepo.update(searchLogId, {
      clickedProductId: productId,
    });
  }

  async logConversion(searchLogId: string, orderId: string): Promise<void> {
    await this.searchLogRepo.update(searchLogId, { convertedOrderId: orderId });
  }

  async getAnalyticsSummary(period: '7d' | '30d' | '90d' = '30d') {
    const since = this.getDateRange(period);

    const totalSearches = await this.searchLogRepo.count({
      where: { createdAt: MoreThan(since) },
    });

    const clickCount = await this.searchLogRepo.count({
      where: { createdAt: MoreThan(since), clickedProductId: Not(IsNull()) },
    });

    const conversionCount = await this.searchLogRepo.count({
      where: { createdAt: MoreThan(since), convertedOrderId: Not(IsNull()) },
    });

    const ctr =
      totalSearches > 0
        ? Number(((clickCount / totalSearches) * 100).toFixed(2))
        : 0;
    const conversionRate =
      totalSearches > 0
        ? Number(((conversionCount / totalSearches) * 100).toFixed(2))
        : 0;

    const avgPositionClicked = await this.searchLogRepo
      .createQueryBuilder('log')
      .select('AVG(log.results_count)', 'avgPosition')
      .where('log.created_at > :since', { since })
      .andWhere('log.clicked_product_id IS NOT NULL')
      .getRawOne();

    return {
      totalSearches,
      uniqueSearches: (
        await this.searchLogRepo
          .createQueryBuilder('log')
          .select('DISTINCT log.keyword')
          .where('log.created_at > :since', { since })
          .getRawMany()
      ).length,
      clickCount,
      ctr,
      conversionCount,
      conversionRate,
      avgPositionClicked: avgPositionClicked?.avgPosition
        ? Number(parseFloat(avgPositionClicked.avgPosition).toFixed(2))
        : 0,
      period,
    };
  }

  async clearCache(): Promise<void> {
    // placeholder for cache clearing
  }
}
