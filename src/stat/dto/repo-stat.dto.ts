export class DailyStatPointDto {
  date: string;
  count: number;
}

export class RepoStatDto {
  repoId: string;
  loadsTotal: number;
  loadsForYear: number;
  loadsForMonth: number;
  loadsForWeek: number;
  loadsForDay: number;
  dailyChart: DailyStatPointDto[];
}
