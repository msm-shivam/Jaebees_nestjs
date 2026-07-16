import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../entities/email-template.entity';
import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly templateRepo: Repository<EmailTemplate>,
  ) {}

  async create(dto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const existing = await this.templateRepo.findOne({
      where: { code: dto.code },
    });
    if (existing) throw new ConflictException('Template code already exists');
    const template = this.templateRepo.create(dto);
    return this.templateRepo.save(template);
  }

  async findAll(query: { page?: number; limit?: number; active?: boolean; search?: string }) {
    const qb = this.templateRepo
      .createQueryBuilder('t')
      .orderBy('t.createdAt', 'DESC');

    if (query.active !== undefined)
      qb.andWhere('t.active = :active', { active: query.active });

    if (query.search) {
      qb.andWhere(
        '(t.name ILIKE :search OR t.code ILIKE :search OR t.subject ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<EmailTemplate> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Email template not found');
    return template;
  }

  async findByCode(code: string): Promise<EmailTemplate | null> {
    return this.templateRepo.findOne({ where: { code } });
  }

  async update(
    id: string,
    dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepo.remove(template);
  }
}
