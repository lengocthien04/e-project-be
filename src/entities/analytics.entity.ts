// src/entities/analytics.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AnalyticsType {
  STUDENT_PERFORMANCE = 'STUDENT_PERFORMANCE',
  TEACHER_PERFORMANCE = 'TEACHER_PERFORMANCE',
  COURSE_ANALYTICS = 'COURSE_ANALYTICS',
  CLASS_ANALYTICS = 'CLASS_ANALYTICS',
  DEPARTMENT_ANALYTICS = 'DEPARTMENT_ANALYTICS',
  SEMESTER_SUMMARY = 'SEMESTER_SUMMARY',
}

export enum AnalyticsPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  SEMESTER = 'SEMESTER',
  YEARLY = 'YEARLY',
}

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AnalyticsType,
  })
  analyticsType: AnalyticsType;

  @Column({
    type: 'enum',
    enum: AnalyticsPeriod,
  })
  period: AnalyticsPeriod;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  // Reference IDs for filtering
  @Column({ nullable: true })
  studentId: number;

  @Column({ nullable: true })
  teacherId: number;

  @Column({ nullable: true })
  courseId: number;

  @Column({ nullable: true })
  classId: number;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  semester: string;

  @Column({ type: 'int', nullable: true })
  academicYear: number;

  // Student Performance Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageGPA: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageAttendance: number;

  @Column({ type: 'int', nullable: true })
  totalStudents: number;

  @Column({ type: 'int', nullable: true })
  passedStudents: number;

  @Column({ type: 'int', nullable: true })
  failedStudents: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  passRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  dropoutRate: number;

  // Grade Distribution
  @Column({ type: 'int', default: 0 })
  gradeA: number;

  @Column({ type: 'int', default: 0 })
  gradeB: number;

  @Column({ type: 'int', default: 0 })
  gradeC: number;

  @Column({ type: 'int', default: 0 })
  gradeD: number;

  @Column({ type: 'int', default: 0 })
  gradeF: number;

  // Teacher Performance Metrics
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  teacherRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  classAverageScore: number;

  @Column({ type: 'int', nullable: true })
  totalClassesTaught: number;

  @Column({ type: 'int', nullable: true })
  totalStudentsTaught: number;

  // Course Analytics
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  enrollmentRate: number;

  @Column({ type: 'int', nullable: true })
  totalEnrollments: number;

  @Column({ type: 'int', nullable: true })
  completedEnrollments: number;

  @Column({ type: 'int', nullable: true })
  withdrawnEnrollments: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  courseSatisfactionScore: number;

  // Assignment and Assessment Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageAssignmentScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageMidtermScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageFinalScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageQuizScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageProjectScore: number;

  // Resource Utilization
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  classroomUtilization: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  teacherWorkload: number;

  // Financial Metrics
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  revenue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPerStudent: number;

  // Trends and Comparisons (JSON fields for flexibility)
  @Column({ type: 'json', nullable: true })
  trendData: any;

  @Column({ type: 'json', nullable: true })
  comparisonData: any;

  @Column({ type: 'json', nullable: true })
  additionalMetrics: any;

  // Quality Indicators
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  studentRetentionRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  graduationRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  employmentRate: number;

  // ETL Metadata
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataExtractedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @Column({ type: 'varchar', nullable: true })
  etlJobId: string;

  @Column({ type: 'json', nullable: true })
  processingMetadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}