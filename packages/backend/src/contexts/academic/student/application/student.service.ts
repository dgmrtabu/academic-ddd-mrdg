import { Injectable, Inject } from '@nestjs/common';
import { Student } from '../domain/student.entity';
import { IStudentRepository, STUDENT_REPOSITORY } from '../domain/student.repository';

@Injectable()
export class StudentService {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentRepository.findAll();
  }

  async findById(id: string): Promise<Student | null> {
    return this.studentRepository.findById(id);
  }

  async create(data: {
    name: string;
    document: string;
    birthDate: string;
  }): Promise<Student> {
    const id = crypto.randomUUID();
    const count = await this.studentRepository.count();
    const code = `ALUMNO-${String(count + 1).padStart(5, '0')}`;
    const birthDate = new Date(data.birthDate);
    const student = new Student(
      id,
      data.name,
      data.document,
      birthDate,
      code,
    );
    return this.studentRepository.save(student);
  }
}
