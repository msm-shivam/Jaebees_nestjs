import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Slider } from './entities/slider.entity';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { SliderResponseDto } from './dto/slider-response.dto';

@Injectable()
export class SlidersService {
  constructor(
    @InjectRepository(Slider)
    private readonly repo: Repository<Slider>,
  ) {}

  async create(dto: CreateSliderDto, imageUrls: string[]): Promise<SliderResponseDto> {
    const slider = this.repo.create({
      ...dto,
      images: imageUrls.length > 0 ? imageUrls : null,
    });
    const saved = await this.repo.save(slider);
    return this.toResponse(saved);
  }

  async findAll(): Promise<SliderResponseDto[]> {
    const sliders = await this.repo.find();
    return sliders.map((s) => this.toResponse(s));
  }

  async findActive(): Promise<SliderResponseDto[]> {
    const sliders = await this.repo.find();
    return sliders.map((s) => this.toResponse(s));
  }

  async findOne(id: string): Promise<SliderResponseDto> {
    const slider = await this.repo.findOne({ where: { id } as any });
    if (!slider) throw new NotFoundException('Slider not found');
    return this.toResponse(slider);
  }

  async update(id: string, dto: UpdateSliderDto, newUrls: string[]): Promise<SliderResponseDto> {
    const slider = await this.repo.findOne({ where: { id } as any });
    if (!slider) throw new NotFoundException('Slider not found');
    Object.assign(slider, dto);
    // images: if dto.images provided, use as base; then append any new uploads
    if (dto.images !== undefined) {
      slider.images = [...dto.images, ...newUrls];
      if (slider.images.length === 0) slider.images = null;
    } else if (newUrls.length > 0) {
      slider.images = [...(slider.images ?? []), ...newUrls];
    }
    const saved = await this.repo.save(slider);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const slider = await this.repo.findOne({ where: { id } as any });
    if (!slider) throw new NotFoundException('Slider not found');
    await this.repo.remove(slider);
  }

  private toResponse(slider: Slider): SliderResponseDto {
    return plainToInstance(SliderResponseDto, slider, {
      excludeExtraneousValues: true,
    });
  }
}
