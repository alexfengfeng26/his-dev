import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionsFilter } from './exceptions/httpExceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionsFilter());

  // 启用 CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger API 文档配置 (临时禁用以解决循环依赖问题)
  // const config = new DocumentBuilder()
  //   .setTitle('HIS-DEV API')
  //   .setDescription('电子病历系统 API 文档')
  //   .setVersion('1.0')
  //   .addBearerAuth()
  //   .addTag('auth', '认证模块')
  //   .addTag('user', '用户管理')
  //   .addTag('patient', '患者管理')
  //   .addTag('medical-record', '病历管理')
  //   .addTag('template', '模板管理')
  //   .addTag('plugin', '插件管理')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 HIS-DEV Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API Documentation: http://localhost:${port}/api`);
}

bootstrap();