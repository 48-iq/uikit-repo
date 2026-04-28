import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { Repo } from './repo.entity';

@Entity()
export class Component {
  @PrimaryColumn()
  id: string;

  @Column()
  version: string;

  @ManyToMany(() => Repo, (repo) => repo.components)
  repos: Repo[];

  @CreateDateColumn({type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)"})
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true})
  updatedAt?: Date;
}
