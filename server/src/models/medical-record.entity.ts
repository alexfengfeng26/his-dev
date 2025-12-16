import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('medical_records')
export class MedicalRecord {
  @ApiProperty({ description: '病历ID', type: String })
  @ObjectIdColumn()
  _id: ObjectId;

  @ApiProperty({ description: '患者ID' })
  @Column()
  patientId: string;

  @ApiProperty({ description: '医生ID' })
  @Column()
  doctorId: string;

  @ApiProperty({ description: '病历编号', type: String })
  @Column({ unique: true })
  recordNo: string;

  @ApiProperty({ description: '病历类型：outpatient-门诊，inpatient-住院，emergency-急诊' })
  @Column()
  type: 'outpatient' | 'inpatient' | 'emergency';

  @ApiProperty({ description: '就诊科室' })
  @Column()
  department: string;

  @ApiProperty({ description: '就诊日期' })
  @Column()
  visitDate: Date;

  @ApiProperty({ description: '主诉' })
  @Column({ type: 'text' })
  chiefComplaint: string;

  @ApiProperty({ description: '现病史' })
  @Column({ type: 'text', nullable: true })
  presentIllness: string;

  @ApiProperty({ description: '既往史' })
  @Column({ type: 'simple-array', nullable: true })
  pastHistory?: string[];

  @ApiProperty({ description: '体格检查' })
  @Column({ type: 'text', nullable: true })
  physicalExam: string;

  @ApiProperty({ description: '辅助检查' })
  @Column({ type: 'text', nullable: true })
  auxiliaryExam: string;

  @ApiProperty({ description: '初步诊断' })
  @Column({ type: 'simple-array' })
  diagnosis: string[];

  @ApiProperty({ description: '治疗方案' })
  @Column({ type: 'text', nullable: true })
  treatment: string;

  @ApiProperty({ description: '处方信息' })
  @Column({ type: 'simple-array', nullable: true })
  prescription?: string[];

  @ApiProperty({ description: '医嘱' })
  @Column({ type: 'text', nullable: true })
  medicalAdvice: string;

  @ApiProperty({ description: '复诊时间', nullable: true })
  @Column({ nullable: true })
  followUpDate?: Date;

  @ApiProperty({ description: '病历状态：draft-草稿，completed-完成，archived-归档' })
  @Column({ default: 'draft' })
  status: 'draft' | 'completed' | 'archived';

  @ApiProperty({ description: '模板ID（如果基于模板创建）', nullable: true })
  @Column({ nullable: true })
  templateId?: string;

  @ApiProperty({ description: '备注', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: '软删除时间', nullable: true })
  @Column({ nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: '删除操作人ID', nullable: true })
  @Column({ nullable: true })
  deletedBy?: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}