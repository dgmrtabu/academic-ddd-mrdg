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

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.repo.findOne({
      where: { username: username.toLowerCase() },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    const row = this.repo.create({
      id: user.id,
      username: user.username.toLowerCase(),
      email: user.email,
      roleId: user.roleId,
      password: user.password,
    });
    await this.repo.save(row);
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: UserTypeOrmEntity): User {
    return new User(
      row.id,
      row.username,
      row.email,
      row.roleId,
      row.password,
    );
  }
}
