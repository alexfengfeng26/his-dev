import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('templateHistories')
export class TemplateHistory {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  templateId: string;

  @Column()
  version: string;

  @Column({ type: 'json' })
  content: Record<string, any>;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  changeLog?: string;

  @CreateDateColumn()
  createdAt: Date;
}