import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student } from '../../entities/student.entity';
import { StudyRecord } from '../../entities/study-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, StudyRecord])],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}