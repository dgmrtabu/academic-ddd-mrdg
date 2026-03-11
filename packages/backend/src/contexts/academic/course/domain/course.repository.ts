import { Course } from './course.entity';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

export interface ICourseRepository {
  findAll(): Promise<Course[]>;
  findById(id: string): Promise<Course | null>;
  save(course: Course): Promise<Course>;
}
