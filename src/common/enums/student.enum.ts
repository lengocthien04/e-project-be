// src/common/enums/index.ts

// Student enums
export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  GRADUATED = 'GRADUATED',
  SUSPENDED = 'SUSPENDED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum YearLevel {
  FRESHMAN = 'FRESHMAN',
  SOPHOMORE = 'SOPHOMORE',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
  GRADUATE = 'GRADUATE',
}

// Teacher enums
export enum EducationLevel {
  MASTERS = 'MASTERS',
  PHD = 'PHD',
  DOCTORATE = 'DOCTORATE',
}

export enum TeacherStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  RETIRED = 'RETIRED',
  TERMINATED = 'TERMINATED',
}

export enum AcademicRank {
  INSTRUCTOR = 'INSTRUCTOR',
  ASSISTANT_PROFESSOR = 'ASSISTANT_PROFESSOR',
  ASSOCIATE_PROFESSOR = 'ASSOCIATE_PROFESSOR',
  FULL_PROFESSOR = 'FULL_PROFESSOR',
  EMERITUS = 'EMERITUS',
}

// Course enums
export enum CourseLevel {
  UNDERGRADUATE = 'UNDERGRADUATE',
  GRADUATE = 'GRADUATE',
  DOCTORAL = 'DOCTORAL',
}

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

// Class enums
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



export enum RecordStatus {
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
  INCOMPLETE = 'INCOMPLETE',
}

// Teaching Record enums
export enum TeachingEvaluation {
  EXCELLENT = 'EXCELLENT',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  SATISFACTORY = 'SATISFACTORY',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
}

export enum LetterGrade {
  A_PLUS = 'A+',
  A = 'A',
  B_PLUS = 'B+',
  B = 'B',
  C_PLUS = 'C+',
  C = 'C',
  D_PLUS = 'D+',
  D = 'D',
  F = 'F',
}