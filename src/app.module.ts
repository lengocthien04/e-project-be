import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './configs/database.config';
import { AuthModule } from './module/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './module/student/student.module';
import { TeacherModule } from './module/teacher/teacher.module';
import { JwtStrategy } from './module/auth/stratergies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    AuthModule,
    StudentModule,
    TeacherModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    
    AppService,
      JwtStrategy

  ],
})
export class AppModule {  constructor() {
    console.log('🔥 APP MODULE CONSTRUCTOR - AuthModule should be loaded');
  }}