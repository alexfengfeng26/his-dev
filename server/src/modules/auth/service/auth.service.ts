import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { User } from '../../../models/user.entity';
import { JwtUtil } from '../../../common/utils/jwt.util';
import { PasswordUtil } from '../../../common/utils/password.util';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtPayload } from '../../../common/utils/jwt.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtUtil: JwtUtil,
    private readonly passwordUtil: PasswordUtil,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<{ message: string; user: Partial<User> }> {
    const { username, password, realName, phone } = registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查手机号是否已存在
    const existingPhone = await this.userRepository.findOne({ where: { phone } });
    if (existingPhone) {
      throw new ConflictException('手机号已被注册');
    }

    // 加密密码
    const hashedPassword = await this.passwordUtil.hashPassword(password);

    // 创建用户
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      realName,
      phone,
      status: 'active',
      roleIds: [], // 默认无角色，需要管理员分配
      isSuperAdmin: false,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      message: '注册成功',
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        realName: savedUser.realName,
        phone: savedUser.phone,
        email: savedUser.email,
        status: savedUser.status,
      },
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<{
    token: string;
    user: Partial<User>;
    expiresIn: string;
  }> {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new UnauthorizedException('账户已被禁用');
    }

    // 验证密码
    const isPasswordValid = await this.passwordUtil.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新最后登录时间
    await this.userRepository.update(user._id, {
      lastLoginAt: new Date(),
      lastLoginIp: '127.0.0.1', // 实际应用中应该从请求中获取IP
    });

    // 生成JWT令牌
    const payload: JwtPayload = {
      sub: user._id.toString(),
      username: user.username,
      realName: user.realName,
      roleIds: user.roleIds,
    };

    const token = this.jwtUtil.generateToken(payload);

    return {
      token,
      user: {
        _id: user._id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        departmentId: user.departmentId,
        roleIds: user.roleIds,
        status: user.status,
        isSuperAdmin: user.isSuperAdmin,
      },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    };
  }

  /**
   * 验证令牌
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtUtil.verifyToken(token);
    } catch (error) {
      throw new UnauthorizedException('无效的令牌');
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken(user: JwtPayload): Promise<{ token: string; expiresIn: string }> {
    const token = this.jwtUtil.generateToken(user);
    return {
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    };
  }

  /**
   * 用户登出
   */
  async logout(): Promise<{ message: string }> {
    // 在实际应用中，可以在这里实现令牌黑名单
    return { message: '登出成功' };
  }

  /**
   * 修改密码
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
      const user = await this.userRepository.findOne({
      where: {
        _id: { $eq: new ObjectId(userId) } as any
      }
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证旧密码
    const isOldPasswordValid = await this.passwordUtil.verifyPassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('旧密码错误');
    }

    // 加密新密码
    const hashedNewPassword = await this.passwordUtil.hashPassword(newPassword);

    // 更新密码
    await this.userRepository.update(userId, { password: hashedNewPassword });

    return { message: '密码修改成功' };
  }
}