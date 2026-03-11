import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository';

@Injectable()
export class UserMemoryRepository implements IUserRepository {
  private readonly store = new Map<string, User>();

  async findAll(): Promise<User[]> {
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async save(user: User): Promise<User> {
    this.store.set(user.id, user);
    return user;
  }
}
