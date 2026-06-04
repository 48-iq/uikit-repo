import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildModule } from 'src/build/build.module';
import { Repo } from 'src/postgres/entities/repo.entity';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';

@Module({
  imports: [BuildModule, TypeOrmModule.forFeature([Repo])],
  controllers: [RepoController],
  providers: [RepoService],
})
export class RepoModule {}
