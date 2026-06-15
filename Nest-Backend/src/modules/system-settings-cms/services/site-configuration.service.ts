import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteConfiguration } from '../entities/site-configuration.entity';

@Injectable()
export class SiteConfigurationService {
  constructor(
    @InjectRepository(SiteConfiguration)
    private readonly configRepo: Repository<SiteConfiguration>,
  ) {}

  async find(): Promise<SiteConfiguration | null> {
    const records = await this.configRepo.find({
      take: 1,
      order: { createdAt: 'DESC' },
    });
    return records[0] ?? null;
  }

  async upsert(data: Partial<SiteConfiguration>): Promise<SiteConfiguration> {
    let config = await this.find();
    if (!config) {
      config = this.configRepo.create({
        siteName: data.siteName ?? 'My Store',
        logoUrl: data.logoUrl ?? null,
        faviconUrl: data.faviconUrl ?? null,
        maintenanceMode: data.maintenanceMode ?? false,
      });
    } else {
      Object.assign(config, data);
    }
    return this.configRepo.save(config);
  }
}
