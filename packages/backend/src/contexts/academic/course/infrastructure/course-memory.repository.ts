import { Injectable } from '@nestjs/common';
import { Course } from '../domain/course.entity';
import { ICourseRepository } from '../domain/course.repository';

@Injectable()
export class CourseMemoryRepository implements ICourseRepository {
  private readonly store = new Map<string, Course>();

  async findAll(): Promise<Course[]> {
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Course | null> {
    return this.store.get(id) ?? null;
  }

  async save(course: Course): Promise<Course> {
    this.store.set(course.id, course);
    return course;
  }
}
