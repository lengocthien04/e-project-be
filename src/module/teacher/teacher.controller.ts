// src/modules/teacher/teacher.controller.ts
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
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherSearchDto } from './dto/teacher-search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherStatus } from 'src/common/enums/student.enum';

@Controller('teachers')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  async create(@Body() createTeacherDto: CreateTeacherDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Teacher created successfully',
      data: await this.teacherService.create(createTeacherDto),
    };
  }

  @Get()
  async findAll(@Query() searchDto: TeacherSearchDto) {
    const data = await this.teacherService.findAllPaginated(searchDto)
    return {
      statusCode: HttpStatus.OK,
      message: 'Teachers retrieved successfully',
      ...data,
    };
  }

  @Get('search')
  async findByEmployeeId(@Query('employeeId') employeeId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Teacher found successfully',
      data: await this.teacherService.findByEmployeeId(employeeId),
    };
  }

  @Get('department/:department')
  async getTeachersByDepartment(@Param('department') department: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Teachers by department retrieved successfully',
      data: await this.teacherService.getTeachersByDepartment(department),
    };
  }

  @Get('top-performers')
  async getTopPerformingTeachers(@Query('limit', ParseIntPipe) limit: number = 10) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Top performing teachers retrieved successfully',
      data: await this.teacherService.getTopPerformingTeachers(limit),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Teacher retrieved successfully',
      data: await this.teacherService.findOne(id),
    };
  }

  @Get(':id/profile')
  async getTeacherProfile(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Teacher profile retrieved successfully',
      data: await this.teacherService.getTeacherProfile(id),
    };
  }

  @Get(':id/teaching-records')
  async getTeacherTeachingRecords(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Teaching records retrieved successfully',
      data: await this.teacherService.getTeacherTeachingRecords(id),
    };
  }

  @Get(':id/teaching-records/semester')
  async getTeacherTeachingRecordsBySemester(
    @Param('id', ParseIntPipe) id: number,
    @Query('semester') semester: string,
    @Query('academicYear', ParseIntPipe) academicYear: number,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Semester teaching records retrieved successfully',
      data: await this.teacherService.getTeacherTeachingRecordsBySemester(
        id,
        semester,
        academicYear,
      ),
    };
  }

  @Get(':id/current-classes')
  async getTeacherCurrentClasses(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Current classes retrieved successfully',
      data: await this.teacherService.getTeacherCurrentClasses(id),
    };
  }

  @Get(':id/class-history')
  async getTeacherClassHistory(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Class history retrieved successfully',
      data: await this.teacherService.getTeacherClassHistory(id),
    };
  }

  @Get(':id/performance-summary')
  async getTeacherPerformanceSummary(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Performance summary retrieved successfully',
      data: await this.teacherService.getTeacherPerformanceSummary(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Teacher updated successfully',
      data: await this.teacherService.update(id, updateTeacherDto),
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TeacherStatus,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Teacher status updated successfully',
      data: await this.teacherService.updateTeacherStatus(id, status),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.teacherService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Teacher deleted successfully',
    };
  }
}