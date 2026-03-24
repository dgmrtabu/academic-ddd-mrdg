import { Module } from '@nestjs/common';
import { StudentModule } from './student/student.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CourseModule } from './course/course.module';
import { DepartmentModule } from './department/department.module'; // <-- ESTO

@Module({
  imports: [StudentModule, ScheduleModule, CourseModule, DepartmentModule], // <-- Y ESTO
  exports: [StudentModule, ScheduleModule, CourseModule, DepartmentModule],
})
export class AcademicModule {}