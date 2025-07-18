import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { JwtStrategy } from './stratergies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { RolesGuard } from './guards/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

console.log('🔥 AUTH MODULE FILE LOADED'); // Add this OUTSIDE the class

@Module({
    imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    ConfigModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, UserService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {
   constructor() {
    console.log('🔥 AUTH MODULE LOADED'); // Add this
  }
}


