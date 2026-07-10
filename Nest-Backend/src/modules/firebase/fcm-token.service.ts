import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FcmToken, FcmUserType } from './entities/fcm-token.entity';

@Injectable()
export class FcmTokenService {
  constructor(
    @InjectRepository(FcmToken)
    private readonly repo: Repository<FcmToken>,
  ) {}

  async register(
    userId: string,
    userType: FcmUserType,
    token: string,
    deviceInfo?: Record<string, any>,
  ): Promise<FcmToken> {
    const existing = await this.repo.findOne({ where: { token } as any });
    if (existing) {
      existing.userId = userId;
      existing.userType = userType;
      if (deviceInfo) existing.deviceInfo = deviceInfo;
      return this.repo.save(existing);
    }
    return this.repo.save(
      this.repo.create({ userId, userType, token, deviceInfo }),
    );
  }

  async findByUser(userId: string, userType: FcmUserType): Promise<FcmToken[]> {
    return this.repo.find({
      where: { userId, userType } as any,
      order: { createdAt: 'DESC' },
    });
  }

  async remove(token: string): Promise<void> {
    await this.repo.delete({ token } as any);
  }

  async removeByUser(userId: string, userType: FcmUserType): Promise<number> {
    const result = await this.repo.delete({ userId, userType } as any);
    return result.affected ?? 0;
  }

  async findAllByUserType(userType: FcmUserType): Promise<FcmToken[]> {
    return this.repo.find({ where: { userType } as any });
  }

  async removeByUserType(userType: FcmUserType): Promise<number> {
    const result = await this.repo.delete({ userType } as any);
    return result.affected ?? 0;
  }
}
