import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Analytics } from 'src/entities/analytics.entity';
import { Class } from 'src/entities/class.entity';
import { Course } from 'src/entities/course.entity';
import { Student } from 'src/entities/student.entity';
import { StudyRecord } from 'src/entities/study-record.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { TeachingRecord } from 'src/entities/teaching-record.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST'),
      port: this.configService.get<number>('DATABASE_PORT'),
      username: this.configService.get<string>('DATABASE_USERNAME'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      entities: [User, Student, Teacher, StudyRecord, TeachingRecord, Class, Course, Analytics],
      synchronize: this.configService.get<string>('NODE_ENV') === 'development',
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: {
        rejectUnauthorized: false, // For cloud databases like Aiven
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
  }
}