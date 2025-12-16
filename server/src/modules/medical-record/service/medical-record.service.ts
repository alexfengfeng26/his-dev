import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { MedicalRecord } from '../../../models/medical-record.entity';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { UpdateMedicalRecordDto, QueryMedicalRecordDto } from '../dto/update-medical-record.dto';
import { Logger } from '../../../common/logger/logger';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
  ) {}

  /**
   * 创建病历
   */
  async create(createMedicalRecordDto: CreateMedicalRecordDto, createdBy: string): Promise<MedicalRecord> {
    Logger.info(`创建病历: ${createMedicalRecordDto.recordNo}`);

    // 检查病历编号是否已存在
    const existingRecord = await this.medicalRecordRepository.findOne({
      where: { recordNo: createMedicalRecordDto.recordNo }
    });
    if (existingRecord) {
      throw new ConflictException('病历编号已存在');
    }

    // 验证患者是否存在
    // TODO: 检查Patient表中是否存在该患者
    // const patient = await this.patientRepository.findOne({ where: { _id: new ObjectId(createMedicalRecordDto.patientId) } });
    // if (!patient) {
    //   throw new NotFoundException('患者不存在');
    // }

    // 验证医生是否存在
    // TODO: 检查User表中是否存在该医生
    // const doctor = await this.userRepository.findOne({ where: { _id: new ObjectId(createMedicalRecordDto.doctorId) } });
    // if (!doctor) {
    //   throw new NotFoundException('医生不存在');
    // }

    // 如果状态为完成，必须有必要的诊断信息
    if (createMedicalRecordDto.status === 'completed' && (!createMedicalRecordDto.diagnosis || createMedicalRecordDto.diagnosis.length === 0)) {
      throw new BadRequestException('完成状态的病历必须包含诊断信息');
    }

    const medicalRecord = this.medicalRecordRepository.create({
      ...createMedicalRecordDto,
      visitDate: new Date(createMedicalRecordDto.visitDate),
      followUpDate: createMedicalRecordDto.followUpDate ? new Date(createMedicalRecordDto.followUpDate) : undefined,
      doctorId: createdBy, // 使用当前登录用户作为医生ID
    });

    const savedRecord = await this.medicalRecordRepository.save(medicalRecord);

    Logger.info(`病历创建成功: ${savedRecord.recordNo} (ID: ${savedRecord._id})`);
    return savedRecord;
  }

  /**
   * 分页查询病历列表
   */
  async findAll(queryDto: QueryMedicalRecordDto) {
    const { page = 1, limit = 10, patientId, doctorId, type, department, startDate, endDate, status, keyword } = queryDto;
    const skip = (page - 1) * limit;

    // 构建查询条件 - 使用MongoDB原生查询支持模糊搜索
    const where: any = {};

    // 患者筛选
    if (patientId) {
      where.patientId = patientId;
    }

    // 医生筛选
    if (doctorId) {
      where.doctorId = doctorId;
    }

    // 病历类型筛选
    if (type) {
      where.type = type;
    }

    // 科室筛选
    if (department) {
      where.department = { $regex: department, $options: 'i' };
    }

    // 日期范围筛选
    if (startDate || endDate) {
      where.visitDate = {};
      if (startDate) {
        where.visitDate.$gte = new Date(startDate);
      }
      if (endDate) {
        where.visitDate.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 关键词搜索（主诉、诊断、治疗方案等）
    if (keyword) {
      where.$or = [
        { chiefComplaint: { $regex: keyword, $options: 'i' } },
        { diagnosis: { $regex: keyword, $options: 'i' } },
        { treatment: { $regex: keyword, $options: 'i' } },
        { medicalAdvice: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 排除已软删除的记录
    where.deletedAt = { $exists: false };

    const [records, total] = await Promise.all([
      this.medicalRecordRepository.find({
        where,
        skip,
        take: limit,
        order: { visitDate: 'DESC', createdAt: 'DESC' },
      }),
      this.medicalRecordRepository.count({ where }),
    ]);

    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查找病历
   */
  async findById(id: string): Promise<MedicalRecord> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException('无效的病历ID');
    }

    const record = await this.medicalRecordRepository.findOne({
      where: { _id: objectId } as any,
    });

    if (!record) {
      throw new NotFoundException('病历不存在');
    }

    return record;
  }

  /**
   * 更新病历信息
   */
  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    Logger.info(`更新病历信息: ID ${id}`);

    const record = await this.findById(id);

    // 如果更新病历编号，检查是否重复
    if (updateMedicalRecordDto.recordNo && updateMedicalRecordDto.recordNo !== record.recordNo) {
      const existingRecord = await this.medicalRecordRepository.findOne({
        where: { recordNo: updateMedicalRecordDto.recordNo }
      });
      if (existingRecord) {
        throw new ConflictException('病历编号已存在');
      }
    }

    // 如果状态改为完成，必须有必要的诊断信息
    if (updateMedicalRecordDto.status === 'completed' &&
        updateMedicalRecordDto.diagnosis &&
        updateMedicalRecordDto.diagnosis.length === 0) {
      throw new BadRequestException('完成状态的病历必须包含诊断信息');
    }

    // 处理日期字段
    const updateData = { ...updateMedicalRecordDto };
    if (updateMedicalRecordDto.visitDate) {
      (updateData as any).visitDate = new Date(updateMedicalRecordDto.visitDate);
    }
    if (updateMedicalRecordDto.followUpDate) {
      (updateData as any).followUpDate = new Date(updateMedicalRecordDto.followUpDate);
    }

    Object.assign(record, updateData);
    const updatedRecord = await this.medicalRecordRepository.save(record);

    Logger.info(`病历信息更新成功: ${updatedRecord.recordNo} (ID: ${updatedRecord._id})`);
    return updatedRecord;
  }

  /**
   * 删除病历（软删除）
   */
  async remove(id: string, deletedBy?: string): Promise<void> {
    Logger.info(`删除病历: ID ${id}`);

    const record = await this.findById(id);

    // 检查病历状态是否允许删除
    if (record.status === 'completed') {
      throw new BadRequestException('已完成的病历不能删除，只能归档');
    }

    // 执行软删除
    record.deletedAt = new Date();
    record.deletedBy = deletedBy;
    await this.medicalRecordRepository.save(record);

    Logger.info(`病历软删除成功: ${record.recordNo} (ID: ${id})`);
  }

  /**
   * 获取患者病历列表
   */
  async findByPatientId(patientId: string, queryDto: QueryMedicalRecordDto) {
    return this.findAll({ ...queryDto, patientId });
  }

  /**
   * 获取医生病历列表
   */
  async findByDoctorId(doctorId: string, queryDto: QueryMedicalRecordDto) {
    return this.findAll({ ...queryDto, doctorId });
  }

  /**
   * 更新病历状态
   */
  async updateStatus(id: string, status: string): Promise<MedicalRecord> {
    Logger.info(`更新病历状态: ID ${id} -> ${status}`);

    const record = await this.findById(id);

    // 如果状态改为完成，必须有必要的诊断信息
    if (status === 'completed' && (!record.diagnosis || record.diagnosis.length === 0)) {
      throw new BadRequestException('完成状态的病历必须包含诊断信息');
    }

    record.status = status as any;
    const updatedRecord = await this.medicalRecordRepository.save(record);

    Logger.info(`病历状态更新成功: ${updatedRecord.recordNo} -> ${status}`);
    return updatedRecord;
  }

  /**
   * 根据病历编号查找
   */
  async findByRecordNo(recordNo: string): Promise<MedicalRecord> {
    const record = await this.medicalRecordRepository.findOne({
      where: { recordNo },
    });

    if (!record) {
      throw new NotFoundException('病历不存在');
    }

    return record;
  }

  /**
   * 获取病历统计信息
   */
  async getStatistics(doctorId?: string) {
    const where: any = { deletedAt: { $exists: false } };

    if (doctorId) {
      where.doctorId = doctorId;
    }

    const [
      totalRecords,
      outpatientRecords,
      inpatientRecords,
      emergencyRecords,
      draftRecords,
      completedRecords,
      archivedRecords,
    ] = await Promise.all([
      this.medicalRecordRepository.count({ where }),
      this.medicalRecordRepository.count({ where: { ...where, type: 'outpatient' } }),
      this.medicalRecordRepository.count({ where: { ...where, type: 'inpatient' } }),
      this.medicalRecordRepository.count({ where: { ...where, type: 'emergency' } }),
      this.medicalRecordRepository.count({ where: { ...where, status: 'draft' } }),
      this.medicalRecordRepository.count({ where: { ...where, status: 'completed' } }),
      this.medicalRecordRepository.count({ where: { ...where, status: 'archived' } }),
    ]);

    return {
      totalRecords,
      outpatientRecords,
      inpatientRecords,
      emergencyRecords,
      draftRecords,
      completedRecords,
      archivedRecords,
    };
  }
}