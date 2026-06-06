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
import { AdminResponseDto } from './dto/admin-response.dto';
import { hashPassword } from '../../common/utils/password.util';
import {
  AdminMessages,
  RbacMessages,
} from '../../common/constants/messages.constants';

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

    const passwordHash = await hashPassword(dto.password);
    const admin = this.adminRepo.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      isActive: true,
      roles: [],
    });
    const saved = await this.adminRepo.save(admin);
    const data = plainToInstance(AdminResponseDto, saved, {
      excludeExtraneousValues: true,
    });
    return { message: 'Admin user created successfully.', data };
  }

  async findAll(): Promise<AdminResponseDto[]> {
    const admins = await this.adminRepo.find({
      relations: { roles: true },
      order: { createdAt: 'DESC' },
    });
    return admins.map((a) =>
      plainToInstance(AdminResponseDto, a, { excludeExtraneousValues: true }),
    );
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
    });

    const saved = await this.adminRepo.save(admin);
    const data = plainToInstance(AdminResponseDto, saved, {
      excludeExtraneousValues: true,
    });
    return { message: 'Admin user updated successfully.', data };
  }

  async remove(id: string): Promise<{ message: string }> {
    const admin = await this.findByIdOrFail(id);
    await this.adminSessionRepo.delete({ adminId: id });
    await this.adminRepo.remove(admin);
    return { message: 'Admin user deleted successfully.' };
  }

  async assignRoles(
    id: string,
    dto: AssignRolesDto,
  ): Promise<{ message: string; data: AdminResponseDto }> {
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
    const admin = await this.findByIdOrFail(id);
    const revokeSet = new Set(dto.roleIds);
    admin.roles = (admin.roles ?? []).filter((r) => !revokeSet.has(r.id));

    const saved = await this.adminRepo.save(admin);
    const data = plainToInstance(AdminResponseDto, saved, {
      excludeExtraneousValues: true,
    });
    return { message: RbacMessages.ROLE_REVOKED, data };
  }

  async findByIdOrFail(id: string): Promise<AdminUser> {
    const admin = await this.adminRepo.findOne({
      where: { id },
      relations: { roles: true },
    });
    if (!admin) throw new NotFoundException(AdminMessages.ADMIN_NOT_FOUND);
    return admin;
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.adminRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: { roles: { permissions: true } },
    });
  }
}
