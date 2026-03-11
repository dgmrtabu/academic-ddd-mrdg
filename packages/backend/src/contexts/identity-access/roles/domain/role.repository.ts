import { Role } from './role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface IRoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  save(role: Role): Promise<Role>;
}
