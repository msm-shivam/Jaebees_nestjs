import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSetting } from '../entities/store-setting.entity';
import { EmailService } from '../../notifications/email.service';
import {
  UpdateStoreSettingsDto,
  UpdateSocialLinksDto,
  UpdateEmailConfigDto,
  UpdateBusinessInfoDto,
  UpdateSmtpConfigDto,
} from '../dto/store-settings.dto';

@Injectable()
export class StoreSettingsService {
  private readonly logger = new Logger(StoreSettingsService.name);

  constructor(
    @InjectRepository(StoreSetting)
    private readonly storeSettingRepo: Repository<StoreSetting>,
    private readonly emailService: EmailService,
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
    await this.storeSettingRepo.save(settings);
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

  async getSmtpConfig() {
    const settings = await this.getOrCreateStoreSettings();
    return {
      smtpHost:
        settings.smtpHost ?? process.env.MAIL_HOST ?? 'smtp.ethereal.email',
      smtpPort:
        settings.smtpPort ?? parseInt(process.env.MAIL_PORT ?? '587', 10),
      smtpUser: settings.smtpUser ?? process.env.MAIL_USER ?? '',
      smtpPass: settings.smtpPass ?? process.env.MAIL_PASS ?? '',
      smtpSecure: settings.smtpSecure ?? process.env.MAIL_SECURE === 'true',
      emailProvider:
        settings.emailProvider ?? process.env.EMAIL_PROVIDER ?? 'smtp',
      fromName: settings.fromName ?? process.env.MAIL_FROM_NAME ?? 'Sport Ecom',
      fromEmail:
        settings.fromEmail ?? process.env.MAIL_FROM ?? 'support@sportecom.com',
    };
  }

  async updateSmtpConfig(dto: UpdateSmtpConfigDto) {
    const settings = await this.getOrCreateStoreSettings();
    if (dto.smtpHost !== undefined) settings.smtpHost = dto.smtpHost;
    if (dto.smtpPort !== undefined) settings.smtpPort = dto.smtpPort;
    if (dto.smtpUser !== undefined) settings.smtpUser = dto.smtpUser;
    if (dto.smtpPass !== undefined) settings.smtpPass = dto.smtpPass;
    if (dto.smtpSecure !== undefined) settings.smtpSecure = dto.smtpSecure;
    if (dto.emailProvider !== undefined)
      settings.emailProvider = dto.emailProvider;
    if (dto.fromName !== undefined) settings.fromName = dto.fromName;
    if (dto.fromEmail !== undefined) settings.fromEmail = dto.fromEmail;
    await this.storeSettingRepo.save(settings);

    // Hot-reload the SMTP transporter
    const host =
      dto.smtpHost ??
      settings.smtpHost ??
      process.env.MAIL_HOST ??
      'smtp.ethereal.email';
    const port =
      dto.smtpPort ??
      settings.smtpPort ??
      parseInt(process.env.MAIL_PORT ?? '587', 10);
    const secure =
      dto.smtpSecure ??
      settings.smtpSecure ??
      process.env.MAIL_SECURE === 'true';
    const user =
      dto.smtpUser ?? settings.smtpUser ?? process.env.MAIL_USER ?? '';
    const pass =
      dto.smtpPass ?? settings.smtpPass ?? process.env.MAIL_PASS ?? '';
    this.emailService.configure({ host, port, secure, user, pass });

    return this.getSmtpConfig();
  }

  async testSmtpConnection(options: {
    to: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUser?: string;
    smtpPass?: string;
  }): Promise<{ success: boolean; message: string }> {
    const settings = await this.getOrCreateStoreSettings();
    try {
      const success = await this.emailService.sendTestEmail({
        to: options.to,
        subject: 'SMTP Configuration Test',
        html: '<h2>SMTP Test Email</h2><p>If you are reading this, your SMTP configuration is working correctly.</p>',
        smtpHost:
          options.smtpHost ??
          settings.smtpHost ??
          process.env.MAIL_HOST ??
          'smtp.ethereal.email',
        smtpPort:
          options.smtpPort ??
          settings.smtpPort ??
          parseInt(process.env.MAIL_PORT ?? '587', 10),
        smtpSecure:
          options.smtpSecure ??
          settings.smtpSecure ??
          process.env.MAIL_SECURE === 'true',
        smtpUser:
          options.smtpUser ?? settings.smtpUser ?? process.env.MAIL_USER ?? '',
        smtpPass:
          options.smtpPass ?? settings.smtpPass ?? process.env.MAIL_PASS ?? '',
      });
      return {
        success,
        message: success
          ? `Test email sent successfully to ${options.to}`
          : 'Failed to send test email. Check SMTP configuration.',
      };
    } catch (error) {
      this.logger.error(`SMTP test failed: ${(error as Error).message}`);
      return { success: false, message: (error as Error).message };
    }
  }
}
