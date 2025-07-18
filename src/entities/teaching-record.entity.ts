// src/entities/teaching-record.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Class } from './class.entity';

export enum TeachingEvaluation {
  EXCELLENT = 'EXCELLENT',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  SATISFACTORY = 'SATISFACTORY',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
}

@Entity('teaching_records')
export class TeachingRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.teachingRecords)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: number;

  @ManyToOne(() => Class, (classEntity) => classEntity.teachingRecords)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  // Student evaluation scores (out of 5.0)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  overallSatisfactionScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  teachingEffectivenessScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  courseMaterialQualityScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  communicationSkillsScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  availabilityHelpfulnessScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  fairnessGradingScore: number;

  // Class performance metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  classAverageScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  passRate: number; // Percentage of students who passed

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  attendanceRate: number; // Average class attendance percentage

  @Column({ type: 'int', default: 0 })
  totalStudentsEnrolled: number;

  @Column({ type: 'int', default: 0 })
  studentsCompleted: number;

  @Column({ type: 'int', default: 0 })
  studentsWithdrawn: number;

  // Feedback and evaluation
  @Column({ type: 'int', default: 0 })
  evaluationResponseCount: number;

  @Column({ type: 'text', nullable: true })
  studentFeedbackSummary: string;

  @Column({ type: 'text', nullable: true })
  positiveComments: string;

  @Column({ type: 'text', nullable: true })
  improvementSuggestions: string;

  // Administrative evaluation
  @Column({
    type: 'enum',
    enum: TeachingEvaluation,
    nullable: true,
  })
  administrativeEvaluation: TeachingEvaluation;

  @Column({ type: 'text', nullable: true })
  administratorComments: string;

  // Professional development
  @Column({ type: 'boolean', default: false })
  completedProfessionalDevelopment: boolean;

  @Column({ type: 'text', nullable: true })
  professionalDevelopmentNotes: string;

  // Goals and achievements
  @Column({ type: 'text', nullable: true })
  semesterGoals: string;

  @Column({ type: 'text', nullable: true })
  achievementsHighlights: string;

  @Column({ type: 'text', nullable: true })
  challengesFaced: string;

  @Column({ type: 'text', nullable: true })
  improvementPlan: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}