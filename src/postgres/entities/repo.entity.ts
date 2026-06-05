import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Build } from './build.entity';
import { RepoTag } from './repo-tag.enum';

@Entity({ name: 'repos' })
export class Repo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Build, (build) => build.repo)
  builds: Build[];

  @Column({
    type: 'enum',
    enum: RepoTag,
    array: true,
    nullable: true,
    default: [],
  })
  tags: RepoTag[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;
}
