import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID' })
  @ObjectIdColumn()
  _id: ObjectId;

  @ApiProperty({ description: '用户名' })
  @Column()
  username: string;

  @ApiProperty({ description: '密码（加密存储）' })
  @Column()
  password: string;

  @ApiProperty({ description: '真实姓名' })
  @Column()
  realName: string;

  @ApiProperty({ description: '邮箱' })
  @Column()
  email: string;

  @ApiProperty({ description: '手机号' })
  @Column()
  phone: string;

  @ApiProperty({ description: '头像URL' })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({ description: '科室ID' })
  @Column()
  departmentId: string;

  @ApiProperty({ description: '角色ID列表' })
  @Column({ type: 'simple-array' })
  roleIds: string[];

  @ApiProperty({ description: '用户状态：active-激活，inactive-未激活，locked-锁定' })
  @Column({ default: 'active' })
  status: 'active' | 'inactive' | 'locked';

  @ApiProperty({ description: '最后登录时间' })
  @Column({ nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: '最后登录IP' })
  @Column({ nullable: true })
  lastLoginIp?: string;

  @ApiProperty({ description: '是否是超级管理员' })
  @Column({ default: false })
  isSuperAdmin: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}