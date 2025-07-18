// src/entities/course.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { CourseLevel, CourseStatus } from 'src/common/enums/student.enum';



@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  courseCode: string;

  @Column()
  courseName: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  department: string;

  @Column({ type: 'int' })
  credits: number;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.UNDERGRADUATE,
  })
  level: CourseLevel;

  @Column({ nullable: true })
  prerequisites: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.ACTIVE,
  })
  status: CourseStatus;

  @Column({ type: 'text', nullable: true })
  learningObjectives: string;

  @Column({ type: 'text', nullable: true })
  syllabus: string;

  @Column({ nullable: true })
  textbook: string;

  @Column({ type: 'int', default: 15 })
  minimumEnrollment: number;

  @Column({ type: 'int', default: 30 })
  maximumEnrollment: number;

  @OneToMany(() => Class, (classEntity) => classEntity.course)
  classes: Class[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}