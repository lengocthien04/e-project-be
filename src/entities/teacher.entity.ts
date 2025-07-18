// src/entities/teacher.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { TeachingRecord } from './teaching-record.entity';
import { AcademicRank, EducationLevel, TeacherStatus } from 'src/common/enums/student.enum';


@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  employeeId: string;

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
  hireDate: Date;

  @Column()
  department: string;

  @Column({
    type: 'enum',
    enum: EducationLevel,
    default: EducationLevel.MASTERS,
  })
  highestEducation: EducationLevel;

  @Column()
  specialization: string;

  @Column({
    type: 'enum',
    enum: AcademicRank,
    default: AcademicRank.INSTRUCTOR,
  })
  academicRank: AcademicRank;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @Column({
    type: 'enum',
    enum: TeacherStatus,
    default: TeacherStatus.ACTIVE,
  })
  status: TeacherStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  overallRating: number;

  @Column({ default: 0 })
  yearsOfExperience: number;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  biography: string;

  @OneToMany(() => Class, (classEntity) => classEntity.teacher)
  classes: Class[];

  @OneToMany(() => TeachingRecord, (teachingRecord) => teachingRecord.teacher)
  teachingRecords: TeachingRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}