// src/modules/teacher/dto/update-teacher.dto.ts
import { IsString, IsEmail, IsDateString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { AcademicRank, EducationLevel, TeacherStatus } from 'src/common/enums/student.enum';

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsEnum(EducationLevel)
  highestEducation?: EducationLevel;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsEnum(AcademicRank)
  academicRank?: AcademicRank;

  @IsOptional()
  @IsNumber()
  salary?: number;

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
