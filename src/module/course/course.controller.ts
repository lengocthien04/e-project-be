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
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseSearchDto } from './dto/course-search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CourseStatus } from 'src/common/enums/student.enum';
import { CourseService } from './course.service';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Course created successfully',
      data: await this.courseService.create(createCourseDto),
    };
  }

  @Get()
  async findAll(@Query() searchDto: CourseSearchDto) {
    const data = await this.courseService.findAllPaginated(searchDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Courses retrieved successfully',
      ...data
    };
  }

  @Get('departments')
  async getDepartments() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Departments retrieved successfully',
      data: await this.courseService.getDepartments(),
    };
  }

  @Get('active')
  async getActiveCourses() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Active courses retrieved successfully',
      data: await this.courseService.getActiveCourses(),
    };
  }

  @Get('department/:department')
  async getCoursesByDepartment(@Param('department') department: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Courses by department retrieved successfully',
      data: await this.courseService.getCoursesByDepartment(department),
    };
  }

  @Get('search')
  async findByCourseCode(@Query('courseCode') courseCode: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Course found successfully',
      data: await this.courseService.findByCourseCode(courseCode),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Course retrieved successfully',
      data: await this.courseService.findOne(id),
    };
  }

  @Get(':id/profile')
  async getCourseProfile(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Course profile retrieved successfully',
      data: await this.courseService.getCourseProfile(id),
    };
  }

  @Get(':id/classes')
  async getCourseClasses(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Course classes retrieved successfully',
      data: await this.courseService.getCourseClasses(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Course updated successfully',
      data: await this.courseService.update(id, updateCourseDto),
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: CourseStatus,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Course status updated successfully',
      data: await this.courseService.updateCourseStatus(id, status),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.courseService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Course deleted successfully',
    };
  }
}