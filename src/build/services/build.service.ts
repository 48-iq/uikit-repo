import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { randomUUID } from 'node:crypto';
import { AppError } from 'src/errors/app.error';
import { ERROR_CODE } from 'src/errors/error-code';
import { MINIO_REPOSITORIES_BUCKET } from 'src/minio/constants';
import { InjectMinio } from 'src/minio/minio.decorator';
import { Build, BuildStatus } from 'src/postgres/entities/build.entity';
import { ComponentBuild } from 'src/postgres/entities/component-build.entity';
import { Repo } from 'src/postgres/entities/repo.entity';
import { Client as MinioClient } from 'minio';
import { Repository } from 'typeorm';
import { BuildFiltersDto } from '../dto/build-filters.dto';
import { BuildListEntityDto, BuildListResultDto } from '../dto/component-build-api.dto';
import { BuildMapper } from '../mappers/build.mapper';
import { BuildLogService } from './build-log.service';
import { RollupBuildService } from './rollup-build.service';
import { Load } from 'src/postgres/entities/load.entity';

@Injectable()
export class BuildService {
  private readonly logger = new Logger(BuildService.name);

  constructor(
    @InjectRepository(Build)
    private readonly buildRepository: Repository<Build>,
    @InjectRepository(ComponentBuild)
    private readonly componentBuildRepository: Repository<ComponentBuild>,
    private readonly rollupBuildService: RollupBuildService,
    private readonly buildLogService: BuildLogService,
    private readonly config: ConfigService,
    @InjectRepository(Load)
    private readonly loadRepository: Repository<Load>,
    @InjectMinio() private readonly minio: MinioClient,
  ) {}

  async create(args: { repo: Repo; componentBuildIds: string[] }): Promise<Build> {
    const { repo, componentBuildIds } = args;

    const buildServiceUrl = this.config.getOrThrow<string>('UIKIT_BUILD_SERVICE_URL');
    const params = new URLSearchParams();
    componentBuildIds.forEach((id) => params.append('ids', id));

    const { data } = await axios.get<BuildListResultDto>(
      `${buildServiceUrl}/api/components/builds/get/batch?${params.toString()}`,
    );

    const items = data.result ?? [];
    this.validateNoDuplicates(items);

    const lastBuild = await this.buildRepository
      .createQueryBuilder('build')
      .leftJoin('build.repo', 'repo')
      .where('repo.id = :repoId', { repoId: repo.id })
      .orderBy('build.version', 'DESC')
      .getOne();

    const build = await this.buildRepository.save({
      repo,
      status: BuildStatus.PENDING,
      logs: '',
      version: lastBuild ? lastBuild.version + 1 : 1,
    });

    const componentBuilds = await this.componentBuildRepository.save(
      items.map((item) => ({
        id: randomUUID(),
        componentBuildId: item.id,
        componentId: item.componentId,
        componentName: item.name,
        componentUsername: item.username,
        buildVersion: item.version,
        packageFilename: item.packageFilename ?? '',
        build,
      })),
    );

    this.runBuild(build, repo, componentBuilds).catch((err) =>
      this.logger.error(`Build runner ${build.id} crashed unexpectedly`, err),
    );

    return build;
  }

  async getById(buildId: string) {
    const build = await this.buildRepository.findOne({
      where: { id: buildId },
      relations: ['repo', 'componentBuilds'],
    });
    if (!build) throw new AppError(ERROR_CODE.BUILD_NOT_FOUND);
    return BuildMapper.toEntityResultDto(build);
  }

  async getByFilters(dto: BuildFiltersDto) {
    const { repoId, username, status, query, skip = 0, limit = 10 } = dto;
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();

    let qb = this.buildRepository
      .createQueryBuilder('build')
      .leftJoinAndSelect('build.repo', 'repo')
      .where('build.startedAt < :startDate', { startDate });
    if (status)
      qb = qb.andWhere('build.status = :status', { status: status });

    if (repoId) qb = qb.andWhere('repo.id = :repoId', { repoId });
    if (username) qb = qb.andWhere('repo.username = :username', { username });

    if (query) {
      qb = qb.andWhere('LOWER(repo.name) LIKE :query', {
        query: `%${query.toLowerCase()}%`,
      });
    }

    qb = qb.orderBy('build.version', 'DESC');

    const total = await qb.getCount();
    if (skip) qb = qb.skip(skip);
    if (limit) qb = qb.take(limit);

    const builds = await qb.getMany();

    return BuildMapper.toCursorResultDto({
      builds,
      itemsLeft: total - skip - builds.length,
      startDate,
      itemsSkipped: skip,
    });
  }

  async getPackage(buildId: string) {
    const build = await this.buildRepository.findOneBy({ id: buildId });
    if (!build) throw new AppError(ERROR_CODE.BUILD_NOT_FOUND);
    await this.loadRepository.save({ build });

    return this.minio.getObject(MINIO_REPOSITORIES_BUCKET, build.id);
  }

  private validateNoDuplicates(items: BuildListEntityDto[]) {
    const seen = new Set<string>();
    for (const item of items) {
      const key = `${item.username}/${item.name}`;
      if (seen.has(key)) {
        throw new AppError(ERROR_CODE.VALIDATION_ERROR);
      }
      seen.add(key);
    }
  }

  private async runBuild(build: Build, repo: Repo, componentBuilds: ComponentBuild[]) {
    try {
      await this.buildRepository.update({ id: build.id }, { status: BuildStatus.RUNNING });

      const outputName = await this.rollupBuildService.buildAndSave({
        build,
        repo,
        componentBuilds,
      });

      await this.buildRepository.update(
        { id: build.id },
        {
          status: outputName ? BuildStatus.SUCCESS : BuildStatus.FAILED,
          finishedAt: new Date(),
        },
      );
    } catch (error: any) {
      this.logger.error(`Build ${build.id} failed`, error);
      await this.buildRepository.update(
        { id: build.id },
        { status: BuildStatus.FAILED, finishedAt: new Date() },
      );
    } finally {
      await this.buildLogService.flush(build.id);
    }
  }
}
