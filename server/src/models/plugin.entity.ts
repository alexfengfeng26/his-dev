import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plugins')
export class Plugin {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  version: string;

  @Column()
  description: string;

  @Column()
  entry: string;

  @Column({ type: 'json' })
  config: Record<string, any>;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ default: false })
  isSystem: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}