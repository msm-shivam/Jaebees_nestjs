import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
export class StoreSettingsService implements OnModuleInit {
  private readonly logger = new Logger(StoreSettingsService.name);

  constructor(
    @InjectRepository(StoreSetting)
    private readonly storeSettingRepo: Repository<StoreSetting>,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    try {
      const settings = await this.getOrCreateStoreSettings();
      if (settings.smtpHost) {
        const host = settings.smtpHost;
        const port = settings.smtpPort ?? 587;
        const secure = settings.smtpSecure ?? (port === 465);
        const user = settings.smtpUser ?? '';
        const pass = settings.smtpPass ?? '';
        const fromName = settings.fromName ?? undefined;
        const fromEmail = settings.fromEmail ?? undefined;
        this.emailService.configure({ host, port, secure, user, pass, fromName, fromEmail });
        this.logger.log(
          `SMTP transporter initialized from database settings (${host}:${port})`,
        );
      }
    } catch (e) {
      this.logger.warn(
        `Failed to initialize SMTP transporter on boot: ${(e as Error).message}`,
      );
    }
  }

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
    const rawPass = settings.smtpPass ?? process.env.MAIL_PASS ?? '';
    return {
      smtpHost:
        settings.smtpHost ?? process.env.MAIL_HOST ?? 'smtp.ethereal.email',
      smtpPort:
        settings.smtpPort ?? parseInt(process.env.MAIL_PORT ?? '587', 10),
      smtpUser: settings.smtpUser ?? process.env.MAIL_USER ?? '',
      smtpPass: rawPass ? '********' : '',
      smtpPassConfigured: !!rawPass,
      smtpSecure: settings.smtpSecure ?? process.env.MAIL_SECURE === 'true',
      emailProvider:
        settings.emailProvider ?? process.env.EMAIL_PROVIDER ?? 'smtp',
      fromName: settings.fromName ?? process.env.MAIL_FROM_NAME ?? 'Jaebees',
      fromEmail:
        settings.fromEmail ?? process.env.MAIL_FROM ?? 'support@jaebees.com',
      replyToEmail: settings.replyToEmail ?? 'support@jaebees.com',
    };
  }

  async updateSmtpConfig(dto: UpdateSmtpConfigDto) {
    const settings = await this.getOrCreateStoreSettings();
    if (dto.smtpHost !== undefined) settings.smtpHost = dto.smtpHost;
    if (dto.smtpPort !== undefined) settings.smtpPort = dto.smtpPort;
    if (dto.smtpUser !== undefined) settings.smtpUser = dto.smtpUser;
    if (dto.smtpPass !== undefined && dto.smtpPass !== '********' && dto.smtpPass !== '') {
      settings.smtpPass = dto.smtpPass;
    }
    if (dto.smtpSecure !== undefined) settings.smtpSecure = dto.smtpSecure;
    if (dto.emailProvider !== undefined)
      settings.emailProvider = dto.emailProvider;
    if (dto.fromName !== undefined) settings.fromName = dto.fromName;
    if (dto.fromEmail !== undefined) settings.fromEmail = dto.fromEmail;
    if (dto.replyToEmail !== undefined) settings.replyToEmail = dto.replyToEmail;
    await this.storeSettingRepo.save(settings);

    // Hot-reload the SMTP transporter
    const host =
      settings.smtpHost ?? process.env.MAIL_HOST ?? 'smtp.ethereal.email';
    const port =
      settings.smtpPort ?? parseInt(process.env.MAIL_PORT ?? '587', 10);
    const secure =
      settings.smtpSecure ?? process.env.MAIL_SECURE === 'true';
    const user = settings.smtpUser ?? process.env.MAIL_USER ?? '';
    const pass = settings.smtpPass ?? process.env.MAIL_PASS ?? '';
    const fromName = settings.fromName ?? undefined;
    const fromEmail = settings.fromEmail ?? undefined;
    this.emailService.configure({ host, port, secure, user, pass, fromName, fromEmail });

    return this.getSmtpConfig();
  }

  getDefaultAllowedSenders(): string[] {
    // No hardcoded defaults — allowedSenders comes solely from Email Config page
    return [];
  }

  getDefaultSenderMappings(): Record<string, string> {
    // No hardcoded defaults — category mappings come solely from Email Config page
    return {};
  }

  async getSenderConfig() {
    const settings = await this.getOrCreateStoreSettings();
    // Return only what is saved in the DB — no hardcoded merging.
    // The Email Config page is the sole source of truth.
    const allowedSenders = settings.allowedSenders ?? [];
    const senderMappings = settings.senderMappings ?? {};
    return {
      allowedSenders,
      senderMappings,
      fromName: settings.fromName ?? process.env.MAIL_FROM_NAME ?? '',
      defaultFromEmail: settings.fromEmail ?? process.env.MAIL_FROM ?? '',
      replyToEmail: settings.replyToEmail ?? '',
    };
  }

  async updateSenderConfig(dto: { allowedSenders?: string[]; senderMappings?: Record<string, string>; fromName?: string; defaultFromEmail?: string; replyToEmail?: string }) {
    const settings = await this.getOrCreateStoreSettings();
    if (dto.allowedSenders !== undefined) settings.allowedSenders = dto.allowedSenders;
    if (dto.senderMappings !== undefined) settings.senderMappings = dto.senderMappings;
    if (dto.fromName !== undefined) settings.fromName = dto.fromName;
    if (dto.defaultFromEmail !== undefined) settings.fromEmail = dto.defaultFromEmail;
    if (dto.replyToEmail !== undefined) settings.replyToEmail = dto.replyToEmail;
    await this.storeSettingRepo.save(settings);
    return this.getSenderConfig();
  }

  async resolveCategorySender(category?: string): Promise<{ from: string; replyTo?: string }> {
    const settings = await this.getOrCreateStoreSettings();
    const fromName = settings.fromName ?? process.env.MAIL_FROM_NAME ?? '';

    // The default sender is ALWAYS from the Email Config page.
    // Fall back to MAIL_FROM env only as absolute last resort.
    const defaultEmail =
      settings.fromEmail ??
      process.env.MAIL_FROM ??
      '';

    const replyTo = settings.replyToEmail ?? undefined;

    // Allowed senders from Email Config page only (no hardcoded fallbacks)
    const allowedSenders: string[] =
      settings.allowedSenders && settings.allowedSenders.length > 0
        ? settings.allowedSenders
        : defaultEmail
          ? [defaultEmail]
          : [];

    // Category mappings from Email Config page only (no hardcoded fallbacks)
    const mappings: Record<string, string> = settings.senderMappings || {};

    let targetEmail = defaultEmail;
    if (category && mappings[category]) {
      const mappedEmail = mappings[category];
      // Only use the mapped email if it is in the allowed senders list.
      // This prevents sending from addresses that are not configured in Email Config.
      if (allowedSenders.includes(mappedEmail)) {
        targetEmail = mappedEmail;
      } else {
        this.logger.warn(
          `Category sender "${mappedEmail}" for "${category}" is not in allowedSenders. ` +
          `Falling back to default sender "${defaultEmail}". ` +
          `Please update your Email Config page.`,
        );
      }
    }

    const from = fromName ? `"${fromName}" <${targetEmail}>` : targetEmail;
    return { from, replyTo };
  }

  async testSmtpConnection(options: {
    to: string;
    category?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUser?: string;
    smtpPass?: string;
  }): Promise<{ success: boolean; message: string }> {
    const settings = await this.getOrCreateStoreSettings();
    const { from } = await this.resolveCategorySender(options.category);

    const host =
      options.smtpHost ??
      settings.smtpHost ??
      process.env.MAIL_HOST ??
      'smtp.ethereal.email';
    const port =
      options.smtpPort ??
      settings.smtpPort ??
      parseInt(process.env.MAIL_PORT ?? '587', 10);
    const secure =
      options.smtpSecure ??
      settings.smtpSecure ??
      process.env.MAIL_SECURE === 'true';
    const user =
      options.smtpUser ?? settings.smtpUser ?? process.env.MAIL_USER ?? '';
    const pass =
      options.smtpPass && options.smtpPass !== '********'
        ? options.smtpPass
        : settings.smtpPass ?? process.env.MAIL_PASS ?? '';

    if (!user || !pass) {
      return {
        success: false,
        message:
          'SMTP Username and Password are required. Please configure your valid SMTP credentials in Admin Settings -> General -> Email Config.',
      };
    }

    try {
      const success = await this.emailService.sendTestEmail({
        to: options.to,
        subject: `SMTP & Sender Configuration Test (${options.category || 'default'})`,
        html: `<h2>SMTP Test Email</h2><p>If you are reading this, your SMTP configuration and sender mapping (${from}) are working correctly.</p>`,
        smtpHost: host,
        smtpPort: port,
        smtpSecure: secure,
        smtpUser: user,
        smtpPass: pass,
      });
      return {
        success,
        message: success
          ? `Test email sent successfully to ${options.to} from ${from}`
          : 'Failed to send test email. Please check your SMTP configuration.',
      };
    } catch (error) {
      const errMsg = (error as Error).message || 'Unknown SMTP error';
      let userFriendlyMsg = errMsg;
      if (errMsg.includes('Greeting never received')) {
        userFriendlyMsg = `SMTP connection timed out ("Greeting never received"). Please check SMTP Host (${host}) and Port (${port}). If using Port 465, enable SSL/TLS. If using Port 587, disable SSL/TLS (STARTTLS).`;
      } else if (
        errMsg.includes('Invalid login') ||
        errMsg.includes('535') ||
        errMsg.includes('Authentication failed')
      ) {
        userFriendlyMsg = `SMTP Authentication failed. Please verify your SMTP Username (${user}) and Password/App Password.`;
      } else if (
        errMsg.includes('ENOTFOUND') ||
        errMsg.includes('EHOSTUNREACH')
      ) {
        userFriendlyMsg = `SMTP Host "${host}" could not be reached. Please verify the host address.`;
      }
      this.logger.error(`SMTP test failed: ${errMsg}`);
      return { success: false, message: userFriendlyMsg };
    }
  }
}
