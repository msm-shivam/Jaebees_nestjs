import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Settlement } from '../entities/settlement.entity';
import { CreateSettlementDto } from '../dto/create-settlement.dto';
import { UpdateSettlementDto } from '../dto/update-settlement.dto';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepo: Repository<Settlement>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSettlementDto): Promise<Settlement> {
    const settlementNumber = await this.generateSettlementNumber();
    const settlement = this.settlementRepo.create({
      ...dto,
      settlementNumber,
      settlementDate: dto.settlementDate ? new Date(dto.settlementDate) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });
    return this.settlementRepo.save(settlement);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    supplierId?: string;
  }) {
    const qb = this.settlementRepo
      .createQueryBuilder('s')
      .orderBy('s.createdAt', 'DESC');

    if (query.status)
      qb.andWhere('s.status = :status', { status: query.status });
    if (query.supplierId)
      qb.andWhere('s.supplier_id = :supplierId', {
        supplierId: query.supplierId,
      });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Settlement> {
    const settlement = await this.settlementRepo.findOne({ where: { id } });
    if (!settlement) throw new NotFoundException('Settlement not found');
    return settlement;
  }

  async update(id: string, dto: UpdateSettlementDto): Promise<Settlement> {
    const settlement = await this.findOne(id);
    Object.assign(settlement, {
      ...dto,
      settlementDate: dto.settlementDate
        ? new Date(dto.settlementDate)
        : settlement.settlementDate,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : settlement.dueDate,
    });
    return this.settlementRepo.save(settlement);
  }

  private async generateSettlementNumber(): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO settlement_sequence_counters (locked, last_number) VALUES (1, 0)
       ON CONFLICT (locked) DO UPDATE SET last_number = settlement_sequence_counters.last_number + 1
       RETURNING last_number`,
    );
    const nextNum = result[0]?.last_number ?? 1;
    return `STL-${new Date().getFullYear()}-${String(nextNum).padStart(6, '0')}`;
  }
}
