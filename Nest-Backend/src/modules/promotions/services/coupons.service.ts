import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { CouponQueryDto } from '../dto/coupon-query.dto';
import { CouponType } from '../enums/coupon-type.enum';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto, adminId: string): Promise<Coupon> {
    const existing = await this.couponRepository.findOne({
      where: { code: dto.code.toUpperCase() },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }
    const coupon = this.couponRepository.create({
      ...dto,
      code: dto.code.toUpperCase(),
      createdBy: adminId,
      startsAt: new Date(dto.startsAt),
      expiresAt: new Date(dto.expiresAt),
    });
    return this.couponRepository.save(coupon);
  }

  async findAll(query: CouponQueryDto): Promise<PaginatedResult<Coupon>> {
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.code = Like(`%${query.search.toUpperCase()}%`);
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.discountType) {
      where.discountType = query.discountType;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const [items, total] = await this.couponRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(items, total, page, limit);
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findById(id);
    if (dto.code) {
      dto.code = dto.code.toUpperCase();
      const existing = await this.couponRepository.findOne({
        where: { code: dto.code },
        withDeleted: true,
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Coupon code already exists');
      }
    }
    Object.assign(coupon, dto);
    if (dto.startsAt) coupon.startsAt = new Date(dto.startsAt);
    if (dto.expiresAt) coupon.expiresAt = new Date(dto.expiresAt);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.couponRepository.softDelete(id);
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found or inactive');
    }
    return coupon;
  }

  validateCoupon(
    coupon: Coupon,
    userId: string,
    orderAmount: number,
    isFirstOrder: boolean,
  ): { valid: boolean; message?: string } {
    const now = new Date();
    if (!coupon.isActive) {
      return { valid: false, message: 'Coupon is inactive' };
    }
    if (now < coupon.startsAt) {
      return { valid: false, message: 'Coupon not yet valid' };
    }
    if (now > coupon.expiresAt) {
      return { valid: false, message: 'Coupon has expired' };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }
    if (orderAmount < coupon.minimumOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of ${coupon.minimumOrderAmount} required`,
      };
    }
    if (coupon.type === CouponType.FIRST_ORDER && !isFirstOrder) {
      return { valid: false, message: 'This coupon is for first orders only' };
    }
    return { valid: true };
  }
}
