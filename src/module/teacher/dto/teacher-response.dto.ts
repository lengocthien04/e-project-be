// src/modules/teacher/dto/teacher-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { AcademicRank, EducationLevel, TeacherStatus } from 'src/common/enums/student.enum';

export class TeacherResponseDto {
  @Expose()
  id: number;

  @Expose()
  employeeId: string;

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
  hireDate: Date;

  @Expose()
  department: string;

  @Expose()
  highestEducation: EducationLevel;

  @Expose()
  specialization: string;

  @Expose()
  academicRank: AcademicRank;

  @Exclude()
  salary: number;

  @Expose()
  status: TeacherStatus;

  @Expose()
  overallRating: number;

  @Expose()
  yearsOfExperience: number;

  @Expose()
  profilePicture: string;

  @Expose()
  biography: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}