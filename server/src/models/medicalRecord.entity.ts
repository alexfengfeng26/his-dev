import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('medicalRecords')
export class MedicalRecord {
  @ApiProperty({ description: '病历ID' })
  @ObjectIdColumn()
  _id: ObjectId;

  @ApiProperty({ description: '病历编号' })
  @Column({ unique: true })
  recordNo: string;

  @ApiProperty({ description: '患者ID' })
  @Column()
  patientId: string;

  @ApiProperty({ description: '就诊科室ID' })
  @Column()
  departmentId: string;

  @ApiProperty({ description: '就诊医生ID' })
  @Column()
  doctorId: string;

  @ApiProperty({ description: '就诊类型：outpatient-门诊，inpatient-住院，emergency-急诊' })
  @Column()
  visitType: 'outpatient' | 'inpatient' | 'emergency';

  @ApiProperty({ description: '就诊时间' })
  @Column()
  visitDate: Date;

  @ApiProperty({ description: '主诉' })
  @Column()
  chiefComplaint: string;

  @ApiProperty({ description: '现病史' })
  @Column()
  presentIllness: string;

  @ApiProperty({ description: '既往史' })
  @Column({ nullable: true })
  pastHistory?: string;

  @ApiProperty({ description: '个人史' })
  @Column({ nullable: true })
  personalHistory?: string;

  @ApiProperty({ description: '家族史' })
  @Column({ nullable: true })
  familyHistory?: string;

  @ApiProperty({ description: '体格检查（JSON格式）' })
  @Column({ type: 'json' })
  physicalExamination: Record<string, any>;

  @ApiProperty({ description: '辅助检查（JSON格式）' })
  @Column({ type: 'json', nullable: true })
  auxiliaryExamination?: Record<string, any>;

  @ApiProperty({ description: '初步诊断' })
  @Column({ type: 'simple-array' })
  diagnosis: string[];

  @ApiProperty({ description: '治疗方案' })
  @Column({ nullable: true })
  treatment?: string;

  @ApiProperty({ description: '处方信息（JSON格式）' })
  @Column({ type: 'json', nullable: true })
  prescription?: Record<string, any>;

  @ApiProperty({ description: '医嘱（JSON格式）' })
  @Column({ type: 'json', nullable: true })
  medicalOrders?: Record<string, any>;

  @ApiProperty({ description: '病历模板ID' })
  @Column({ nullable: true })
  templateId?: string;

  @ApiProperty({ description: '模板版本号' })
  @Column({ nullable: true })
  templateVersion?: string;

  @ApiProperty({ description: '自定义数据（JSON格式）' })
  @Column({ type: 'json', nullable: true })
  customData?: Record<string, any>;

  @ApiProperty({ description: '附件列表（图片、PDF等）' })
  @Column({ type: 'simple-array', nullable: true })
  attachments?: string[];

  @ApiProperty({ description: '病历状态：draft-草稿，submitted-已提交，approved-已审核，locked-已锁定' })
  @Column({ default: 'draft' })
  status: 'draft' | 'submitted' | 'approved' | 'locked';

  @ApiProperty({ description: '审核医生ID' })
  @Column({ nullable: true })
  approvedBy?: string;

  @ApiProperty({ description: '审核时间' })
  @Column({ nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: '审核意见' })
  @Column({ nullable: true })
  approvalComment?: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}