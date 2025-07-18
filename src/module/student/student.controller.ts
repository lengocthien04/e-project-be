// src/modules/student/student.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudentStatus } from 'src/common/enums/student.enum';
import { StudentService } from './student.service';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async create(@Body() createStudentDto: CreateStudentDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Student created successfully',
      data: await this.studentService.create(createStudentDto),
    };
  }

  @Get()
  async findAll() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Students retrieved successfully',
      data: await this.studentService.findAll(),
    };
  }

  @Get('search')
  async findByStudentId(@Query('studentId') studentId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Student found successfully',
      data: await this.studentService.findByStudentId(studentId),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Student retrieved successfully',
      data: await this.studentService.findOne(id),
    };
  }

  @Get(':id/profile')
  async getStudentProfile(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Student profile retrieved successfully',
      data: await this.studentService.getStudentProfile(id),
    };
  }

  @Get(':id/study-records')
  async getStudentStudyRecords(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Study records retrieved successfully',
      data: await this.studentService.getStudentStudyRecords(id),
    };
  }


  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Student updated successfully',
      data: await this.studentService.update(id, updateStudentDto),
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: StudentStatus,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Student status updated successfully',
      data: await this.studentService.updateStudentStatus(id, status),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.studentService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Student deleted successfully',
    };
  }
}