import { BuildOptions } from '../models/build-options.interface';
import { BuildResult } from '../models/build-result.interface';

export abstract class BuildService {
  abstract buildAndSave(buildOptions: BuildOptions): Promise<BuildResult>;
}
