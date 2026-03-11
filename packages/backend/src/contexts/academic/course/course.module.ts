import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './application/course.service';
import { COURSE_REPOSITORY } from './domain/course.repository';
import { CourseTypeOrmEntity } from './infrastructure/course-typeorm.entity';
import { CourseTypeOrmRepository } from './infrastructure/course-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CourseTypeOrmEntity])],
  providers: [
    CourseService,
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseTypeOrmRepository,
    },
  ],
  exports: [CourseService],
})
export class CourseModule {}
