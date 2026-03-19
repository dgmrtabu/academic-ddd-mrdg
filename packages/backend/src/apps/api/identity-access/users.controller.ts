import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../../contexts/identity-access/users/domain/user.entity';
import { UserService } from '../../../contexts/identity-access/users/application/user.service';

function toUserResponse(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return users.map(toUserResponse);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return toUserResponse(user);
  }

  @Post()
  async create(
    @Body() body: {
      username: string;
      email: string;
      roleId: string;
      password: string;
    },
  ) {
    const user = await this.userService.create(body);
    return toUserResponse(user);
  }


  @Patch(':id/email')
  async updateEmail(
    @Param('id') id: string,
    @Body('email') email:string
  ) {
    const user = await this.userService.updateEmail(id, email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
 



}
