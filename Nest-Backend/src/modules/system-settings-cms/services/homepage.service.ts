import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomepageSection } from '../entities/homepage-section.entity';
import type { CreateHomepageSectionDto } from '../dto/create-homepage-section.dto';
import type { UpdateHomepageSectionDto } from '../dto/update-homepage-section.dto';

@Injectable()
export class HomepageService {
  constructor(
    @InjectRepository(HomepageSection)
    private readonly sectionRepo: Repository<HomepageSection>,
  ) {}

  async findAll() {
    return this.sectionRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async create(dto: CreateHomepageSectionDto): Promise<HomepageSection> {
    const section = this.sectionRepo.create(dto);
    return this.sectionRepo.save(section);
  }

  async update(
    id: string,
    dto: UpdateHomepageSectionDto,
  ): Promise<HomepageSection> {
    const section = await this.sectionRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Homepage section not found');
    Object.assign(section, dto);
    return this.sectionRepo.save(section);
  }

  async remove(id: string): Promise<void> {
    const section = await this.sectionRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Homepage section not found');
    await this.sectionRepo.remove(section);
  }
}
