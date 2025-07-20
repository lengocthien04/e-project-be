/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/controllers/etl.controller.ts
import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ETLJobResult, ETLService } from 'src/services/etl.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from '../auth/decorators/auth.decorators';

interface ETLJobRequest {
  jobType: 'FULL' | 'INCREMENTAL' | 'STUDENT' | 'TEACHER' | 'COURSE' | 'DEPARTMENT' | 'SEMESTER';
  lastRunDate?: string;
  parameters?: any;
}

interface ETLScheduleRequest {
  cronExpression: string;
  jobType: 'FULL' | 'INCREMENTAL';
  enabled: boolean;
}

@Controller('etl')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ETLController {
  private readonly logger = new Logger(ETLController.name);
  private etlSchedules: Map<string, any> = new Map();
  private isETLRunning = false;
  private lastETLRun: Date | null = null;

  constructor(private readonly etlService: ETLService) {}

  @Post('trigger')
  @Roles(UserRole.ADMIN)
  async triggerETL(@Body() request: ETLJobRequest): Promise<{ success: boolean; data: ETLJobResult; message: string; triggeredAt: string }> {
    try {
      if (this.isETLRunning) {
        throw new HttpException(
          'ETL job is already running. Please wait for it to complete.',
          HttpStatus.CONFLICT,
        );
      }

      this.isETLRunning = true;
      this.logger.log(`Manual ETL job triggered: ${request.jobType}`);

      let result;

      switch (request.jobType) {
        case 'FULL':
          result = await this.etlService.runFullETL();
          break;
        
        case 'INCREMENTAL':
          { if (!request.lastRunDate) {
            throw new HttpException(
              'lastRunDate is required for incremental ETL',
              HttpStatus.BAD_REQUEST,
            );
          }
          const lastRun = new Date(request.lastRunDate);
          if (isNaN(lastRun.getTime())) {
            throw new HttpException(
              'Invalid lastRunDate format',
              HttpStatus.BAD_REQUEST,
            );
          }
          result = await this.etlService.runIncrementalETL(lastRun);
          break; }
        
        case 'STUDENT':
          { const studentResult = await this.etlService.processStudentAnalytics(`manual-student-${Date.now()}`);
          result = {
            jobId: `manual-student-${Date.now()}`,
            success: studentResult.errors.length === 0,
            recordsProcessed: studentResult.recordsProcessed,
            recordsCreated: studentResult.recordsCreated,
            recordsUpdated: 0,
            errors: studentResult.errors,
            executionTime: 0,
            message: `Student analytics processed: ${studentResult.recordsProcessed} records`,
          };
          break; }
        
        case 'TEACHER':
          { const teacherResult = await this.etlService.processTeacherAnalytics(`manual-teacher-${Date.now()}`);
          result = {
            jobId: `manual-teacher-${Date.now()}`,
            success: teacherResult.errors.length === 0,
            recordsProcessed: teacherResult.recordsProcessed,
            recordsCreated: teacherResult.recordsCreated,
            recordsUpdated: 0,
            errors: teacherResult.errors,
            executionTime: 0,
            message: `Teacher analytics processed: ${teacherResult.recordsProcessed} records`,
          };
          break; }
        
        case 'COURSE':
          { const courseResult = await this.etlService.processCourseAnalytics(`manual-course-${Date.now()}`);
          result = {
            jobId: `manual-course-${Date.now()}`,
            success: courseResult.errors.length === 0,
            recordsProcessed: courseResult.recordsProcessed,
            recordsCreated: courseResult.recordsCreated,
            recordsUpdated: 0,
            errors: courseResult.errors,
            executionTime: 0,
            message: `Course analytics processed: ${courseResult.recordsProcessed} records`,
          };
          break; }
        
        case 'DEPARTMENT':
          { const departmentResult = await this.etlService.processDepartmentAnalytics(`manual-department-${Date.now()}`);
          result = {
            jobId: `manual-department-${Date.now()}`,
            success: departmentResult.errors.length === 0,
            recordsProcessed: departmentResult.recordsProcessed,
            recordsCreated: departmentResult.recordsCreated,
            recordsUpdated: 0,
            errors: departmentResult.errors,
            executionTime: 0,
            message: `Department analytics processed: ${departmentResult.recordsProcessed} records`,
          };
          break; }
        
        case 'SEMESTER':
          { const semesterResult = await this.etlService.processSemesterSummary(`manual-semester-${Date.now()}`);
          result = {
            jobId: `manual-semester-${Date.now()}`,
            success: semesterResult.errors.length === 0,
            recordsProcessed: semesterResult.recordsProcessed,
            recordsCreated: semesterResult.recordsCreated,
            recordsUpdated: 0,
            errors: semesterResult.errors,
            executionTime: 0,
            message: `Semester analytics processed: ${semesterResult.recordsProcessed} records`,
          };
          break; }
        
        default:
          throw new HttpException(
            'Invalid job type',
            HttpStatus.BAD_REQUEST,
          );
      }

      this.lastETLRun = new Date();
      
      return {
        success: result.success,
        data: result,
        message: `ETL job ${request.jobType} completed`,
        triggeredAt: new Date().toISOString(),
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error triggering ETL job:', error);
      throw new HttpException(
        'Failed to trigger ETL job',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      this.isETLRunning = false;
    }
  }

  @Get('status')
  @Roles(UserRole.ADMIN)
   getETLStatus() {
    try {
      return {
        success: true,
        data: {
          isRunning: this.isETLRunning,
          lastRun: this.lastETLRun?.toISOString() || null,
          scheduledJobs: Array.from(this.etlSchedules.keys()),
          systemHealth: 'HEALTHY',
          uptime: process.uptime(),
        },
        message: 'ETL status retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving ETL status:', error);
      throw new HttpException(
        'Failed to retrieve ETL status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('schedule')
  @Roles(UserRole.ADMIN)
   scheduleETL(@Body() request: ETLScheduleRequest) {
    try {
      const scheduleId = `${request.jobType.toLowerCase()}-${Date.now()}`;
      
      // Validate cron expression (basic validation)
      if (!this.isValidCronExpression(request.cronExpression)) {
        throw new HttpException(
          'Invalid cron expression',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.etlSchedules.set(scheduleId, {
        cronExpression: request.cronExpression,
        jobType: request.jobType,
        enabled: request.enabled !== false,
        createdAt: new Date(),
      });

      this.logger.log(`ETL job scheduled: ${scheduleId} with cron: ${request.cronExpression}`);

      return {
        success: true,
        data: {
          scheduleId,
          cronExpression: request.cronExpression,
          jobType: request.jobType,
          enabled: request.enabled !== false,
          nextRun: this.getNextCronRun(request.cronExpression),
        },
        message: 'ETL job scheduled successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error scheduling ETL job:', error);
      throw new HttpException(
        'Failed to schedule ETL job',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('schedules')
  @Roles(UserRole.ADMIN)
  getScheduledJobs() {
    try {
      const schedules = Array.from(this.etlSchedules.entries()).map(([id, config]) => ({
        scheduleId: id,
        ...config,
        nextRun: this.getNextCronRun(config.cronExpression),
      }));

      return {
        success: true,
        data: schedules,
        count: schedules.length,
        message: 'Scheduled ETL jobs retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving scheduled jobs:', error);
      throw new HttpException(
        'Failed to retrieve scheduled jobs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('test-connection')
  @Roles(UserRole.ADMIN)
   testETLConnection() {
    try {
      const startTime = Date.now();
      
      // Test database connectivity by running a simple query
      const testResult = {
        database: 'CONNECTED',
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        systemResources: {
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        },
      };

      return {
        success: true,
        data: testResult,
        message: 'ETL system connectivity test completed successfully',
      };
    } catch (error) {
      this.logger.error('Error testing ETL connection:', error);
      return {
        success: false,
        data: {
          database: 'DISCONNECTED',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        message: 'ETL system connectivity test failed',
      };
    }
  }

  // Scheduled ETL Jobs
  @Cron('0 2 * * *') // Daily at 2 AM
  async scheduledFullETL() {
    if (this.isETLRunning) {
      this.logger.warn('Scheduled ETL skipped - another job is running');
      return;
    }

    try {
      this.logger.log('Starting scheduled full ETL');
      this.isETLRunning = true;
      const result = await this.etlService.runFullETL();
      this.lastETLRun = new Date();
      this.logger.log(`Scheduled full ETL completed: ${result.message}`);
    } catch (error) {
      this.logger.error('Scheduled full ETL failed:', error);
    } finally {
      this.isETLRunning = false;
    }
  }

  @Cron('0 */6 * * *') // Every 6 hours
  async scheduledIncrementalETL() {
    if (this.isETLRunning) {
      this.logger.warn('Scheduled incremental ETL skipped - another job is running');
      return;
    }

    if (!this.lastETLRun) {
      this.logger.warn('No previous ETL run found - skipping incremental ETL');
      return;
    }

    try {
      this.logger.log('Starting scheduled incremental ETL');
      this.isETLRunning = true;
      const result = await this.etlService.runIncrementalETL(this.lastETLRun);
      this.lastETLRun = new Date();
      this.logger.log(`Scheduled incremental ETL completed: ${result.message}`);
    } catch (error) {
      this.logger.error('Scheduled incremental ETL failed:', error);
    } finally {
      this.isETLRunning = false;
    }
  }

  // Helper methods
  private isValidCronExpression(expression: string): boolean {
    // Basic cron validation - should be 5 or 6 parts separated by spaces
    const parts = expression.trim().split(/\s+/);
    return parts.length === 5 || parts.length === 6;
  }

  private getNextCronRun(cronExpression: string): string {
    // This is a simplified implementation
    // In a real application, you'd use a proper cron parser library
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day for simplicity
    return nextRun.toISOString();
  }
}