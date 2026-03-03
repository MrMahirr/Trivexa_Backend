import { Test, TestingModule } from '@nestjs/testing';
import { UploadFileUseCase } from './upload-file.usecase';
import { FilesService } from '../../../../shared/files/files.service';
import { FilesRepository } from '../../infrastructure/files.repository';

describe('UploadFileUseCase', () => {
  let useCase: UploadFileUseCase;
  let storageService: Partial<jest.Mocked<FilesService>>;
  let filesRepo: Partial<jest.Mocked<FilesRepository>>;

  const mockUploadResult = {
    url: 'https://storage.example.com/files/test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
  };

  const mockSavedFile: any = {
    id: 'file-1',
    fileName: 'test.pdf',
    filePath: 'https://storage.example.com/files/test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    entityType: 'PROJECT',
    entityId: 'proj-1',
    uploadedBy: 'user-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    storageService = {
      uploadFile: jest.fn(),
    };

    filesRepo = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadFileUseCase,
        { provide: FilesService, useValue: storageService },
        { provide: FilesRepository, useValue: filesRepo },
      ],
    }).compile();

    useCase = module.get<UploadFileUseCase>(UploadFileUseCase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should upload file and save metadata', async () => {
      storageService.uploadFile.mockResolvedValue(mockUploadResult as any);
      filesRepo.create.mockResolvedValue(mockSavedFile);

      const mockFile: any = { originalname: 'test.pdf' };
      const metadata: any = { entityType: 'PROJECT', entityId: 'proj-1' };

      const result = await useCase.execute(mockFile, metadata, 'user-1');

      expect(result).toEqual(mockSavedFile);
      expect(storageService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(filesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'test.pdf',
          filePath: 'https://storage.example.com/files/test.pdf',
          entityType: 'PROJECT',
          entityId: 'proj-1',
          uploadedBy: 'user-1',
        }),
      );
    });
  });
});
