import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSetting } from '../entities/store-setting.entity';
import {
  UpdateStoreSettingsDto,
  UpdateSocialLinksDto,
  UpdateEmailConfigDto,
  UpdateBusinessInfoDto,
} from '../dto/store-settings.dto';

@Injectable()
export class StoreSettingsService {
  constructor(
    @InjectRepository(StoreSetting)
    private readonly storeSettingRepo: Repository<StoreSetting>,
  ) {}

  async getOrCreateStoreSettings(): Promise<StoreSetting> {
    const records = await this.storeSettingRepo.find({
      take: 1,
      order: { createdAt: 'DESC' },
    });
    let record = records[0];
    if (!record) {
      record = this.storeSettingRepo.create({});
      record = await this.storeSettingRepo.save(record);
    }
    return record;
  }

  async getStoreSettings() {
    const settings = await this.getOrCreateStoreSettings();
    return {
      id: settings.id,
      storeName: settings.storeName,
      storeTagline: settings.storeTagline,
      storeEmail: settings.storeEmail,
      supportEmail: settings.supportEmail,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      websiteUrl: settings.websiteUrl,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      description: settings.description,
      addressLine1: settings.addressLine1,
      addressLine2: settings.addressLine2,
      city: settings.city,
      state: settings.state,
      country: settings.country,
      postalCode: settings.postalCode,
      latitude: settings.latitude,
      longitude: settings.longitude,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  async updateStoreSettings(dto: UpdateStoreSettingsDto) {
    const settings = await this.getOrCreateStoreSettings();
    Object.assign(settings, dto);
    const saved = await this.storeSettingRepo.save(settings);
    return this.getStoreSettings();
  }

  async getSocialLinks() {
    const settings = await this.getOrCreateStoreSettings();
    return {
      facebook: settings.facebook ?? '',
      instagram: settings.instagram ?? '',
      twitter: settings.twitter ?? '',
      youtube: settings.youtube ?? '',
      linkedin: settings.linkedin ?? '',
      telegram: settings.telegram ?? '',
      whatsapp: settings.whatsappSocial ?? '',
    };
  }

  async updateSocialLinks(dto: UpdateSocialLinksDto) {
    const settings = await this.getOrCreateStoreSettings();
    if (dto.facebook !== undefined) settings.facebook = dto.facebook;
    if (dto.instagram !== undefined) settings.instagram = dto.instagram;
    if (dto.twitter !== undefined) settings.twitter = dto.twitter;
    if (dto.youtube !== undefined) settings.youtube = dto.youtube;
    if (dto.linkedin !== undefined) settings.linkedin = dto.linkedin;
    if (dto.telegram !== undefined) settings.telegram = dto.telegram;
    if (dto.whatsapp !== undefined) settings.whatsappSocial = dto.whatsapp;
    await this.storeSettingRepo.save(settings);
    return this.getSocialLinks();
  }

  async getEmailConfig() {
    const settings = await this.getOrCreateStoreSettings();
    return {
      fromName: settings.fromName ?? 'Sport Ecom',
      fromEmail: settings.fromEmail ?? 'support@sportecom.com',
      replyToEmail: settings.replyToEmail ?? 'help@sportecom.com',
    };
  }

  async updateEmailConfig(dto: UpdateEmailConfigDto) {
    const settings = await this.getOrCreateStoreSettings();
    Object.assign(settings, dto);
    await this.storeSettingRepo.save(settings);
    return this.getEmailConfig();
  }

  async getBusinessInfo() {
    const settings = await this.getOrCreateStoreSettings();
    return {
      companyName: settings.companyName ?? '',
      gstNumber: settings.gstNumber ?? '',
      panNumber: settings.panNumber ?? '',
      cinNumber: settings.cinNumber ?? '',
      bankName: settings.bankName ?? '',
      accountNumber: settings.accountNumber ?? '',
      ifscCode: settings.ifscCode ?? '',
    };
  }

  async updateBusinessInfo(dto: UpdateBusinessInfoDto) {
    const settings = await this.getOrCreateStoreSettings();
    Object.assign(settings, dto);
    await this.storeSettingRepo.save(settings);
    return this.getBusinessInfo();
  }

  async updateLogo(logoUrl: string) {
    const settings = await this.getOrCreateStoreSettings();
    settings.logoUrl = logoUrl;
    await this.storeSettingRepo.save(settings);
    return { logoUrl };
  }

  async updateFavicon(faviconUrl: string) {
    const settings = await this.getOrCreateStoreSettings();
    settings.faviconUrl = faviconUrl;
    await this.storeSettingRepo.save(settings);
    return { faviconUrl };
  }
}
