import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('templateMetas')
export class TemplateMeta {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  templateId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'simple-array', nullable: true })
  keywords?: string[];

  @Column({ default: 0 })
  usedCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}