import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import {
  DeliveryCharge,
  DeliveryChargeType,
} from './entities/delivery-charge.entity';
import { DeliveryChargeAudit } from './entities/delivery-charge-audit.entity';
import { CreateDeliveryChargeDto } from './dto/create-delivery-charge.dto';
import { UpdateDeliveryChargeDto } from './dto/update-delivery-charge.dto';
import { DeliveryChargeResponseDto } from './dto/delivery-charge-response.dto';
import { DeliveryChargeQueryDto } from './dto/delivery-charge-query.dto';
import { ActiveDeliveryChargesResponseDto } from './dto/active-delivery-charges-response.dto';
import { PaymentMethod } from '../payments/entities/payment-method.entity';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class DeliveryChargesService {
  constructor(
    @InjectRepository(DeliveryCharge)
    private readonly repo: Repository<DeliveryCharge>,
    @InjectRepository(DeliveryChargeAudit)
    private readonly auditRepo: Repository<DeliveryChargeAudit>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
  ) {}

  async create(dto: CreateDeliveryChargeDto, adminId: string) {
    const existing = await this.repo.findOne({
      where: { chargeType: dto.chargeType, isActive: true },
    });
    if (dto.chargeType !== DeliveryChargeType.FIXED_DELIVERY && existing) {
      throw new BadRequestException(
        `An active ${dto.chargeType} rule already exists. Only one per type allowed.`,
      );
    }

    const charge = this.repo.create({
      name: dto.name,
      description: dto.description ?? null,
      chargeAmount: dto.chargeAmount,
      chargeType: dto.chargeType,
      isActive: dto.isActive ?? true,
      createdBy: adminId,
      updatedBy: adminId,
    });
    const saved = await this.repo.save(charge);

    await this.auditRepo.save({
      deliveryChargeId: saved.id,
      oldValue: null,
      newValue: {
        name: saved.name,
        chargeAmount: Number(saved.chargeAmount),
        chargeType: saved.chargeType,
        isActive: saved.isActive,
      },
      changedBy: adminId,
    });

    return {
      message: 'Delivery charge created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: DeliveryChargeQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};
    if (query.chargeType) where.chargeType = query.chargeType;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(
      items.map((i) => this.toResponse(i)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string) {
    const charge = await this.repo.findOne({ where: { id } });
    if (!charge) throw new NotFoundException('Delivery charge not found.');
    return { data: this.toResponse(charge) };
  }

  async update(id: string, dto: UpdateDeliveryChargeDto, adminId: string) {
    const charge = await this.repo.findOne({ where: { id } });
    if (!charge) throw new NotFoundException('Delivery charge not found.');

    const oldValue = {
      name: charge.name,
      chargeAmount: Number(charge.chargeAmount),
      chargeType: charge.chargeType,
      isActive: charge.isActive,
    };

    if (dto.chargeType && dto.chargeType !== charge.chargeType) {
      const existing = await this.repo.findOne({
        where: { chargeType: dto.chargeType, isActive: true },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `An active ${dto.chargeType} rule already exists.`,
        );
      }
    }

    Object.assign(charge, dto, { updatedBy: adminId });
    const saved = await this.repo.save(charge);

    await this.auditRepo.save({
      deliveryChargeId: saved.id,
      oldValue,
      newValue: {
        name: saved.name,
        chargeAmount: Number(saved.chargeAmount),
        chargeType: saved.chargeType,
        isActive: saved.isActive,
      },
      changedBy: adminId,
    });

    return {
      message: 'Delivery charge updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string) {
    const charge = await this.repo.findOne({ where: { id } });
    if (!charge) throw new NotFoundException('Delivery charge not found.');
    await this.repo.remove(charge);
    return { message: 'Delivery charge deleted successfully.' };
  }

  async toggleActive(id: string, adminId: string) {
    const charge = await this.repo.findOne({ where: { id } });
    if (!charge) throw new NotFoundException('Delivery charge not found.');

    const oldValue = { isActive: charge.isActive };
    charge.isActive = !charge.isActive;
    charge.updatedBy = adminId;
    const saved = await this.repo.save(charge);

    await this.auditRepo.save({
      deliveryChargeId: saved.id,
      oldValue,
      newValue: { isActive: saved.isActive },
      changedBy: adminId,
    });

    return {
      message: `Delivery charge ${saved.isActive ? 'enabled' : 'disabled'} successfully.`,
      data: this.toResponse(saved),
    };
  }

  async getActiveCharges(): Promise<{
    deliveryCharge: number;
    freeShippingThreshold: number;
    codCharge?: number;
    handlingCharge: number;
  }> {
    const charges = await this.repo.find({ where: { isActive: true } });

    const codMethod = await this.paymentMethodRepo.findOne({
      where: { code: 'cod', isActive: true },
    });

    let deliveryCharge = 0;
    let freeShippingThreshold = 0;
    let codCharge = undefined as number | undefined;
    let handlingCharge = 0;

    for (const c of charges) {
      const amount = Number(c.chargeAmount);
      switch (c.chargeType) {
        case DeliveryChargeType.FIXED_DELIVERY:
          deliveryCharge = amount;
          break;
        case DeliveryChargeType.FREE_SHIPPING_THRESHOLD:
          freeShippingThreshold = amount;
          break;
        case DeliveryChargeType.COD_CHARGE:
          codCharge = codMethod ? amount : undefined;
          break;
        case DeliveryChargeType.HANDLING_CHARGE:
          handlingCharge = amount;
          break;
      }
    }

    return {
      deliveryCharge,
      freeShippingThreshold,
      ...(codCharge !== undefined ? { codCharge } : {}),
      handlingCharge,
    };
  }

  calculateCharges(
    subtotal: number,
    activeCharges: {
      deliveryCharge: number;
      freeShippingThreshold: number;
      codCharge?: number;
      handlingCharge: number;
    },
  ) {
    const deliveryCharge =
      subtotal >= activeCharges.freeShippingThreshold &&
      activeCharges.freeShippingThreshold > 0
        ? 0
        : activeCharges.deliveryCharge;
    const codCharge = activeCharges.codCharge ?? 0;
    const handlingCharge = activeCharges.handlingCharge;
    return { deliveryCharge, codCharge, handlingCharge };
  }

  async getHistory(id: string) {
    const audits = await this.auditRepo.find({
      where: { deliveryChargeId: id },
      order: { changedAt: 'DESC' },
    });
    return { data: audits };
  }

  private toResponse(charge: DeliveryCharge): DeliveryChargeResponseDto {
    return plainToInstance(DeliveryChargeResponseDto, charge, {
      excludeExtraneousValues: true,
    });
  }
}
