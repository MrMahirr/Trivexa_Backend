import { Test, TestingModule } from '@nestjs/testing';
import { MeetingNotFoundException } from '../domain/meeting.errors';
import { MeetingsService } from './meetings.service';
import { MeetingsRepository } from '../infrastructure/meetings.repository';
import { CreateMeetingUseCase } from './usecases/create-meeting.usecase';
import { ConvertToTicketUseCase } from './usecases/convert-to-ticket.usecase';
import { UpdateMeetingUseCase } from './usecases/update-meeting.usecase';

describe('MeetingsService', () => {
  let service: MeetingsService;
  let meetingsRepo: Partial<jest.Mocked<MeetingsRepository>>;
  let createMeetingUseCase: any;

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
        { provide: CreateMeetingUseCase, useValue: { execute: jest.fn() } },
        { provide: ConvertToTicketUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateMeetingUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
    createMeetingUseCase = module.get<CreateMeetingUseCase>(CreateMeetingUseCase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to createMeetingUseCase', async () => {
      createMeetingUseCase.execute.mockResolvedValue(mockMeeting);

      const dto: any = {
        clientId: 'client-1',
        projectId: 'proj-1',
        title: 'Sprint Planning',
        date: '2026-02-22',
      };

      const result = await service.create(dto, 'user-1');

      expect(result).toEqual(mockMeeting);
      expect(createMeetingUseCase.execute).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return meetings with filters', async () => {
      meetingsRepo.findAll.mockResolvedValue([mockMeeting]);

      const result = await service.findAll({ clientId: 'client-1' });

      expect(result).toHaveLength(1);
      expect(meetingsRepo.findAll).toHaveBeenCalledWith({
        clientId: 'client-1',
      }, undefined);
    });
  });

  describe('findById', () => {
    it('should return meeting if found', async () => {
      meetingsRepo.findById.mockResolvedValue(mockMeeting);

      const result = await service.findById('meeting-1');

      expect(result).toEqual(mockMeeting);
    });

    it('should throw MeetingNotFoundException if not found', async () => {
      meetingsRepo.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        MeetingNotFoundException,
      );
    });
  });
});
