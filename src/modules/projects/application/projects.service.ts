import {
  BadGatewayException,
  Injectable,
  Logger,
  } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import axios from 'axios';
import {
  ProjectCodeProcessTaskSnapshot,
  ProjectsRepository,
} from '../infrastructure/projects.repository';
import { CreateProjectUseCase } from './usecases/create-project.usecase';
import { UpdateProjectStatusUseCase } from './usecases/update-status.usecase';
import { AssignClientUseCase } from './usecases/assign-client.usecase';
import { CreateProjectDto } from '../api/dto/create-project.dto';
import { UpdateProjectDto } from '../api/dto/update-project.dto';
import { ProjectQueryDto } from '../api/dto/project-query.dto';
import { AddMemberDto } from '../api/dto/add-member.dto';
import { AssignClientDto } from '../api/dto/assign-client.dto';
import {
  MemberAlreadyExistsException,
} from '../domain/project.rules';
import { SystemEvents } from '../../../shared/events/event.constants';
import { Role } from '../../../shared/enums/role.enum';
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { ForbiddenError } from "../../../shared/errors/forbidden.error";
import { DomainError, DomainErrorType } from "../../../shared/errors/domain.error";

type ParsedGithubRepository = {
  owner: string;
  repo: string;
  fullName: string;
  normalizedUrl: string;
};

type GithubBranchListResponse = Array<{
  name: string;
  commit?: {
    sha?: string;
  };
  protected?: boolean;
}>;

type GithubRepositoryResponse = {
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string | null;
  language: string | null;
  owner?: {
    login?: string;
    avatar_url?: string;
    html_url?: string;
  };
};

type GithubCommitListResponse = Array<{
  sha: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: {
      name?: string;
      email?: string;
      date?: string;
    };
  };
  author?: {
    login?: string;
    avatar_url?: string;
    html_url?: string;
  } | null;
}>;

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly projectsRepo: ProjectsRepository,
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateStatusUseCase: UpdateProjectStatusUseCase,
    private readonly assignClientUseCase: AssignClientUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(query: ProjectQueryDto, userId?: string, role?: string) {
    return this.projectsRepo.findAll(
      {
        page: query.page || 1,
        limit: query.limit || 10,
        status: query.status,
        clientId: query.clientId,
        search: query.search,
        myProjectsOnly:
          query.myProjectsOnly === 'true' || query.myProjectsOnly === true,
      },
      userId,
      role,
    );
  }

  async findById(id: string) {
    const project = await this.projectsRepo.findById(id);
    if (!project) throw new NotFoundError();
    return project;
  }

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.createProjectUseCase.execute(dto, userId);

    this.eventEmitter.emit(SystemEvents.PROJECT_CREATED, {
      projectId: project.id,
      projectName: project.name,
      createdBy: userId,
      targetUserIds: [userId],
    });

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectsRepo.findById(id);
    if (!project) throw new NotFoundError();

    const updated = await this.projectsRepo.update(id, {
      name: dto.name,
      description: dto.description,
      budget: dto.budget,
      startDate: dto.startDate,
      deadline: dto.deadline,
    });

    this.logger.log(`Project updated: ${id}`);
    return updated;
  }

  async updateStatus(id: string, status: string) {
    return this.updateStatusUseCase.execute(id, status);
  }

  async assignClient(projectId: string, dto: AssignClientDto, userId: string) {
    const updated = await this.assignClientUseCase.execute(
      projectId,
      dto.clientId,
      userId,
    );
    this.logger.log(`Client ${dto.clientId} assigned to project ${projectId}`);
    return updated;
  }

  async addMember(projectId: string, dto: AddMemberDto) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new NotFoundError();

    const exists = await this.projectsRepo.isMember(projectId, dto.userId);
    if (exists) throw new MemberAlreadyExistsException();

    const member = await this.projectsRepo.addMember(
      projectId,
      dto.userId,
      dto.role || 'DEVELOPER',
    );

    this.eventEmitter.emit(SystemEvents.PROJECT_MEMBER_ADDED, {
      projectId,
      projectName: project.name,
      memberId: dto.userId,
      role: dto.role || 'DEVELOPER',
      createdBy: project.createdBy,
    });

    this.logger.log(`Member ${dto.userId} added to project ${projectId}`);
    return member;
  }

  async removeMember(projectId: string, userId: string) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new NotFoundError();

    await this.projectsRepo.removeMember(projectId, userId);
    this.logger.log(`Member ${userId} removed from project ${projectId}`);
  }

  async getMembers(projectId: string) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new NotFoundError();
    return this.projectsRepo.getMembers(projectId);
  }

  async updateGithubRepository(
    projectId: string,
    githubUrl: string,
    accessToken: string | undefined,
    clearAccessToken: boolean | undefined,
    userId: string,
  ) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new NotFoundError();

    const parsed = parseGithubRepository(githubUrl);
    if (!parsed) {
      throw new DomainError(
        'Gecersiz GitHub repository URL. Ornek: https://github.com/owner/repo', DomainErrorType.BUSINESS_RULE);
    }

    const saved = await this.projectsRepo.upsertGithubIntegration({
      projectId,
      repositoryUrl: parsed.normalizedUrl,
      repositoryFullName: parsed.fullName,
      accessToken,
      clearAccessToken,
      userId,
    });

    this.logger.log(
      `GitHub repository linked: project=${projectId}, repo=${parsed.fullName}`,
    );

    return {
      projectId: saved.projectId,
      repositoryUrl: saved.repositoryUrl,
      repositoryFullName: saved.repositoryFullName,
      hasCustomToken: !!saved.hasCustomToken,
      updatedAt: saved.updatedAt,
    };
  }

  async getGithubOverview(projectId: string) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new NotFoundError();

    const integration =
      await this.projectsRepo.findGithubIntegrationByProjectId(projectId);
    if (!integration) {
      return {
        connected: false,
        linkedRepositoryUrl: null,
        linkedRepositoryFullName: null,
        repository: null,
        branches: [],
        error: null,
      };
    }

    const fullName = integration.repositoryFullName;
    const client = createGithubApiClient(integration.accessToken ?? undefined);

    try {
      const [repositoryResponse, branchesResponse] = await Promise.all([
        client.get<GithubRepositoryResponse>(`/repos/${fullName}`),
        client.get<GithubBranchListResponse>(`/repos/${fullName}/branches`, {
          params: { per_page: 100 },
        }),
      ]);

      return {
        connected: true,
        linkedRepositoryUrl: integration.repositoryUrl,
        linkedRepositoryFullName: fullName,
        repository: {
          fullName: repositoryResponse.data.full_name,
          htmlUrl: repositoryResponse.data.html_url,
          description: repositoryResponse.data.description,
          defaultBranch: repositoryResponse.data.default_branch,
          isPrivate: repositoryResponse.data.private,
          stars: repositoryResponse.data.stargazers_count,
          forks: repositoryResponse.data.forks_count,
          openIssues: repositoryResponse.data.open_issues_count,
          pushedAt: repositoryResponse.data.pushed_at,
          language: repositoryResponse.data.language,
          ownerLogin: repositoryResponse.data.owner?.login,
          ownerAvatarUrl: repositoryResponse.data.owner?.avatar_url,
          ownerHtmlUrl: repositoryResponse.data.owner?.html_url,
        },
        branches: branchesResponse.data.map((branch) => ({
          name: branch.name,
          latestCommitSha: branch.commit?.sha || null,
          isProtected: !!branch.protected,
        })),
      };
    } catch (error) {
      const mapped = mapGithubApiError(error, fullName);
      this.logger.warn(
        `GitHub overview fetch failed for ${fullName}: ${mapped.message}`,
      );

      return {
        connected: false,
        linkedRepositoryUrl: integration.repositoryUrl,
        linkedRepositoryFullName: fullName,
        repository: null,
        branches: [],
        error: mapped.message,
      };
    }
  }

  async getGithubCommits(
    projectId: string,
    branch?: string,
    page = 1,
    perPage = 20,
  ) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new NotFoundError();

    const integration =
      await this.projectsRepo.findGithubIntegrationByProjectId(projectId);
    if (!integration) {
      return {
        connected: false,
        linkedRepositoryUrl: null,
        linkedRepositoryFullName: null,
        branch: branch?.trim() || null,
        page: 1,
        perPage: Number.isFinite(perPage)
          ? Math.min(100, Math.max(1, Math.floor(perPage)))
          : 20,
        commits: [],
        error: 'Bu proje icin bagli bir GitHub repository bulunamadi.',
      };
    }

    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safePerPage = Number.isFinite(perPage)
      ? Math.min(100, Math.max(1, Math.floor(perPage)))
      : 20;

    const normalizedBranch = branch?.trim() || undefined;
    const fullName = integration.repositoryFullName;
    const client = createGithubApiClient(integration.accessToken ?? undefined);

    try {
      const response = await client.get<GithubCommitListResponse>(
        `/repos/${fullName}/commits`,
        {
          params: {
            sha: normalizedBranch,
            page: safePage,
            per_page: safePerPage,
          },
        },
      );

      return {
        connected: true,
        linkedRepositoryUrl: integration.repositoryUrl,
        linkedRepositoryFullName: fullName,
        branch: normalizedBranch ?? null,
        page: safePage,
        perPage: safePerPage,
        commits: response.data.map((item) => ({
          sha: item.sha,
          shortSha: item.sha?.slice(0, 7) || null,
          htmlUrl: item.html_url || null,
          message: item.commit?.message || '',
          authorName:
            item.author?.login || item.commit?.author?.name || 'Unknown',
          authorEmail: item.commit?.author?.email || null,
          authorAvatarUrl: item.author?.avatar_url || null,
          committedAt: item.commit?.author?.date || null,
        })),
      };
    } catch (error) {
      const mapped = mapGithubApiError(error, fullName);
      this.logger.warn(
        `GitHub commits fetch failed for ${fullName}: ${mapped.message}`,
      );

      return {
        connected: false,
        linkedRepositoryUrl: integration.repositoryUrl,
        linkedRepositoryFullName: fullName,
        branch: normalizedBranch ?? null,
        page: safePage,
        perPage: safePerPage,
        commits: [],
        error: mapped.message,
      };
    }
  }

  async getCodeProcessesOverview(
    projectId: string,
    userId: string,
    role: string,
    options?: {
      branch?: string;
      commitsPerPage?: number;
      recentTaskLimit?: number;
    },
  ) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new NotFoundError();

    await this.assertProjectAccess(projectId, userId, role);

    const safeCommitsPerPage = toSafeInt(options?.commitsPerPage, 6, 1, 20);
    const safeRecentTaskLimit = toSafeInt(options?.recentTaskLimit, 12, 1, 30);
    const branch = options?.branch?.trim() || undefined;

    const taskSnapshot = await this.projectsRepo.getCodeProcessTaskSnapshot(
      projectId,
      safeRecentTaskLimit,
    );

    let githubOverview: any = {
      connected: false,
      repository: null,
      branches: [],
    };
    let githubOverviewError: string | null = null;

    try {
      githubOverview = await this.getGithubOverview(projectId);
    } catch (error) {
      githubOverviewError = toErrorMessage(error);
      this.logger.warn(
        `GitHub overview unavailable for project ${projectId}: ${githubOverviewError}`,
      );
    }

    let githubCommits: any = {
      connected: false,
      branch: branch ?? null,
      page: 1,
      perPage: safeCommitsPerPage,
      commits: [],
    };
    let githubCommitsError: string | null = null;

    if (githubOverview?.connected) {
      try {
        githubCommits = await this.getGithubCommits(
          projectId,
          branch,
          1,
          safeCommitsPerPage,
        );
      } catch (error) {
        githubCommitsError = toErrorMessage(error);
        this.logger.warn(
          `GitHub commits unavailable for project ${projectId}: ${githubCommitsError}`,
        );
        githubCommits = {
          connected: true,
          linkedRepositoryUrl: githubOverview?.linkedRepositoryUrl ?? undefined,
          linkedRepositoryFullName:
            githubOverview?.linkedRepositoryFullName ?? undefined,
          branch: branch ?? null,
          page: 1,
          perPage: safeCommitsPerPage,
          commits: [],
        };
      }
    }

    const quality = buildCodeProcessQuality(taskSnapshot);

    return {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
      },
      generatedAt: new Date().toISOString(),
      tasks: taskSnapshot,
      github: {
        overview: githubOverview,
        commits: githubCommits,
        errors: {
          overview: githubOverviewError,
          commits: githubCommitsError,
        },
      },
      quality,
    };
  }

  private async assertProjectAccess(
    projectId: string,
    userId: string,
    role: string,
  ): Promise<void> {
    if (canViewAllProjects(role)) {
      return;
    }

    const isMember = await this.projectsRepo.isMember(projectId, userId);
    if (!isMember) {
      throw new ForbiddenError(
        'Bu projenin kod surecine erisim yetkiniz yok.',
      );
    }
  }
}

function canViewAllProjects(role: string | undefined): boolean {
  const normalized = String(role ?? '').toUpperCase();
  return (
    (normalized as unknown as Role) === Role.ADMIN ||
    (normalized as unknown as Role) === Role.CEO ||
    (normalized as unknown as Role) === Role.MANAGER
  );
}

function toErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return 'Unknown error';
}

function toSafeInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.floor(Number(value))));
}

function buildCodeProcessQuality(taskSnapshot: ProjectCodeProcessTaskSnapshot) {
  const summary = taskSnapshot.summary;
  const reviewCount = summary.byStatus.IN_REVIEW;
  const blockedCount = summary.byStatus.BLOCKED;
  const doneThisWeek = summary.doneThisWeek;
  const total = summary.total;

  return {
    reviewQueue: {
      count: reviewCount,
      state: reviewCount > 5 ? 'CRITICAL' : reviewCount > 0 ? 'WARNING' : 'OK',
    },
    blockers: {
      count: blockedCount,
      state: blockedCount > 0 ? 'CRITICAL' : 'OK',
    },
    weeklyThroughput: {
      doneThisWeek,
      state:
        doneThisWeek >= 6 ? 'OK' : doneThisWeek >= 3 ? 'WARNING' : 'CRITICAL',
    },
    completion: {
      total,
      done: summary.byStatus.DONE,
      ratio: total > 0 ? Number((summary.byStatus.DONE / total).toFixed(4)) : 0,
    },
  };
}

function parseGithubRepository(
  input: string | null | undefined,
): ParsedGithubRepository | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  const httpsMatch = trimmed.match(
    /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i,
  );
  if (httpsMatch) {
    const owner = httpsMatch[1];
    const repo = httpsMatch[2];
    const fullName = `${owner}/${repo}`;
    return {
      owner,
      repo,
      fullName,
      normalizedUrl: `https://github.com/${fullName}`,
    };
  }

  const sshMatch = trimmed.match(
    /^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i,
  );
  if (sshMatch) {
    const owner = sshMatch[1];
    const repo = sshMatch[2];
    const fullName = `${owner}/${repo}`;
    return {
      owner,
      repo,
      fullName,
      normalizedUrl: `https://github.com/${fullName}`,
    };
  }

  const shortMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shortMatch) {
    const owner = shortMatch[1];
    const repo = shortMatch[2].replace(/\.git$/i, '');
    const fullName = `${owner}/${repo}`;
    return {
      owner,
      repo,
      fullName,
      normalizedUrl: `https://github.com/${fullName}`,
    };
  }

  return null;
}

function createGithubApiClient(projectAccessToken?: string | null) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'trivexa-backend',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const token = projectAccessToken?.trim() || process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: 'https://api.github.com',
    timeout: 15_000,
    headers,
  });
}

function mapGithubApiError(error: unknown, fullName: string) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) {
      return new NotFoundError(
        `GitHub repository bulunamadi veya erisim yok: ${fullName}`,
      );
    }
    if (status === 401 || status === 403) {
      return new DomainError(
        'GitHub API yetkilendirme/rate-limit hatasi. GITHUB_TOKEN ayarini kontrol edin.', DomainErrorType.BUSINESS_RULE);
    }
    return new BadGatewayException(
      `GitHub API hatasi (status: ${status ?? 'unknown'})`,
    );
  }

  return new BadGatewayException('GitHub API cagrisinda beklenmeyen hata');
}
