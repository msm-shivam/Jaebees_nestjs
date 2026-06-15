import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivacyRequest } from '../entities/privacy-request.entity';
import { PrivacyRequestStatus } from '../enums/privacy-request-status.enum';
import { PrivacyRequestType } from '../enums/privacy-request-type.enum';
import { ProcessPrivacyRequestDto } from '../dto/process-privacy-request.dto';

@Injectable()
export class PrivacyRequestService {
  constructor(
    @InjectRepository(PrivacyRequest)
    private readonly privacyRepo: Repository<PrivacyRequest>,
  ) {}

  async create(
    userId: string,
    requestType: PrivacyRequestType,
  ): Promise<PrivacyRequest> {
    const request = this.privacyRepo.create({ userId, requestType });
    return this.privacyRepo.save(request);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.privacyRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findByUser(userId: string) {
    return this.privacyRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PrivacyRequest> {
    const request = await this.privacyRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Privacy request not found');
    return request;
  }

  async process(
    id: string,
    dto: ProcessPrivacyRequestDto,
  ): Promise<PrivacyRequest> {
    const request = await this.findOne(id);
    if (dto.status) request.status = dto.status;
    if (
      dto.status === PrivacyRequestStatus.COMPLETED ||
      dto.status === PrivacyRequestStatus.REJECTED
    ) {
      request.processedAt = new Date();
    }
    return this.privacyRepo.save(request);
  }
}
