import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSetting } from '../entities/contact-setting.entity';
import type { UpdateContactSettingsDto } from '../dto/update-contact-settings.dto';

@Injectable()
export class ContactSettingsService {
  constructor(
    @InjectRepository(ContactSetting)
    private readonly contactRepo: Repository<ContactSetting>,
  ) {}

  async find(): Promise<ContactSetting | null> {
    const records = await this.contactRepo.find({
      take: 1,
      order: { createdAt: 'DESC' },
    });
    return records[0] ?? null;
  }

  async upsert(dto: UpdateContactSettingsDto): Promise<ContactSetting> {
    let record = await this.find();
    if (!record) {
      record = this.contactRepo.create({
        email: dto.email ?? '',
        phone: dto.phone ?? null,
        address: dto.address ?? null,
        supportHours: dto.supportHours ?? null,
      });
    } else {
      Object.assign(record, dto);
    }
    return this.contactRepo.save(record);
  }
}
