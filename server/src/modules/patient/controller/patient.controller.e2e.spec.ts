import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientModule } from '../patient.module';
import { Patient } from '../../../models/patient.entity';
import { CommonModule } from '../../common/common.module';

describe.skip('PatientController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/his-dev-test',
              JWT_SECRET: 'test-secret-key',
              JWT_EXPIRES_IN: '24h',
            }),
          ],
        }),
        TypeOrmModule.forRoot({
          type: 'mongodb',
          url: process.env.MONGODB_URI || 'mongodb://localhost:27017/his-dev-test',
          entities: [Patient],
          synchronize: true,
          logging: false,
        }),
        CommonModule,
        PatientModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/patients (GET)', () => {
    it('应该返回患者列表', () => {
      return request(app.getHttpServer())
        .get('/patients')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('patients');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(Array.isArray(res.body.patients)).toBe(true);
        });
    });
  });

  describe('/patients/statistics (GET)', () => {
    it('应该返回患者统计信息', () => {
      return request(app.getHttpServer())
        .get('/patients/statistics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalPatients');
          expect(res.body).toHaveProperty('activePatients');
          expect(res.body).toHaveProperty('inactivePatients');
          expect(res.body).toHaveProperty('deceasedPatients');
        });
    });
  });

  describe('/patients (POST)', () => {
    it('应该创建新患者', () => {
      const createPatientDto = {
        patientNo: `TEST${Date.now()}`,
        name: '测试患者',
        gender: 'male',
        birthDate: '1990-01-01',
        idCard: '110101199001011234',
        phone: '13800138001',
        address: '测试地址',
        bloodType: 'A',
      };

      return request(app.getHttpServer())
        .post('/patients')
        .send(createPatientDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('patientNo');
          expect(res.body).toHaveProperty('name');
          expect(res.body.name).toBe(createPatientDto.name);
          expect(res.body.status).toBe('active');
        });
    });

    it('应该验证必填字段', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send({})
        .expect(400);
    });
  });
});