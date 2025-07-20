import { Exclude, Expose } from 'class-transformer';
import { CourseLevel, CourseStatus } from 'src/common/enums/student.enum';

export class CourseResponseDto {
  @Expose()
  id: number;

  @Expose()
  courseCode: string;

  @Expose()
  courseName: string;

  @Expose()
  description: string;

  @Expose()
  department: string;

  @Expose()
  credits: number;

  @Expose()
  level: CourseLevel;

  @Expose()
  prerequisites: string;

  @Expose()
  status: CourseStatus;

  @Expose()
  learningObjectives: string;

  @Expose()
  syllabus: string;

  @Expose()
  textbook: string;

  @Expose()
  minimumEnrollment: number;

  @Expose()
  maximumEnrollment: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}