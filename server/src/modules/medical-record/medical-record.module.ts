import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../../models/medical-record.entity';
import { MedicalRecordService } from './service/medical-record.service';
import { MedicalRecordController } from './controller/medical-record.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord])],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService],
  exports: [MedicalRecordService],
})
export class MedicalRecordModule {}