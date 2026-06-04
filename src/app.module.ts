import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RepoModule } from './repo/repo.module';
import { PostgresModule } from './postgres/postgres.module';
import { MinioModule } from './minio/minio.module';
import { RedisModule } from './redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtGuard } from './security/jwt.guard';
import { AllExceptionsFilter } from './errors/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    RepoModule,
    PostgresModule,
    MinioModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // удаляет лишние поля
        forbidNonWhitelisted: true, // бросает ошибку на лишние поля
        transform: true, // автоматически преобразует типы
      }),
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
