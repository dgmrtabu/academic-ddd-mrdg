import { StudentSchedule } from './student-schedule.entity';

export const STUDENT_SCHEDULE_REPOSITORY = Symbol(
  'STUDENT_SCHEDULE_REPOSITORY',
);

export interface IStudentScheduleRepository {
  save(studentSchedule: StudentSchedule): Promise<StudentSchedule>;
  findByStudentId(studentId: string): Promise<StudentSchedule[]>;
  findByScheduleId(scheduleId: string): Promise<StudentSchedule[]>;
}
