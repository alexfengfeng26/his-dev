import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('patients')
export class Patient {
  @ApiProperty({ description: '患者ID', type: String })
  @ObjectIdColumn()
  _id: ObjectId;

  @ApiProperty({ description: '患者编号（医院内部编号）' })
  @Column({ unique: true })
  patientNo: string;

  @ApiProperty({ description: '姓名' })
  @Column()
  name: string;

  @ApiProperty({ description: '性别：male-男，female-女，unknown-未知' })
  @Column()
  gender: 'male' | 'female' | 'unknown';

  @ApiProperty({ description: '出生日期' })
  @Column()
  birthDate: Date;

  @ApiProperty({ description: '年龄（自动计算）' })
  @Column()
  age: number;

  @ApiProperty({ description: '身份证号' })
  @Column({ unique: true })
  idCard: string;

  @ApiProperty({ description: '手机号' })
  @Column()
  phone: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ nullable: true })
  email?: string;

  @ApiProperty({ description: '地址' })
  @Column()
  address: string;

  @ApiProperty({ description: '职业' })
  @Column({ nullable: true })
  occupation?: string;

  @ApiProperty({ description: '科室' })
  @Column({ nullable: true })
  department?: string;

  @ApiProperty({ description: '血型：A、B、AB、O、unknown' })
  @Column({ default: 'unknown' })
  bloodType: 'A' | 'B' | 'AB' | 'O' | 'unknown';

  @ApiProperty({ description: '过敏史' })
  @Column({ type: 'simple-array', nullable: true })
  allergies?: string[];

  @ApiProperty({ description: '既往病史' })
  @Column({ type: 'simple-array', nullable: true })
  medicalHistory?: string[];

  @ApiProperty({ description: '家族病史' })
  @Column({ type: 'simple-array', nullable: true })
  familyHistory?: string[];

  @ApiProperty({ description: '紧急联系人姓名' })
  @Column({ nullable: true })
  emergencyContactName?: string;

  @ApiProperty({ description: '紧急联系人关系' })
  @Column({ nullable: true })
  emergencyContactRelation?: string;

  @ApiProperty({ description: '紧急联系人电话' })
  @Column({ nullable: true })
  emergencyContactPhone?: string;

  @ApiProperty({ description: '患者状态：active-活跃，inactive-非活跃，deceased-已故' })
  @Column({ default: 'active' })
  status: 'active' | 'inactive' | 'deceased';

  @ApiProperty({ description: '死亡时间（仅当status为deceased时有值）' })
  @Column({ nullable: true })
  deathDate?: Date;

  @ApiProperty({ description: '创建医生ID' })
  @Column()
  createdBy: string;

  @ApiProperty({ description: '软删除时间' })
  @Column({ nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: '删除操作人ID' })
  @Column({ nullable: true })
  deletedBy?: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}