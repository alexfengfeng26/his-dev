import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryUserDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ description: '用户名', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: '真实姓名', required: false })
  @IsString()
  @IsOptional()
  realName?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: '用户状态：active-激活，inactive-未激活，locked-锁定',
    enum: ['active', 'inactive', 'locked'],
    required: false
  })
  @IsEnum(['active', 'inactive', 'locked'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'locked';

  @ApiProperty({ description: '科室ID', required: false })
  @IsString()
  @IsOptional()
  departmentId?: string;
}