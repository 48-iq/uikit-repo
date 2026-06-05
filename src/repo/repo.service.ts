import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildService } from 'src/build/services/build.service';
import { AppError } from 'src/errors/app.error';
import { ERROR_CODE } from 'src/errors/error-code';
import { Build, BuildStatus } from 'src/postgres/entities/build.entity';
import { Repo } from 'src/postgres/entities/repo.entity';
import { Repository } from 'typeorm';
import { RepoCreateDto } from './dto/repo-create.dto';
import { RepoFiltersDto } from './dto/repo-filters.dto';
import { RepoNewVersionDto } from './dto/repo-new-version.dto';
import { RepoMapper } from './repo.mapper';
import { ComponentBuild } from 'src/postgres/entities/component-build.entity';

@Injectable()
export class RepoService {
  private readonly logger = new Logger(RepoService.name);

  constructor(
    @InjectRepository(Repo) private readonly repoRepository: Repository<Repo>,
    private readonly buildService: BuildService,
    @InjectRepository(Build) private readonly buildRepository: Repository<Build>,
  ) {}

  async getById(repoId: string) {
    const repo = await this.repoRepository
      .createQueryBuilder('repo')
      .leftJoinAndMapOne(
        'repo.latestBuild',
        Build,
        'latestBuild',
        `latestBuild.id = (
          SELECT b.id FROM builds b
          WHERE b."repoId" = repo.id
            AND b.status = '${BuildStatus.SUCCESS}'
          ORDER BY b.version DESC
          LIMIT 1
        )`,
      )
      .where('repo.id = :repoId', { repoId })
      .getOne();

    if (!repo) throw new AppError(ERROR_CODE.BUILD_NOT_FOUND);

    const latestBuild = (repo as Repo & { latestBuild?: Build }).latestBuild;
    return RepoMapper.toEntityResultDto(repo, latestBuild);
  }

  async getByNameAndUsername(args: {
    name: string;
    username: string;
    version?: number;
  }) {
    const repo = await this.repoRepository.findOne({
      where: { name: args.name, username: args.username },
    });
    if (!repo) throw new AppError(ERROR_CODE.REPO_NOT_FOUND);

    let buildQuery = this.buildRepository
      .createQueryBuilder('build')
      .leftJoinAndSelect('build.componentBuilds', 'componentBuild')
      .where('build.repoId = :repoId', { repoId: repo.id })
      .andWhere('build.status = :status', { status: BuildStatus.SUCCESS });

    if (args.version != null) {
      buildQuery = buildQuery.andWhere('build.version = :version', { version: args.version });
    } else {
      buildQuery = buildQuery.orderBy('build.version', 'DESC');
    }

    const latestBuild = await buildQuery.getOne();

    return RepoMapper.toEntityResultDto(repo, latestBuild);
  }

  async getByFilters(dto: RepoFiltersDto) {
    const { username, query, skip = 0, limit = 10, tags } = dto;
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();

    let qb = this.repoRepository
      .createQueryBuilder('repo')
      .where('repo.createdAt < :startDate', { startDate });

    if (username) qb = qb.andWhere('repo.username = :username', { username });

    if (query)
      qb = qb.andWhere(`repo.username || '/' || repo.name LIKE :query`, {
        query: `%${query}%`,
      });
    
    if (tags) {
      qb = qb.andWhere('repo.tags @> :tags', { tags: tags });
    }

    qb = qb.orderBy('repo.createdAt', dto.sort === 'asc' ? 'ASC' : 'DESC');

    const total = await qb.getCount();

    if (skip) qb = qb.skip(skip);
    if (limit) qb = qb.take(limit);

    const repos = await qb.getMany();

    return RepoMapper.toCursorResultDto({
      repos,
      itemsLeft: total - skip - repos.length,
      startDate,
      itemsSkipped: skip,
    });
  }

  async create(args: { dto: RepoCreateDto; username: string }) {
    const { dto, username } = args;

    const repo = await this.repoRepository.save({
      name: dto.name,
      username,
      description: dto.description,
      tags: dto.tags
    });

    const build = await this.buildService.create({
      repo,
      componentBuildIds: dto.componentBuildIds,
    });

    this.logger.log(`Repo ${repo.id} created, build ${build.id} started`);
    return RepoMapper.toCreateResultDto(repo, build);
  }

  async newVersion(args: { repoId: string; dto: RepoNewVersionDto; username: string }) {
    const { repoId, dto, username } = args;

    const repo = await this.repoRepository.findOneBy({ id: repoId });
    if (!repo) throw new AppError(ERROR_CODE.REPO_NOT_FOUND);
    if (repo.username !== username) throw new AppError(ERROR_CODE.FORBIDDEN);

    const build = await this.buildService.create({
      repo,
      componentBuildIds: dto.componentBuildIds,
    });

    return RepoMapper.toCreateResultDto(repo, build);
  }
}
