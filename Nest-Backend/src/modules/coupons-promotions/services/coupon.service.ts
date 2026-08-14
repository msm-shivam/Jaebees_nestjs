import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CouponRule } from '../entities/coupon-rule.entity';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { CouponQueryDto } from '../dto/coupon-query.dto';

@Injectable()
export class CouponService implements OnModuleInit {
  private readonly logger = new Logger(CouponService.name);

  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponRule)
    private readonly ruleRepository: Repository<CouponRule>,
    private readonly dataSource: DataSource,
  ) {}

  private validateUuid(id: string) {
    if (!id || id === 'undefined' || id === 'null' || !/^[0-9a-fA-F-]{36}$/.test(id)) {
      throw new BadRequestException(`Invalid coupon ID "${id}"`);
    }
  }

  private sanitizeTargetId(targetId?: string | null): string | null {
    if (!targetId || targetId === 'undefined' || targetId === 'null') {
      return null;
    }
    return targetId;
  }

  async onModuleInit() {
    try {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS coupon_rules (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          coupon_id uuid NOT NULL,
          rule_type varchar NOT NULL,
          target_type varchar NOT NULL,
          target_id varchar,
          created_at timestamptz DEFAULT now()
        );
        ALTER TABLE coupons ADD COLUMN IF NOT EXISTS name varchar DEFAULT '';
        ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description text;
        ALTER TABLE coupons ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'ACTIVE';
        ALTER TABLE coupons ADD COLUMN IF NOT EXISTS priority int DEFAULT 0;
        ALTER TABLE coupons ADD COLUMN IF NOT EXISTS auto_apply boolean DEFAULT false;
        ALTER TABLE coupons ADD COLUMN IF NOT EXISTS admin_notes text;
        ALTER TABLE coupons ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
      `);
      this.logger.log('Database schema for coupons and coupon_rules verified.');
    } catch (err) {
      this.logger.error('Failed to initialize coupons table schema', err);
    }
  }

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const code = dto.code.toUpperCase();
    const existing = await this.couponRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException(`Coupon code "${code}" already exists`);
    }

    const { rules, startDate, endDate, ...rest } = dto;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      throw new BadRequestException('End date must be strictly after start date');
    }

    const coupon = this.couponRepository.create({
      ...rest,
      code,
      startDate: start,
      endDate: end,
    });

    const savedCoupon = await this.couponRepository.save(coupon);

    if (rules && rules.length > 0) {
      const ruleEntities = rules.map((r) =>
        this.ruleRepository.create({
          couponId: savedCoupon.id,
          ruleType: r.ruleType,
          targetType: r.targetType,
          targetId: this.sanitizeTargetId(r.targetId),
        }),
      );
      await this.ruleRepository.save(ruleEntities);
    }

    return this.findById(savedCoupon.id);
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
      relations: { rules: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findById(id: string): Promise<Coupon> {
    this.validateUuid(id);
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: { rules: true },
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase() },
      relations: { rules: true },
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon "${code}" not found`);
    }
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    this.validateUuid(id);
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

    const { rules, startDate, endDate, ...rest } = dto as any;
    const updateData: any = { ...rest };
    if (dto.code) {
      updateData.code = dto.code.toUpperCase();
    }
    const finalStart = startDate ? new Date(startDate) : coupon.startDate;
    const finalEnd = endDate ? new Date(endDate) : coupon.endDate;
    if (finalStart >= finalEnd) {
      throw new BadRequestException('End date must be strictly after start date');
    }
    if (startDate) {
      updateData.startDate = finalStart;
    }
    if (endDate) {
      updateData.endDate = finalEnd;
    }

    await this.couponRepository.update(id, updateData);

    if (rules !== undefined) {
      await this.ruleRepository.delete({ couponId: id });
      if (rules.length > 0) {
        const ruleEntities = rules.map((r: any) =>
          this.ruleRepository.create({
            couponId: id,
            ruleType: r.ruleType,
            targetType: r.targetType,
            targetId: this.sanitizeTargetId(r.targetId),
          }),
        );
        await this.ruleRepository.save(ruleEntities);
      }
    }

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    this.validateUuid(id);
    const coupon = await this.findById(id);
    await this.couponRepository.remove(coupon);
  }
}

