import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectRepository(NotificationPreference)
    private readonly prefRepo: Repository<NotificationPreference>,
  ) {}

  async findByUserId(userId: string): Promise<NotificationPreference> {
    let pref = await this.prefRepo.findOne({ where: { userId } });
    if (!pref) {
      pref = this.prefRepo.create({ userId });
      pref = await this.prefRepo.save(pref);
    }
    return pref;
  }

  async update(
    userId: string,
    dto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const pref = await this.findByUserId(userId);
    Object.assign(pref, dto);
    return this.prefRepo.save(pref);
  }

  async shouldSend(userId: string, type: string): Promise<boolean> {
    try {
      const pref = await this.findByUserId(userId);
      switch (type) {
        case 'order':
          return pref.orderEmails;
        case 'payment':
          return pref.paymentEmails;
        case 'shipment':
          return pref.shipmentEmails;
        case 'promotional':
          return pref.promotionalEmails;
        case 'review':
          return pref.reviewEmails;
        default:
          return true;
      }
    } catch {
      return true;
    }
  }
}
