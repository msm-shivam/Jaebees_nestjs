import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Like } from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import { CampaignQueryDto } from '../dto/campaign-query.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
  ) {}

  async create(dto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
    return this.campaignRepository.save(campaign);
  }

  async findAll(query: CampaignQueryDto): Promise<{ items: Campaign[]; total: number }> {
    const { search, type, isActive, page = 1, limit = 20 } = query;
    const where: any = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    const [items, total] = await this.campaignRepository.findAndCount({
      where,
      order: { priority: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findById(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID "${id}" not found`);
    }
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    await this.findById(id);
    const updateData: any = { ...dto };
    if (dto.startDate) {
      updateData.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      updateData.endDate = new Date(dto.endDate);
    }
    await this.campaignRepository.update(id, updateData);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findById(id);
    await this.campaignRepository.remove(campaign);
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const now = new Date();
    return this.campaignRepository.find({
      where: {
        isActive: true,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      order: { priority: 'DESC' },
    });
  }

  async autoExpireCampaigns(): Promise<number> {
    const now = new Date();
    const result = await this.campaignRepository.update(
      { isActive: true, endDate: LessThan(now) },
      { isActive: false },
    );
    return result.affected ?? 0;
  }
}
