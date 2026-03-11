import { Injectable } from '@nestjs/common';
import { Student } from '../domain/student.entity';
import { IStudentRepository } from '../domain/student.repository';

@Injectable()
export class StudentMemoryRepository implements IStudentRepository {
  private readonly store = new Map<string, Student>();

  async findAll(): Promise<Student[]> {
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Student | null> {
    return this.store.get(id) ?? null;
  }

  async count(): Promise<number> {
    return this.store.size;
  }

  async save(student: Student): Promise<Student> {
    this.store.set(student.id, student);
    return student;
  }
}
