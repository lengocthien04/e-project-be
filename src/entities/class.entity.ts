// src/entities/class.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Teacher } from './teacher.entity';
import { StudyRecord } from './study-record.entity';
import { TeachingRecord } from './teaching-record.entity';

export enum ClassStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Semester {
  FALL = 'FALL',
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  WINTER = 'WINTER',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  classCode: string;

  @Column()
  section: string;

  @ManyToOne(() => Course, (course) => course.classes)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.classes)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: number;

  @Column({
    type: 'enum',
    enum: Semester,
  })
  semester: Semester;

  @Column({ type: 'int' })
  academicYear: number;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
    array: true,
  })
  daysOfWeek: DayOfWeek[];

  @Column()
  classroom: string;

  @Column({ type: 'int', default: 30 })
  maxEnrollment: number;

  @Column({ type: 'int', default: 0 })
  currentEnrollment: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ClassStatus,
    default: ClassStatus.SCHEDULED,
  })
  status: ClassStatus;

  @Column({ type: 'text', nullable: true })
  additionalNotes: string;

  @OneToMany(() => StudyRecord, (studyRecord) => studyRecord.class)
  studyRecords: StudyRecord[];

  @OneToMany(() => TeachingRecord, (teachingRecord) => teachingRecord.class)
  teachingRecords: TeachingRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}