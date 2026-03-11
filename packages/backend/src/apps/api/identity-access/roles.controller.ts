import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { RoleService } from '../../../contexts/identity-access/roles/application/role.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const role = await this.roleService.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  @Post()
  async create(
    @Body() body: { name: string; permissions?: string[] },
  ) {
    return this.roleService.create(body);
  }
}
