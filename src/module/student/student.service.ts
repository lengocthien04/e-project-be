import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentSearchDto } from './dto/student-search.dto';
import { Student } from '../../entities/student.entity';
import { StudyRecord } from '../../entities/study-record.entity';
import { LetterGrade, RecordStatus, StudentStatus } from 'src/common/enums/student.enum';
import { PaginatedResponse, PaginationMetadata } from '../../common/dto/pagination.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudyRecord)
    private studyRecordRepository: Repository<StudyRecord>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Check if student ID already exists
    const existingStudent = await this.studentRepository.findOne({
      where: { studentId: createStudentDto.studentId },
    });

    if (existingStudent) {
      throw new ConflictException('Student ID already exists');
    }

    // Check if email already exists
    const existingEmail = await this.studentRepository.findOne({
      where: { email: createStudentDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const student = this.studentRepository.create(createStudentDto);
    return await this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPaginated(searchDto: StudentSearchDto): Promise<PaginatedResponse<Student>> {
    const { page = 1, limit = 10, search } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .orderBy('student.createdAt', 'DESC');

    // Apply search filters
    if (search) {
      queryBuilder.where(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.studentId ILIKE :search OR student.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    

    const [students, total] = await queryBuilder
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
      data: students,
      metadata,
    };
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async findByStudentId(studentId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async getStudentProfile(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['studyRecords'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Calculate and update GPA
    await this.updateStudentGPA(id);

    return await this.studentRepository.findOne({
      where: { id },
      relations: ['studyRecords'],
    });
  }

  async getStudentStudyRecords(studentId: number): Promise<StudyRecord[]> {
    const student = await this.findOne(studentId);
  if (!student) {
      throw new NotFoundException('Student not found');
    }
    return await this.studyRecordRepository.find({
      where: { studentId },
      relations: ['class', 'class.course', 'class.teacher'],
      order: { createdAt: 'DESC' },
    });
  }



  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    if (updateStudentDto.studentId && updateStudentDto.studentId !== student.studentId) {
      const existingStudent = await this.studentRepository.findOne({
         
        where: { studentId: updateStudentDto.studentId },
      });
      if (existingStudent) {
        throw new ConflictException('Student ID already exists');
      }
    }

    if (updateStudentDto.email && updateStudentDto.email !== student.email) {
      const existingEmail = await this.studentRepository.findOne({
         
        where: { email: updateStudentDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.studentRepository.update(id, updateStudentDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async updateStudentStatus(id: number, status: StudentStatus): Promise<Student> {
    await this.findOne(id); // Check if student exists
    await this.studentRepository.update(id, { status });
    return await this.findOne(id);
  }

  private async updateStudentGPA(studentId: number): Promise<void> {
    const completedRecords = await this.studyRecordRepository.find({
      where: { 
        studentId,
        status: RecordStatus.COMPLETED,
        finalGrade: Not(null),
      },
      relations: ['class', 'class.course'],
    });

    if (completedRecords.length === 0) {
      return;
    }

    let totalGradePoints = 0;
    let totalCredits = 0;

    completedRecords.forEach(record => {
      const credits = record.class.course.credits;
      const gradePoints = this.calculateGradePoints(record.finalGrade);
      
      totalGradePoints += gradePoints * credits;
      totalCredits += credits;
    });

    const cumulativeGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    await this.studentRepository.update(studentId, {
      cumulativeGPA: parseFloat(cumulativeGPA.toFixed(2)),
      totalCreditsEarned: totalCredits,
    });
  }

  private calculateGradePoints(grade: LetterGrade): number {
    const gradePointMap = {
      [LetterGrade.A_PLUS]: 4.0,
      [LetterGrade.A]: 4.0,
      [LetterGrade.B_PLUS]: 3.3,
      [LetterGrade.B]: 3.0,
      [LetterGrade.C_PLUS]: 2.3,
      [LetterGrade.C]: 2.0,
      [LetterGrade.D_PLUS]: 1.3,
      [LetterGrade.D]: 1.0,
      [LetterGrade.F]: 0.0,
    };

    return gradePointMap[grade] || 0.0;
  }


}