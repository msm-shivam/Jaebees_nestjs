import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RbacMessages } from '../../common/constants/messages.constants';
import { DefaultRoles } from '../../common/constants/roles.constants';
import { ALL_PERMISSIONS } from '../../common/constants/permissions-data.constant';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  // ─── Roles ────────────────────────────────────────────────────────────────

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepo.findOne({ where: { slug: dto.slug } });
    if (existing)
      throw new BadRequestException(RbacMessages.ROLE_ALREADY_EXISTS);

    let permissions: Permission[] = [];
    if (dto.permissionSlugs && dto.permissionSlugs.length > 0) {
      permissions = await this.permissionRepo.findBy({
        slug: In(dto.permissionSlugs),
      });
      if (permissions.length !== dto.permissionSlugs.length) {
        throw new NotFoundException('One or more permission slugs not found.');
      }
    }

    const role = this.roleRepo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
      permissions,
    });
    return this.roleRepo.save(role);
  }

  async findAllRoles(): Promise<any> {
    const roles = await this.roleRepo.find({
      relations: { permissions: true },
      order: { createdAt: 'ASC' },
    });

    const systemSlugs = Object.values(DefaultRoles) as string[];
    const totalRoles = roles.length;
    const systemRoles = roles.filter((r) => systemSlugs.includes(r.slug)).length;
    const customRoles = totalRoles - systemRoles;

    return {
      roles,
      totalRoles,
      activeRoles: totalRoles,
      systemRoles,
      customRoles,
    };
  }

  async findRoleById(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) throw new NotFoundException(RbacMessages.ROLE_NOT_FOUND);
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);

    if (dto.slug && dto.slug !== role.slug) {
      const slugExists = await this.roleRepo.findOne({
        where: { slug: dto.slug },
      });
      if (slugExists)
        throw new BadRequestException(RbacMessages.ROLE_ALREADY_EXISTS);
    }

    Object.assign(role, {
      ...(dto.name && { name: dto.name }),
      ...(dto.slug && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description }),
    });

    if (dto.permissionSlugs !== undefined) {
      const permissions = await this.permissionRepo.findBy({
        slug: In(dto.permissionSlugs),
      });
      if (permissions.length !== dto.permissionSlugs.length) {
        throw new NotFoundException('One or more permission slugs not found.');
      }
      role.permissions = permissions;
    }

    return this.roleRepo.save(role);
  }

  async deleteRole(id: string): Promise<{ message: string }> {
    const role = await this.findRoleById(id);
    await this.roleRepo.remove(role);
    return { message: `Role '${role.name}' deleted successfully.` };
  }

  async assignPermissionsToRole(
    roleId: string,
    dto: AssignPermissionsDto,
  ): Promise<Role> {
    const role = await this.findRoleById(roleId);

    const permissions = await this.permissionRepo.findBy({
      id: In(dto.permissionIds),
    });

    if (permissions.length !== dto.permissionIds.length) {
      throw new NotFoundException('One or more permission IDs not found.');
    }

    const existing = role.permissions ?? [];
    const existingIds = new Set(existing.map((p) => p.id));
    const newPerms = permissions.filter((p) => !existingIds.has(p.id));
    role.permissions = [...existing, ...newPerms];

    return this.roleRepo.save(role);
  }

  async removePermissionsFromRole(
    roleId: string,
    dto: AssignPermissionsDto,
  ): Promise<Role> {
    const role = await this.findRoleById(roleId);
    const removeSet = new Set(dto.permissionIds);
    role.permissions = (role.permissions ?? []).filter(
      (p) => !removeSet.has(p.id),
    );
    return this.roleRepo.save(role);
  }

  // ─── Permissions ──────────────────────────────────────────────────────────

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(RbacMessages.PERMISSION_ALREADY_EXISTS);
    }

    const permission = this.permissionRepo.create({
      name: dto.name,
      slug: dto.slug,
      module: dto.module,
    });
    const saved = await this.permissionRepo.save(permission);

    // Auto-assign new permission to SUPER_ADMIN role
    const superAdminRole = await this.roleRepo.findOne({
      where: { slug: DefaultRoles.SUPER_ADMIN },
      relations: { permissions: true },
    });
    if (superAdminRole) {
      superAdminRole.permissions.push(saved);
      await this.roleRepo.save(superAdminRole);
    }

    return saved;
  }

  getAllCodePermissions() {
    return [...ALL_PERMISSIONS];
  }

  async findAllPermissions(): Promise<any> {
    const permissions = await this.permissionRepo.find({
      order: { module: 'ASC', slug: 'ASC' },
    });

    const moduleSet = new Set(permissions.map((p) => p.module));

    return {
      permissions,
      totalPermissions: permissions.length,
      totalModules: moduleSet.size,
    };
  }

  async findPermissionById(id: string): Promise<Permission> {
    const perm = await this.permissionRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException(RbacMessages.PERMISSION_NOT_FOUND);
    return perm;
  }

  async deletePermission(id: string): Promise<{ message: string }> {
    const perm = await this.findPermissionById(id);
    await this.permissionRepo.remove(perm);
    return { message: `Permission '${perm.slug}' deleted successfully.` };
  }
}
