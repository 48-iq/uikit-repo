import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Build, BuildStatus } from 'src/postgres/entities/build.entity';
import { Repository } from 'typeorm';
import { UserStatDto } from './dto/user-stat.dto';
import { UserStatResultDto } from './dto/user-stat-result.dto';
import { AppError } from 'src/errors/app.error';
import { ERROR_CODE } from 'src/errors/error-code';
import { Load } from 'src/postgres/entities/load.entity';
import { Repo } from 'src/postgres/entities/repo.entity';
import { DailyStatPointDto } from './dto/repo-stat.dto';

@Injectable()
export class UserStatService {
  constructor(
    @InjectRepository(Build)
    private readonly buildRepository: Repository<Build>,
    @InjectRepository(Load)
    private readonly loadRepository: Repository<Load>,
    @InjectRepository(Repo)
    private readonly repoRepository: Repository<Repo>,
  ) {}

  async getUserStat(username: string): Promise<UserStatResultDto> {
    const firstRepo = await this.repoRepository
      .createQueryBuilder('repo')
      .where('repo.username = :username', { username })
      .orderBy('repo.createdAt', 'ASC')
      .limit(1)
      .getOne();

    if (!firstRepo) throw new AppError(ERROR_CODE.USER_NOT_FOUND);

    const createdAt = firstRepo.createdAt;

    const countBuilds = (status?: BuildStatus) => {
      const qb = this.buildRepository
        .createQueryBuilder('build')
        .innerJoin('build.repo', 'repo')
        .where('repo.username = :username', { username });
      if (status) qb.andWhere('build.status = :status', { status });
      return qb.getCount();
    };

    const [
      totalRepos,
      totalBuilds,
      successBuilds,
      failedBuilds,
      pendingBuilds,
      runningBuilds,
    ] = await Promise.all([
      this.repoRepository
        .createQueryBuilder('repo')
        .where('repo.username = :username', { username })
        .getCount(),
      countBuilds(),
      countBuilds(BuildStatus.SUCCESS),
      countBuilds(BuildStatus.FAILED),
      countBuilds(BuildStatus.PENDING),
      countBuilds(BuildStatus.RUNNING),
    ]);

    const dailyLoadsChart = await this.getDailyLoadsChart(username, 30, createdAt);

    const result: UserStatDto = {
      username,
      totalRepos,
      totalBuilds,
      successBuilds,
      failedBuilds,
      pendingBuilds,
      runningBuilds,
      dailyLoadsChart,
    };

    return { success: true, result };
  }

  private async getDailyLoadsChart(
    username: string,
    days: number,
    createdAt: Date,
  ): Promise<DailyStatPointDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(createdAt);
    start.setHours(0, 0, 0, 0);

    const naturalEnd = new Date(start);
    naturalEnd.setDate(naturalEnd.getDate() + (days - 1));

    let windowStart: Date;
    let windowEnd: Date;

    if (naturalEnd <= today) {
      windowEnd = today;
      windowStart = new Date(today);
      windowStart.setDate(windowStart.getDate() - (days - 1));
    } else {
      windowStart = start;
      windowEnd = naturalEnd;
    }

    const raw: { date: string; count: string }[] = await this.loadRepository
      .createQueryBuilder('load')
      .innerJoin('load.build', 'build')
      .innerJoin('build.repo', 'repo')
      .select("TO_CHAR(load.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('repo.username = :username', { username })
      .andWhere('load.createdAt >= :start', { start: windowStart })
      .andWhere('load.createdAt < :endExclusive', {
        endExclusive: new Date(windowEnd.getTime() + 1000 * 60 * 60 * 24),
      })
      .groupBy("TO_CHAR(load.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(load.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return fillDailyRange(raw, windowStart, windowEnd);
  }
}

function fillDailyRange(
  raw: { date: string; count: string }[],
  start: Date,
  end: Date,
): DailyStatPointDto[] {
  const byDate = new Map(raw.map((r) => [r.date, Number(r.count)]));
  const result: DailyStatPointDto[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().split('T')[0];
    result.push({ date, count: byDate.get(date) ?? 0 });
  }

  return result;
}
