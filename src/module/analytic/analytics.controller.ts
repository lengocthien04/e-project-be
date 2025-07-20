// src/controllers/analytics.controller.ts
import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { ETLService } from 'src/services/etl.service';
import { AnalyticsService } from 'src/services/analytics.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AnalyticsPeriod, AnalyticsType } from 'src/entities/analytics.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly etlService: ETLService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  async getAllAnalytics(
    @Query('analyticsType') analyticsType?: AnalyticsType,
    @Query('period') period?: AnalyticsPeriod,
    @Query('department') department?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const filters = {
        analyticsType,
        period,
        department,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const analytics = await this.analyticsService.findAll(filters);
      
      return {
        success: true,
        data: analytics,
        count: analytics.length,
        message: 'Analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving analytics:', error);
      throw new HttpException(
        'Failed to retrieve analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  async getAnalyticsById(@Param('id', ParseIntPipe) id: number) {
    try {
      const analytics = await this.analyticsService.findById(id);
      
      if (!analytics) {
        throw new HttpException('Analytics not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: analytics,
        message: 'Analytics retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error retrieving analytics by ID:', error);
      throw new HttpException(
        'Failed to retrieve analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('student/performance')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  async getStudentPerformanceAnalytics(
    @Query('studentId') studentId?: number,
    @Query('period') period?: AnalyticsPeriod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const filters = {
        studentId: studentId ? Number(studentId) : undefined,
        period,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const analytics = await this.analyticsService.getStudentPerformanceAnalytics(filters);
      
      return {
        success: true,
        data: analytics,
        count: analytics.length,
        message: 'Student performance analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving student performance analytics:', error);
      throw new HttpException(
        'Failed to retrieve student performance analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('teacher/performance')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  async getTeacherPerformanceAnalytics(
    @Query('teacherId') teacherId?: number,
    @Query('department') department?: string,
    @Query('period') period?: AnalyticsPeriod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const filters = {
        teacherId: teacherId ? Number(teacherId) : undefined,
        department,
        period,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const analytics = await this.analyticsService.getTeacherPerformanceAnalytics(filters);
      
      return {
        success: true,
        data: analytics,
        count: analytics.length,
        message: 'Teacher performance analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving teacher performance analytics:', error);
      throw new HttpException(
        'Failed to retrieve teacher performance analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('course/analytics')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  async getCourseAnalytics(
    @Query('courseId') courseId?: number,
    @Query('department') department?: string,
    @Query('period') period?: AnalyticsPeriod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const filters = {
        courseId: courseId ? Number(courseId) : undefined,
        department,
        period,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const analytics = await this.analyticsService.getCourseAnalytics(filters);
      
      return {
        success: true,
        data: analytics,
        count: analytics.length,
        message: 'Course analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving course analytics:', error);
      throw new HttpException(
        'Failed to retrieve course analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('department/:department')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  async getDepartmentAnalytics(
    @Param('department') department: string,
    @Query('period') period?: AnalyticsPeriod,
  ) {
    try {
      const analytics = await this.analyticsService.getDepartmentAnalytics(department, period);
      
      return {
        success: true,
        data: analytics,
        count: analytics.length,
        message: 'Department analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving department analytics:', error);
      throw new HttpException(
        'Failed to retrieve department analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('semester/:semester/:year')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  async getSemesterSummary(
    @Param('semester') semester: string,
    @Param('year', ParseIntPipe) year: number,
  ) {
    try {
      const analytics = await this.analyticsService.getSemesterSummary(semester, year);
      
      return {
        success: true,
        data: analytics,
        count: analytics.length,
        message: 'Semester summary retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving semester summary:', error);
      throw new HttpException(
        'Failed to retrieve semester summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('trends/:analyticsType/:metric')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  async getAnalyticsTrends(
    @Param('analyticsType') analyticsType: AnalyticsType,
    @Param('metric') metric: string,
    @Query('period') period: AnalyticsPeriod,
    @Query('limit') limit?: number,
  ) {
    try {
      const trends = await this.analyticsService.getAnalyticsTrends(
        analyticsType,
        metric,
        period,
        limit ? Number(limit) : 12,
      );
      
      return {
        success: true,
        data: trends,
        count: trends.length,
        message: 'Analytics trends retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving analytics trends:', error);
      throw new HttpException(
        'Failed to retrieve analytics trends',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('comparison/:analyticsType/:comparisonField')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  async getComparativeAnalytics(
    @Param('analyticsType') analyticsType: AnalyticsType,
    @Param('comparisonField') comparisonField: string,
    @Query('period') period: AnalyticsPeriod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const analytics = await this.analyticsService.getComparativeAnalytics(
        analyticsType,
        comparisonField,
        period,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );
      
      return {
        success: true,
        data: analytics,
        count: analytics.length,
        message: 'Comparative analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving comparative analytics:', error);
      throw new HttpException(
        'Failed to retrieve comparative analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ETL Endpoints
  @Post('etl/run-full')
  @Roles(UserRole.ADMIN)
  async runFullETL() {
    try {
      this.logger.log('Full ETL process triggered by user');
      const result = await this.etlService.runFullETL();
      
      return {
        success: result.success,
        data: result,
        message: result.message,
      };
    } catch (error) {
      this.logger.error('Error running full ETL:', error);
      throw new HttpException(
        'Failed to run ETL process',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('etl/run-incremental')
  @Roles(UserRole.ADMIN)
  async runIncrementalETL(@Query('lastRunDate') lastRunDate: string) {
    try {
      if (!lastRunDate) {
        throw new HttpException(
          'lastRunDate parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const lastRun = new Date(lastRunDate);
      if (isNaN(lastRun.getTime())) {
        throw new HttpException(
          'Invalid lastRunDate format',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Incremental ETL process triggered from ${lastRunDate}`);
      const result = await this.etlService.runIncrementalETL(lastRun);
      
      return {
        success: result.success,
        data: result,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error running incremental ETL:', error);
      throw new HttpException(
        'Failed to run incremental ETL process',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('etl/student-analytics')
  @Roles(UserRole.ADMIN)
  async runStudentAnalyticsETL() {
    try {
      this.logger.log('Student analytics ETL triggered');
      const jobId = `student-${Date.now()}`;
      const result = await this.etlService.processStudentAnalytics(jobId);
      
      return {
        success: result.errors.length === 0,
        data: result,
        message: `Student analytics ETL completed. Processed ${result.recordsProcessed} records.`,
      };
    } catch (error) {
      this.logger.error('Error running student analytics ETL:', error);
      throw new HttpException(
        'Failed to run student analytics ETL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('etl/teacher-analytics')
  @Roles(UserRole.ADMIN)
  async runTeacherAnalyticsETL() {
    try {
      this.logger.log('Teacher analytics ETL triggered');
      const jobId = `teacher-${Date.now()}`;
      const result = await this.etlService.processTeacherAnalytics(jobId);
      
      return {
        success: result.errors.length === 0,
        data: result,
        message: `Teacher analytics ETL completed. Processed ${result.recordsProcessed} records.`,
      };
    } catch (error) {
      this.logger.error('Error running teacher analytics ETL:', error);
      throw new HttpException(
        'Failed to run teacher analytics ETL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('etl/course-analytics')
  @Roles(UserRole.ADMIN)
  async runCourseAnalyticsETL() {
    try {
      this.logger.log('Course analytics ETL triggered');
      const jobId = `course-${Date.now()}`;
      const result = await this.etlService.processCourseAnalytics(jobId);
      
      return {
        success: result.errors.length === 0,
        data: result,
        message: `Course analytics ETL completed. Processed ${result.recordsProcessed} records.`,
      };
    } catch (error) {
      this.logger.error('Error running course analytics ETL:', error);
      throw new HttpException(
        'Failed to run course analytics ETL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('etl/department-analytics')
  @Roles(UserRole.ADMIN)
  async runDepartmentAnalyticsETL() {
    try {
      this.logger.log('Department analytics ETL triggered');
      const jobId = `department-${Date.now()}`;
      const result = await this.etlService.processDepartmentAnalytics(jobId);
      
      return {
        success: result.errors.length === 0,
        data: result,
        message: `Department analytics ETL completed. Processed ${result.recordsProcessed} records.`,
      };
    } catch (error) {
      this.logger.error('Error running department analytics ETL:', error);
      throw new HttpException(
        'Failed to run department analytics ETL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}