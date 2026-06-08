import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { AttributeQueryDto } from './dto/attribute-query.dto';
import { AttributeResponseDto } from './dto/attribute-response.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('Admin — Attributes')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.ATTRIBUTE_CREATE)
  @ApiOperation({ summary: 'Create a new attribute' })
  @ApiResponse({ status: 201, description: 'Attribute created.' })
  async create(@Body() dto: CreateAttributeDto) {
    return this.attributesService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ATTRIBUTE_VIEW)
  @ApiOperation({ summary: 'List attributes with pagination' })
  @ApiPaginatedResponse(AttributeResponseDto)
  async findAll(@Query() query: AttributeQueryDto) {
    return this.attributesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ATTRIBUTE_VIEW)
  @ApiOperation({ summary: 'Get attribute by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attribute returned.',
    type: AttributeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Attribute not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ATTRIBUTE_UPDATE)
  @ApiOperation({ summary: 'Update an attribute' })
  @ApiResponse({ status: 200, description: 'Attribute updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttributeDto,
  ) {
    return this.attributesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ATTRIBUTE_DELETE)
  @ApiOperation({ summary: 'Delete an attribute' })
  @ApiResponse({ status: 200, description: 'Attribute deleted.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attributesService.remove(id);
  }
}
