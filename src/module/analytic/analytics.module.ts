// src/modules/analytics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Student } from 'src/entities/student.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Course } from 'src/entities/course.entity';
import { Class } from 'src/entities/class.entity';
import { StudyRecord } from 'src/entities/study-record.entity';
import { TeachingRecord } from 'src/entities/teaching-record.entity';
import { Analytics } from 'src/entities/analytics.entity';
import { ETLController } from './etl.controller';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from 'src/services/analytics.service';
import { ETLService } from 'src/services/etl.service';




@Module({
  imports: [
    TypeOrmModule.forFeature([
      Analytics,
      Student,
      Teacher,
      Course,
      Class,
      StudyRecord,
      TeachingRecord,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AnalyticsController, ETLController],
  providers: [AnalyticsService, ETLService],
  exports: [AnalyticsService, ETLService],
})
export class AnalyticsModule {}