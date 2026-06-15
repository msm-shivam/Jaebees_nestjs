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

  async findAll(): Promise<EmailTemplate[]> {
    return this.templateRepo.find({ order: { createdAt: 'DESC' } });
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
