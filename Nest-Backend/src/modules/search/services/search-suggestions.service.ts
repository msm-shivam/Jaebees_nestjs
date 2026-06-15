import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product, ProductStatus } from '../../products/entities/product.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';
import { Collection } from '../../collections/entities/collection.entity';
import { SearchLog } from '../entities/search-log.entity';

@Injectable()
export class SearchSuggestionsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(SearchLog)
    private readonly searchLogRepo: Repository<SearchLog>,
  ) {}

  async getSuggestions(q: string, limit = 10): Promise<string[]> {
    const suggestions = new Set<string>();
    const term = `%${q.toLowerCase()}%`;

    const products = await this.productRepo.find({
      where: {
        name: ILike(term),
        status: ProductStatus.ACTIVE,
        isActive: true,
      },
      take: limit,
      order: { totalReviews: 'DESC' },
    });
    products.forEach((p) => suggestions.add(p.name));

    if (suggestions.size < limit) {
      const brands = await this.brandRepo.find({
        where: { name: ILike(term), isActive: true },
        take: limit,
      });
      brands.forEach((b) => suggestions.add(b.name));
    }

    if (suggestions.size < limit) {
      const categories = await this.categoryRepo.find({
        where: { name: ILike(term), isActive: true },
        take: limit,
      });
      categories.forEach((c) => suggestions.add(c.name));
    }

    if (suggestions.size < limit) {
      const collections = await this.collectionRepo.find({
        where: { name: ILike(term), isActive: true },
        take: limit,
      });
      collections.forEach((c) => suggestions.add(c.name));
    }

    if (suggestions.size < limit) {
      const popular = await this.searchLogRepo.find({
        take: limit * 2,
        order: { createdAt: 'DESC' },
      });
      const seen = new Set<string>();
      for (const log of popular) {
        if (
          log.keyword.toLowerCase().includes(q.toLowerCase()) &&
          !seen.has(log.keyword)
        ) {
          seen.add(log.keyword);
          suggestions.add(log.keyword);
          if (suggestions.size >= limit) break;
        }
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }
}
