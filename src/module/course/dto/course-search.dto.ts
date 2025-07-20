import { PaginationDto } from '../../../common/dto/pagination.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { CourseLevel, CourseStatus } from 'src/common/enums/student.enum';

export class CourseSearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}