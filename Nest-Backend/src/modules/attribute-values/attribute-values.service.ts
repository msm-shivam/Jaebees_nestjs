import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { AttributeValue } from './entities/attribute-value.entity';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { AttributeValueQueryDto } from './dto/attribute-value-query.dto';
import { AttributeValueResponseDto } from './dto/attribute-value-response.dto';
import { AttributesService } from '../attributes/attributes.service';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';

@Injectable()
export class AttributeValuesService {
  constructor(
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepo: Repository<AttributeValue>,
    private readonly attributesService: AttributesService,
  ) {}

  async create(
    dto: CreateAttributeValueDto,
  ): Promise<{ message: string; data: AttributeValueResponseDto }> {
    await this.attributesService.findByIdOrFail(dto.attributeId);

    const slug = dto.slug ?? toSlug(dto.value);
    await this.ensureSlugUnique(dto.attributeId, slug);

    const attributeValue = this.attributeValueRepo.create({
      attributeId: dto.attributeId,
      value: dto.value,
      slug,
      sortOrder: dto.sortOrder ?? 0,
    });

    const saved = await this.attributeValueRepo.save(attributeValue);
    return {
      message: 'Attribute value created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: AttributeValueQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.attributeId) where.attributeId = query.attributeId;
    if (query.search) where.value = ILike(`%${query.search}%`);

    const [items, total] = await this.attributeValueRepo.findAndCount({
      where,
      order: { sortOrder: 'ASC', value: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(
      items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<AttributeValueResponseDto> {
    const attributeValue = await this.findByIdOrFail(id);
    return this.toResponse(attributeValue);
  }

  async update(
    id: string,
    dto: UpdateAttributeValueDto,
  ): Promise<{ message: string; data: AttributeValueResponseDto }> {
    const attributeValue = await this.findByIdOrFail(id);

    if (dto.slug && dto.slug !== attributeValue.slug) {
      await this.ensureSlugUnique(attributeValue.attributeId, dto.slug, id);
      attributeValue.slug = dto.slug;
    } else if (dto.value && !dto.slug && dto.value !== attributeValue.value) {
      const newSlug = toSlug(dto.value);
      if (newSlug !== attributeValue.slug) {
        await this.ensureSlugUnique(attributeValue.attributeId, newSlug, id);
        attributeValue.slug = newSlug;
      }
    }

    if (dto.value !== undefined) attributeValue.value = dto.value;
    if (dto.sortOrder !== undefined) attributeValue.sortOrder = dto.sortOrder;

    const saved = await this.attributeValueRepo.save(attributeValue);
    return {
      message: 'Attribute value updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const attributeValue = await this.findByIdOrFail(id);
    await this.attributeValueRepo.remove(attributeValue);
    return { message: 'Attribute value deleted successfully.' };
  }

  private async findByIdOrFail(id: string): Promise<AttributeValue> {
    const attributeValue = await this.attributeValueRepo.findOne({
      where: { id },
    });
    if (!attributeValue) {
      throw new NotFoundException(CatalogMessages.ATTRIBUTE_VALUE_NOT_FOUND);
    }
    return attributeValue;
  }

  private async ensureSlugUnique(
    attributeId: string,
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.attributeValueRepo.findOne({
      where: { attributeId, slug },
      withDeleted: true,
    });
    if (!existing) return;
    if (existing.id === excludeId) return;
    if (existing.deletedAt) {
      await this.attributeValueRepo.remove(existing);
      return;
    }
    throw new BadRequestException(CatalogMessages.ATTRIBUTE_VALUE_SLUG_EXISTS);
  }

  private toResponse(
    attributeValue: AttributeValue,
  ): AttributeValueResponseDto {
    return plainToInstance(AttributeValueResponseDto, attributeValue, {
      excludeExtraneousValues: true,
    });
  }
}
