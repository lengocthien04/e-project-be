import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from '../../entities/course.entity';
import { Class } from '../../entities/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Class])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}