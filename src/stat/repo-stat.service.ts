import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Load } from 'src/postgres/entities/load.entity';
import { Repo } from 'src/postgres/entities/repo.entity';
import { Repository } from 'typeorm';
import { DailyStatPointDto, RepoStatDto } from './dto/repo-stat.dto';
import { AppError } from 'src/errors/app.error';
import { ERROR_CODE } from 'src/errors/error-code';
import { RepoStatResultDto } from './dto/repo-stat-result.dto';

@Injectable()
export class RepoStatService {
  constructor(
    @InjectRepository(Load)
    private readonly loadRepository: Repository<Load>,
    @InjectRepository(Repo)
    private readonly repoRepository: Repository<Repo>,
  ) {}

  async getRepoStat(repoId: string): Promise<RepoStatResultDto> {
    const repo = await this.repoRepository.findOneBy({ id: repoId });
    if (!repo) throw new AppError(ERROR_CODE.REPO_NOT_FOUND);

    const now = Date.now();
    const msDay = 1000 * 60 * 60 * 24;
    const createdAt = repo.createdAt;

    const clip = (since: Date) => (since < createdAt ? createdAt : since);

    const countSince = (since: Date) =>
      this.loadRepository
        .createQueryBuilder('load')
        .innerJoin('load.build', 'build')
        .where('build.repoId = :repoId', { repoId })
        .andWhere('load.createdAt >= :since', { since })
        .getCount();

    const [loadsTotal, loadsForYear, loadsForMonth, loadsForWeek, loadsForDay] =
      await Promise.all([
        countSince(createdAt),
        countSince(clip(new Date(now - msDay * 365))),
        countSince(clip(new Date(now - msDay * 30))),
        countSince(clip(new Date(now - msDay * 7))),
        countSince(clip(new Date(now - msDay))),
      ]);

    const dailyChart = await this.getDailyChart(repoId, 30, createdAt);

    const result: RepoStatDto = {
      repoId,
      loadsTotal,
      loadsForYear,
      loadsForMonth,
      loadsForWeek,
      loadsForDay,
      dailyChart,
    };

    return { success: true, result };
  }

  private async getDailyChart(
    repoId: string,
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
      .select("TO_CHAR(load.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('build.repoId = :repoId', { repoId })
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
