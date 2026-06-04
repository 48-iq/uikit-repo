import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Build } from 'src/postgres/entities/build.entity';
import { ComponentBuild } from 'src/postgres/entities/component-build.entity';
import { BuildController } from './build.controller';
import { BuildLogService } from './services/build-log.service';
import { BuildService } from './services/build.service';
import { RollupBuildService } from './services/rollup-build.service';

@Module({
  imports: [TypeOrmModule.forFeature([Build, ComponentBuild])],
  controllers: [BuildController],
  providers: [BuildLogService, RollupBuildService, BuildService],
  exports: [BuildService],
})
export class BuildModule {}
