import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { AdminUser } from './entities/admin-user.entity';
import { AdminSession } from './entities/admin-session.entity';
import { Role } from '../rbac/entities/role.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { ChangeAdminPasswordDto } from './dto/change-admin-password.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import {
  comparePassword,
  hashPassword,
} from '../../common/utils/password.util';
import {
  AdminMessages,
  AuthMessages,
  RbacMessages,
} from '../../common/constants/messages.constants';
import { DefaultRoles } from '../../common/constants/roles.constants';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
    @InjectRepository(AdminSession)
    private readonly adminSessionRepo: Repository<AdminSession>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async create(
    dto: CreateAdminDto,
  ): Promise<{ message: string; data: AdminResponseDto }> {
    const exists = await this.adminRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (exists) throw new BadRequestException(AdminMessages.EMAIL_TAKEN);

    let roles: Role[] = [];
    if (dto.roleIds && dto.roleIds.length > 0) {
      roles = await this.roleRepo.findBy({ id: In(dto.roleIds) });
      if (roles.length !== dto.roleIds.length) {
        throw new NotFoundException(RbacMessages.ROLE_NOT_FOUND);
      }
    }

    const passwordHash = await hashPassword(dto.password);
    const admin = this.adminRepo.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      isActive: true,
      roles,
      avatar: null,
    });
    const saved = await this.adminRepo.save(admin);
    const data = plainToInstance(AdminResponseDto, saved, {
      excludeExtraneousValues: true,
    });
    return { message: 'Admin user created successfully.', data };
  }

  async findAll(): Promise<any> {
    const admins = await this.adminRepo.find({
      relations: { roles: true },
      order: { createdAt: 'DESC' },
    });

    const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
      this.adminRepo.count(),
      this.adminRepo.count({ where: { isActive: true } }),
      this.adminRepo.count({ where: { isActive: false } }),
    ]);

    return {
      users: admins.map((a) =>
        plainToInstance(AdminResponseDto, a, { excludeExtraneousValues: true }),
      ),
      totalUsers,
      activeUsers,
      inactiveUsers,
    };
  }

  async findById(id: string): Promise<AdminResponseDto> {
    const admin = await this.findByIdOrFail(id);
    return plainToInstance(AdminResponseDto, admin, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: string,
    dto: UpdateAdminDto,
    actorId?: string,
  ): Promise<{ message: string; data: AdminResponseDto }> {
    const admin = await this.findByIdOrFail(id);

    if (dto.email && dto.email.toLowerCase() !== admin.email) {
      const emailExists = await this.adminRepo.findOne({
        where: { email: dto.email.toLowerCase() },
      });
      if (emailExists) throw new BadRequestException(AdminMessages.EMAIL_TAKEN);
    }

    Object.assign(admin, {
      ...(dto.name && { name: dto.name }),
      ...(dto.email && { email: dto.email.toLowerCase() }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.avatar !== undefined && { avatar: dto.avatar ?? null }),
    });

    const saved = await this.adminRepo.save(admin);
    const data = plainToInstance(AdminResponseDto, saved, {
      excludeExtraneousValues: true,
    });
    return { message: 'Admin user updated successfully.', data };
  }

  private async isSuperAdmin(id: string): Promise<boolean> {
    const admin = await this.adminRepo.findOne({
      where: { id },
      relations: { roles: true },
    });
    return admin?.roles?.some((r) => r.slug === DefaultRoles.SUPER_ADMIN) ?? false;
  }

  async remove(id: string, actorId: string): Promise<{ message: string }> {
    if (id === actorId) {
      throw new BadRequestException('You cannot delete SuperAdmin.');
    }

    const isSuper = await this.isSuperAdmin(id);
    if (isSuper) {
      throw new BadRequestException('Cannot delete a super admin.');
    }

    const admin = await this.findByIdOrFail(id);
    await this.adminSessionRepo.delete({ adminId: id });
    await this.adminRepo.remove(admin);
    return { message: 'Admin user deleted successfully.' };
  }

  async assignRoles(
    id: string,
    dto: AssignRolesDto,
  ): Promise<{ message: string; data: AdminResponseDto }> {
    const isSuper = await this.isSuperAdmin(id);
    if (isSuper) {
      throw new BadRequestException('Cannot modify roles of a super admin.');
    }

    const admin = await this.findByIdOrFail(id);

    const roles = await this.roleRepo.findBy({ id: In(dto.roleIds) });
    if (roles.length !== dto.roleIds.length) {
      throw new NotFoundException(RbacMessages.ROLE_NOT_FOUND);
    }

    const existing = admin.roles ?? [];
    const existingIds = new Set(existing.map((r) => r.id));
    const newRoles = roles.filter((r) => !existingIds.has(r.id));
    admin.roles = [...existing, ...newRoles];

    const saved = await this.adminRepo.save(admin);
    const data = plainToInstance(AdminResponseDto, saved, {
      excludeExtraneousValues: true,
    });
    return { message: RbacMessages.ROLE_ASSIGNED, data };
  }

  async revokeRoles(
    id: string,
    dto: AssignRolesDto,
  ): Promise<{ message: string; data: AdminResponseDto }> {
    const isSuper = await this.isSuperAdmin(id);
    if (isSuper) {
      throw new BadRequestException('Cannot modify roles of a super admin.');
    }

    const admin = await this.findByIdOrFail(id);
    const revokeSet = new Set(dto.roleIds);
    admin.roles = (admin.roles ?? []).filter((r) => !revokeSet.has(r.id));

    const saved = await this.adminRepo.save(admin);
    const data = plainToInstance(AdminResponseDto, saved, {
      excludeExtraneousValues: true,
    });
    return { message: RbacMessages.ROLE_REVOKED, data };
  }

  async findByIdOrFail(
    id: string,
    loadPermissions = false,
  ): Promise<AdminUser> {
    const admin = await this.adminRepo.findOne({
      where: { id },
      relations: loadPermissions
        ? { roles: { permissions: true } }
        : { roles: true },
    });
    if (!admin) throw new NotFoundException(AdminMessages.ADMIN_NOT_FOUND);
    return admin;
  }

  async getProfile(id: string): Promise<{ data: AdminResponseDto }> {
    const admin = await this.findByIdOrFail(id, true);

    const allPermissions = [
      ...new Map(
        (admin.roles ?? [])
          .flatMap((r) => r.permissions ?? [])
          .map((p) => [p.slug, { id: p.id, name: p.name, slug: p.slug }]),
      ).values(),
    ];

    const data = plainToInstance(
      AdminResponseDto,
      { ...admin, permissions: allPermissions },
      {
        excludeExtraneousValues: true,
      },
    );
    return { data };
  }

  async changePassword(
    id: string,
    dto: ChangeAdminPasswordDto,
  ): Promise<{ message: string }> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException(AdminMessages.ADMIN_NOT_FOUND);

    const valid = await comparePassword(dto.currentPassword, admin.passwordHash);
    if (!valid) throw new BadRequestException(AuthMessages.INVALID_CREDENTIALS);

    const passwordHash = await hashPassword(dto.newPassword);
    await this.adminRepo.update(id, { passwordHash });
    return { message: 'Password changed successfully.' };
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.adminRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: { roles: { permissions: true } },
    });
  }
}
