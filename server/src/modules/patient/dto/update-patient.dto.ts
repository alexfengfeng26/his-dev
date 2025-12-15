import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsPhoneNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePatientDto {
  @ApiProperty({ description: '姓名', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '性别：male-男，female-女，unknown-未知', enum: ['male', 'female', 'unknown'], required: false })
  @IsOptional()
  @IsEnum(['male', 'female', 'unknown'])
  gender?: 'male' | 'female' | 'unknown';

  @ApiProperty({ description: '出生日期', required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ description: '身份证号', required: false })
  @IsOptional()
  @IsString()
  idCard?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsPhoneNumber('CN')
  phone?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '地址', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: '职业', required: false })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiProperty({ description: '科室', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: '血型：A、B、AB、O、unknown', enum: ['A', 'B', 'AB', 'O', 'unknown'], required: false })
  @IsOptional()
  @IsEnum(['A', 'B', 'AB', 'O', 'unknown'])
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'unknown';

  @ApiProperty({ description: '过敏史', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiProperty({ description: '既往病史', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalHistory?: string[];

  @ApiProperty({ description: '家族病史', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  familyHistory?: string[];

  @ApiProperty({ description: '紧急联系人姓名', required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ description: '紧急联系人关系', required: false })
  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  @ApiProperty({ description: '紧急联系人电话', required: false })
  @IsOptional()
  @IsPhoneNumber('CN')
  emergencyContactPhone?: string;

  @ApiProperty({ description: '患者状态：active-活跃，inactive-非活跃，deceased-已故', enum: ['active', 'inactive', 'deceased'], required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'deceased'])
  status?: 'active' | 'inactive' | 'deceased';

  @ApiProperty({ description: '死亡时间（仅当status为deceased时有值）', required: false })
  @IsOptional()
  @IsDateString()
  deathDate?: string;
}

export class QueryPatientDto {
  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ description: '患者姓名搜索', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '手机号搜索', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '身份证号搜索', required: false })
  @IsOptional()
  @IsString()
  idCard?: string;

  @ApiProperty({ description: '患者状态', enum: ['active', 'inactive', 'deceased'], required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'deceased'])
  status?: 'active' | 'inactive' | 'deceased';

  @ApiProperty({ description: '性别', enum: ['male', 'female', 'unknown'], required: false })
  @IsOptional()
  @IsEnum(['male', 'female', 'unknown'])
  gender?: 'male' | 'female' | 'unknown';

  @ApiProperty({ description: '科室筛选', required: false })
  @IsOptional()
  @IsString()
  department?: string;
}