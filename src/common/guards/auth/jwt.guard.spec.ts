import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';

describe('JwtGuard', () => {
  let guard: JwtGuard;

  beforeEach(() => {
    guard = new JwtGuard();
  });

  describe('canActivate', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should call super.canActivate', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      const mockResponse = {};

      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
        getType: jest.fn().mockReturnValue('http'),
      } as unknown as ExecutionContext;

      const superCanActivate = jest.spyOn(
        Object.getPrototypeOf(JwtGuard.prototype),
        'canActivate',
      );

      guard.canActivate(mockContext);

      expect(superCanActivate).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('handleRequest', () => {
    it('should return user when authenticated', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      expect(() => {
        guard.handleRequest(null, undefined, null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw error when error is provided', () => {
      const mockError = new Error('JWT expired');

      expect(() => {
        guard.handleRequest(mockError, null, null);
      }).toThrow(mockError);
    });

    it('should throw UnauthorizedException with custom message', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow('Authentication required');
    });
  });
});
