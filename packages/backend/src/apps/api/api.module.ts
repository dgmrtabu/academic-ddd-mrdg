import { Module } from '@nestjs/common';
import { IdentityAccessModule } from '../../contexts/identity-access/identity-access.module';
import { AcademicModule } from '../../contexts/academic/academic.module';
import { UsersController } from './identity-access/users.controller';
import { RolesController } from './identity-access/roles.controller';
import { StudentsController } from './academic/students.controller';
import { SchedulesController } from './academic/schedules.controller';
import { CoursesController } from './academic/courses.controller';

@Module({
  imports: [IdentityAccessModule, AcademicModule],
  controllers: [
    UsersController,
    RolesController,
    StudentsController,
    SchedulesController,
    CoursesController,
  ],
})
export class ApiModule {}
