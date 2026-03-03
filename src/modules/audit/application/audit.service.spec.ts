import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { AuditRepository } from '../infrastructure/audit.repository';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepo: Partial<jest.Mocked<AuditRepository>>;

  const mockAuditLog: any = {
    id: 'audit-1',
    userId: 'user-1',
    action: 'CREATE',
    resource: 'projects',
    resourceId: 'proj-1',
    oldData: null,
    newData: { title: 'New Project' },
    ipAddress: '127.0.0.1',
    userAgent: 'PostmanRuntime/7.0',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    auditRepo = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: AuditRepository, useValue: auditRepo },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      auditRepo.create.mockResolvedValue(mockAuditLog);

      const result = await service.log({
        userId: 'user-1',
        action: 'CREATE',
        resource: 'projects',
        resourceId: 'proj-1',
        newData: { title: 'New Project' },
      });

      expect(result).toEqual(mockAuditLog);
      expect(auditRepo.create).toHaveBeenCalled();
    });
  });
});
