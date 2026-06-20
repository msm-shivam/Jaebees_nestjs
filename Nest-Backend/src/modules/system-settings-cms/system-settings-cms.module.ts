import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { CmsPage } from './entities/cms-page.entity';
import { HomepageSection } from './entities/homepage-section.entity';
import { ContactSetting } from './entities/contact-setting.entity';
import { SiteConfiguration } from './entities/site-configuration.entity';
import { StoreSetting } from './entities/store-setting.entity';
import { SystemSettingsService } from './services/system-settings.service';
import { CmsPageService } from './services/cms-page.service';
import { HomepageService } from './services/homepage.service';
import { ContactSettingsService } from './services/contact-settings.service';
import { SiteConfigurationService } from './services/site-configuration.service';
import { StoreSettingsService } from './services/store-settings.service';
import { AdminSettingsController } from './controllers/admin-settings.controller';
import { AdminCmsController } from './controllers/admin-cms.controller';
import { AdminHomepageController } from './controllers/admin-homepage.controller';
import { AdminContactSettingsController } from './controllers/admin-contact-settings.controller';
import { AdminStoreSettingsController } from './controllers/admin-store-settings.controller';
import { PublicContentController } from './controllers/public-content.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemSetting,
      CmsPage,
      HomepageSection,
      ContactSetting,
      SiteConfiguration,
      StoreSetting,
    ]),
  ],
  controllers: [
    AdminSettingsController,
    AdminCmsController,
    AdminHomepageController,
    AdminContactSettingsController,
    AdminStoreSettingsController,
    PublicContentController,
  ],
  providers: [
    SystemSettingsService,
    CmsPageService,
    HomepageService,
    ContactSettingsService,
    SiteConfigurationService,
    StoreSettingsService,
  ],
})
export class SystemSettingsCmsModule {}

