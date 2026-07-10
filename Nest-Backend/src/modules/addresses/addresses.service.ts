import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly repo: Repository<Address>,
  ) {}

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.resetDefaults(userId);
    }

    const address = this.repo.create({
      userId,
      fullName: dto.fullName,
      phone: dto.phone,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2 ?? null,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      postalCode: dto.postalCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      isDefault: dto.isDefault ?? false,
    });
    return this.repo.save(address);
  }

  async findAll(userId: string) {
    const addresses = await this.repo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
    return plainToInstance(AddressResponseDto, addresses, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(userId: string, id: string) {
    const address = await this.repo.findOne({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId)
      throw new ForbiddenException('Access denied');
    return address;
  }

  async findById(id: string) {
    const address = await this.repo.findOne({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.findOne(userId, id);
    if (dto.isDefault && !address.isDefault) {
      await this.resetDefaults(userId);
    }
    Object.assign(address, dto);
    return this.repo.save(address);
  }

  async remove(userId: string, id: string) {
    const address = await this.findOne(userId, id);
    await this.repo.softRemove(address);
    return { message: 'Address deleted successfully.' };
  }

  async setDefault(userId: string, id: string) {
    const address = await this.findOne(userId, id);
    await this.resetDefaults(userId);
    address.isDefault = true;
    return this.repo.save(address);
  }

  private async resetDefaults(userId: string) {
    await this.repo.update({ userId, isDefault: true }, { isDefault: false });
  }
}
