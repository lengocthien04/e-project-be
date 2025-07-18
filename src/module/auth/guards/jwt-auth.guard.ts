import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  constructor(private reflector: Reflector) {
    super();
  }
async canActivate(context: ExecutionContext): Promise<boolean> {
  console.log('🚪 Guard canActivate started');
    console.log('🔑 LOGIN - JWT_SECRET for signing:', process.env.JWT_SECRET);

  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (isPublic) {
    return true;
  }

   const result = await super.canActivate(context);
    return result as boolean;

}
}
