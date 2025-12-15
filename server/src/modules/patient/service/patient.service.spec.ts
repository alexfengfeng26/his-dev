import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientService } from './patient.service';
import { Patient } from '../../../models/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto, QueryPatientDto } from '../dto/update-patient.dto';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('PatientService', () => {
  let service: PatientService;
  let repository: Repository<Patient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getRepositoryToken(Patient),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    repository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建患者', async () => {
      // 准备测试数据
      const createPatientDto: CreatePatientDto = {
        patientNo: 'TEST001',
        name: '测试患者',
        gender: 'male',
        birthDate: '1990-01-01',
        idCard: '110101199001011234',
        phone: '13800138001',
        address: '测试地址',
        bloodType: 'A',
      };

      const expectedPatient = {
        ...createPatientDto,
        age: 34, // 1990年出生
        status: 'active',
        createdBy: 'test-user-id',
      };

      // 模拟仓库方法
      (repository.findOne as jest.Mock)
        .mockResolvedValueOnce(null) // 检查患者编号
        .mockResolvedValueOnce(null) // 检查身份证号
        .mockResolvedValueOnce(null); // 检查手机号

      (repository.create as jest.Mock).mockReturnValue(expectedPatient);
      (repository.save as jest.Mock).mockResolvedValue({ ...expectedPatient, _id: 'test-id', createdAt: new Date(), updatedAt: new Date() });

      // 执行测试
      const result = await service.create(createPatientDto, 'test-user-id');

      // 验证结果
      expect(result).toBeDefined();
      expect(repository.findOne).toHaveBeenCalledTimes(3);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        ...createPatientDto,
        age: expect.any(Number),
        createdBy: 'test-user-id',
        status: 'active',
      }));
      expect(repository.save).toHaveBeenCalled();
    });

    it('当患者编号已存在时应该抛出ConflictException', async () => {
      // 准备测试数据
      const createPatientDto: CreatePatientDto = {
        patientNo: 'TEST001',
        name: '测试患者',
        gender: 'male',
        birthDate: '1990-01-01',
        idCard: '110101199001011234',
        phone: '13800138001',
        address: '测试地址',
      };

      // 模拟患者编号已存在
      (repository.findOne as jest.Mock).mockResolvedValueOnce({ patientNo: 'TEST001' });

      // 执行测试并验证异常
      await expect(service.create(createPatientDto, 'test-user-id'))
        .rejects.toThrow(ConflictException);
    });

    it('当身份证号与出生日期不一致时应该抛出BadRequestException', async () => {
      // 准备测试数据（身份证号和出生日期不匹配）
      const createPatientDto: CreatePatientDto = {
        patientNo: 'TEST001',
        name: '测试患者',
        gender: 'male',
        birthDate: '1990-01-01',
        idCard: '110101199501011234', // 1995年出生的身份证
        phone: '13800138001',
        address: '测试地址',
      };

      // 模拟患者编号不存在
      (repository.findOne as jest.Mock).mockResolvedValueOnce(null);

      // 执行测试并验证异常
      await expect(service.create(createPatientDto, 'test-user-id'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('应该返回分页的患者列表', async () => {
      // 准备测试数据
      const mockPatients = [
        { name: '患者1' },
        { name: '患者2' },
        { name: '患者3' },
      ];

      const queryDto: QueryPatientDto = { page: 1, limit: 10 };

      // 模拟仓库方法
      (repository.find as jest.Mock).mockResolvedValue(mockPatients as any[]);
      (repository.count as jest.Mock).mockResolvedValue(3);

      // 执行测试
      const result = await service.findAll(queryDto);

      // 验证结果
      expect(result.patients).toEqual(mockPatients);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(repository.count).toHaveBeenCalledWith({ where: {} });
    });

    it('应该根据查询条件筛选患者', async () => {
      // 准备测试数据
      const queryDto: QueryPatientDto = {
        page: 1,
        limit: 5,
        status: 'active',
        gender: 'male',
      };

      // 模拟仓库方法
      (repository.find as jest.Mock).mockResolvedValue([]);
      (repository.count as jest.Mock).mockResolvedValue(0);

      // 执行测试
      await service.findAll(queryDto);

      // 验证查询条件
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          status: 'active',
          gender: 'male',
        },
        skip: 0,
        take: 5,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('应该根据ID返回患者', async () => {
      // 准备测试数据 - 使用有效的ObjectId
      const mockPatient = { _id: '507f1f77bcf86cd799439011', name: '测试患者' };
      const patientId = '507f1f77bcf86cd799439011';

      // 模拟仓库方法
      (repository.findOne as jest.Mock).mockResolvedValue(mockPatient as any);

      // 执行测试
      const result = await service.findById(patientId);

      // 验证结果
      expect(result).toBe(mockPatient);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { _id: expect.any(Object) }
      });
    });

    it('当患者不存在时应该抛出NotFoundException', async () => {
      // 使用有效的ObjectId
      const patientId = '507f1f77bcf86cd799439012';

      // 模拟患者不存在
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // 执行测试并验证异常
      await expect(service.findById(patientId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('应该成功更新患者信息', async () => {
      // 准备测试数据
      const existingPatient = { _id: '507f1f77bcf86cd799439011', name: '原姓名' };
      const patientId = '507f1f77bcf86cd799439011';
      const updateDto: UpdatePatientDto = {
        name: '更新后的姓名',
        phone: '13800138999',
      };

      // 模拟仓库方法
      (repository.findOne as jest.Mock)
        .mockResolvedValueOnce(existingPatient as any) // findById
        .mockResolvedValueOnce(null); // 检查手机号是否重复

      (repository.save as jest.Mock).mockResolvedValue({ ...existingPatient, ...updateDto });

      // 执行测试
      const result = await service.update(patientId, updateDto);

      // 验证结果
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
    });

    it('当患者不存在时应该抛出NotFoundException', async () => {
      // 使用有效的ObjectId
      const patientId = '507f1f77bcf86cd799439012';

      // 模拟患者不存在
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // 执行测试并验证异常
      await expect(service.update(patientId, { name: '更新后的姓名' }))
        .rejects.toThrow(NotFoundException);
    });

    it('当状态为已故但没有死亡时间时应该抛出BadRequestException', async () => {
      // 准备测试数据
      const existingPatient = { _id: '507f1f77bcf86cd799439011', name: '测试患者' };
      const patientId = '507f1f77bcf86cd799439011';
      const updateDto: UpdatePatientDto = {
        status: 'deceased',
      };

      // 模拟患者存在
      (repository.findOne as jest.Mock).mockResolvedValue(existingPatient as any);

      // 执行测试并验证异常
      await expect(service.update(patientId, updateDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('应该成功删除患者', async () => {
      // 准备测试数据
      const existingPatient = { _id: '507f1f77bcf86cd799439011', name: '测试患者' };
      const patientId = '507f1f77bcf86cd799439011';

      // 模拟仓库方法
      (repository.findOne as jest.Mock).mockResolvedValue(existingPatient as any);
      (repository.remove as jest.Mock).mockResolvedValue(undefined);

      // 执行测试
      await expect(service.remove(patientId))
        .resolves.not.toThrow();

      expect(repository.remove).toHaveBeenCalledWith(existingPatient);
    });

    it('当患者不存在时应该抛出NotFoundException', async () => {
      // 使用有效的ObjectId
      const patientId = '507f1f77bcf86cd799439012';

      // 模拟患者不存在
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // 执行测试并验证异常
      await expect(service.remove(patientId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatistics', () => {
    it('应该返回正确的患者统计信息', async () => {
      // 准备测试数据
      const mockCounts = {
        totalPatients: 100,
        activePatients: 80,
        inactivePatients: 15,
        deceasedPatients: 5,
        malePatients: 55,
        femalePatients: 45,
      };

      // 模拟仓库方法
      (repository.count as jest.Mock)
        .mockResolvedValueOnce(mockCounts.totalPatients) // 总数
        .mockResolvedValueOnce(mockCounts.activePatients) // 活跃
        .mockResolvedValueOnce(mockCounts.inactivePatients) // 非活跃
        .mockResolvedValueOnce(mockCounts.deceasedPatients) // 已故
        .mockResolvedValueOnce(mockCounts.malePatients) // 男性
        .mockResolvedValueOnce(mockCounts.femalePatients); // 女性

      // 执行测试
      const result = await service.getStatistics();

      // 验证结果
      expect(result).toEqual({
        ...mockCounts,
        unknownGender: 0, // 100 - 55 - 45 = 0
      });

      // 验证调用次数
      expect(repository.count).toHaveBeenCalledTimes(6);
    });
  });
});