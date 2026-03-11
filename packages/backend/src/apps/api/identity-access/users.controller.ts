import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../../contexts/identity-access/users/application/user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Post()
  async create(
    @Body() body: { email: string; name: string; roleId: string },
  ) {
    return this.userService.create(body);
  }
}
