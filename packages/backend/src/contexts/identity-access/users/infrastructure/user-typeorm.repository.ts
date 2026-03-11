import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository';
import { UserTypeOrmEntity } from './user-typeorm.entity';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private readonly repo: Repository<UserTypeOrmEntity>,
  ) {}

  async findAll(): Promise<User[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    const row = this.repo.create({
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
    });
    await this.repo.save(row);
    return user;
  }

  private toDomain(row: UserTypeOrmEntity): User {
    return new User(row.id, row.email, row.name, row.roleId);
  }
}
