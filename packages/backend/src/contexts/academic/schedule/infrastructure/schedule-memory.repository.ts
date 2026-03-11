import { Injectable } from '@nestjs/common';
import { Schedule } from '../domain/schedule.entity';
import { IScheduleRepository } from '../domain/schedule.repository';

@Injectable()
export class ScheduleMemoryRepository implements IScheduleRepository {
  private readonly store = new Map<string, Schedule>();

  async findAll(): Promise<Schedule[]> {
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Schedule | null> {
    return this.store.get(id) ?? null;
  }

  async save(schedule: Schedule): Promise<Schedule> {
    this.store.set(schedule.id, schedule);
    return schedule;
  }
}
