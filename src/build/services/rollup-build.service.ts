import { Injectable, Logger } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { create, extract } from 'tar';
import tmp from 'tmp';
import path from 'node:path';
import fs from 'node:fs';
import { finished } from 'node:stream/promises';
import { InjectMinio } from 'src/minio/minio.decorator';
import { MINIO_COMPONENTS_BUCKET, MINIO_REPOSITORIES_BUCKET } from 'src/minio/constants';
import { Build } from 'src/postgres/entities/build.entity';
import { ComponentBuild } from 'src/postgres/entities/component-build.entity';
import { Repo } from 'src/postgres/entities/repo.entity';
import { BuildLogService } from './build-log.service';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface ComponentMeta {
  dir: string;
  safeName: string;
  hasDts: boolean;
  dependencies: Record<string, string>;
}

@Injectable()
export class RollupBuildService {
  private readonly logger = new Logger(RollupBuildService.name);

  constructor(
    @InjectMinio() private readonly minio: MinioClient,
    private readonly buildLog: BuildLogService,
  ) {}

  async buildAndSave(args: {
    build: Build;
    repo: Repo;
    componentBuilds: ComponentBuild[];
  }): Promise<string | null> {
    const { build, repo, componentBuilds } = args;
    const buildId = build.id;
    const outputName = build.id;

    const log = (msg: string, level: LogLevel = 'info') =>
      this.buildLog.append(buildId, msg, level);

    const tmpDir = tmp.dirSync({ unsafeCleanup: true }).name;
    const distDir = path.join(tmpDir, 'dist');

    try {
      await log(`Starting build for repo: ${repo.name} (${repo.id})`);
      fs.mkdirSync(distDir, { recursive: true });

      const componentInfos = await this.downloadComponents(
        distDir,
        componentBuilds,
        buildId,
      );
      await log('All components downloaded and extracted');

      this.generateIndexJs(distDir, componentInfos);
      await log('index.js created');

      const dtsComponents = componentInfos.filter((c) => c.hasDts);
      if (dtsComponents.length > 0) {
        this.generateIndexDts(distDir, dtsComponents);
        await log('index.d.ts created');
      }

      this.generatePackageJson(distDir, repo, componentInfos);
      await log('package.json created');

      const tgzPath = path.join(tmpDir, 'output.tgz');
      await create(
        { gzip: true, file: tgzPath, portable: true, strict: true, cwd: distDir },
        ['.'],
      );
      await log('Tarball created');

      await this.minio.putObject(
        MINIO_REPOSITORIES_BUCKET,
        outputName,
        fs.createReadStream(tgzPath),
      );
      await log(`Uploaded to MinIO: ${MINIO_REPOSITORIES_BUCKET}/${outputName}`);

      await log('Build completed successfully!');
      return outputName;
    } catch (error: any) {
      this.logger.error(`Build ${build.id} failed`, error);
      await log(`Build failed: ${error.message || error}`, 'error');
      return null;
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  private async downloadComponents(
    distDir: string,
    componentBuilds: ComponentBuild[],
    buildId: string,
  ): Promise<ComponentMeta[]> {
    return Promise.all(
      componentBuilds.map(async (cb) => {
        const dir = path.join(distDir, 'components', cb.componentUsername, cb.componentName);
        fs.mkdirSync(dir, { recursive: true });

        const stream = await this.minio.getObject(MINIO_COMPONENTS_BUCKET, cb.packageFilename);
        await finished(stream.pipe(extract({ cwd: dir })));
        await this.buildLog.append(buildId, `Extracted: ${cb.packageFilename}`, 'info');

        const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
        const entries = fs.readdirSync(dir, { recursive: true, encoding: 'utf-8' });

        return {
          dir,
          safeName: this.toIdentifier(cb.componentName),
          hasDts: entries.some((e) => e.endsWith('.d.ts')),
          dependencies: (pkg.dependencies as Record<string, string>) ?? {},
        };
      }),
    );
  }

  private generateIndexJs(distDir: string, components: ComponentMeta[]) {
    const lines = components.map((c) => {
      const rel = path.relative(distDir, c.dir).replace(/\\/g, '/');
      return `export * as ${c.safeName} from './${rel}/index.js';`;
    });
    fs.writeFileSync(path.join(distDir, 'index.js'), lines.join('\n') + '\n', 'utf-8');
  }

  private generateIndexDts(distDir: string, components: ComponentMeta[]) {
    const lines = components.map((c) => {
      const rel = path.relative(distDir, c.dir).replace(/\\/g, '/');
      return `export * as ${c.safeName} from './${rel}/index';`;
    });
    fs.writeFileSync(path.join(distDir, 'index.d.ts'), lines.join('\n') + '\n', 'utf-8');
  }

  private generatePackageJson(distDir: string, repo: Repo, components: ComponentMeta[]) {
    const dependencies: Record<string, string> = {};
    for (const c of components) {
      Object.assign(dependencies, c.dependencies);
    }

    const hasDts = components.some((c) => c.hasDts);
    const pkg: Record<string, unknown> = {
      name: repo.name,
      type: 'module',
      main: './index.js',
      exports: {
        '.': {
          import: './index.js',
          ...(hasDts && { types: './index.d.ts' }),
        },
      },
      dependencies,
    };
    if (hasDts) pkg['types'] = './index.d.ts';

    fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf-8');
  }

  private toIdentifier(name: string): string {
    return name
      .replace(/^@[^/]+\//, '')
      .replace(/[-_](.)/g, (_, c: string) => c.toUpperCase());
  }
}
