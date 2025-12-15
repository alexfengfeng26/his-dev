import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('templates')
export class Template {
  @ApiProperty({ description: '模板ID' })
  @ObjectIdColumn()
  _id: ObjectId;

  @ApiProperty({ description: '模板名称' })
  @Column()
  name: string;

  @ApiProperty({ description: '模板代码（唯一标识）' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ description: '模板描述' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: '模板类型：basic-基础模板，specialty-专科模板，custom-自定义模板' })
  @Column()
  type: 'basic' | 'specialty' | 'custom';

  @ApiProperty({ description: '适用科室ID列表' })
  @Column({ type: 'simple-array', nullable: true })
  departmentIds?: string[];

  @ApiProperty({ description: '模板配置（JSON格式）' })
  @Column({ type: 'json' })
  config: Record<string, any>;

  @ApiProperty({ description: '模板结构（JSON格式）' })
  @Column({ type: 'json' })
  structure: Record<string, any>;

  @ApiProperty({ description: '表单字段定义（JSON格式）' })
  @Column({ type: 'json' })
  fields: Record<string, any>[];

  @ApiProperty({ description: '验证规则（JSON格式）' })
  @Column({ type: 'json', nullable: true })
  validationRules?: Record<string, any>;

  @ApiProperty({ description: '版本号' })
  @Column({ default: '1.0.0' })
  version: string;

  @ApiProperty({ description: '是否为系统模板' })
  @Column({ default: false })
  isSystem: boolean;

  @ApiProperty({ description: '是否启用' })
  @Column({ default: true })
  isEnabled: boolean;

  @ApiProperty({ description: '使用次数' })
  @Column({ default: 0 })
  usageCount: number;

  @ApiProperty({ description: '模板标签' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiProperty({ description: '创建者ID' })
  @Column()
  createdBy: string;

  @ApiProperty({ description: '最后修改者ID' })
  @Column({ nullable: true })
  lastModifiedBy?: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}