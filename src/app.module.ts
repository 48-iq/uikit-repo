import { Module } from '@nestjs/common';
import { ComponentModule } from './component/component.module';
import { ConfigModule } from '@nestjs/config';
import { RepoModule } from './repo/repo.module';
import { PostgresModule } from './postgres/postgres.module';
import { MinioModule } from './minio/minio.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    ComponentModule,
    RepoModule,
    PostgresModule,
    MinioModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
