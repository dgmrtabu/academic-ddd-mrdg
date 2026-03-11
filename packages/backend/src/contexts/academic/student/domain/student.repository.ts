import { Student } from './student.entity';

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

export interface IStudentRepository {
  findAll(): Promise<Student[]>;
  findById(id: string): Promise<Student | null>;
  count(): Promise<number>;
  save(student: Student): Promise<Student>;
}
