import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsObject, IsBoolean, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTemplateDto {
  @ApiProperty({ description: '模板代码', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '模板名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '模板描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '模板类型',
    enum: ['basic', 'specialty', 'custom'],
    required: false
  })
  @IsOptional()
  @IsEnum(['basic', 'specialty', 'custom'])
  type?: 'basic' | 'specialty' | 'custom';

  @ApiProperty({ description: '适用科室ID列表', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];

  @ApiProperty({ description: '模板配置（JSON格式）', required: false })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiProperty({ description: '模板结构（JSON格式）', required: false })
  @IsOptional()
  @IsObject()
  structure?: Record<string, any>;

  @ApiProperty({ description: '表单字段定义（JSON格式）', required: false, type: Array })
  @IsOptional()
  @IsArray()
  fields?: Record<string, any>[];

  @ApiProperty({ description: '验证规则（JSON格式）', required: false })
  @IsOptional()
  @IsObject()
  validationRules?: Record<string, any>;

  @ApiProperty({ description: '版本号', required: false })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ description: '是否为系统模板', required: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ description: '模板标签', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class QueryTemplateDto {
  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ description: '模板名称搜索', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '模板代码搜索', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: '模板类型',
    enum: ['basic', 'specialty', 'custom'],
    required: false
  })
  @IsOptional()
  @IsEnum(['basic', 'specialty', 'custom'])
  type?: 'basic' | 'specialty' | 'custom';

  @ApiProperty({ description: '科室ID筛选', required: false })
  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @ApiProperty({ description: '创建者ID筛选', required: false })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  @ApiProperty({ description: '是否系统模板', required: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ description: '标签筛选', required: false })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiProperty({ description: '关键词搜索', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;
}