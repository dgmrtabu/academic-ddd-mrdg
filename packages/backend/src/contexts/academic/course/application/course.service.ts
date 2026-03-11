import { Injectable, Inject } from '@nestjs/common';
import { Course } from '../domain/course.entity';
import { ICourseRepository, COURSE_REPOSITORY } from '../domain/course.repository';

@Injectable()
export class CourseService {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async findAll(): Promise<Course[]> {
    return this.courseRepository.findAll();
  }

  async findById(id: string): Promise<Course | null> {
    return this.courseRepository.findById(id);
  }

  async create(data: {
    name: string;
    code: string;
    credits: number;
  }): Promise<Course> {
    const id = crypto.randomUUID();
    const course = new Course(id, data.name, data.code, data.credits);
    return this.courseRepository.save(course);
  }
}
