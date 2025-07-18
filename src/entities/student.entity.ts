// src/entities/student.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudyRecord } from './study-record.entity';
import { StudentStatus, YearLevel } from 'src/common/enums/student.enum';



@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  studentId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column()
  address: string;

  @Column({ type: 'date' })
  enrollmentDate: Date;

  @Column({
    type: 'enum',
    enum: YearLevel,
    default: YearLevel.FRESHMAN,
  })
  currentYearLevel: YearLevel;

  @Column()
  major: string;

  @Column({ nullable: true })
  minor: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  cumulativeGPA: number;

  @Column({ default: 0 })
  totalCreditsEarned: number;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;

  @Column({ nullable: true })
  profilePicture: string;

  @OneToMany(() => StudyRecord, (studyRecord) => studyRecord.student)
  studyRecords: StudyRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}