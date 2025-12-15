import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  username: string;
  realName: string;
  roleIds: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtUtil {
  private readonly secretKey: string;
  private readonly expiresIn: number;

  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'his-dev-jwt-secret-2024';
    // 将 '24h' 转换为秒数
    this.expiresIn = this.parseTimeString(process.env.JWT_EXPIRES_IN || '24h');
  }

  private parseTimeString(timeString: string): number {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 86400; // 默认24小时
    }
  }

  /**
   * 生成JWT令牌
   */
  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.expiresIn as any,
    });
  }

  /**
   * 验证JWT令牌
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secretKey) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * 解码JWT令牌（不验证）
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 从请求头中提取令牌
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}