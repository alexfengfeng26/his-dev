import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    this.logger.log(`创建用户请求: ${createUserDto.username}`);

    const createdBy = req.user?.sub;
    const user = await this.userService.create(createUserDto, createdBy);

    return {
      code: 201,
      message: '用户创建成功',
      data: user
    };
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryUserDto) {
    this.logger.log(`获取用户列表请求: ${JSON.stringify(query)}`);

    const result = await this.userService.findAll(query);

    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户详情' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`获取用户详情请求: ${id}`);

    const user = await this.userService.findOne(id);

    return {
      code: 200,
      message: '获取成功',
      data: user
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '邮箱已存在' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any
  ) {
    this.logger.log(`更新用户请求: ${id}`);

    const updatedBy = req.user?.sub;
    const user = await this.userService.update(id, updateUserDto, updatedBy);

    return {
      code: 200,
      message: '更新成功',
      data: user
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id') id: string) {
    this.logger.log(`删除用户请求: ${id}`);

    await this.userService.remove(id);
  }

  @Patch(':id/reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async resetPassword(
    @Param('id') id: string,
    @Body() body: { password: string }
  ) {
    this.logger.log(`重置用户密码请求: ${id}`);

    await this.userService.resetPassword(id, body.password);

    return {
      code: 200,
      message: '密码重置成功'
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新用户状态' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'inactive' | 'locked' }
  ) {
    this.logger.log(`更新用户状态请求: ${id} -> ${body.status}`);

    await this.userService.updateStatus(id, body.status);

    return {
      code: 200,
      message: '状态更新成功'
    };
  }
}