import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SupplierQueryDto } from '../dto/supplier-query.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const existing = await this.supplierRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Supplier code "${dto.code}" already exists`);
    }
    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  async findAll(query: SupplierQueryDto): Promise<{ items: Supplier[]; total: number }> {
    const { search, isActive, page = 1, limit = 20 } = query;
    const where: any = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    const [items, total] = await this.supplierRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findById(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID "${id}" not found`);
    }
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    await this.findById(id);
    if (dto.code) {
      const existing = await this.supplierRepository.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Supplier code "${dto.code}" already exists`);
      }
    }
    await this.supplierRepository.update(id, dto);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findById(id);
    await this.supplierRepository.softRemove(supplier);
  }
}
