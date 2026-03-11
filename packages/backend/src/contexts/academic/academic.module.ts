import { Module } from '@nestjs/common';
import { StudentModule } from './student/student.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [StudentModule, ScheduleModule, CourseModule],
  exports: [StudentModule, ScheduleModule, CourseModule],
})
export class AcademicModule {}
