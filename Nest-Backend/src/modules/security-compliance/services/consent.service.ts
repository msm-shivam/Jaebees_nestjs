import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentRecord } from '../entities/consent-record.entity';
import { ConsentType } from '../enums/consent-type.enum';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(ConsentRecord)
    private readonly consentRepo: Repository<ConsentRecord>,
  ) {}

  async createOrUpdate(
    userId: string,
    consentType: ConsentType,
    accepted: boolean,
  ): Promise<ConsentRecord> {
    let record = await this.consentRepo.findOne({
      where: { userId, consentType },
    });
    if (!record) {
      record = this.consentRepo.create({
        userId,
        consentType,
        accepted,
        acceptedAt: new Date(),
      });
    } else {
      record.accepted = accepted;
      record.acceptedAt = new Date();
    }
    return this.consentRepo.save(record);
  }

  async findByUser(userId: string): Promise<ConsentRecord[]> {
    return this.consentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
