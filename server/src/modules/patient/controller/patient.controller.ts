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
import { PatientService } from '../service/patient.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto, QueryPatientDto } from '../dto/update-patient.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { Patient } from '../../../models/patient.entity';

@ApiTags('患者管理')
@Controller('patients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @ApiOperation({ summary: '创建患者' })
  @ApiResponse({ status: 201, description: '患者创建成功', type: Patient })
  @ApiResponse({ status: 409, description: '患者编号/身份证号/手机号已存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createPatientDto: CreatePatientDto, @Request() req) {
    // 从JWT token中获取用户ID
    const createdBy = req.user.sub;
    return this.patientService.create(createPatientDto, createdBy);
  }

  @Get()
  @ApiOperation({ summary: '获取患者列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() queryDto: QueryPatientDto) {
    return this.patientService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取患者统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics() {
    return this.patientService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取患者详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: Patient })
  @ApiResponse({ status: 404, description: '患者不存在' })
  async findById(@Param('id') id: string) {
    return this.patientService.findById(id);
  }

  @Get('idcard/:idCard')
  @ApiOperation({ summary: '根据身份证号获取患者' })
  @ApiResponse({ status: 200, description: '获取成功', type: Patient })
  @ApiResponse({ status: 404, description: '患者不存在' })
  async findByIdCard(@Param('idCard') idCard: string) {
    return this.patientService.findByIdCard(idCard);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: '根据手机号查找患者' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Patient] })
  async findByPhone(@Param('phone') phone: string) {
    return this.patientService.findByPhone(phone);
  }

  @Get('name/:name')
  @ApiOperation({ summary: '根据姓名查找患者' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Patient] })
  async findByName(@Param('name') name: string) {
    return this.patientService.findByName(name);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新患者信息' })
  @ApiResponse({ status: 200, description: '更新成功', type: Patient })
  @ApiResponse({ status: 404, description: '患者不存在' })
  @ApiResponse({ status: 409, description: '身份证号/手机号已被使用' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除患者' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '患者不存在' })
  @ApiResponse({ status: 400, description: '患者有关联的病历记录，无法删除' })
  async remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }
}