import { api } from "../api";

// 模板接口定义
export interface Template {
  _id: string;
  name: string;
  code: string;
  description?: string;
  type: "basic" | "specialty" | "custom";
  departmentIds?: string[];
  config: Record<string, any>;
  structure: Record<string, any>;
  fields: Record<string, any>[];
  validationRules?: Record<string, any>;
  version: string;
  isSystem: boolean;
  isEnabled: boolean;
  usageCount: number;
  tags?: string[];
  createdBy: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 查询参数接口
export interface QueryTemplateDto {
  page?: number;
  limit?: number;
  name?: string;
  code?: string;
  type?: "basic" | "specialty" | "custom";
  departmentId?: string;
  createdBy?: string;
  isSystem?: boolean;
  isEnabled?: boolean;
  tag?: string;
  keyword?: string;
}

// 创建模板接口
export interface CreateTemplateDto {
  name: string;
  code: string;
  description?: string;
  type: "basic" | "specialty" | "custom";
  departmentIds?: string[];
  config: Record<string, any>;
  structure: Record<string, any>;
  fields: Record<string, any>[];
  validationRules?: Record<string, any>;
  version?: string;
  isSystem?: boolean;
  tags?: string[];
}

// 更新模板接口
export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  type?: "basic" | "specialty" | "custom";
  departmentIds?: string[];
  config?: Record<string, any>;
  structure?: Record<string, any>;
  fields?: Record<string, any>[];
  validationRules?: Record<string, any>;
  version?: string;
  isSystem?: boolean;
  isEnabled?: boolean;
  tags?: string[];
}

// 复制模板接口
export interface DuplicateTemplateDto {
  newName: string;
}

// 模板列表响应接口
export interface TemplateListResponse {
  code: number;
  message: string;
  data: {
    templates: Template[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 模板统计接口
export interface TemplateStatistics {
  totalTemplates: number;
  systemTemplates: number;
  customTemplates: number;
  enabledTemplates: number;
  disabledTemplates: number;
  basicTemplates: number;
  specialtyTemplates: number;
  customTemplateTypes: number;
}

// 模板服务
export const templateService = {
  // 获取模板列表
  async getTemplates(
    query: QueryTemplateDto = {},
  ): Promise<TemplateListResponse> {
    const response = await api.get("/templates", { params: query });
    return response.data;
  },

  // 获取模板详情
  async getTemplateById(
    id: string,
  ): Promise<{ code: number; message: string; data: Template }> {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // 根据代码获取模板
  async getTemplateByCode(
    code: string,
  ): Promise<{ code: number; message: string; data: Template }> {
    const response = await api.get(`/templates/code/${code}`);
    return response.data;
  },

  // 创建模板
  async createTemplate(
    data: CreateTemplateDto,
  ): Promise<{ code: number; message: string; data: Template }> {
    const response = await api.post("/templates", data);
    return response.data;
  },

  // 更新模板
  async updateTemplate(
    id: string,
    data: UpdateTemplateDto,
  ): Promise<{ code: number; message: string; data: Template }> {
    const response = await api.patch(`/templates/${id}`, data);
    return response.data;
  },

  // 更新模板状态
  async updateTemplateStatus(
    id: string,
    isEnabled: boolean,
  ): Promise<{ code: number; message: string; data: Template }> {
    const response = await api.patch(`/templates/${id}/status`, { isEnabled });
    return response.data;
  },

  // 复制模板
  async duplicateTemplate(
    id: string,
    data: DuplicateTemplateDto,
  ): Promise<{ code: number; message: string; data: Template }> {
    const response = await api.post(`/templates/${id}/duplicate`, data);
    return response.data;
  },

  // 增加使用次数
  async incrementUsageCount(
    id: string,
  ): Promise<{ code: number; message: string; data: Template }> {
    const response = await api.patch(`/templates/${id}/usage`);
    return response.data;
  },

  // 删除模板
  async deleteTemplate(
    id: string,
  ): Promise<{ code: number; message: string; data: null }> {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },

  // 获取模板统计
  async getStatistics(): Promise<{
    code: number;
    message: string;
    data: TemplateStatistics;
  }> {
    const response = await api.get("/templates/statistics");
    return response.data;
  },
};
