// src/modules/teacher/teacher.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../../entities/teacher.entity';
import { TeachingRecord } from '../../entities/teaching-record.entity';
import { Class, ClassStatus } from '../../entities/class.entity';
import { TeacherStatus } from 'src/common/enums/student.enum';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherSearchDto } from './dto/teacher-search.dto';
import { PaginatedResponse, PaginationMetadata } from '../../common/dto/pagination.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(TeachingRecord)
    private teachingRecordRepository: Repository<TeachingRecord>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    // Check if employee ID already exists
    const existingTeacher = await this.teacherRepository.findOne({
      where: { employeeId: createTeacherDto.employeeId },
    });

    if (existingTeacher) {
      throw new ConflictException('Employee ID already exists');
    }

    // Check if email already exists
    const existingEmail = await this.teacherRepository.findOne({
      where: { email: createTeacherDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const teacher = this.teacherRepository.create(createTeacherDto);
    return await this.teacherRepository.save(teacher);
  }

  async findAll(): Promise<Teacher[]> {
    return await this.teacherRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPaginated(searchDto: TeacherSearchDto): Promise<PaginatedResponse<Teacher>> {
    const { page = 1, limit = 10, search } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.teacherRepository
      .createQueryBuilder('teacher')
      .orderBy('teacher.createdAt', 'DESC');

    // Apply search filters
    if (search) {
      queryBuilder.where(
        '(teacher.firstName ILIKE :search OR teacher.lastName ILIKE :search OR teacher.employeeId ILIKE :search OR teacher.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }


    const [teachers, total] = await queryBuilder
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
      data: teachers,
      metadata,
    };
  }

  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  async findByEmployeeId(employeeId: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { employeeId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  async getTeacherProfile(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['classes', 'teachingRecords'],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Update overall rating based on teaching records
    await this.updateTeacherRating(id);

    return await this.teacherRepository.findOne({
      where: { id },
      relations: ['classes', 'teachingRecords'],
    });
  }

  async getTeacherTeachingRecords(teacherId: number): Promise<TeachingRecord[]> {
    const teacher = await this.findOne(teacherId);
    
    return await this.teachingRecordRepository.find({
      where: { teacherId },
      relations: ['class', 'class.course'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTeacherTeachingRecordsBySemester(
    teacherId: number,
    semester: string,
    academicYear: number,
  ): Promise<TeachingRecord[]> {
    const teacher = await this.findOne(teacherId);

    return await this.teachingRecordRepository
      .createQueryBuilder('teachingRecord')
      .leftJoinAndSelect('teachingRecord.class', 'class')
      .leftJoinAndSelect('class.course', 'course')
      .where('teachingRecord.teacherId = :teacherId', { teacherId })
      .andWhere('class.semester = :semester', { semester })
      .andWhere('class.academicYear = :academicYear', { academicYear })
      .orderBy('teachingRecord.createdAt', 'DESC')
      .getMany();
  }

  async getTeacherCurrentClasses(teacherId: number): Promise<Class[]> {
    const teacher = await this.findOne(teacherId);

    return await this.classRepository.find({
      where: { 
        teacherId,
        status: ClassStatus.ACTIVE,
      },
      relations: ['course', 'studyRecords'],
      order: { startDate: 'ASC' },
    });
  }

  async getTeacherClassHistory(teacherId: number): Promise<Class[]> {
    const teacher = await this.findOne(teacherId);

    return await this.classRepository.find({
      where: { teacherId },
      relations: ['course', 'studyRecords'],
      order: { startDate: 'DESC' },
    });
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.findOne(id);

    // Check for conflicts if updating unique fields
    if (updateTeacherDto.employeeId && updateTeacherDto.employeeId !== teacher.employeeId) {
      const existingTeacher = await this.teacherRepository.findOne({
        where: { employeeId: updateTeacherDto.employeeId },
      });
      if (existingTeacher) {
        throw new ConflictException('Employee ID already exists');
      }
    }

    if (updateTeacherDto.email && updateTeacherDto.email !== teacher.email) {
      const existingEmail = await this.teacherRepository.findOne({
        where: { email: updateTeacherDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.teacherRepository.update(id, updateTeacherDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const teacher = await this.findOne(id);
    await this.teacherRepository.remove(teacher);
  }

  async updateTeacherStatus(id: number, status: TeacherStatus): Promise<Teacher> {
    await this.findOne(id); // Check if teacher exists
    await this.teacherRepository.update(id, { status });
    return await this.findOne(id);
  }

  private async updateTeacherRating(teacherId: number): Promise<void> {
    const teachingRecords = await this.teachingRecordRepository.find({
      where: { teacherId },
    });

    if (teachingRecords.length === 0) {
      return;
    }

    const totalRating = teachingRecords.reduce(
      (sum, record) => sum + record.overallSatisfactionScore,
      0,
    );

    const overallRating = totalRating / teachingRecords.length;

    await this.teacherRepository.update(teacherId, {
      overallRating: parseFloat(overallRating.toFixed(2)),
    });
  }

  async getTeacherPerformanceSummary(teacherId: number) {
    const teacher = await this.getTeacherProfile(teacherId);
    const teachingRecords = await this.getTeacherTeachingRecords(teacherId);
    const currentClasses = await this.getTeacherCurrentClasses(teacherId);

    const completedRecords = teachingRecords.filter(
      record => record.class.status === ClassStatus.COMPLETED
    );

    // Calculate performance metrics
    const avgSatisfactionScore = this.calculateAverage(
      completedRecords.map(r => r.overallSatisfactionScore)
    );

    const avgTeachingEffectiveness = this.calculateAverage(
      completedRecords.map(r => r.teachingEffectivenessScore)
    );

    const avgClassPerformance = this.calculateAverage(
      completedRecords.map(r => r.classAverageScore)
    );

    const avgPassRate = this.calculateAverage(
      completedRecords.map(r => r.passRate)
    );

    return {
      teacher,
      performanceSummary: {
        overallRating: teacher.overallRating,
        totalClassesTaught: completedRecords.length,
        currentlyTeaching: currentClasses.length,
        averageSatisfactionScore: avgSatisfactionScore,
        averageTeachingEffectiveness: avgTeachingEffectiveness,
        averageClassPerformance: avgClassPerformance,
        averagePassRate: avgPassRate,
        yearsOfExperience: teacher.yearsOfExperience,
        academicRank: teacher.academicRank,
      },
      teachingRecords: completedRecords.slice(0, 5), // Latest 5 records
      currentClasses,
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + (val || 0), 0);
    return parseFloat((sum / values.length).toFixed(2));
  }

  async getTeachersByDepartment(department: string): Promise<Teacher[]> {
    return await this.teacherRepository.find({
      where: { department },
      order: { lastName: 'ASC' },
    });
  }

  async getTopPerformingTeachers(limit: number = 10): Promise<Teacher[]> {
    return await this.teacherRepository.find({
      where: { status: TeacherStatus.ACTIVE },
      order: { overallRating: 'DESC' },
      take: limit,
    });
  }
}