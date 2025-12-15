import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ description: '真实姓名', required: false })
  @IsString()
  @IsOptional()
  realName?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: '科室ID', required: false })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ description: '角色ID列表', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleIds?: string[];

  @ApiProperty({
    description: '用户状态：active-激活，inactive-未激活，locked-锁定',
    enum: ['active', 'inactive', 'locked'],
    required: false
  })
  @IsEnum(['active', 'inactive', 'locked'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'locked';

  @ApiProperty({ description: '是否是超级管理员', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isSuperAdmin?: boolean;
}