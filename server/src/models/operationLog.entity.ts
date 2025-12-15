import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('operationLogs')
export class OperationLog {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: string;

  @Column()
  username: string;

  @Column()
  action: string;

  @Column()
  resource: string;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column()
  ip: string;

  @Column({ type: 'json', nullable: true })
  requestData?: Record<string, any>;

  @Column({ default: 'success' })
  status: 'success' | 'error';

  @Column({ nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;
}