import { Module } from '@nestjs/common';
import { UserStatService } from './user-stat.service';
import { UserStatController } from './user-stat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Build } from 'src/postgres/entities/build.entity';
import { RepoStatService } from './repo-stat.service';
import { Load } from 'src/postgres/entities/load.entity';
import { Repo } from 'src/postgres/entities/repo.entity';
import { RepoStatController } from './repo-stat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Load, Build, Repo])],
  controllers: [UserStatController, RepoStatController],
  providers: [UserStatService, RepoStatService],
})
export class StatModule {}
