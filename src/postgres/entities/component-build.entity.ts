import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { Build } from './build.entity';


@Entity({ name: 'component_builds' })
export class ComponentBuild {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  componentBuildId: string;

  @Column({ type: 'uuid' })
  componentId: string;

  @Column({ type: 'text' })
  componentName: string;

  @Column({ type: 'text' })
  componentUsername: string;

  @Column({ type: 'text' })
  packageFilename: string;

  @Column({ type: 'integer' })
  buildVersion: number;

  @ManyToOne(() => Build, (build) => build.componentBuilds)
  @JoinColumn({ name: 'buildId' })
  build: Build;
}
