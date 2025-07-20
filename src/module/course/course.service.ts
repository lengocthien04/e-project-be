/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseSearchDto } from './dto/course-search.dto';
import { Course } from '../../entities/course.entity';
import { Class } from '../../entities/class.entity';
import { CourseStatus } from 'src/common/enums/student.enum';
import { PaginatedResponse, PaginationMetadata } from '../../common/dto/pagination.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // Check if course code already exists
    const existingCourse = await this.courseRepository.findOne({
      where: { courseCode: createCourseDto.courseCode },
    });

    if (existingCourse) {
      throw new ConflictException('Course code already exists');
    }

    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPaginated(searchDto: CourseSearchDto): Promise<PaginatedResponse<Course>> {
    const { page = 1, limit = 10, search, department, level, status } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .orderBy('course.createdAt', 'DESC');

    // Apply search filters
    if (search) {
      queryBuilder.where(
        '(course.courseCode ILIKE :search OR course.courseName ILIKE :search OR course.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (department) {
      queryBuilder.andWhere('course.department ILIKE :department', { 
        department: `%${department}%` 
      });
    }

    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }

    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    const [courses, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const metadata: PaginationMetadata = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      data: courses,
      metadata,
    };
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findByCourseCode(courseCode: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { courseCode },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async getCourseProfile(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['classes', 'classes.teacher'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async getCourseClasses(courseId: number): Promise<Class[]> {
    const course = await this.findOne(courseId);
    
    return await this.classRepository.find({
      where: { courseId },
      relations: ['teacher', 'studyRecords'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCoursesByDepartment(department: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { department },
      order: { courseCode: 'ASC' },
    });
  }

  async getActiveCourses(): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { status: CourseStatus.ACTIVE },
      order: { courseCode: 'ASC' },
    });
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    if (updateCourseDto.courseCode && updateCourseDto.courseCode !== course.courseCode) {
      const existingCourse = await this.courseRepository.findOne({
        where: { courseCode: updateCourseDto.courseCode },
      });
      if (existingCourse) {
        throw new ConflictException('Course code already exists');
      }
    }

    await this.courseRepository.update(id, updateCourseDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);
    
    // Check if course has active classes
    const activeClasses = await this.classRepository.count({
      where: { courseId: id },
    });

    if (activeClasses > 0) {
      throw new ConflictException('Cannot delete course with existing classes');
    }

    await this.courseRepository.remove(course);
  }

  async updateCourseStatus(id: number, status: CourseStatus): Promise<Course> {
    await this.findOne(id); // Check if course exists
    await this.courseRepository.update(id, { status });
    return await this.findOne(id);
  }

  async getDepartments(): Promise<string[]> {
    const result = await this.courseRepository
      .createQueryBuilder('course')
      .select('DISTINCT course.department', 'department')
      .getRawMany();

    return result.map(item => item.department);
  }
}