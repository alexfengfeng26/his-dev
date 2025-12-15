import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;
}