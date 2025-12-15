import { ObjectId } from 'mongodb';
import { Patient } from '../models/patient.entity';
import { CreatePatientDto } from '../modules/patient/dto/create-patient.dto';

/**
 * 测试辅助工具类
 */
export class TestHelpers {
  /**
   * 生成测试患者数据
   */
  static generateTestPatient(overrides: Partial<CreatePatientDto> = {}): CreatePatientDto {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return {
      patientNo: `TEST${timestamp}${randomSuffix}`,
      name: `测试患者${randomSuffix}`,
      gender: 'male',
      birthDate: '1990-01-01',
      idCard: `11010119900101123${randomSuffix}`,
      phone: `1380013800${randomSuffix.slice(-1)}`,
      address: `测试地址${randomSuffix}`,
      bloodType: 'A',
      allergies: ['青霉素'],
      medicalHistory: ['高血压'],
      familyHistory: ['糖尿病'],
      emergencyContactName: `紧急联系人${randomSuffix}`,
      emergencyContactRelation: '配偶',
      emergencyContactPhone: `1390013900${randomSuffix.slice(-1)}`,
      ...overrides
    };
  }

  /**
   * 生成多个测试患者
   */
  static generateTestPatients(count: number): CreatePatientDto[] {
    return Array.from({ length: count }, (_, index) =>
      this.generateTestPatient({
        name: `测试患者${(index + 1).toString().padStart(3, '0')}`,
        idCard: `11010119900101${(index + 1).toString().padStart(3, '0')}`,
        phone: `1380013800${index.toString().padStart(1, '0')}`,
      })
    );
  }

  /**
   * 创建患者实体
   */
  static createPatientEntity(overrides: Partial<Patient> = {}): Patient {
    const objectId = new ObjectId();
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return {
      _id: objectId,
      patientNo: `PAT${timestamp}${randomSuffix}`,
      name: `测试患者${randomSuffix}`,
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      age: 34,
      idCard: `11010119900101123${randomSuffix}`,
      phone: `1380013800${randomSuffix.slice(-1)}`,
      address: `测试地址${randomSuffix}`,
      occupation: '软件工程师',
      bloodType: 'A',
      allergies: ['青霉素'],
      medicalHistory: ['高血压'],
      familyHistory: ['糖尿病'],
      emergencyContactName: `紧急联系人${randomSuffix}`,
      emergencyContactRelation: '配偶',
      emergencyContactPhone: `1390013900${randomSuffix.slice(-1)}`,
      status: 'active',
      createdBy: new ObjectId().toHexString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * 验证患者数据
   */
  static validatePatient(patient: Patient): void {
    expect(patient).toBeDefined();
    expect(patient._id).toBeDefined();
    expect(patient.patientNo).toBeDefined();
    expect(patient.name).toBeDefined();
    expect(patient.gender).toBeDefined();
    expect(patient.birthDate).toBeDefined();
    expect(patient.age).toBeGreaterThanOrEqual(0);
    expect(patient.idCard).toBeDefined();
    expect(patient.phone).toBeDefined();
    expect(patient.status).toBeDefined();
    expect(patient.createdBy).toBeDefined();
    expect(patient.createdAt).toBeDefined();
    expect(patient.updatedAt).toBeDefined();
  }

  /**
   * 验证两个患者对象是否相等（忽略ID和时间戳）
   */
  static comparePatientData(actual: Patient, expected: Partial<Patient>): void {
    if (expected.name) expect(actual.name).toBe(expected.name);
    if (expected.gender) expect(actual.gender).toBe(expected.gender);
    if (expected.patientNo) expect(actual.patientNo).toBe(expected.patientNo);
    if (expected.idCard) expect(actual.idCard).toBe(expected.idCard);
    if (expected.phone) expect(actual.phone).toBe(expected.phone);
    if (expected.address) expect(actual.address).toBe(expected.address);
    if (expected.occupation) expect(actual.occupation).toBe(expected.occupation);
    if (expected.bloodType) expect(actual.bloodType).toBe(expected.bloodType);
    if (expected.status) expect(actual.status).toBe(expected.status);

    // 数组字段比较
    if (expected.allergies) {
      expect(actual.allergies).toEqual(expect.arrayContaining(expected.allergies));
    }
    if (expected.medicalHistory) {
      expect(actual.medicalHistory).toEqual(expect.arrayContaining(expected.medicalHistory));
    }
    if (expected.familyHistory) {
      expect(actual.familyHistory).toEqual(expect.arrayContaining(expected.familyHistory));
    }

    // 紧急联系人信息
    if (expected.emergencyContactName) {
      expect(actual.emergencyContactName).toBe(expected.emergencyContactName);
    }
    if (expected.emergencyContactRelation) {
      expect(actual.emergencyContactRelation).toBe(expected.emergencyContactRelation);
    }
    if (expected.emergencyContactPhone) {
      expect(actual.emergencyContactPhone).toBe(expected.emergencyContactPhone);
    }
  }

  /**
   * 等待指定时间（用于测试异步操作）
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成随机的ObjectId字符串
   */
  static generateObjectId(): string {
    return new ObjectId().toHexString();
  }
}