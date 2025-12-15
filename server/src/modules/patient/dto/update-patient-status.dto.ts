import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export class UpdatePatientStatusDto {
  @ApiProperty({
    description: '患者状态：active-活跃，inactive-非活跃，deceased-已故',
    enum: ['active', 'inactive', 'deceased']
  })
  @IsEnum(['active', 'inactive', 'deceased'])
  status: 'active' | 'inactive' | 'deceased';

  @ApiProperty({
    description: '死亡时间（仅当status为deceased时必填）',
    required: false
  })
  @IsOptional()
  @IsDateString()
  deathDate?: string;
}