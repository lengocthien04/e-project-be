// src/modules/student/dto/create-student.dto.ts
import { IsString, IsEmail, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { StudentStatus, YearLevel } from 'src/common/enums/student.enum';

export class CreateStudentDto {
  @IsString()
  studentId: string;

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
  enrollmentDate: string;

  @IsEnum(YearLevel)
  @IsOptional()
  currentYearLevel?: YearLevel;

  @IsString()
  major: string;

  @IsOptional()
  @IsString()
  minor?: string;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}

