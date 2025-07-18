// src/modules/teacher/dto/create-teacher.dto.ts
import { IsString, IsEmail, IsDateString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { AcademicRank, EducationLevel, TeacherStatus } from 'src/common/enums/student.enum';

export class CreateTeacherDto {
  @IsString()
  employeeId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  address: string;

  @IsDateString()
  hireDate: string;

  @IsString()
  department: string;

  @IsEnum(EducationLevel)
  @IsOptional()
  highestEducation?: EducationLevel;

  @IsString()
  specialization: string;

  @IsEnum(AcademicRank)
  @IsOptional()
  academicRank?: AcademicRank;

  @IsNumber()
  salary: number;

  @IsOptional()
  @IsEnum(TeacherStatus)
  status?: TeacherStatus;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  biography?: string;
}


