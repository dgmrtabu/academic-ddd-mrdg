import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../domain/student.entity';
import { IStudentRepository } from '../domain/student.repository';
import { StudentTypeOrmEntity } from './student-typeorm.entity';

@Injectable()
export class StudentTypeOrmRepository implements IStudentRepository {
  constructor(
    @InjectRepository(StudentTypeOrmEntity)
    private readonly repo: Repository<StudentTypeOrmEntity>,
  ) {}

  async findAll(): Promise<Student[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Student | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async save(student: Student): Promise<Student> {
    const row = this.repo.create({
      id: student.id,
      name: student.name,
      document: student.document,
      birthDate: student.birthDate,
      code: student.code,
    });
    await this.repo.save(row);
    return student;
  }

  private toDomain(row: StudentTypeOrmEntity): Student {
    return new Student(
      row.id,
      row.name,
      row.document,
      row.birthDate,
      row.code,
    );
  }
}
