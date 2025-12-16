import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Template } from '../../../models/template.entity';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto, QueryTemplateDto } from '../dto/update-template.dto';
import { Logger } from '../../../common/logger/logger';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  /**
   * 创建模板
   */
  async create(createTemplateDto: CreateTemplateDto, createdBy: string): Promise<Template> {
    Logger.info(`创建模板: ${createTemplateDto.name}`);

    // 检查模板代码是否已存在
    const existingTemplate = await this.templateRepository.findOne({
      where: { code: createTemplateDto.code }
    });
    if (existingTemplate) {
      throw new ConflictException('模板代码已存在');
    }

    // 验证模板结构
    this.validateTemplateStructure(createTemplateDto.structure, createTemplateDto.fields);

    const template = this.templateRepository.create({
      ...createTemplateDto,
      createdBy,
      version: createTemplateDto.version || '1.0.0',
      isSystem: createTemplateDto.isSystem || false,
      isEnabled: true,
      usageCount: 0,
    });

    const savedTemplate = await this.templateRepository.save(template);

    Logger.info(`模板创建成功: ${savedTemplate.name} (ID: ${savedTemplate._id})`);
    return savedTemplate;
  }

  /**
   * 分页查询模板列表
   */
  async findAll(queryDto: QueryTemplateDto) {
    const { page = 1, limit = 10, name, code, type, departmentId, createdBy, isSystem, isEnabled, tag, keyword } = queryDto;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    // 名称模糊搜索
    if (name) {
      where.name = { $regex: name, $options: 'i' };
    }

    // 代码模糊搜索
    if (code) {
      where.code = { $regex: code, $options: 'i' };
    }

    // 类型筛选
    if (type) {
      where.type = type;
    }

    // 科室筛选（如果模板包含该科室ID）
    if (departmentId) {
      where.departmentIds = { $in: [departmentId] };
    }

    // 创建者筛选
    if (createdBy) {
      where.createdBy = createdBy;
    }

    // 系统模板筛选
    if (typeof isSystem === 'boolean') {
      where.isSystem = isSystem;
    }

    // 启用状态筛选
    if (typeof isEnabled === 'boolean') {
      where.isEnabled = isEnabled;
    }

    // 标签筛选
    if (tag) {
      where.tags = { $in: [tag] };
    }

    // 关键词搜索（搜索名称、描述、标签）
    if (keyword) {
      where.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } }
      ];
    }

    const [templates, total] = await Promise.all([
      this.templateRepository.find({
        where,
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      }),
      this.templateRepository.count({ where }),
    ]);

    return {
      templates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查找模板
   */
  async findById(id: string): Promise<Template> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException('无效的模板ID');
    }

    const template = await this.templateRepository.findOne({
      where: { _id: objectId } as any,
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    return template;
  }

  /**
   * 更新模板信息
   */
  async update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<Template> {
    Logger.info(`更新模板信息: ID ${id}`);

    const template = await this.findById(id);

    // 如果更新模板代码，检查是否重复
    if (updateTemplateDto.code && updateTemplateDto.code !== template.code) {
      const existingTemplate = await this.templateRepository.findOne({
        where: { code: updateTemplateDto.code }
      });
      if (existingTemplate) {
        throw new ConflictException('模板代码已存在');
      }
    }

    // 如果更新结构，验证新的结构
    if (updateTemplateDto.structure && updateTemplateDto.fields) {
      this.validateTemplateStructure(updateTemplateDto.structure, updateTemplateDto.fields);
    }

    Object.assign(template, updateTemplateDto);
    template.lastModifiedBy = template.createdBy; // 简化处理，实际应该传入用户ID

    const updatedTemplate = await this.templateRepository.save(template);

    Logger.info(`模板信息更新成功: ${updatedTemplate.name} (ID: ${updatedTemplate._id})`);
    return updatedTemplate;
  }

  /**
   * 删除模板
   */
  async remove(id: string, deletedBy?: string): Promise<void> {
    Logger.info(`删除模板: ID ${id}`);

    const template = await this.findById(id);

    // 检查模板是否为系统模板
    if (template.isSystem) {
      throw new BadRequestException('系统模板不能删除');
    }

    // 检查模板是否被使用
    // TODO: 检查是否有病历使用了该模板
    // const usedByMedicalRecords = await this.medicalRecordRepository.count({ where: { templateId: id } });
    // if (usedByMedicalRecords > 0) {
    //   throw new BadRequestException('该模板已被病历使用，无法删除');
    // }

    await this.templateRepository.remove(template);

    Logger.info(`模板删除成功: ${template.name} (ID: ${id})`);
  }

  /**
   * 更新模板状态
   */
  async updateStatus(id: string, isEnabled: boolean): Promise<Template> {
    Logger.info(`更新模板状态: ID ${id} -> ${isEnabled ? '启用' : '停用'}`);

    const template = await this.findById(id);

    template.isEnabled = isEnabled;
    const updatedTemplate = await this.templateRepository.save(template);

    Logger.info(`模板状态更新成功: ${updatedTemplate.name} -> ${isEnabled ? '启用' : '停用'}`);
    return updatedTemplate;
  }

  /**
   * 根据代码查找模板
   */
  async findByCode(code: string): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: { code },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    return template;
  }

  /**
   * 增加使用次数
   */
  async incrementUsageCount(id: string): Promise<Template> {
    const template = await this.findById(id);

    template.usageCount += 1;
    return await this.templateRepository.save(template);
  }

  /**
   * 获取模板统计信息
   */
  async getStatistics(createdBy?: string) {
    const where: any = {};
    if (createdBy) {
      where.createdBy = createdBy;
    }

    const [
      totalTemplates,
      systemTemplates,
      customTemplates,
      enabledTemplates,
      disabledTemplates,
      basicTemplates,
      specialtyTemplates,
    ] = await Promise.all([
      this.templateRepository.count({ where }),
      this.templateRepository.count({ where: { ...where, isSystem: true } }),
      this.templateRepository.count({ where: { ...where, isSystem: false } }),
      this.templateRepository.count({ where: { ...where, isEnabled: true } }),
      this.templateRepository.count({ where: { ...where, isEnabled: false } }),
      this.templateRepository.count({ where: { ...where, type: 'basic' } }),
      this.templateRepository.count({ where: { ...where, type: 'specialty' } }),
    ]);

    return {
      totalTemplates,
      systemTemplates,
      customTemplates,
      enabledTemplates,
      disabledTemplates,
      basicTemplates,
      specialtyTemplates,
      customTemplateTypes: totalTemplates - systemTemplates - basicTemplates - specialtyTemplates,
    };
  }

  /**
   * 复制模板
   */
  async duplicate(id: string, newName: string, createdBy: string): Promise<Template> {
    Logger.info(`复制模板: ID ${id} -> ${newName}`);

    const originalTemplate = await this.findById(id);

    // 创建新模板代码
    const newCode = `${originalTemplate.code}_copy_${Date.now()}`;

    const duplicateTemplate = this.templateRepository.create({
      name: newName,
      code: newCode,
      description: `${originalTemplate.description} (复制)`,
      type: 'custom',
      departmentIds: originalTemplate.departmentIds,
      config: originalTemplate.config,
      structure: originalTemplate.structure,
      fields: originalTemplate.fields,
      validationRules: originalTemplate.validationRules,
      version: '1.0.0',
      isSystem: false,
      isEnabled: true,
      usageCount: 0,
      tags: originalTemplate.tags,
      createdBy,
    });

    const savedTemplate = await this.templateRepository.save(duplicateTemplate);

    Logger.info(`模板复制成功: ${savedTemplate.name} (ID: ${savedTemplate._id})`);
    return savedTemplate;
  }

  /**
   * 验证模板结构
   */
  private validateTemplateStructure(structure: Record<string, any>, fields: Record<string, any>[]): void {
    if (!structure || typeof structure !== 'object') {
      throw new BadRequestException('模板结构格式不正确');
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      throw new BadRequestException('模板字段配置不能为空');
    }

    // 验证字段配置
    for (const field of fields) {
      if (!field.key || !field.type) {
        throw new BadRequestException('模板字段必须包含key和type属性');
      }
    }

    Logger.info('模板结构验证通过');
  }
}