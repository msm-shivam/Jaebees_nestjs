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

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const code = dto.code.toUpperCase();
    const existing = await this.couponRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException(`Coupon code "${code}" already exists`);
    }
    const coupon = this.couponRepository.create({
      ...dto,
      code,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
    return this.couponRepository.save(coupon);
  }

  async findAll(
    query: CouponQueryDto,
  ): Promise<{ items: Coupon[]; total: number }> {
    const { search, type, isActive, page = 1, limit = 20 } = query;
    const where: any = {};
    if (search) {
      where.code = Like(`%${search.toUpperCase()}%`);
    }
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    const [items, total] = await this.couponRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon "${code}" not found`);
    }
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findById(id);
    if (dto.code && dto.code.toUpperCase() !== coupon.code) {
      const existing = await this.couponRepository.findOne({
        where: { code: dto.code.toUpperCase() },
      });
      if (existing) {
        throw new ConflictException(
          `Coupon code "${dto.code.toUpperCase()}" already exists`,
        );
      }
    }
    const updateData: any = { ...dto };
    if (dto.code) {
      updateData.code = dto.code.toUpperCase();
    }
    if (dto.startDate) {
      updateData.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      updateData.endDate = new Date(dto.endDate);
    }
    await this.couponRepository.update(id, updateData);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findById(id);
    await this.couponRepository.remove(coupon);
  }
}
