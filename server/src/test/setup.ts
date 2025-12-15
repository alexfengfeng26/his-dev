import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getConnection, getRepository, Repository } from 'typeorm';
import { Patient } from '../models/patient.entity';
import { User } from '../models/user.entity';
import { CommonModule } from '../modules/common/common.module';
import { PatientModule } from '../modules/patient/patient.module';

/**
 * 测试环境配置
 */
export class TestEnvironment {
  private mongod: MongoMemoryServer;

  /**
   * 启动内存MongoDB服务器
   */
  async startMongo(): Promise<void> {
    this.mongod = await MongoMemoryServer.create();
  }

  /**
   * 停止内存MongoDB服务器
   */
  async stopMongo(): Promise<void> {
    if (this.mongod) {
      await this.mongod.stop();
    }
  }

  /**
   * 获取MongoDB连接URI
   */
  getMongoUri(): string {
    return this.mongod.getUri();
  }

  /**
   * 创建测试模块
   */
  async createTestingModule() {
    return Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              MONGODB_URI: this.getMongoUri(),
              JWT_SECRET: 'test-secret-key',
              JWT_EXPIRES_IN: '24h',
            }),
          ],
        }),
        TypeOrmModule.forRoot({
          type: 'mongodb',
          url: this.getMongoUri(),
          entities: [Patient, User],
          synchronize: true,
          logging: false,
        }),
        CommonModule,
        PatientModule,
      ],
    }).compile();
  }

  /**
   * 清理数据库
   */
  async cleanupDatabase(): Promise<void> {
    try {
      const connection = getConnection();
      const patientRepository = getRepository(Patient);
      const userRepository = getRepository(User);

      await patientRepository.clear();
      await userRepository.clear();
    } catch (error) {
      // 忽略连接不存在的错误
    }
  }

  /**
   * 获取患者仓库
   */
  getPatientRepository(): Repository<Patient> {
    return getRepository(Patient);
  }

  /**
   * 获取用户仓库
   */
  getUserRepository(): Repository<User> {
    return getRepository(User);
  }
}

/**
 * 全局测试环境实例
 */
export const testEnvironment = new TestEnvironment();

/**
 * 测试前设置
 */
beforeAll(async () => {
  await testEnvironment.startMongo();
});

/**
 * 测试后清理
 */
afterAll(async () => {
  await testEnvironment.stopMongo();
});

/**
 * 每个测试前清理数据库
 */
beforeEach(async () => {
  await testEnvironment.cleanupDatabase();
});