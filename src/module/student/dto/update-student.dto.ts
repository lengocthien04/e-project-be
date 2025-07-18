import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateStudentDto extends PartialType(CreateStudentDto) {}

// src/modules/student/dto/student-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { StudentStatus, YearLevel } from 'src/common/enums/student.enum';

export class StudentResponseDto {
  @Expose()
  id: number;

  @Expose()
  studentId: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  dateOfBirth: Date;

  @Expose()
  address: string;

  @Expose()
  enrollmentDate: Date;

  @Expose()
  currentYearLevel: YearLevel;

  @Expose()
  major: string;

  @Expose()
  minor: string;

  @Expose()
  cumulativeGPA: number;

  @Expose()
  totalCreditsEarned: number;

  @Expose()
  status: StudentStatus;

  @Expose()
  profilePicture: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}