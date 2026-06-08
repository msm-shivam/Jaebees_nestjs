import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Attribute } from './entities/attribute.entity';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { AttributeQueryDto } from './dto/attribute-query.dto';
import { AttributeResponseDto } from './dto/attribute-response.dto';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepo: Repository<Attribute>,
  ) {}

  async create(
    dto: CreateAttributeDto,
  ): Promise<{ message: string; data: AttributeResponseDto }> {
    const slug = dto.slug ?? toSlug(dto.name);
    await this.ensureSlugUnique(slug);

    const attribute = this.attributeRepo.create({
      name: dto.name,
      slug,
      isFilterable: dto.isFilterable ?? false,
      isRequired: dto.isRequired ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });

    const saved = await this.attributeRepo.save(attribute);
    return {
      message: 'Attribute created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: AttributeQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.isFilterable !== undefined)
      where.isFilterable = query.isFilterable;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [items, total] = await this.attributeRepo.findAndCount({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
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

  async findOne(id: string): Promise<AttributeResponseDto> {
    const attribute = await this.findByIdOrFail(id);
    return this.toResponse(attribute);
  }

  async update(
    id: string,
    dto: UpdateAttributeDto,
  ): Promise<{ message: string; data: AttributeResponseDto }> {
    const attribute = await this.findByIdOrFail(id);

    if (dto.slug && dto.slug !== attribute.slug) {
      await this.ensureSlugUnique(dto.slug, id);
      attribute.slug = dto.slug;
    } else if (dto.name && !dto.slug && dto.name !== attribute.name) {
      const newSlug = toSlug(dto.name);
      if (newSlug !== attribute.slug) {
        await this.ensureSlugUnique(newSlug, id);
        attribute.slug = newSlug;
      }
    }

    if (dto.name !== undefined) attribute.name = dto.name;
    if (dto.isFilterable !== undefined)
      attribute.isFilterable = dto.isFilterable;
    if (dto.isRequired !== undefined) attribute.isRequired = dto.isRequired;
    if (dto.sortOrder !== undefined) attribute.sortOrder = dto.sortOrder;

    const saved = await this.attributeRepo.save(attribute);
    return {
      message: 'Attribute updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const attribute = await this.findByIdOrFail(id);
    await this.attributeRepo.remove(attribute);
    return { message: 'Attribute deleted successfully.' };
  }

  async findByIdOrFail(id: string): Promise<Attribute> {
    const attribute = await this.attributeRepo.findOne({ where: { id } });
    if (!attribute) {
      throw new NotFoundException(CatalogMessages.ATTRIBUTE_NOT_FOUND);
    }
    return attribute;
  }

  private async ensureSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.attributeRepo.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(CatalogMessages.ATTRIBUTE_SLUG_EXISTS);
    }
  }

  private toResponse(attribute: Attribute): AttributeResponseDto {
    return plainToInstance(AttributeResponseDto, attribute, {
      excludeExtraneousValues: true,
    });
  }
}
