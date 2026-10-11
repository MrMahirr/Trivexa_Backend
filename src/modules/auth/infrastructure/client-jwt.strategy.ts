import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import jwtConfig from '../../../config/jwt.config';
import { AuthTokenRepository } from './repositories/auth-token.repository';

export interface ClientJwtPayload {
  sub: string;
  email: string;
  clientId: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

/**
 * Client Portal JWT Strategy
 *
 * Used for authenticating client users accessing the client portal.
 * Validates JWT tokens and ensures the user has a clientId (required for client access).
 */
@Injectable()
export class ClientJwtStrategy extends PassportStrategy(Strategy, 'client-jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: ConfigType<typeof jwtConfig>,
    private readonly authTokenRepo: AuthTokenRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConf.accessSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: ClientJwtPayload) {
    // Check if token is blacklisted
    const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (rawToken) {
      const isBlacklisted = await this.authTokenRepo.isBlacklisted(rawToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    // Validate payload
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Ensure user has clientId (required for client portal access)
    if (!payload.clientId) {
      throw new UnauthorizedException('Client access required');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      clientId: payload.clientId,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
      name: payload.name,
    };
  }
}
