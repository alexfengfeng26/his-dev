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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TemplateService } from '../service/template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto, QueryTemplateDto } from '../dto/update-template.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { Template } from '../../../models/template.entity';

@ApiTags('模板管理')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: '创建模板' })
  @ApiResponse({ status: 201, description: '模板创建成功', type: Template })
  @ApiResponse({ status: 409, description: '模板代码已存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createTemplateDto: CreateTemplateDto, @Request() req) {
    const createdBy = req.user.sub;
    return this.templateService.create(createTemplateDto, createdBy);
  }

  @Get()
  @ApiOperation({ summary: '获取模板列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() queryDto: QueryTemplateDto) {
    const result = await this.templateService.findAll(queryDto);

    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取模板统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics(@Request() req) {
    const createdBy = req.user.sub;
    const result = await this.templateService.getStatistics(createdBy);

    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取模板详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: Template })
  @ApiResponse({ status: 404, description: '模板不存在' })
  async findById(@Param('id') id: string) {
    const result = await this.templateService.findById(id);
    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据代码获取模板' })
  @ApiResponse({ status: 200, description: '获取成功', type: Template })
  @ApiResponse({ status: 404, description: '模板不存在' })
  async findByCode(@Param('code') code: string) {
    const result = await this.templateService.findByCode(code);
    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新模板信息' })
  @ApiResponse({ status: 200, description: '更新成功', type: Template })
  @ApiResponse({ status: 404, description: '模板不存在' })
  @ApiResponse({ status: 409, description: '模板代码已存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    const result = await this.templateService.update(id, updateTemplateDto);
    return {
      code: 200,
      message: '更新成功',
      data: result
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新模板状态' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  @ApiResponse({ status: 404, description: '模板不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async updateStatus(
    @Param('id') id: string,
    @Body() statusData: { isEnabled: boolean },
  ) {
    const result = await this.templateService.updateStatus(id, statusData.isEnabled);
    return {
      code: 200,
      message: '状态更新成功',
      data: result
    };
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: '复制模板' })
  @ApiResponse({ status: 201, description: '模板复制成功', type: Template })
  @ApiResponse({ status: 404, description: '模板不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async duplicate(
    @Param('id') id: string,
    @Body() duplicateData: { newName: string },
    @Request() req,
  ) {
    const createdBy = req.user.sub;
    const result = await this.templateService.duplicate(id, duplicateData.newName, createdBy);
    return {
      code: 201,
      message: '模板复制成功',
      data: result
    };
  }

  @Patch(':id/usage')
  @ApiOperation({ summary: '增加模板使用次数' })
  @ApiResponse({ status: 200, description: '使用次数更新成功' })
  @ApiResponse({ status: 404, description: '模板不存在' })
  async incrementUsageCount(@Param('id') id: string) {
    const result = await this.templateService.incrementUsageCount(id);
    return {
      code: 200,
      message: '使用次数更新成功',
      data: result
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除模板' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '模板不存在' })
  @ApiResponse({ status: 400, description: '系统模板不能删除或模板已被使用' })
  async remove(@Param('id') id: string, @Request() req) {
    const deletedBy = req.user.sub;
    await this.templateService.remove(id, deletedBy);
    return {
      code: 200,
      message: '删除成功',
      data: null
    };
  }
}