/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/services/analytics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics, AnalyticsType, AnalyticsPeriod } from '../entities/analytics.entity';
import { Student } from '../entities/student.entity';
import { Teacher } from '../entities/teacher.entity';
import { Course } from '../entities/course.entity';
import { Class } from '../entities/class.entity';
import { StudyRecord } from '../entities/study-record.entity';
import { TeachingRecord } from '../entities/teaching-record.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(StudyRecord)
    private studyRecordRepository: Repository<StudyRecord>,
    @InjectRepository(TeachingRecord)
    private teachingRecordRepository: Repository<TeachingRecord>,
  ) {}

  async findAll(filters?: {
    analyticsType?: AnalyticsType;
    period?: AnalyticsPeriod;
    department?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.analyticsRepository.createQueryBuilder('analytics');

    if (filters?.analyticsType) {
      query.andWhere('analytics.analyticsType = :analyticsType', {
        analyticsType: filters.analyticsType,
      });
    }

    if (filters?.period) {
      query.andWhere('analytics.period = :period', {
        period: filters.period,
      });
    }

    if (filters?.department) {
      query.andWhere('analytics.department = :department', {
        department: filters.department,
      });
    }

    if (filters?.startDate) {
      query.andWhere('analytics.periodStart >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('analytics.periodEnd <= :endDate', {
        endDate: filters.endDate,
      });
    }

    return query.orderBy('analytics.createdAt', 'DESC').getMany();
  }

  async findById(id: number) {
    return this.analyticsRepository.findOne({ where: { id } });
  }

  async getStudentPerformanceAnalytics(filters?: {
    studentId?: number;
    period?: AnalyticsPeriod;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.analyticsRepository.createQueryBuilder('analytics')
      .where('analytics.analyticsType = :type', { type: AnalyticsType.STUDENT_PERFORMANCE });

    if (filters?.studentId) {
      query.andWhere('analytics.studentId = :studentId', { studentId: filters.studentId });
    }

    if (filters?.period) {
      query.andWhere('analytics.period = :period', { period: filters.period });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('analytics.periodStart >= :startDate AND analytics.periodEnd <= :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.orderBy('analytics.periodStart', 'DESC').getMany();
  }

  async getTeacherPerformanceAnalytics(filters?: {
    teacherId?: number;
    period?: AnalyticsPeriod;
    department?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.analyticsRepository.createQueryBuilder('analytics')
      .where('analytics.analyticsType = :type', { type: AnalyticsType.TEACHER_PERFORMANCE });

    if (filters?.teacherId) {
      query.andWhere('analytics.teacherId = :teacherId', { teacherId: filters.teacherId });
    }

    if (filters?.department) {
      query.andWhere('analytics.department = :department', { department: filters.department });
    }

    if (filters?.period) {
      query.andWhere('analytics.period = :period', { period: filters.period });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('analytics.periodStart >= :startDate AND analytics.periodEnd <= :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.orderBy('analytics.periodStart', 'DESC').getMany();
  }

  async getCourseAnalytics(filters?: {
    courseId?: number;
    department?: string;
    period?: AnalyticsPeriod;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.analyticsRepository.createQueryBuilder('analytics')
      .where('analytics.analyticsType = :type', { type: AnalyticsType.COURSE_ANALYTICS });

    if (filters?.courseId) {
      query.andWhere('analytics.courseId = :courseId', { courseId: filters.courseId });
    }

    if (filters?.department) {
      query.andWhere('analytics.department = :department', { department: filters.department });
    }

    if (filters?.period) {
      query.andWhere('analytics.period = :period', { period: filters.period });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('analytics.periodStart >= :startDate AND analytics.periodEnd <= :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.orderBy('analytics.periodStart', 'DESC').getMany();
  }

  async getDepartmentAnalytics(department: string, period?: AnalyticsPeriod) {
    const query = this.analyticsRepository.createQueryBuilder('analytics')
      .where('analytics.analyticsType = :type', { type: AnalyticsType.DEPARTMENT_ANALYTICS })
      .andWhere('analytics.department = :department', { department });

    if (period) {
      query.andWhere('analytics.period = :period', { period });
    }

    return query.orderBy('analytics.periodStart', 'DESC').getMany();
  }

  async getSemesterSummary(semester: string, academicYear: number) {
    return this.analyticsRepository.find({
      where: {
        analyticsType: AnalyticsType.SEMESTER_SUMMARY,
        semester,
        academicYear,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getAnalyticsTrends(
    analyticsType: AnalyticsType,
    metric: string,
    period: AnalyticsPeriod,
    limit: number = 12
  ) {
    const query = this.analyticsRepository.createQueryBuilder('analytics')
      .where('analytics.analyticsType = :analyticsType', { analyticsType })
      .andWhere('analytics.period = :period', { period })
      .orderBy('analytics.periodStart', 'DESC')
      .limit(limit);

    const results = await query.getMany();
    
    return results.map(record => ({
      period: record.periodStart,
      value: record[metric],
      periodLabel: this.formatPeriodLabel(record.periodStart, period),
    }));
  }

  async getComparativeAnalytics(
    analyticsType: AnalyticsType,
    comparisonField: string,
    period: AnalyticsPeriod,
    startDate?: Date,
    endDate?: Date
  ) {
    const query = this.analyticsRepository.createQueryBuilder('analytics')
      .where('analytics.analyticsType = :analyticsType', { analyticsType })
      .andWhere('analytics.period = :period', { period });

    if (startDate && endDate) {
      query.andWhere('analytics.periodStart >= :startDate AND analytics.periodEnd <= :endDate', {
        startDate,
        endDate,
      });
    }

    const results = await query.getMany();
    
    // Group by comparison field and calculate averages
    const grouped = results.reduce((acc, record) => {
      const key = record[comparisonField];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record);
      return acc;
    }, {});

    return Object.entries(grouped).map(([key, records]: [string, Analytics[]]) => ({
      [comparisonField]: key,
      averageGPA: this.calculateAverage(records, 'averageGPA'),
      passRate: this.calculateAverage(records, 'passRate'),
      attendanceRate: this.calculateAverage(records, 'averageAttendance'),
      enrollmentRate: this.calculateAverage(records, 'enrollmentRate'),
      recordCount: records.length,
    }));
  }

  private calculateAverage(records: Analytics[], field: string): number {
    const values = records
      .map(r => r[field])
      .filter(v => v !== null && v !== undefined);
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + Number(val), 0) / values.length;
  }

  private formatPeriodLabel(date: Date, period: AnalyticsPeriod): string {
    const d = new Date(date);
    
    switch (period) {
      case AnalyticsPeriod.DAILY:
        return d.toLocaleDateString();
      case AnalyticsPeriod.WEEKLY:
        { const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return `Week of ${weekStart.toLocaleDateString()}`; }
      case AnalyticsPeriod.MONTHLY:
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      case AnalyticsPeriod.SEMESTER:
        return `${d.getFullYear()} Semester`;
      case AnalyticsPeriod.YEARLY:
        return d.getFullYear().toString();
      default:
        return d.toLocaleDateString();
    }
  }

  async deleteAnalytics(id: number) {
    const result = await this.analyticsRepository.delete(id);
    return result.affected > 0;
  }

  async deleteAnalyticsByType(analyticsType: AnalyticsType, olderThan?: Date) {
    const query = this.analyticsRepository.createQueryBuilder()
      .delete()
      .where('analyticsType = :analyticsType', { analyticsType });

    if (olderThan) {
      query.andWhere('createdAt < :olderThan', { olderThan });
    }

    const result = await query.execute();
    return result.affected;
  }
}