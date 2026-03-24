import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentSchedule } from '../domain/student-schedule.entity';
import {
  IStudentScheduleRepository,
} from '../domain/student-schedule.repository';
import { StudentScheduleTypeOrmEntity } from './student-schedule-typeorm.entity';

@Injectable()
export class StudentScheduleTypeOrmRepository
  implements IStudentScheduleRepository
{
  constructor(
    @InjectRepository(StudentScheduleTypeOrmEntity)
    private readonly repo: Repository<StudentScheduleTypeOrmEntity>,
  ) {}

  async save(studentSchedule: StudentSchedule): Promise<StudentSchedule> {
    const row = this.repo.create({
      id: studentSchedule.id,
      studentId: studentSchedule.studentId,
      scheduleId: studentSchedule.scheduleId,
    });
    await this.repo.save(row);
    return studentSchedule;
  }

  async findByStudentId(studentId: string): Promise<StudentSchedule[]> {
    const rows = await this.repo.find({
      where: { studentId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByScheduleId(scheduleId: string): Promise<StudentSchedule[]> {
    const rows = await this.repo.find({
      where: { scheduleId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  private toDomain(row: StudentScheduleTypeOrmEntity): StudentSchedule {
    return new StudentSchedule(row.id, row.studentId, row.scheduleId);
  }
}
