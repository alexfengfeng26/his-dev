import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, IsDateString, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: '患者ID' })
  @IsMongoId()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ description: '医生ID' })
  @IsMongoId()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ description: '病历编号（医院内部编号）' })
  @IsString()
  @IsNotEmpty()
  recordNo: string;

  @ApiProperty({
    description: '病历类型',
    enum: ['outpatient', 'inpatient', 'emergency']
  })
  @IsEnum(['outpatient', 'inpatient', 'emergency'])
  type: 'outpatient' | 'inpatient' | 'emergency';

  @ApiProperty({ description: '就诊科室' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: '就诊日期' })
  @IsDateString()
  @IsNotEmpty()
  visitDate: string;

  @ApiProperty({ description: '主诉' })
  @IsString()
  @IsNotEmpty()
  chiefComplaint: string;

  @ApiProperty({ description: '现病史', required: false })
  @IsOptional()
  @IsString()
  presentIllness?: string;

  @ApiProperty({ description: '既往史', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pastHistory?: string[];

  @ApiProperty({ description: '体格检查', required: false })
  @IsOptional()
  @IsString()
  physicalExam?: string;

  @ApiProperty({ description: '辅助检查', required: false })
  @IsOptional()
  @IsString()
  auxiliaryExam?: string;

  @ApiProperty({ description: '初步诊断', type: [String] })
  @IsArray()
  @IsString({ each: true })
  diagnosis: string[];

  @ApiProperty({ description: '治疗方案', required: false })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiProperty({ description: '处方信息', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prescription?: string[];

  @ApiProperty({ description: '医嘱', required: false })
  @IsOptional()
  @IsString()
  medicalAdvice?: string;

  @ApiProperty({ description: '复诊时间', required: false })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiProperty({
    description: '病历状态',
    enum: ['draft', 'completed', 'archived'],
    default: 'draft',
    required: false
  })
  @IsOptional()
  @IsEnum(['draft', 'completed', 'archived'])
  status?: 'draft' | 'completed' | 'archived';

  @ApiProperty({ description: '模板ID（如果基于模板创建）', required: false })
  @IsOptional()
  @IsMongoId()
  templateId?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}