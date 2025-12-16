import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ description: '模板名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '模板代码（唯一标识）' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '模板描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '模板类型',
    enum: ['basic', 'specialty', 'custom']
  })
  @IsEnum(['basic', 'specialty', 'custom'])
  type: 'basic' | 'specialty' | 'custom';

  @ApiProperty({ description: '适用科室ID列表', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];

  @ApiProperty({ description: '模板配置（JSON格式）' })
  @IsObject()
  config: Record<string, any>;

  @ApiProperty({ description: '模板结构（JSON格式）' })
  @IsObject()
  structure: Record<string, any>;

  @ApiProperty({ description: '表单字段定义（JSON格式）', type: Array })
  @IsArray()
  fields: Record<string, any>[];

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

  @ApiProperty({ description: '模板标签', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}