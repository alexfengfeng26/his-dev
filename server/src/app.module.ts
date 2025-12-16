import { MiddlewareConsumer, Module } from '@nestjs/common';

import { HisSecurityPlugin } from './securityPlugin/hisSecurityPlugin';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PatientModule } from './modules/patient/patient.module';
import { MedicalRecordModule } from './modules/medical-record/medical-record.module';
import { TemplateModule } from './modules/template/template.module';
import { PluginModule } from './modules/plugin/plugin.module';

import { join } from 'path';

import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionsFilter } from './exceptions/httpExceptions.filter';

import { User } from './models/user.entity';
import { Patient } from './models/patient.entity';
import { MedicalRecord } from './models/medical-record.entity';
import { Template } from './models/template.entity';
import { TemplateMeta } from './models/templateMeta.entity';
import { TemplateHistory } from './models/templateHistory.entity';
import { Plugin } from './models/plugin.entity';
import { PluginConfig } from './models/pluginConfig.entity';
import { Department } from './models/department.entity';
import { Role } from './models/role.entity';
import { Permission } from './models/permission.entity';
import { OperationLog } from './models/operationLog.entity';

import { LoggerProvider } from './common/logger/logger.provider';
import { PluginManagerProvider } from './securityPlugin/pluginManager.provider';
import { LogRequestMiddleware } from './middlewares/logRequest.middleware';
import { PluginManager } from './securityPlugin/pluginManager';
import { Logger } from './common/logger/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const rawUrl = configService.get<string>('HIS_DEV_MONGO_URL');
        const url = rawUrl ? rawUrl.replace(/^"+|"+$/g, '') : '';
        const authSource =
          (await configService.get<string>('HIS_DEV_MONGO_AUTH_SOURCE')) || '';
        const database =
          (await configService.get<string>('HIS_DEV_MONGO_DB_NAME')) || '';

        const ret: Record<string, any> = {
          type: 'mongodb',
          connectTimeoutMS: 10000,
          socketTimeoutMS: 10000,
          url,
          useNewUrlParser: true,
          entities: [
            User,
            Patient,
            MedicalRecord,
            Template,
            TemplateMeta,
            TemplateHistory,
            Plugin,
            PluginConfig,
            Department,
            Role,
            Permission,
            OperationLog,
          ],
        };

        if (authSource) {
          ret.authSource = authSource;
        }
        if (database) {
          ret.database = database;
        }
        return ret;
      },
    }),
    AuthModule,
    UserModule,
    PatientModule,
    MedicalRecordModule,
    TemplateModule,
    PluginModule,
    ServeStaticModule.forRootAsync({
      useFactory: async () => {
        return [
          {
            rootPath: join(__dirname, '..', 'public'),
          },
        ];
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
    },
    LoggerProvider,
    PluginManagerProvider,
  ],
})
export class AppModule {
  constructor(
    private readonly configService: ConfigService,
    private readonly pluginManager: PluginManager,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogRequestMiddleware).forRoutes('*');
  }

  onModuleInit() {
    // 注册系统核心插件
    this.pluginManager.registerPlugin(
      new HisSecurityPlugin(
        this.configService.get<string>('HIS_DEV_DATA_ENCRYPT_SECRET_KEY'),
      ),
    );

    // 初始化日志系统
    Logger.init({
      filename: this.configService.get<string>('HIS_DEV_LOGGER_FILENAME'),
    });

    console.log('🏥 HIS-DEV 电子病历系统已启动');
    console.log('🔒 安全插件已加载');
    console.log('📋 插件管理器已初始化');
  }
}