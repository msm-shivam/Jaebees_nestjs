import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ChangeAdminPasswordDto } from './dto/change-admin-password.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import type { AdminJwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Admin — Profile')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard)
@Controller('admin/profile')
export class AdminProfileController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get own admin profile with roles and permissions' })
  @ApiResponse({ status: 200, description: 'Profile returned.' })
  async getProfile(@CurrentAdmin() admin: AdminJwtPayload) {
    return this.adminService.getProfile(admin.sub);
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `admin-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Admin name' },
        email: { type: 'string', format: 'email', description: 'Admin email' },
        avatar: { type: 'string', format: 'binary', description: 'Avatar image (max 2MB)' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own admin profile (name, email, avatar)' })
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  @ApiResponse({ status: 400, description: 'Email already taken.' })
  async updateProfile(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Body() dto: UpdateAdminDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    if (avatar) {
      dto.avatar = `/uploads/avatars/${avatar.filename}`;
    }
    return this.adminService.update(admin.sub, dto);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `admin-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image (max 2MB)',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload admin avatar image' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded.' })
  async uploadAvatar(
    @CurrentAdmin() admin: AdminJwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminService.update(admin.sub, {
      avatar: `/uploads/avatars/${file.filename}`,
    });
  }

  @Put('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change own admin password' })
  @ApiResponse({ status: 200, description: 'Password changed.' })
  @ApiResponse({ status: 400, description: 'Invalid current password.' })
  async changePassword(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Body() dto: ChangeAdminPasswordDto,
  ) {
    return this.adminService.changePassword(admin.sub, dto);
  }
}
