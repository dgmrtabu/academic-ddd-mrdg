import { Injectable, Inject } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { IUserRepository, USER_REPOSITORY } from '../domain/user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async create(data: { email: string; name: string; roleId: string }): Promise<User> {
    const id = crypto.randomUUID();
    const user = new User(id, data.email, data.name, data.roleId);
    return this.userRepository.save(user);
  }
}
