import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Repo } from './repo.entity';
import { ComponentBuild } from './component-build.entity';

export enum BuildStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('builds')
export class Build {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Repo, (repo) => repo.builds)
  @JoinColumn({ name: 'repoId' })
  repo: Repo;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'enum', enum: BuildStatus, default: BuildStatus.PENDING })
  status: BuildStatus;

  @Column({ type: 'text', nullable: true })
  logs: string;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  finishedAt?: Date;

  @OneToMany(() => ComponentBuild, (componentBuild) => componentBuild.build)
  componentBuilds: ComponentBuild[]

  @Column({ default: 'repo' })
  type: string;
}