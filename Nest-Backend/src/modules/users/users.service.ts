import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, ILike } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  comparePassword,
  hashPassword,
} from '../../common/utils/password.util';
import {
  AuthMessages,
  UserMessages,
} from '../../common/constants/messages.constants';
import { AuditLogService } from '../security-compliance/services/audit-log.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.findByIdOrFail(userId);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<{ message: string; data: UserResponseDto }> {
    const user = await this.findByIdOrFail(userId);

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) throw new BadRequestException(UserMessages.EMAIL_TAKEN);
    }

    if (dto.mobile && dto.mobile !== user.mobile) {
      const existing = await this.userRepo.findOne({
        where: { mobile: dto.mobile },
      });
      if (existing) throw new BadRequestException(UserMessages.MOBILE_TAKEN);
    }

    Object.assign(user, {
      ...(dto.firstName && { firstName: dto.firstName }),
      ...(dto.lastName && { lastName: dto.lastName }),
      ...(dto.email !== undefined && { email: dto.email.toLowerCase() }),
      ...(dto.mobile !== undefined && { mobile: dto.mobile }),
    });

    const saved = await this.userRepo.save(user);
    const data = plainToInstance(UserResponseDto, saved, {
      excludeExtraneousValues: true,
    });
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
    // await this.auditLogService.log({
    //   userId,
    //   action: 'PASSWORD_CHANGE',
    //   entityType: 'USER',
    //   entityId: userId,
    //   newValues: { message: 'Password changed' },
    // });
    return { message: UserMessages.PASSWORD_CHANGED };
  }

  async updateAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ message: string; data: UserResponseDto }> {
    const user = await this.findByIdOrFail(userId);
    user.avatar = `/uploads/avatars/${file.filename}`;
    const saved = await this.userRepo.save(user);
    const data = plainToInstance(UserResponseDto, saved, {
      excludeExtraneousValues: true,
    });
    return { message: UserMessages.PROFILE_UPDATED, data };
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async findAllCustomers(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<any> {
    const { page = 1, limit = 20, search, isActive, isEmailVerified, dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const where: any = {};

    if (search) {
      where.firstName = ILike(`%${search}%`);
    }
    if (isActive !== undefined) where.isActive = isActive;
    if (isEmailVerified !== undefined) where.isEmailVerified = isEmailVerified;
    if (dateFrom && dateTo) {
      where.createdAt = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      where.createdAt = MoreThanOrEqual(new Date(dateFrom));
    } else if (dateTo) {
      where.createdAt = LessThanOrEqual(new Date(dateTo));
    }

    const [users, total] = await this.userRepo.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = users.map((u) =>
      plainToInstance(UserResponseDto, u, { excludeExtraneousValues: true }),
    );

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalCustomers, activeCustomers, verifiedCustomers, newThisMonth, newToday] =
      await Promise.all([
        this.userRepo.count(),
        this.userRepo.count({ where: { isActive: true } }),
        this.userRepo.count({ where: { isEmailVerified: true } }),
        this.userRepo.count({
          where: { createdAt: MoreThanOrEqual(monthStart) as any },
        }),
        this.userRepo.count({
          where: { createdAt: MoreThanOrEqual(todayStart) as any },
        }),
      ]);

    return {
      customers: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalCustomers,
      activeCustomers,
      verifiedCustomers,
      newThisMonth,
      newToday,
    };
  }

  async getCustomerStats(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    verifiedCustomers: number;
    newThisMonth: number;
    newToday: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalCustomers, activeCustomers, verifiedCustomers, newThisMonth, newToday] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { isActive: true } }),
      this.userRepo.count({ where: { isEmailVerified: true } }),
      this.userRepo.count({ where: { createdAt: MoreThanOrEqual(startOfMonth) } }),
      this.userRepo.count({ where: { createdAt: MoreThanOrEqual(startOfToday) } }),
    ]);

    return { totalCustomers, activeCustomers, verifiedCustomers, newThisMonth, newToday };
  }

  async toggleCustomerActive(id: string): Promise<{ message: string; data: UserResponseDto }> {
    const user = await this.findByIdOrFail(id);
    user.isActive = !user.isActive;
    const saved = await this.userRepo.save(user);
    const data = plainToInstance(UserResponseDto, saved, { excludeExtraneousValues: true });
    return { message: `Customer ${saved.isActive ? 'activated' : 'deactivated'} successfully`, data };
  }

  async deleteCustomer(id: string): Promise<{ message: string }> {
    const user = await this.findByIdOrFail(id);
    await this.userRepo.softRemove(user);
    return { message: 'Customer deleted successfully' };
  }
}
