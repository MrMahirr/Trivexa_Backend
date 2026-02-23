import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsRepository } from '../infrastructure/meetings.repository';

describe('MeetingsService', () => {
  let service: MeetingsService;
  let meetingsRepo: Partial<jest.Mocked<MeetingsRepository>>;

  const mockMeeting: any = {
    id: 'meeting-1',
    clientId: 'client-1',
    projectId: 'proj-1',
    title: 'Sprint Planning',
    date: new Date('2026-02-22'),
    durationMinutes: 60,
    link: 'https://meet.example.com/abc',
    notes: 'Weekly sprint planning',
    organizerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    meetingsRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingsService,
        { provide: MeetingsRepository, useValue: meetingsRepo },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a meeting with default duration', async () => {
      meetingsRepo.create.mockResolvedValue(mockMeeting);

      const dto: any = {
        clientId: 'client-1',
        projectId: 'proj-1',
        title: 'Sprint Planning',
        date: '2026-02-22',
        link: 'https://meet.example.com/abc',
        notes: 'Weekly sprint planning',
      };

      const result = await service.create(dto, 'user-1');

      expect(result).toEqual(mockMeeting);
      expect(meetingsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sprint Planning',
          durationMinutes: 60,
          organizerId: 'user-1',
        }),
      );
    });

    it('should use provided duration', async () => {
      meetingsRepo.create.mockResolvedValue({
        ...mockMeeting,
        durationMinutes: 30,
      });

      const dto: any = {
        title: 'Quick Sync',
        date: '2026-02-22',
        durationMinutes: 30,
      };
      await service.create(dto, 'user-1');

      expect(meetingsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ durationMinutes: 30 }),
      );
    });
  });

  describe('findAll', () => {
    it('should return meetings with filters', async () => {
      meetingsRepo.findAll.mockResolvedValue([mockMeeting]);

      const result = await service.findAll({ clientId: 'client-1' });

      expect(result).toHaveLength(1);
      expect(meetingsRepo.findAll).toHaveBeenCalledWith({
        clientId: 'client-1',
      });
    });
  });

  describe('findById', () => {
    it('should return meeting if found', async () => {
      meetingsRepo.findById.mockResolvedValue(mockMeeting);

      const result = await service.findById('meeting-1');

      expect(result).toEqual(mockMeeting);
    });

    it('should throw NotFoundException if not found', async () => {
      meetingsRepo.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
