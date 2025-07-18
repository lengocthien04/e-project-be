// src/modules/teacher/teacher.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { Teacher } from '../../entities/teacher.entity';
import { TeachingRecord } from '../../entities/teaching-record.entity';
import { Class } from '../../entities/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, TeachingRecord, Class])],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}