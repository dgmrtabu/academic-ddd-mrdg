import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { CourseService } from '../../../contexts/academic/course/application/course.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  @Post()
  async create(
    @Body() body: { name: string; code: string; credits: number },
  ) {
    return this.courseService.create(body);
  }
}
