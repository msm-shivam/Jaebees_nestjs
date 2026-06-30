import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';
import { FaqService } from '../services/faq.service';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';
import { FaqQueryDto } from '../dto/faq-query.dto';
import { FaqResponseDto } from '../dto/faq-response.dto';

@ApiTags('Admin — FAQ')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/faqs')
export class AdminFaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.CMS_MANAGE)
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiResponse({ status: 201, description: 'FAQ created.' })
  async create(@Body() dto: CreateFaqDto) {
    return this.faqService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CMS_VIEW)
  @ApiOperation({ summary: 'List FAQs with pagination' })
  @ApiPaginatedResponse(FaqResponseDto)
  async findAll(@Query() query: FaqQueryDto) {
    return this.faqService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CMS_VIEW)
  @ApiOperation({ summary: 'Get FAQ by ID' })
  @ApiResponse({ status: 200, type: FaqResponseDto })
  @ApiResponse({ status: 404, description: 'FAQ not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CMS_MANAGE)
  @ApiOperation({ summary: 'Update a FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.faqService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CMS_MANAGE)
  @ApiOperation({ summary: 'Delete a FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ deleted.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqService.remove(id);
  }
}
