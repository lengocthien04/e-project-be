import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { JwtStrategy } from './module/auth/stratergies/jwt.strategy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  app.enableCors();
    try {
    const jwtStrategy = app.get(JwtStrategy);
    console.log('🎯 Manually got JwtStrategy:', !!jwtStrategy);
  } catch (error) {
    console.log('❌ Failed to get JwtStrategy:', error.message);
  }
  
  // Make sure this line is present
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT || 3000);
}
void bootstrap();