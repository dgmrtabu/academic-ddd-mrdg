import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './application/role.service';
import { ROLE_REPOSITORY } from './domain/role.repository';
import { RoleTypeOrmEntity } from './infrastructure/role-typeorm.entity';
import { RoleTypeOrmRepository } from './infrastructure/role-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoleTypeOrmEntity])],
  providers: [
    RoleService,
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleTypeOrmRepository,
    },
  ],
  exports: [RoleService],
})
export class RolesModule {}
