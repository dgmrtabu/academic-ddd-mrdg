import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from './application/schedule.service';
import { SCHEDULE_REPOSITORY } from './domain/schedule.repository';
import { ScheduleTypeOrmEntity } from './infrastructure/schedule-typeorm.entity';
import { ScheduleTypeOrmRepository } from './infrastructure/schedule-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleTypeOrmEntity])],
  providers: [
    ScheduleService,
    {
      provide: SCHEDULE_REPOSITORY,
      useClass: ScheduleTypeOrmRepository,
    },
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}
