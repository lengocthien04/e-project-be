// src/entities/study-record.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Class } from './class.entity';
import { LetterGrade, RecordStatus } from 'src/common/enums/student.enum';



@Entity('study_records')
export class StudyRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.studyRecords)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(() => Class, (classEntity) => classEntity.studyRecords)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  @Column({ type: 'date' })
  enrollmentDate: Date;

  // Attendance tracking
  @Column({ type: 'int', default: 0 })
  totalClassesHeld: number;

  @Column({ type: 'int', default: 0 })
  classesAttended: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  attendancePercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  attendanceScore: number; // Out of 100

  // Assignment scores
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  assignmentScore: number; // Out of 100

  @Column({ type: 'int', default: 0 })
  assignmentsCompleted: number;

  @Column({ type: 'int', default: 0 })
  totalAssignments: number;

  // Exam scores
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  midtermScore: number; // Out of 100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalExamScore: number; // Out of 100

  // Additional assessment scores
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  quizScore: number; // Out of 100

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  participationScore: number; // Out of 100

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  projectScore: number; // Out of 100

  // Final calculation
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  totalScore: number; // Out of 100

  @Column({
    type: 'enum',
    enum: LetterGrade,
    nullable: true,
  })
  finalGrade: LetterGrade;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  gradePoints: number; // For GPA calculation

  @Column({
    type: 'enum',
    enum: RecordStatus,
    default: RecordStatus.ENROLLED,
  })
  status: RecordStatus;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'text', nullable: true })
  teacherNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}