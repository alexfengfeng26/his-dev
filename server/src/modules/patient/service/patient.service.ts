import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Patient } from '../../../models/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto, QueryPatientDto } from '../dto/update-patient.dto';
import { Logger } from '../../../common/logger/logger';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  /**
   * 创建患者
   */
  async create(createPatientDto: CreatePatientDto, createdBy: string): Promise<Patient> {
    Logger.info(`创建患者: ${createPatientDto.name}`);

    // 检查患者编号是否已存在
    const existingPatientNo = await this.patientRepository.findOne({
      where: { patientNo: createPatientDto.patientNo }
    });
    if (existingPatientNo) {
      throw new ConflictException('患者编号已存在');
    }

    // 检查身份证号是否已存在
    const existingIdCard = await this.patientRepository.findOne({
      where: { idCard: createPatientDto.idCard }
    });
    if (existingIdCard) {
      throw new ConflictException('身份证号已存在');
    }

    // 检查手机号是否已存在
    const existingPhone = await this.patientRepository.findOne({
      where: { phone: createPatientDto.phone }
    });
    if (existingPhone) {
      throw new ConflictException('手机号已被注册');
    }

    // 验证出生日期和身份证号的一致性
    this.validateIdCardWithBirthDate(createPatientDto.idCard, createPatientDto.birthDate);

    // 计算年龄
    const age = this.calculateAge(createPatientDto.birthDate);

    const patient = this.patientRepository.create({
      ...createPatientDto,
      age,
      createdBy,
      status: 'active',
    });

    const savedPatient = await this.patientRepository.save(patient);

    Logger.info(`患者创建成功: ${savedPatient.name} (ID: ${savedPatient._id})`);
    return savedPatient;
  }

  /**
   * 分页查询患者列表
   */
  async findAll(queryDto: QueryPatientDto) {
    const { page = 1, limit = 10, name, phone, idCard, status, gender } = queryDto;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    // 简化查询，暂时移除正则表达式
    if (status) {
      where.status = status;
    }

    if (gender) {
      where.gender = gender;
    }

    // 注意：需要实现前端搜索逻辑或使用原生的MongoDB查询

    const [patients, total] = await Promise.all([
      this.patientRepository.find({
        where,
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      }),
      this.patientRepository.count({ where }),
    ]);

    return {
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查找患者
   */
  async findById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });

    if (!patient) {
      throw new NotFoundException('患者不存在');
    }

    return patient;
  }

  /**
   * 更新患者信息
   */
  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    Logger.info(`更新患者信息: ID ${id}`);

    const patient = await this.findById(id);

    // 如果更新身份证号，检查是否重复
    if (updatePatientDto.idCard && updatePatientDto.idCard !== patient.idCard) {
      const existingIdCard = await this.patientRepository.findOne({
        where: { idCard: updatePatientDto.idCard }
      });
      if (existingIdCard) {
        throw new ConflictException('身份证号已被使用');
      }
    }

    // 如果更新手机号，检查是否重复
    if (updatePatientDto.phone && updatePatientDto.phone !== patient.phone) {
      const existingPhone = await this.patientRepository.findOne({
        where: { phone: updatePatientDto.phone }
      });
      if (existingPhone) {
        throw new ConflictException('手机号已被使用');
      }
    }

    // 如果更新出生日期，验证身份证号一致性
    if (updatePatientDto.birthDate && updatePatientDto.idCard) {
      this.validateIdCardWithBirthDate(updatePatientDto.idCard, updatePatientDto.birthDate);
    }

    // 如果状态改为已故，必须有死亡时间
    if (updatePatientDto.status === 'deceased' && !updatePatientDto.deathDate) {
      throw new BadRequestException('状态为已故时必须提供死亡时间');
    }

    // 重新计算年龄
    if (updatePatientDto.birthDate) {
      updatePatientDto['age'] = this.calculateAge(updatePatientDto.birthDate);
    }

    Object.assign(patient, updatePatientDto);
    const updatedPatient = await this.patientRepository.save(patient);

    Logger.info(`患者信息更新成功: ${updatedPatient.name} (ID: ${updatedPatient._id})`);
    return updatedPatient;
  }

  /**
   * 删除患者（软删除）
   */
  async remove(id: string): Promise<void> {
    Logger.info(`删除患者: ID ${id}`);

    const patient = await this.findById(id);

    // 检查患者是否有关联的病历记录
    // TODO: 检查MedicalRecord表中是否有该患者的记录
    // const hasMedicalRecords = await this.medicalRecordRepository.count({ where: { patientId: id } });
    // if (hasMedicalRecords > 0) {
    //   throw new BadRequestException('该患者有关联的病历记录，无法删除');
    // }

    await this.patientRepository.remove(patient);
    Logger.info(`患者删除成功: ${patient.name} (ID: ${id})`);
  }

  /**
   * 根据身份证号查找患者
   */
  async findByIdCard(idCard: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { idCard },
    });

    if (!patient) {
      throw new NotFoundException('根据身份证号未找到患者');
    }

    return patient;
  }

  /**
   * 根据手机号查找患者
   */
  async findByPhone(phone: string): Promise<Patient[]> {
    // 暂时使用简单匹配，后续可以实现更复杂的搜索逻辑
    return this.patientRepository.find({
      where: { phone },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据姓名查找患者
   */
  async findByName(name: string): Promise<Patient[]> {
    // 暂时使用简单匹配，后续可以实现更复杂的搜索逻辑
    return this.patientRepository.find({
      where: { name },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取患者统计信息
   */
  async getStatistics() {
    const [
      totalPatients,
      activePatients,
      inactivePatients,
      deceasedPatients,
      malePatients,
      femalePatients,
    ] = await Promise.all([
      this.patientRepository.count(),
      this.patientRepository.count({ where: { status: 'active' } }),
      this.patientRepository.count({ where: { status: 'inactive' } }),
      this.patientRepository.count({ where: { status: 'deceased' } }),
      this.patientRepository.count({ where: { gender: 'male' } }),
      this.patientRepository.count({ where: { gender: 'female' } }),
    ]);

    return {
      totalPatients,
      activePatients,
      inactivePatients,
      deceasedPatients,
      malePatients,
      femalePatients,
      unknownGender: totalPatients - malePatients - femalePatients,
    };
  }

  /**
   * 验证身份证号与出生日期的一致性
   */
  private validateIdCardWithBirthDate(idCard: string, birthDate: string): void {
    // 从身份证号提取出生日期
    let idCardBirthDate: string;
    if (idCard.length === 18) {
      idCardBirthDate = idCard.substring(6, 14);
    } else if (idCard.length === 15) {
      idCardBirthDate = '19' + idCard.substring(6, 12);
    } else {
      throw new BadRequestException('身份证号格式不正确');
    }

    // 格式化日期
    const formattedBirthDate = birthDate.replace(/-/g, '');
    const formattedIdCardDate = idCardBirthDate.substring(0, 8);

    if (formattedBirthDate !== formattedIdCardDate) {
      throw new BadRequestException('出生日期与身份证号不一致');
    }
  }

  /**
   * 计算年龄
   */
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }
}