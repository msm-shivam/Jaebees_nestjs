import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  comparePassword,
  hashPassword,
} from '../../common/utils/password.util';
import { AuthMessages, UserMessages } from '../../common/constants/messages.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.findByIdOrFail(userId);
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<{ message: string; data: UserResponseDto }> {
    const user = await this.findByIdOrFail(userId);

    if (dto.mobile && dto.mobile !== user.mobile) {
      const existing = await this.userRepo.findOne({
        where: { mobile: dto.mobile },
      });
      if (existing) throw new BadRequestException(UserMessages.MOBILE_TAKEN);
    }

    Object.assign(user, {
      ...(dto.firstName && { firstName: dto.firstName }),
      ...(dto.lastName && { lastName: dto.lastName }),
      ...(dto.mobile !== undefined && { mobile: dto.mobile }),
    });

    const saved = await this.userRepo.save(user);
    const data = plainToInstance(UserResponseDto, saved, { excludeExtraneousValues: true });
    return { message: UserMessages.PROFILE_UPDATED, data };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findByIdOrFail(userId);

    const valid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException(AuthMessages.INVALID_CREDENTIALS);

    const passwordHash = await hashPassword(dto.newPassword);
    await this.userRepo.update(userId, { passwordHash });
    return { message: UserMessages.PASSWORD_CHANGED };
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email: email.toLowerCase() } });
  }
}
