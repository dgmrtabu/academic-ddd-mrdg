import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../domain/role.entity';
import { IRoleRepository } from '../domain/role.repository';
import { RoleTypeOrmEntity } from './role-typeorm.entity';

@Injectable()
export class RoleTypeOrmRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleTypeOrmEntity)
    private readonly repo: Repository<RoleTypeOrmEntity>,
  ) {}

  async findAll(): Promise<Role[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Role | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const row = await this.repo.findOne({ where: { name } });
    return row ? this.toDomain(row) : null;
  }

  async save(role: Role): Promise<Role> {
    const row = this.repo.create({
      id: role.id,
      name: role.name,
      permissions: (role.permissions ?? []).join(','),
    });
    await this.repo.save(row);
    return role;
  }

  private toDomain(row: RoleTypeOrmEntity): Role {
    const raw: unknown = row.permissions;
    const permissions: string[] =
      typeof raw === 'string'
        ? raw ? raw.split(',').filter(Boolean) : []
        : Array.isArray(raw)
          ? raw.filter((p): p is string => typeof p === 'string')
          : [];
    return new Role(row.id, row.name, permissions);
  }
}
