import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsPhoneNumber } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ description: '患者编号（医院内部编号）' })
  @IsString()
  patientNo: string;

  @ApiProperty({ description: '姓名' })
  @IsString()
  name: string;

  @ApiProperty({ description: '性别：male-男，female-女，unknown-未知', enum: ['male', 'female', 'unknown'] })
  @IsEnum(['male', 'female', 'unknown'])
  gender: 'male' | 'female' | 'unknown';

  @ApiProperty({ description: '出生日期' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ description: '身份证号' })
  @IsString()
  idCard: string;

  @ApiProperty({ description: '手机号' })
  @IsPhoneNumber('CN')
  phone: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '地址' })
  @IsString()
  address: string;

  @ApiProperty({ description: '职业', required: false })
  @IsOptional()
  @IsString()
  occupation?: string;

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
}