import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { User } from '../../../models/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, createdBy?: string): Promise<User> {
    this.logger.log(`创建用户: ${createUserDto.username}`);

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username }
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // 创建用户
    const user = new User();
    user.username = createUserDto.username;
    user.password = hashedPassword;
    user.realName = createUserDto.realName;
    user.email = createUserDto.email;
    user.phone = createUserDto.phone;
    user.avatar = createUserDto.avatar;
    user.departmentId = createUserDto.departmentId;
    user.roleIds = createUserDto.roleIds || [];
    user.isSuperAdmin = createUserDto.isSuperAdmin || false;
    user.status = 'active';

    const savedUser = await this.userRepository.save(user);

    // 返回时不包含密码
    delete savedUser.password;
    return savedUser;
  }

  async findAll(query: QueryUserDto): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> {
    this.logger.log(`查询用户列表: ${JSON.stringify(query)}`);

    const { page = 1, limit = 10, username, realName, phone, status, departmentId } = query;

    // 构建查询条件
    const where: any = {};

    if (username) {
      where.username = { $regex: username, $options: 'i' };
    }

    if (realName) {
      where.realName = { $regex: realName, $options: 'i' };
    }

    if (phone) {
      where.phone = { $regex: phone, $options: 'i' };
    }

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    // 计算跳过的数量
    const skip = (page - 1) * limit;

    // 查询总数
    const total = await this.userRepository.count({ where });

    // 查询数据
    const users = await this.userRepository.find({
      where,
      skip,
      take: limit,
      order: { createdAt: -1 }
    });

    // 移除密码字段
    const usersWithoutPassword = users.map(user => {
      const userCopy = { ...user };
      delete userCopy.password;
      return userCopy;
    });

    return {
      users: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`查询用户详情: ${id}`);

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException('无效的用户ID');
    }

    const user = await this.userRepository.findOne({ where: { _id: objectId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 移除密码字段
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedBy?: string): Promise<User> {
    this.logger.log(`更新用户: ${id}`);

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException('无效的用户ID');
    }

    const user = await this.userRepository.findOne({ where: { _id: objectId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果更新邮箱，检查邮箱是否已存在
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingEmail) {
        throw new ConflictException('邮箱已存在');
      }
    }

    // 更新用户信息
    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);

    // 移除密码字段
    const userWithoutPassword = { ...updatedUser };
    delete userWithoutPassword.password;

    return userWithoutPassword;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`删除用户: ${id}`);

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException('无效的用户ID');
    }

    const user = await this.userRepository.findOne({ where: { _id: objectId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.userRepository.remove(user);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    this.logger.log(`重置用户密码: ${id}`);

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException('无效的用户ID');
    }

    const user = await this.userRepository.findOne({ where: { _id: objectId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 加密新密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'locked'): Promise<void> {
    this.logger.log(`更新用户状态: ${id} -> ${status}`);

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException('无效的用户ID');
    }

    const user = await this.userRepository.findOne({ where: { _id: objectId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.status = status;
    await this.userRepository.save(user);
  }
}