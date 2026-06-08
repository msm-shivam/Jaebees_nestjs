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
import { AttributeValuesService } from './attribute-values.service';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { AttributeValueQueryDto } from './dto/attribute-value-query.dto';
import { AttributeValueResponseDto } from './dto/attribute-value-response.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('Admin — Attribute Values')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/attribute-values')
export class AttributeValuesController {
  constructor(
    private readonly attributeValuesService: AttributeValuesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.ATTRIBUTE_CREATE)
  @ApiOperation({ summary: 'Create a new attribute value' })
  @ApiResponse({ status: 201, description: 'Attribute value created.' })
  async create(@Body() dto: CreateAttributeValueDto) {
    return this.attributeValuesService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ATTRIBUTE_VIEW)
  @ApiOperation({ summary: 'List attribute values with pagination' })
  @ApiPaginatedResponse(AttributeValueResponseDto)
  async findAll(@Query() query: AttributeValueQueryDto) {
    return this.attributeValuesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ATTRIBUTE_VIEW)
  @ApiOperation({ summary: 'Get attribute value by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attribute value returned.',
    type: AttributeValueResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Attribute value not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attributeValuesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ATTRIBUTE_UPDATE)
  @ApiOperation({ summary: 'Update an attribute value' })
  @ApiResponse({ status: 200, description: 'Attribute value updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttributeValueDto,
  ) {
    return this.attributeValuesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ATTRIBUTE_DELETE)
  @ApiOperation({ summary: 'Delete an attribute value' })
  @ApiResponse({ status: 200, description: 'Attribute value deleted.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attributeValuesService.remove(id);
  }
}
