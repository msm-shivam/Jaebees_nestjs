import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsPageService } from '../services/cms-page.service';
import { HomepageService } from '../services/homepage.service';
import { ContactSettingsService } from '../services/contact-settings.service';
import { StoreSettingsService } from '../services/store-settings.service';
import { SystemSettingsService } from '../services/system-settings.service';

@ApiTags('Public — Content')
@Controller('content')
export class PublicContentController {
  constructor(
    private readonly cmsPageService: CmsPageService,
    private readonly homepageService: HomepageService,
    private readonly contactSettingsService: ContactSettingsService,
    private readonly storeSettingsService: StoreSettingsService,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  @Get('announcement')
  async getAnnouncement() {
    const setting = await this.systemSettingsService.findByKey('announcement_text');
    return {
      data: {
        text: setting?.value ?? 'FREE SHIPPING OVER $75 • 48-HOUR RETURNS',
      },
    };
  }

  @Get('pages/:slug')
  async getPage(@Param('slug') slug: string) {
    const page = await this.cmsPageService.findBySlug(slug);
    if (!page) return { data: null };
    return { data: page };
  }

  @Get('homepage')
  async getHomepage() {
    const sections = await this.homepageService.findAll();
    return { data: sections };
  }

  @Get('contact')
  async getContact() {
    const contact = await this.contactSettingsService.find();
    return { data: contact };
  }

  @Get('social-links')
  async getSocialLinks() {
    const data = await this.storeSettingsService.getSocialLinks();
    return { data };
  }
}
