import {
  Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { SlidersService } from '../sliders.service';
import { CreateSliderDto } from '../dto/create-slider.dto';
import { UpdateSliderDto } from '../dto/update-slider.dto';

@ApiTags('Admin — Sliders')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/sliders')
export class AdminSliderController {
  constructor(private readonly slidersService: SlidersService) {}

  @Post()
  @Permissions(DefaultPermissions.SLIDER_MANAGE)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/sliders',
        filename: (_req, file, cb) => {
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create slider with up to 5 images',
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        images: { type: 'array', items: { type: 'string', format: 'binary' }, maxItems: 5 },
      },
    },
  })
  async create(@Body() dto: CreateSliderDto, @UploadedFiles() files: Express.Multer.File[]) {
    const urls = (files ?? []).map((f) => `/uploads/sliders/${f.filename}`);
    return this.slidersService.create(dto, urls);
  }

  @Get()
  @Permissions(DefaultPermissions.SLIDER_VIEW)
  async findAll() {
    return this.slidersService.findAll();
  }

  @Get(':id')
  @Permissions(DefaultPermissions.SLIDER_VIEW)
  async findOne(@Param('id') id: string) {
    return this.slidersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.SLIDER_MANAGE)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/sliders',
        filename: (_req, file, cb) => {
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSliderDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const urls = files?.length ? files.map((f) => `/uploads/sliders/${f.filename}`) : undefined;
    return this.slidersService.update(id, dto, urls);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.SLIDER_MANAGE)
  async remove(@Param('id') id: string) {
    await this.slidersService.remove(id);
    return { message: 'Slider deleted' };
  }
}
