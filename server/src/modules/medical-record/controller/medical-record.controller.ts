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
import { MedicalRecordService } from '../service/medical-record.service';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { UpdateMedicalRecordDto, QueryMedicalRecordDto } from '../dto/update-medical-record.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { MedicalRecord } from '../../../models/medical-record.entity';

@ApiTags('病历管理')
@Controller('medical-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @ApiOperation({ summary: '创建病历' })
  @ApiResponse({ status: 201, description: '病历创建成功', type: MedicalRecord })
  @ApiResponse({ status: 409, description: '病历编号已存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createMedicalRecordDto: CreateMedicalRecordDto, @Request() req) {
    // 从JWT token中获取用户ID
    const createdBy = req.user.sub;
    return this.medicalRecordService.create(createMedicalRecordDto, createdBy);
  }

  @Get()
  @ApiOperation({ summary: '获取病历列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() queryDto: QueryMedicalRecordDto) {
    const result = await this.medicalRecordService.findAll(queryDto);

    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取病历统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics(@Request() req) {
    const doctorId = req.user.sub; // 获取当前用户ID作为医生ID
    const result = await this.medicalRecordService.getStatistics(doctorId);

    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取病历详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: MedicalRecord })
  @ApiResponse({ status: 404, description: '病历不存在' })
  async findById(@Param('id') id: string) {
    const result = await this.medicalRecordService.findById(id);
    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Get('record-no/:recordNo')
  @ApiOperation({ summary: '根据病历编号获取病历' })
  @ApiResponse({ status: 200, description: '获取成功', type: MedicalRecord })
  @ApiResponse({ status: 404, description: '病历不存在' })
  async findByRecordNo(@Param('recordNo') recordNo: string) {
    const result = await this.medicalRecordService.findByRecordNo(recordNo);
    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: '获取患者病历列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findByPatientId(@Param('patientId') patientId: string, @Query() queryDto: QueryMedicalRecordDto) {
    const result = await this.medicalRecordService.findByPatientId(patientId, queryDto);
    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Get('by-doctor/:doctorId')
  @ApiOperation({ summary: '获取医生病历列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findByDoctorId(@Param('doctorId') doctorId: string, @Query() queryDto: QueryMedicalRecordDto) {
    const result = await this.medicalRecordService.findByDoctorId(doctorId, queryDto);
    return {
      code: 200,
      message: '获取成功',
      data: result
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新病历信息' })
  @ApiResponse({ status: 200, description: '更新成功', type: MedicalRecord })
  @ApiResponse({ status: 404, description: '病历不存在' })
  @ApiResponse({ status: 409, description: '病历编号已存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    const result = await this.medicalRecordService.update(id, updateMedicalRecordDto);
    return {
      code: 200,
      message: '更新成功',
      data: result
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新病历状态' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  @ApiResponse({ status: 404, description: '病历不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async updateStatus(
    @Param('id') id: string,
    @Body() statusData: { status: string },
  ) {
    const result = await this.medicalRecordService.updateStatus(id, statusData.status);
    return {
      code: 200,
      message: '状态更新成功',
      data: result
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除病历' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '病历不存在' })
  @ApiResponse({ status: 400, description: '已完成的病历不能删除' })
  async remove(@Param('id') id: string, @Request() req) {
    const deletedBy = req.user.sub; // 从JWT token中获取用户ID
    await this.medicalRecordService.remove(id, deletedBy);
    return {
      code: 200,
      message: '删除成功',
      data: null
    };
  }
}