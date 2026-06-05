import { DailyStatPointDto } from "./repo-stat.dto";

export class UserStatDto {
  username: string;
  totalRepos: number;
  totalBuilds: number;
  successBuilds: number;
  failedBuilds: number;
  pendingBuilds: number;
  runningBuilds: number;
  dailyLoadsChart: DailyStatPointDto[];
}
