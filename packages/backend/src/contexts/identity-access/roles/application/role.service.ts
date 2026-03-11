import { Injectable, Inject } from '@nestjs/common';
import { Role } from '../domain/role.entity';
import { IRoleRepository, ROLE_REPOSITORY } from '../domain/role.repository';

@Injectable()
export class RoleService {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async create(data: { name: string; permissions?: string[] }): Promise<Role> {
    const id = crypto.randomUUID();
    const role = new Role(id, data.name, data.permissions ?? []);
    return this.roleRepository.save(role);
  }
}
