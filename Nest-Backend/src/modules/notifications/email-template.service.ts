import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EmailTemplate,
  EmailTemplateCode,
} from './entities/email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

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
    if (existing) {
      throw new ConflictException(
        `Template with code "${dto.code}" already exists`,
      );
    }
    const template = this.templateRepo.create(dto);
    return this.templateRepo.save(template);
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    isActive?: boolean,
  ): Promise<any> {
    const qb = this.templateRepo.createQueryBuilder('template');

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(template.name) LIKE :search OR LOWER(template.code) LIKE :search OR LOWER(template.subject) LIKE :search OR LOWER(template.description) LIKE :search)',
        { search: searchTerm },
      );
    }

    if (isActive !== undefined) {
      qb.andWhere('template.isActive = :isActive', { isActive });
    }

    qb.orderBy('template.createdAt', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [templates, total] = await qb.getManyAndCount();

    const [totalTemplates, activeTemplates, inactiveTemplates] =
      await Promise.all([
        this.templateRepo.count(),
        this.templateRepo.count({ where: { isActive: true } }),
        this.templateRepo.count({ where: { isActive: false } }),
      ]);

    return {
      templates,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      totalTemplates,
      activeTemplates,
      inactiveTemplates,
    };
  }

  async findById(id: string): Promise<EmailTemplate> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Email template not found');
    }
    return template;
  }

  async findByCode(code: EmailTemplateCode): Promise<EmailTemplate> {
    const template = await this.templateRepo.findOne({
      where: { code, isActive: true },
    });
    if (!template) {
      throw new NotFoundException(
        `Active email template not found for code: ${code}`,
      );
    }
    return template;
  }

  async update(
    id: string,
    dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const template = await this.findById(id);
    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findById(id);
    await this.templateRepo.remove(template);
  }
}
