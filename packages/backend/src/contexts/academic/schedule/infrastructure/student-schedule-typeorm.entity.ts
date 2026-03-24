import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('student_schedules')
export class StudentScheduleTypeOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'student_id' })
  studentId: string;

  @Column('uuid', { name: 'schedule_id' })
  scheduleId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
