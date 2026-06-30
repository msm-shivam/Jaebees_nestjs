import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Faq } from '../entities/faq.entity';
import type { CreateFaqDto } from '../dto/create-faq.dto';
import type { UpdateFaqDto } from '../dto/update-faq.dto';
import type { FaqQueryDto } from '../dto/faq-query.dto';
import { FaqResponseDto } from '../dto/faq-response.dto';
import { paginate } from '../../../common/utils/pagination.util';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepo: Repository<Faq>,
  ) {}

  async create(dto: CreateFaqDto) {
    const faq = this.faqRepo.create(dto);
    const saved = await this.faqRepo.save(faq);
    return {
      message: 'FAQ created successfully',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: FaqQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.category) where.category = query.category;
    if (query.search) {
      return this.search(
        query.search,
        query.category,
        query.isActive,
        page,
        limit,
      );
    }

    const [items, total] = await this.faqRepo.findAndCount({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(
      items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    );
  }

  private async search(
    search: string,
    category?: string,
    isActive?: boolean,
    page = 1,
    limit = 20,
  ) {
    const where: Record<string, unknown>[] = [
      { question: ILike(`%${search}%`) },
      { answer: ILike(`%${search}%`) },
    ];
    if (category !== undefined) {
      where.forEach((w) => (w.category = category));
    }
    if (isActive !== undefined) {
      where.forEach((w) => (w.isActive = isActive));
    }

    const [items, total] = await this.faqRepo.findAndCount({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(
      items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string) {
    const faq = await this.findByIdOrFail(id);
    return this.toResponse(faq);
  }

  async update(id: string, dto: UpdateFaqDto) {
    const faq = await this.findByIdOrFail(id);
    Object.assign(faq, dto);
    const saved = await this.faqRepo.save(faq);
    return {
      message: 'FAQ updated successfully',
      data: this.toResponse(saved),
    };
  }

  async getCategories() {
    const result = await this.faqRepo
      .createQueryBuilder('faq')
      .select('faq.category')
      .where('faq.category IS NOT NULL')
      .andWhere('faq.isActive = :isActive', { isActive: true })
      .groupBy('faq.category')
      .orderBy('faq.category', 'ASC')
      .getRawMany();
    return result.map((r) => r.faq_category).filter(Boolean);
  }

  async remove(id: string) {
    const faq = await this.findByIdOrFail(id);
    await this.faqRepo.remove(faq);
    return { message: 'FAQ deleted successfully' };
  }

  private async findByIdOrFail(id: string): Promise<Faq> {
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  private toResponse(faq: Faq): FaqResponseDto {
    return plainToInstance(FaqResponseDto, faq, {
      excludeExtraneousValues: true,
    });
  }
}
