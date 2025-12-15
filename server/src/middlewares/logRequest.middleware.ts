import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LogRequestMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, url, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const startTime = Date.now();

    // 记录请求信息
    this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);

    // 记录响应信息
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('Content-Length') || 0;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${url} ${statusCode} ${contentLength} - ${responseTime}ms`,
      );
    });

    next();
  }
}