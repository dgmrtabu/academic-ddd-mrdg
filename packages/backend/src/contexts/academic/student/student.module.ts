import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityAccessModule } from '../../identity-access/identity-access.module';
import { StudentService } from './application/student.service';
import { STUDENT_REPOSITORY } from './domain/student.repository';
import { StudentTypeOrmEntity } from './infrastructure/student-typeorm.entity';
import { StudentTypeOrmRepository } from './infrastructure/student-typeorm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentTypeOrmEntity]),
    IdentityAccessModule,
  ],
  providers: [
    StudentService,
    {
      provide: STUDENT_REPOSITORY,
      useClass: StudentTypeOrmRepository,
    },
  ],
  exports: [StudentService],
})
export class StudentModule {}
