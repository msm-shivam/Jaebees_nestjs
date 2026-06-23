import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Collection } from './entities/collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionQueryDto } from './dto/collection-query.dto';
import { CollectionResponseDto } from './dto/collection-response.dto';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
  ) {}

  async create(
    dto: CreateCollectionDto,
  ): Promise<{ message: string; data: CollectionResponseDto }> {
    const slug = dto.slug ?? toSlug(dto.name);
    await this.ensureSlugUnique(slug);

    const collection = this.collectionRepo.create({
      name: dto.name,
      slug,
      bannerImage: dto.bannerImage ?? null,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.collectionRepo.save(collection);
    return {
      message: 'Collection created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: CollectionQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [items, total] = await this.collectionRepo.findAndCount({
      where,
      order: { name: 'ASC' },
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

  async findOne(id: string): Promise<CollectionResponseDto> {
    const collection = await this.findByIdOrFail(id);
    return this.toResponse(collection);
  }

  async update(
    id: string,
    dto: UpdateCollectionDto,
  ): Promise<{ message: string; data: CollectionResponseDto }> {
    const collection = await this.findByIdOrFail(id);

    if (dto.slug && dto.slug !== collection.slug) {
      await this.ensureSlugUnique(dto.slug, id);
      collection.slug = dto.slug;
    } else if (dto.name && !dto.slug && dto.name !== collection.name) {
      const newSlug = toSlug(dto.name);
      if (newSlug !== collection.slug) {
        await this.ensureSlugUnique(newSlug, id);
        collection.slug = newSlug;
      }
    }

    if (dto.name !== undefined) collection.name = dto.name;
    if (dto.bannerImage !== undefined) collection.bannerImage = dto.bannerImage;
    if (dto.description !== undefined) collection.description = dto.description;
    if (dto.isActive !== undefined) collection.isActive = dto.isActive;

    const saved = await this.collectionRepo.save(collection);
    return {
      message: 'Collection updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const collection = await this.findByIdOrFail(id);
    await this.collectionRepo.softRemove(collection);
    return { message: 'Collection deleted successfully.' };
  }

  private async findByIdOrFail(id: string): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) {
      throw new NotFoundException(CatalogMessages.COLLECTION_NOT_FOUND);
    }
    return collection;
  }

  private async ensureSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.collectionRepo.findOne({ where: { slug }, withDeleted: true });
    if (!existing) return;
    if (existing.id === excludeId) return;
    if (existing.deletedAt) {
      await this.collectionRepo.remove(existing);
      return;
    }
    throw new BadRequestException(CatalogMessages.COLLECTION_SLUG_EXISTS);
  }

  private toResponse(collection: Collection): CollectionResponseDto {
    return plainToInstance(CollectionResponseDto, collection, {
      excludeExtraneousValues: true,
    });
  }
}
