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
    if (existing) throw new BadRequestException(RbacMessages.ROLE_ALREADY_EXISTS);

    const role = this.roleRepo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
    });
    return this.roleRepo.save(role);
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepo.find({
      relations: { permissions: true },
      order: { createdAt: 'ASC' },
    });
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
      if (slugExists) throw new BadRequestException(RbacMessages.ROLE_ALREADY_EXISTS);
    }

    Object.assign(role, {
      ...(dto.name && { name: dto.name }),
      ...(dto.slug && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description }),
    });

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
    return this.permissionRepo.save(permission);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find({
      order: { module: 'ASC', slug: 'ASC' },
    });
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
