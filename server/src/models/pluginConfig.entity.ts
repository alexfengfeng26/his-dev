import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pluginConfigs')
export class PluginConfig {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  pluginId: string;

  @Column({ type: 'json' })
  settings: Record<string, any>;

  @Column()
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}