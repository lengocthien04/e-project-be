/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

  
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Analytics, AnalyticsType, AnalyticsPeriod } from '../entities/analytics.entity';
import { Student } from '../entities/student.entity';
import { Teacher } from '../entities/teacher.entity';
import { Course } from '../entities/course.entity';
import { Class, ClassStatus } from '../entities/class.entity';
import { StudyRecord } from '../entities/study-record.entity';
import { TeachingRecord } from '../entities/teaching-record.entity';
import { CourseStatus, LetterGrade, RecordStatus, StudentStatus, TeacherStatus } from '../common/enums/student.enum';
import { v4 as uuidv4 } from 'uuid';

export interface ETLJobResult {
  jobId: string;
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  errors: string[];
  executionTime: number;
  message: string;
}

@Injectable()
export class ETLService {
  private readonly logger = new Logger(ETLService.name);

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

  async runFullETL(): Promise<ETLJobResult> {
    const jobId = uuidv4();
    const startTime = Date.now();
    
    this.logger.log(`Starting Full ETL Job: ${jobId}`);

    const result: ETLJobResult = {
      jobId,
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      errors: [],
      executionTime: 0,
      message: '',
    };

    try {
      // Run all analytics processes
      const studentAnalytics = await this.processStudentAnalytics(jobId);
      const teacherAnalytics = await this.processTeacherAnalytics(jobId);
      const courseAnalytics = await this.processCourseAnalytics(jobId);
      const classAnalytics = await this.processClassAnalytics(jobId);
      const departmentAnalytics = await this.processDepartmentAnalytics(jobId);
      const semesterAnalytics = await this.processSemesterSummary(jobId);

      result.recordsProcessed = studentAnalytics.recordsProcessed + 
                                teacherAnalytics.recordsProcessed + 
                                courseAnalytics.recordsProcessed + 
                                classAnalytics.recordsProcessed + 
                                departmentAnalytics.recordsProcessed + 
                                semesterAnalytics.recordsProcessed;

      result.recordsCreated = studentAnalytics.recordsCreated + 
                             teacherAnalytics.recordsCreated + 
                             courseAnalytics.recordsCreated + 
                             classAnalytics.recordsCreated + 
                             departmentAnalytics.recordsCreated + 
                             semesterAnalytics.recordsCreated;

      result.errors = [
        ...studentAnalytics.errors,
        ...teacherAnalytics.errors,
        ...courseAnalytics.errors,
        ...classAnalytics.errors,
        ...departmentAnalytics.errors,
        ...semesterAnalytics.errors,
      ];

      result.success = result.errors.length === 0;
      result.executionTime = Date.now() - startTime;
      result.message = `ETL completed. Processed ${result.recordsProcessed} records, created ${result.recordsCreated} analytics entries.`;

      this.logger.log(`ETL Job ${jobId} completed in ${result.executionTime}ms`);
      
    } catch (error) {
      result.errors.push(error.message);
      result.executionTime = Date.now() - startTime;
      result.message = `ETL failed: ${error.message}`;
      this.logger.error(`ETL Job ${jobId} failed: ${error.message}`);
    }

    return result;
  }

  async processStudentAnalytics(jobId: string): Promise<Partial<ETLJobResult>> {
    this.logger.log('Processing Student Analytics...');
    const result = { recordsProcessed: 0, recordsCreated: 0, errors: [] };

    try {
      // Get all active students
      const students = await this.studentRepository.find({
        where: { status: StudentStatus.ACTIVE },
        relations: ['studyRecords', 'studyRecords.class', 'studyRecords.class.course'],
      });

      for (const student of students) {
        try {
          const analytics = await this.calculateStudentAnalytics(student, jobId);
          await this.analyticsRepository.save(analytics);
          result.recordsCreated++;
        } catch (error) {
          result.errors.push(`Student ${student.id}: ${error.message}`);
        }
        result.recordsProcessed++;
      }

    } catch (error) {
      result.errors.push(`Student Analytics: ${error.message}`);
    }

    return result;
  }

  async processTeacherAnalytics(jobId: string): Promise<Partial<ETLJobResult>> {
    this.logger.log('Processing Teacher Analytics...');
    const result = { recordsProcessed: 0, recordsCreated: 0, errors: [] };

    try {
      const teachers = await this.teacherRepository.find({
        where: { status: TeacherStatus.ACTIVE },
        relations: ['classes', 'teachingRecords', 'teachingRecords.class'],
      });

      for (const teacher of teachers) {
        try {
          const analytics = await this.calculateTeacherAnalytics(teacher, jobId);
          await this.analyticsRepository.save(analytics);
          result.recordsCreated++;
        } catch (error) {
          result.errors.push(`Teacher ${teacher.id}: ${error.message}`);
        }
        result.recordsProcessed++;
      }

    } catch (error) {
      result.errors.push(`Teacher Analytics: ${error.message}`);
    }

    return result;
  }

  async processCourseAnalytics(jobId: string): Promise<Partial<ETLJobResult>> {
    this.logger.log('Processing Course Analytics...');
    const result = { recordsProcessed: 0, recordsCreated: 0, errors: [] };

    try {
      const courses = await this.courseRepository.find({
        where: { status: CourseStatus.ACTIVE },
        relations: ['classes', 'classes.studyRecords'],
      });

      for (const course of courses) {
        try {
          const analytics = await this.calculateCourseAnalytics(course, jobId);
          await this.analyticsRepository.save(analytics);
          result.recordsCreated++;
        } catch (error) {
          result.errors.push(`Course ${course.id}: ${error.message}`);
        }
        result.recordsProcessed++;
      }

    } catch (error) {
      result.errors.push(`Course Analytics: ${error.message}`);
    }

    return result;
  }

  async processClassAnalytics(jobId: string): Promise<Partial<ETLJobResult>> {
    this.logger.log('Processing Class Analytics...');
    const result = { recordsProcessed: 0, recordsCreated: 0, errors: [] };

    try {
      const classes = await this.classRepository.find({
        relations: ['course', 'teacher', 'studyRecords', 'teachingRecords'],
      });

      for (const classEntity of classes) {
        try {
          const analytics = this.calculateClassAnalytics(classEntity, jobId);
          await this.analyticsRepository.save(analytics);
          result.recordsCreated++;
        } catch (error) {
          result.errors.push(`Class ${classEntity.id}: ${error.message}`);
        }
        result.recordsProcessed++;
      }

    } catch (error) {
      result.errors.push(`Class Analytics: ${error.message}`);
    }

    return result;
  }

  async processDepartmentAnalytics(jobId: string): Promise<Partial<ETLJobResult>> {
    this.logger.log('Processing Department Analytics...');
    const result = { recordsProcessed: 0, recordsCreated: 0, errors: [] };

    try {
      // Get unique departments
      const departments = await this.courseRepository
        .createQueryBuilder('course')
        .select('DISTINCT course.department')
        .getRawMany();

      for (const dept of departments) {
        try {
          const analytics = await this.calculateDepartmentAnalytics(dept.course_department, jobId);
          await this.analyticsRepository.save(analytics);
          result.recordsCreated++;
        } catch (error) {
          result.errors.push(`Department ${dept.course_department}: ${error.message}`);
        }
        result.recordsProcessed++;
      }

    } catch (error) {
      result.errors.push(`Department Analytics: ${error.message}`);
    }

    return result;
  }

  async processSemesterSummary(jobId: string): Promise<Partial<ETLJobResult>> {
    this.logger.log('Processing Semester Summary...');
    const result = { recordsProcessed: 0, recordsCreated: 0, errors: [] };

    try {
      // Get unique semester/year combinations
      const semesters = await this.classRepository
        .createQueryBuilder('class')
        .select(['DISTINCT class.semester', 'class.academicYear'])
        .getRawMany();

      for (const semester of semesters) {
        try {
          const analytics = await this.calculateSemesterSummary(
            semester.class_semester,
            semester.class_academicYear,
            jobId
          );
          await this.analyticsRepository.save(analytics);
          result.recordsCreated++;
        } catch (error) {
          result.errors.push(`Semester ${semester.class_semester} ${semester.class_academicYear}: ${error.message}`);
        }
        result.recordsProcessed++;
      }

    } catch (error) {
      result.errors.push(`Semester Summary: ${error.message}`);
    }

    return result;
  }

  private async calculateStudentAnalytics(student: Student, jobId: string): Promise<Analytics> {
    const currentDate = new Date();
    const studyRecords = student.studyRecords || [];

    // Calculate GPA
    const completedRecords = studyRecords.filter(r => r.status === RecordStatus.COMPLETED);
    const totalGradePoints = completedRecords.reduce((sum, record) => sum + record.gradePoints, 0);
    const averageGPA = completedRecords.length > 0 ? totalGradePoints / completedRecords.length : 0;

    // Calculate attendance
    const recordsWithAttendance = studyRecords.filter(r => r.totalClassesHeld > 0);
    const averageAttendance = recordsWithAttendance.length > 0 
      ? recordsWithAttendance.reduce((sum, record) => sum + record.attendancePercentage, 0) / recordsWithAttendance.length 
      : 0;

    // Grade distribution
    const gradeDistribution = this.calculateGradeDistribution(completedRecords);

    const analytics = this.analyticsRepository.create({
      analyticsType: AnalyticsType.STUDENT_PERFORMANCE,
      period: AnalyticsPeriod.SEMESTER,
      periodStart: new Date(currentDate.getFullYear(), 0, 1),
      periodEnd: new Date(currentDate.getFullYear(), 11, 31),
      studentId: student.id,
      averageGPA,
      averageAttendance,
      totalStudents: 1,
      passedStudents: completedRecords.filter(r => r.finalGrade && r.finalGrade !== LetterGrade.F).length,
      failedStudents: completedRecords.filter(r => r.finalGrade === LetterGrade.F).length,
      passRate: completedRecords.length > 0 
        ? (completedRecords.filter(r => r.finalGrade && r.finalGrade !== LetterGrade.F).length / completedRecords.length) * 100 
        : 0,
      gradeA: gradeDistribution.A,
      gradeB: gradeDistribution.B,
      gradeC: gradeDistribution.C,
      gradeD: gradeDistribution.D,
      gradeF: gradeDistribution.F,
      totalEnrollments: studyRecords.length,
      completedEnrollments: completedRecords.length,
      withdrawnEnrollments: studyRecords.filter(r => r.status === RecordStatus.WITHDRAWN).length,
      averageAssignmentScore: this.calculateAverageScore(studyRecords, 'assignmentScore'),
      averageMidtermScore: this.calculateAverageScore(studyRecords, 'midtermScore'),
      averageFinalScore: this.calculateAverageScore(studyRecords, 'finalExamScore'),
      averageQuizScore: this.calculateAverageScore(studyRecords, 'quizScore'),
      averageProjectScore: this.calculateAverageScore(studyRecords, 'projectScore'),
      etlJobId: jobId,
      dataExtractedAt: currentDate,
      processingMetadata: {
        totalRecords: studyRecords.length,
        completedRecords: completedRecords.length,
        activeRecords: studyRecords.filter(r => r.status === RecordStatus.ENROLLED).length,
      },
    });

    return await this.analyticsRepository.save(analytics);
  }

  private async calculateTeacherAnalytics(teacher: Teacher, jobId: string): Promise<Analytics> {
    const currentDate = new Date();
    const teachingRecords = teacher.teachingRecords || [];
    const classes = teacher.classes || [];

    // Calculate average ratings
    const recordsWithRatings = teachingRecords.filter(r => r.overallSatisfactionScore > 0);
    const averageRating = recordsWithRatings.length > 0
      ? recordsWithRatings.reduce((sum, record) => sum + record.overallSatisfactionScore, 0) / recordsWithRatings.length
      : 0;

    // Calculate class performance
    const classAverageScore = teachingRecords.length > 0
      ? teachingRecords.reduce((sum, record) => sum + record.classAverageScore, 0) / teachingRecords.length
      : 0;

    const totalStudentsTaught = teachingRecords.reduce((sum, record) => sum + record.totalStudentsEnrolled, 0);

    const analytics = this.analyticsRepository.create({
      analyticsType: AnalyticsType.TEACHER_PERFORMANCE,
      period: AnalyticsPeriod.SEMESTER,
      periodStart: new Date(currentDate.getFullYear(), 0, 1),
      periodEnd: new Date(currentDate.getFullYear(), 11, 31),
      teacherId: teacher.id,
      department: teacher.department,
      teacherRating: averageRating,
      classAverageScore,
      totalClassesTaught: classes.length,
      totalStudentsTaught,
      passRate: teachingRecords.length > 0
        ? teachingRecords.reduce((sum, record) => sum + record.passRate, 0) / teachingRecords.length
        : 0,
      courseSatisfactionScore: recordsWithRatings.length > 0
        ? recordsWithRatings.reduce((sum, record) => sum + record.teachingEffectivenessScore, 0) / recordsWithRatings.length
        : 0,
      teacherWorkload: classes.length,
      etlJobId: jobId,
      dataExtractedAt: currentDate,
      processingMetadata: {
        totalTeachingRecords: teachingRecords.length,
        classesAssigned: classes.length,
        evaluationResponses: teachingRecords.reduce((sum, record) => sum + record.evaluationResponseCount, 0),
      },
    });

    return await this.analyticsRepository.save(analytics);
  }

  private async calculateCourseAnalytics(course: Course, jobId: string): Promise<Analytics> {
    const currentDate = new Date();
    const classes = course.classes || [];
    const allStudyRecords = classes.flatMap(c => c.studyRecords || []);

    const totalEnrollments = allStudyRecords.length;
    const completedEnrollments = allStudyRecords.filter(r => r.status === RecordStatus.COMPLETED).length;
    const withdrawnEnrollments = allStudyRecords.filter(r => r.status === RecordStatus.WITHDRAWN).length;

    const enrollmentRate = classes.length > 0
      ? (totalEnrollments / (classes.reduce((sum, c) => sum + c.maxEnrollment, 0))) * 100
      : 0;

    const passedStudents = allStudyRecords.filter(r => 
      r.status === RecordStatus.COMPLETED && r.finalGrade && r.finalGrade !== LetterGrade.F
    ).length;

    const gradeDistribution = this.calculateGradeDistribution(allStudyRecords);

    const analytics = this.analyticsRepository.create({
      analyticsType: AnalyticsType.COURSE_ANALYTICS,
      period: AnalyticsPeriod.SEMESTER,
      periodStart: new Date(currentDate.getFullYear(), 0, 1),
      periodEnd: new Date(currentDate.getFullYear(), 11, 31),
      courseId: course.id,
      department: course.department,
      totalStudents: totalEnrollments,
      passedStudents,
      failedStudents: allStudyRecords.filter(r => r.finalGrade === LetterGrade.F).length,
      passRate: completedEnrollments > 0 ? (passedStudents / completedEnrollments) * 100 : 0,
      enrollmentRate,
      totalEnrollments,
      completedEnrollments,
      withdrawnEnrollments,
      dropoutRate: totalEnrollments > 0 ? (withdrawnEnrollments / totalEnrollments) * 100 : 0,
      gradeA: gradeDistribution.A,
      gradeB: gradeDistribution.B,
      gradeC: gradeDistribution.C,
      gradeD: gradeDistribution.D,
      gradeF: gradeDistribution.F,
      averageGPA: this.calculateAverageGPA(allStudyRecords),
      averageAttendance: this.calculateAverageAttendance(allStudyRecords),
      averageAssignmentScore: this.calculateAverageScore(allStudyRecords, 'assignmentScore'),
      averageMidtermScore: this.calculateAverageScore(allStudyRecords, 'midtermScore'),
      averageFinalScore: this.calculateAverageScore(allStudyRecords, 'finalExamScore'),
      etlJobId: jobId,
      dataExtractedAt: currentDate,
      processingMetadata: {
        totalClasses: classes.length,
        activeClasses: classes.filter(c => c.status === ClassStatus.ACTIVE).length,
        totalCapacity: classes.reduce((sum, c) => sum + c.maxEnrollment, 0),
      },
    });

    return await this.analyticsRepository.save(analytics);
  }

  private calculateClassAnalytics(classEntity: Class, jobId: string): Analytics {
    const currentDate = new Date();
    const studyRecords = classEntity.studyRecords || [];
    const teachingRecords = classEntity.teachingRecords || [];

    const completedRecords = studyRecords.filter(r => r.status === RecordStatus.COMPLETED);
    const gradeDistribution = this.calculateGradeDistribution(completedRecords);

    const classUtilization = classEntity.maxEnrollment > 0
      ? (classEntity.currentEnrollment / classEntity.maxEnrollment) * 100
      : 0;

    return this.analyticsRepository.create({
      analyticsType: AnalyticsType.CLASS_ANALYTICS,
      period: AnalyticsPeriod.SEMESTER,
      periodStart: classEntity.startDate,
      periodEnd: classEntity.endDate,
      classId: classEntity.id,
      courseId: classEntity.courseId,
      teacherId: classEntity.teacherId,
      department: classEntity.course?.department,
      semester: classEntity.semester,
      academicYear: classEntity.academicYear,
      totalStudents: studyRecords.length,
      passedStudents: completedRecords.filter(r => r.finalGrade && r.finalGrade !== LetterGrade.F).length,
      failedStudents: completedRecords.filter(r => r.finalGrade === LetterGrade.F).length,
      passRate: completedRecords.length > 0
        ? (completedRecords.filter(r => r.finalGrade && r.finalGrade !== LetterGrade.F).length / completedRecords.length) * 100
        : 0,
      gradeA: gradeDistribution.A,
      gradeB: gradeDistribution.B,
      gradeC: gradeDistribution.C,
      gradeD: gradeDistribution.D,
      gradeF: gradeDistribution.F,
      averageGPA: this.calculateAverageGPA(studyRecords),
      averageAttendance: this.calculateAverageAttendance(studyRecords),
      enrollmentRate: classUtilization,
      classroomUtilization: classUtilization,
      totalEnrollments: studyRecords.length,
      completedEnrollments: completedRecords.length,
      withdrawnEnrollments: studyRecords.filter(r => r.status === RecordStatus.WITHDRAWN).length,
      teacherRating: teachingRecords.length > 0 ? teachingRecords[0].overallSatisfactionScore : null,
      classAverageScore: teachingRecords.length > 0 ? teachingRecords[0].classAverageScore : null,
      etlJobId: jobId,
      dataExtractedAt: currentDate,
      processingMetadata: {
        maxEnrollment: classEntity.maxEnrollment,
        currentEnrollment: classEntity.currentEnrollment,
        classStatus: classEntity.status,
      },
    });
  }

  private async calculateDepartmentAnalytics(department: string, jobId: string): Promise<Analytics> {
    const currentDate = new Date();
    
    // Get all courses in department
    const courses = await this.courseRepository.find({
      where: { department },
      relations: ['classes', 'classes.studyRecords'],
    });

    // Get all teachers in department
    const teachers = await this.teacherRepository.find({
      where: { department },
      relations: ['teachingRecords'],
    });

    const allClasses = courses.flatMap(c => c.classes || []);
    const allStudyRecords = allClasses.flatMap(c => c.studyRecords || []);
    const allTeachingRecords = teachers.flatMap(t => t.teachingRecords || []);

    const completedRecords = allStudyRecords.filter(r => r.status === RecordStatus.COMPLETED);
    const gradeDistribution = this.calculateGradeDistribution(completedRecords);

    const totalCapacity = allClasses.reduce((sum, c) => sum + c.maxEnrollment, 0);
    const totalEnrollment = allClasses.reduce((sum, c) => sum + c.currentEnrollment, 0);

    const analytics = this.analyticsRepository.create({
      analyticsType: AnalyticsType.DEPARTMENT_ANALYTICS,
      period: AnalyticsPeriod.SEMESTER,
      periodStart: new Date(currentDate.getFullYear(), 0, 1),
      periodEnd: new Date(currentDate.getFullYear(), 11, 31),
      department,
      totalStudents: allStudyRecords.length,
      passedStudents: completedRecords.filter(r => r.finalGrade && r.finalGrade !== LetterGrade.F).length,
      failedStudents: completedRecords.filter(r => r.finalGrade === LetterGrade.F).length,
      passRate: completedRecords.length > 0
        ? (completedRecords.filter(r => r.finalGrade && r.finalGrade !== LetterGrade.F).length / completedRecords.length) * 100
        : 0,
      gradeA: gradeDistribution.A,
      gradeB: gradeDistribution.B,
      gradeC: gradeDistribution.C,
      gradeD: gradeDistribution.D,
      gradeF: gradeDistribution.F,
      averageGPA: this.calculateAverageGPA(allStudyRecords),
      averageAttendance: this.calculateAverageAttendance(allStudyRecords),
      enrollmentRate: totalCapacity > 0 ? (totalEnrollment / totalCapacity) * 100 : 0,
      totalEnrollments: allStudyRecords.length,
      completedEnrollments: completedRecords.length,
      withdrawnEnrollments: allStudyRecords.filter(r => r.status === RecordStatus.WITHDRAWN).length,
      teacherRating: allTeachingRecords.length > 0
        ? allTeachingRecords.reduce((sum, r) => sum + r.overallSatisfactionScore, 0) / allTeachingRecords.length
        : 0,
      classAverageScore: allTeachingRecords.length > 0
        ? allTeachingRecords.reduce((sum, r) => sum + r.classAverageScore, 0) / allTeachingRecords.length
        : 0,
      totalClassesTaught: allClasses.length,
      etlJobId: jobId,
      dataExtractedAt: currentDate,
      processingMetadata: {
        totalCourses: courses.length,
        totalTeachers: teachers.length,
        totalClasses: allClasses.length,
        departmentCapacity: totalCapacity,
      },
    });

    return await this.analyticsRepository.save(analytics);
  }

  private async calculateSemesterSummary(semester: string, academicYear: number, jobId: string): Promise<Analytics> {
    const currentDate = new Date();
    
    // Get all classes for the semester
    const classes = await this.classRepository.find({
      where: { 
        semester: semester as any, // Type assertion to handle enum
        academicYear 
      },
      relations: ['course', 'teacher', 'studyRecords', 'teachingRecords'],
    });

    const allStudyRecords = classes.flatMap(c => c.studyRecords || []);
    const allTeachingRecords = classes.flatMap(c => c.teachingRecords || []);

    const completedRecords = allStudyRecords.filter(r => r.status === RecordStatus.COMPLETED);
    const gradeDistribution = this.calculateGradeDistribution(completedRecords);

    // Get unique departments
    const departments = [...new Set(classes.map(c => c.course?.department).filter(Boolean))];

    const analytics = this.analyticsRepository.create({
      analyticsType: AnalyticsType.SEMESTER_SUMMARY,
      period: AnalyticsPeriod.SEMESTER,
      periodStart: new Date(academicYear, semester === 'FALL' ? 8 : semester === 'SPRING' ? 0 : 5, 1),
      periodEnd: new Date(academicYear, semester === 'FALL' ? 11 : semester === 'SPRING' ? 4 : 7, 31),
      semester,
      academicYear,
      totalStudents: allStudyRecords.length,
      passedStudents: completedRecords.filter(r => r.finalGrade && r.finalGrade !== LetterGrade.F).length,
      failedStudents: completedRecords.filter(r => r.finalGrade === LetterGrade.F).length,
      passRate: completedRecords.length > 0
        ? (completedRecords.filter(r => r.finalGrade && r.finalGrade !== LetterGrade.F).length / completedRecords.length) * 100
        : 0,
      gradeA: gradeDistribution.A,
      gradeB: gradeDistribution.B,
      gradeC: gradeDistribution.C,
      gradeD: gradeDistribution.D,
      gradeF: gradeDistribution.F,
      averageGPA: this.calculateAverageGPA(allStudyRecords),
      averageAttendance: this.calculateAverageAttendance(allStudyRecords),
      totalEnrollments: allStudyRecords.length,
      completedEnrollments: completedRecords.length,
      withdrawnEnrollments: allStudyRecords.filter(r => r.status === RecordStatus.WITHDRAWN).length,
      totalClassesTaught: classes.length,
      teacherRating: allTeachingRecords.length > 0
        ? allTeachingRecords.reduce((sum, r) => sum + r.overallSatisfactionScore, 0) / allTeachingRecords.length
        : 0,
      etlJobId: jobId,
      dataExtractedAt: currentDate,
      processingMetadata: {
        totalClasses: classes.length,
        uniqueDepartments: departments.length,
        departments: departments,
      },
    });

    return await this.analyticsRepository.save(analytics);
  }

  // Helper methods
  private calculateGradeDistribution(records: StudyRecord[]) {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    
    records.forEach(record => {
      if (record.finalGrade) {
        switch (record.finalGrade) {
          case LetterGrade.A_PLUS:
          case LetterGrade.A:
            distribution.A++;
            break;
          case LetterGrade.B_PLUS:
          case LetterGrade.B:
            distribution.B++;
            break;
          case LetterGrade.C_PLUS:
          case LetterGrade.C:
            distribution.C++;
            break;
          case LetterGrade.D_PLUS:
          case LetterGrade.D:
            distribution.D++;
            break;
          case LetterGrade.F:
            distribution.F++;
            break;
        }
      }
    });

    return distribution;
  }

  private calculateAverageScore(records: StudyRecord[], field: string): number {
    const validRecords = records.filter(r => r[field] !== null && r[field] !== undefined);
    if (validRecords.length === 0) return 0;
    
    return validRecords.reduce((sum, record) => sum + Number(record[field]), 0) / validRecords.length;
  }

  private calculateAverageGPA(records: StudyRecord[]): number {
    const completedRecords = records.filter(r => 
      r.status === RecordStatus.COMPLETED && r.gradePoints !== null && r.gradePoints !== undefined
    );
    
    if (completedRecords.length === 0) return 0;
    
    return completedRecords.reduce((sum, record) => sum + Number(record.gradePoints), 0) / completedRecords.length;
  }

  private calculateAverageAttendance(records: StudyRecord[]): number {
    const recordsWithAttendance = records.filter(r => r.totalClassesHeld > 0);
    
    if (recordsWithAttendance.length === 0) return 0;
    
    return recordsWithAttendance.reduce((sum, record) => sum + record.attendancePercentage, 0) / recordsWithAttendance.length;
  }

  // Incremental ETL methods
  async runIncrementalETL(lastRunDate: Date): Promise<ETLJobResult> {
    const jobId = uuidv4();
    const startTime = Date.now();
    
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.logger.log(`Starting Incremental ETL Job: ${jobId} from ${lastRunDate}`);

    const result: ETLJobResult = {
      jobId,
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      errors: [],
      executionTime: 0,
      message: '',
    };

    try {
      // Only process records updated since last run
      const updatedStudents = await this.studentRepository.find({
        where: { updatedAt: Between(lastRunDate, new Date()) },
        relations: ['studyRecords', 'studyRecords.class', 'studyRecords.class.course'],
      });

      const updatedTeachers = await this.teacherRepository.find({
        where: { updatedAt: Between(lastRunDate, new Date()) },
        relations: ['classes', 'teachingRecords', 'teachingRecords.class'],
      });

      // Process incremental updates
      for (const student of updatedStudents) {
        try {
          const analytics = await this.calculateStudentAnalytics(student, jobId);
          await this.analyticsRepository.save(analytics);
          result.recordsCreated++;
        } catch (error) {
          result.errors.push(`Student ${student.id}: ${error.message}`);
        }
        result.recordsProcessed++;
      }

      for (const teacher of updatedTeachers) {
        try {
          const analytics = await this.calculateTeacherAnalytics(teacher, jobId);
          await this.analyticsRepository.save(analytics);
          result.recordsCreated++;
        } catch (error) {
          result.errors.push(`Teacher ${teacher.id}: ${error.message}`);
        }
        result.recordsProcessed++;
      }

      result.success = result.errors.length === 0;
      result.executionTime = Date.now() - startTime;
      result.message = `Incremental ETL completed. Processed ${result.recordsProcessed} records.`;

    } catch (error) {
      result.errors.push(error.message);
      result.executionTime = Date.now() - startTime;
      result.message = `Incremental ETL failed: ${error.message}`;
      this.logger.error(`ETL Job ${jobId} failed: ${error.message}`);
    }

    return result;
  }
}

function calculateClassAnalytics(classEntity: any, Class: Class, jobId: any, string: any) {
  throw new Error('Function not implemented.');
}
