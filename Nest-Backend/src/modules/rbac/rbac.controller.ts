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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';

@ApiTags('Admin — RBAC')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, RolesGuard, PermissionsGuard)
@Controller('admin')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ─── Roles ─────────────────────────────────────────────────────────────────

  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.ROLES_MANAGE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created.' })
  @ApiResponse({ status: 400, description: 'Slug already exists.' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Get('roles')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ROLES_MANAGE)
  @ApiOperation({ summary: 'List all roles with their permissions' })
  @ApiResponse({ status: 200, description: 'Roles list returned.' })
  async findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ROLES_MANAGE)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role returned.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async findRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.rbacService.findRoleById(id);
  }

  @Patch('roles/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ROLES_MANAGE)
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated.' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rbacService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ROLES_MANAGE)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted.' })
  async deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.rbacService.deleteRole(id);
  }

  @Post('roles/:id/permissions')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ROLES_MANAGE)
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiResponse({ status: 200, description: 'Permissions assigned.' })
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rbacService.assignPermissionsToRole(id, dto);
  }

  @Delete('roles/:id/permissions')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ROLES_MANAGE)
  @ApiOperation({ summary: 'Remove permissions from a role' })
  @ApiResponse({ status: 200, description: 'Permissions removed.' })
  async removePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rbacService.removePermissionsFromRole(id, dto);
  }

  // ─── Permissions ───────────────────────────────────────────────────────────

  @Post('permissions')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.PERMISSIONS_MANAGE)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created.' })
  @ApiResponse({ status: 400, description: 'Slug already exists.' })
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Get('permissions')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PERMISSIONS_MANAGE)
  @ApiOperation({ summary: 'List all permissions grouped by module' })
  @ApiResponse({ status: 200, description: 'Permissions list returned.' })
  async findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Get('permissions/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PERMISSIONS_MANAGE)
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission returned.' })
  async findPermission(@Param('id', ParseUUIDPipe) id: string) {
    return this.rbacService.findPermissionById(id);
  }

  @Delete('permissions/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PERMISSIONS_MANAGE)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted.' })
  async deletePermission(@Param('id', ParseUUIDPipe) id: string) {
    return this.rbacService.deletePermission(id);
  }
}
