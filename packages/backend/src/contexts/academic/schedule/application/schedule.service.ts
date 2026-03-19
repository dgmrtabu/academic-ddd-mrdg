import { Injectable, Inject } from '@nestjs/common';
import { Schedule } from '../domain/schedule.entity';
import { IScheduleRepository, SCHEDULE_REPOSITORY, ScheduleSortField } from '../domain/schedule.repository';
import { CourseService } from '../../course/application/course.service';

export type SchedulesPaginatedResult = {
  data: Array<Schedule & { courseName: string;}>;
  total: number;
};

@Injectable()
export class ScheduleService {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IScheduleRepository,
    private readonly courseService: CourseService,
  ) {}

  async findAll(): Promise<Schedule[]> {
    return this.scheduleRepository.findAll();
  }

  async findAllWithCourseInfo(): Promise<
      Array<Schedule & { courseName: string }>
    > {
      const schedules = await this.scheduleRepository.findAll();
      const result: Array<Schedule & { courseName: string }> = [];
      for (const schedule of schedules) {
        const course = await this.courseService.findById(schedule.courseId);
        result.push({
          ...schedule,
          courseName: course?.name ?? '',
        });
      }
      return result;
    }
  
    async findPaginatedWithUserInfo(
      page: number,
      pageSize: number,
      sortBy?: ScheduleSortField,
      sortOrder?: 'asc' | 'desc',
    ): Promise<SchedulesPaginatedResult> {
      const offset = (Math.max(1, page) - 1) * Math.max(1, pageSize);
      const limit = Math.min(100, Math.max(1, pageSize));
      const { data: schedules, total } = await this.scheduleRepository.findPaginated({
        offset,
        limit,
        sortBy,
        sortOrder,
      });
      const data: Array<Schedule & { courseName: string }> = [];
      for (const schedule of schedules) {
        const course = await this.courseService.findById(schedule.courseId);
        data.push({
          ...schedule,
          courseName: course?.name ?? '',
        });
      }
      return { data, total };
    }

  async findById(id: string): Promise<Schedule | null> {
    return this.scheduleRepository.findById(id);
  }

  async create(data: { courseId: string; slot: string }): Promise<Schedule> {
    const id = crypto.randomUUID();
    const schedule = new Schedule(id, data.courseId, data.slot);
    return this.scheduleRepository.save(schedule);
  }

  async update(id: string, data:{ slot?: string, courseId?: string}): Promise<Schedule | null>{
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) return null;

    const slot = data.slot?.trim() ?? schedule.slot;
    const courseId = data.courseId?.trim() ?? schedule.courseId;

    const updated = new Schedule(
      schedule.id,
      courseId,
      slot
    );
    
    await this.scheduleRepository.save(updated);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) return false;
    await this.scheduleRepository.delete(id);
    return true;
  }
}
