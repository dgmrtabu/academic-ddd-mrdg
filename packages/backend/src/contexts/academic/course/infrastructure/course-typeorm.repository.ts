import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../domain/course.entity';
import { ICourseRepository } from '../domain/course.repository';
import { CourseTypeOrmEntity } from './course-typeorm.entity';

@Injectable()
export class CourseTypeOrmRepository implements ICourseRepository {
  constructor(
    @InjectRepository(CourseTypeOrmEntity)
    private readonly repo: Repository<CourseTypeOrmEntity>,
  ) {}

  async findAll(): Promise<Course[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Course | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(course: Course): Promise<Course> {
    const row = this.repo.create({
      id: course.id,
      name: course.name,
      code: course.code,
      credits: course.credits,
    });
    await this.repo.save(row);
    return course;
  }

  private toDomain(row: CourseTypeOrmEntity): Course {
    return new Course(row.id, row.name, row.code, row.credits);
  }
}
