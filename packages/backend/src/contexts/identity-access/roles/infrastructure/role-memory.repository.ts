import { Injectable } from '@nestjs/common';
import { Role } from '../domain/role.entity';
import { IRoleRepository } from '../domain/role.repository';

@Injectable()
export class RoleMemoryRepository implements IRoleRepository {
  private readonly store = new Map<string, Role>();

  async findAll(): Promise<Role[]> {
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Role | null> {
    return this.store.get(id) ?? null;
  }

  async save(role: Role): Promise<Role> {
    this.store.set(role.id, role);
    return role;
  }
}
