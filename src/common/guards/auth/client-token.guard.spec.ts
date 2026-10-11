import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ClientTokenGuard } from './client-token.guard';

describe('ClientTokenGuard', () => {
  let guard: ClientTokenGuard;

  beforeEach(() => {
    guard = new ClientTokenGuard();
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
        Object.getPrototypeOf(ClientTokenGuard.prototype),
        'canActivate',
      );

      guard.canActivate(mockContext);

      expect(superCanActivate).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('handleRequest', () => {
    it('should return user when authenticated with clientId', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'client@example.com',
        clientId: 'client-456',
        role: 'client',
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

    it('should throw UnauthorizedException when clientId is missing', () => {
      const mockUserWithoutClientId = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };

      expect(() => {
        guard.handleRequest(null, mockUserWithoutClientId, null);
      }).toThrow(UnauthorizedException);
      expect(() => {
        guard.handleRequest(null, mockUserWithoutClientId, null);
      }).toThrow('Client access required');
    });

    it('should throw error when error is provided', () => {
      const mockError = new Error('JWT expired');
      const mockUser = {
        userId: 'user-123',
        email: 'client@example.com',
        clientId: 'client-456',
      };

      expect(() => {
        guard.handleRequest(mockError, mockUser, null);
      }).toThrow(mockError);
    });

    it('should throw UnauthorizedException when clientId is empty string', () => {
      const mockUserWithEmptyClientId = {
        userId: 'user-123',
        email: 'client@example.com',
        clientId: '',
      };

      expect(() => {
        guard.handleRequest(null, mockUserWithEmptyClientId, null);
      }).toThrow('Client access required');
    });
  });
});
