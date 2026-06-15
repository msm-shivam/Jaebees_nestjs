import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { CreateEmailCampaignDto } from '../dto/create-email-campaign.dto';
import { UpdateEmailCampaignDto } from '../dto/update-email-campaign.dto';

@Injectable()
export class EmailCampaignService {
  constructor(
    @InjectRepository(EmailCampaign)
    private readonly campaignRepo: Repository<EmailCampaign>,
  ) {}

  async create(dto: CreateEmailCampaignDto): Promise<EmailCampaign> {
    const campaign = this.campaignRepo.create({
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });
    return this.campaignRepo.save(campaign);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) {
    const qb = this.campaignRepo
      .createQueryBuilder('c')
      .orderBy('c.createdAt', 'DESC');

    if (query.status)
      qb.andWhere('c.status = :status', { status: query.status });
    if (query.type) qb.andWhere('c.type = :type', { type: query.type });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<EmailCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(
    id: string,
    dto: UpdateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const campaign = await this.findOne(id);
    Object.assign(campaign, {
      ...dto,
      scheduledAt: dto.scheduledAt
        ? new Date(dto.scheduledAt)
        : campaign.scheduledAt,
    });
    return this.campaignRepo.save(campaign);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignRepo.remove(campaign);
  }
}
