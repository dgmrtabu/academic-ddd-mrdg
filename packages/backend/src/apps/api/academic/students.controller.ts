import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { StudentService } from '../../../contexts/academic/student/application/student.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const student = await this.studentService.findById(id);
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  @Post()
  async create(
    @Body() body: { name: string; document: string; birthDate: string },
  ) {
    return this.studentService.create(body);
  }
}
