import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CourseLevel, CourseStatus } from 'src/common/enums/student.enum';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  courseCode: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  courseName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  department: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  credits: number;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsString()
  prerequisites?: string;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @IsString()
  learningObjectives?: string;

  @IsOptional()
  @IsString()
  syllabus?: string;

  @IsOptional()
  @IsString()
  textbook?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  minimumEnrollment?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  maximumEnrollment?: number;
}