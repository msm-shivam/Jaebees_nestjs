import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsPage } from '../entities/cms-page.entity';
import { CmsPageStatus } from '../enums/cms-page-status.enum';
import type { CreateCmsPageDto } from '../dto/create-cms-page.dto';
import type { UpdateCmsPageDto } from '../dto/update-cms-page.dto';

@Injectable()
export class CmsPageService {
  constructor(
    @InjectRepository(CmsPage)
    private readonly cmsPageRepo: Repository<CmsPage>,
  ) {}

  async create(dto: CreateCmsPageDto): Promise<CmsPage> {
    const page = this.cmsPageRepo.create(dto);
    return this.cmsPageRepo.save(page);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.cmsPageRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<CmsPage> {
    const page = await this.cmsPageRepo.findOne({ where: { id } });
    if (!page) throw new NotFoundException('CMS page not found');
    return page;
  }

  async findBySlug(slug: string): Promise<CmsPage | null> {
    return this.cmsPageRepo.findOne({
      where: { slug, status: CmsPageStatus.PUBLISHED },
    });
  }

  async update(id: string, dto: UpdateCmsPageDto): Promise<CmsPage> {
    const page = await this.findOne(id);
    Object.assign(page, dto);
    return this.cmsPageRepo.save(page);
  }

  async remove(id: string): Promise<void> {
    const page = await this.findOne(id);
    await this.cmsPageRepo.remove(page);
  }
}
