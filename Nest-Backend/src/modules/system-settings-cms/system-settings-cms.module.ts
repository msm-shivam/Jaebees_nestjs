import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { CmsPage } from './entities/cms-page.entity';
import { HomepageSection } from './entities/homepage-section.entity';
import { ContactSetting } from './entities/contact-setting.entity';
import { SiteConfiguration } from './entities/site-configuration.entity';
import { StoreSetting } from './entities/store-setting.entity';
import { Faq } from './entities/faq.entity';
import { SystemSettingsService } from './services/system-settings.service';
import { CmsPageService } from './services/cms-page.service';
import { HomepageService } from './services/homepage.service';
import { ContactSettingsService } from './services/contact-settings.service';
import { SiteConfigurationService } from './services/site-configuration.service';
import { StoreSettingsService } from './services/store-settings.service';
import { FaqService } from './services/faq.service';
import { AdminSettingsController } from './controllers/admin-settings.controller';
import { AdminCmsController } from './controllers/admin-cms.controller';
import { AdminHomepageController } from './controllers/admin-homepage.controller';
import { AdminContactSettingsController } from './controllers/admin-contact-settings.controller';
import { AdminStoreSettingsController } from './controllers/admin-store-settings.controller';
import { AdminFaqController } from './controllers/admin-faq.controller';
import { PublicContentController } from './controllers/public-content.controller';
import { PublicFaqController } from './controllers/public-faq.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemSetting,
      CmsPage,
      HomepageSection,
      ContactSetting,
      SiteConfiguration,
      StoreSetting,
      Faq,
    ]),
  ],
  controllers: [
    AdminSettingsController,
    AdminCmsController,
    AdminHomepageController,
    AdminContactSettingsController,
    AdminStoreSettingsController,
    AdminFaqController,
    PublicContentController,
    PublicFaqController,
  ],
  providers: [
    SystemSettingsService,
    CmsPageService,
    HomepageService,
    ContactSettingsService,
    SiteConfigurationService,
    StoreSettingsService,
    FaqService,
  ],
  exports: [StoreSettingsService],
})
export class SystemSettingsCmsModule {}
