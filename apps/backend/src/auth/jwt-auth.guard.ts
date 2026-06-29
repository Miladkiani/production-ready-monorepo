import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { User } from '@prisma/client';

interface RequestWithUser extends Request {
  user?: User;
}

interface GraphQLContext {
  req: RequestWithUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const contextType = context.getType<'http' | 'graphql'>();

    let req: RequestWithUser;

    if (contextType === 'graphql') {
      const gqlContext = ctx.getContext<GraphQLContext>();
      req = gqlContext.req;
    } else {
      req = context.switchToHttp().getRequest<RequestWithUser>();
    }

    const authHeader = req?.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No access token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const user = await this.authService.verifyAccessToken(token);
      // attach user to request for downstream use (resolvers, roles guard, etc.)
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
