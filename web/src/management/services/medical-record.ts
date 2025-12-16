import { api } from "../api";

// 病历接口定义
export interface MedicalRecord {
  _id: string;
  patientId: string;
  doctorId: string;
  recordNo: string;
  type: "outpatient" | "inpatient" | "emergency";
  department: string;
  visitDate: string;
  chiefComplaint: string;
  presentIllness?: string;
  pastHistory?: string[];
  physicalExam?: string;
  auxiliaryExam?: string;
  diagnosis: string[];
  treatment?: string;
  prescription?: string[];
  medicalAdvice?: string;
  followUpDate?: string;
  status: "draft" | "completed" | "archived";
  templateId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 查询参数接口
export interface QueryMedicalRecordDto {
  page?: number;
  limit?: number;
  patientId?: string;
  doctorId?: string;
  type?: "outpatient" | "inpatient" | "emergency";
  department?: string;
  startDate?: string;
  endDate?: string;
  status?: "draft" | "completed" | "archived";
  keyword?: string;
}

// 创建病历接口
export interface CreateMedicalRecordDto {
  patientId: string;
  recordNo: string;
  type: "outpatient" | "inpatient" | "emergency";
  department: string;
  visitDate: string;
  chiefComplaint: string;
  presentIllness?: string;
  pastHistory?: string[];
  physicalExam?: string;
  auxiliaryExam?: string;
  diagnosis: string[];
  treatment?: string;
  prescription?: string[];
  medicalAdvice?: string;
  followUpDate?: string;
  status?: "draft" | "completed" | "archived";
  templateId?: string;
  notes?: string;
}

// 更新病历接口
export interface UpdateMedicalRecordDto {
  patientId?: string;
  recordNo?: string;
  type?: "outpatient" | "inpatient" | "emergency";
  department?: string;
  visitDate?: string;
  chiefComplaint?: string;
  presentIllness?: string;
  pastHistory?: string[];
  physicalExam?: string;
  auxiliaryExam?: string;
  diagnosis?: string[];
  treatment?: string;
  prescription?: string[];
  medicalAdvice?: string;
  followUpDate?: string;
  status?: "draft" | "completed" | "archived";
  templateId?: string;
  notes?: string;
}

// 病历列表响应接口
export interface MedicalRecordListResponse {
  code: number;
  message: string;
  data: {
    records: MedicalRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 病历统计接口
export interface MedicalRecordStatistics {
  totalRecords: number;
  outpatientRecords: number;
  inpatientRecords: number;
  emergencyRecords: number;
  draftRecords: number;
  completedRecords: number;
  archivedRecords: number;
}

// 病历服务
export const medicalRecordService = {
  // 获取病历列表
  async getRecords(
    query: QueryMedicalRecordDto = {},
  ): Promise<MedicalRecordListResponse> {
    const response = await api.get("/medical-records", { params: query });
    return response.data;
  },

  // 获取病历详情
  async getRecordById(
    id: string,
  ): Promise<{ code: number; message: string; data: MedicalRecord }> {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  },

  // 根据病历编号获取病历
  async getRecordByNo(
    recordNo: string,
  ): Promise<{ code: number; message: string; data: MedicalRecord }> {
    const response = await api.get(`/medical-records/record-no/${recordNo}`);
    return response.data;
  },

  // 获取患者病历列表
  async getRecordsByPatientId(
    patientId: string,
    query: QueryMedicalRecordDto = {},
  ): Promise<MedicalRecordListResponse> {
    const response = await api.get(`/medical-records/patient/${patientId}`, {
      params: query,
    });
    return response.data;
  },

  // 获取医生病历列表
  async getRecordsByDoctorId(
    doctorId: string,
    query: QueryMedicalRecordDto = {},
  ): Promise<MedicalRecordListResponse> {
    const response = await api.get(`/medical-records/by-doctor/${doctorId}`, {
      params: query,
    });
    return response.data;
  },

  // 创建病历
  async createRecord(
    data: CreateMedicalRecordDto,
  ): Promise<{ code: number; message: string; data: MedicalRecord }> {
    const response = await api.post("/medical-records", data);
    return response.data;
  },

  // 更新病历
  async updateRecord(
    id: string,
    data: UpdateMedicalRecordDto,
  ): Promise<{ code: number; message: string; data: MedicalRecord }> {
    const response = await api.patch(`/medical-records/${id}`, data);
    return response.data;
  },

  // 更新病历状态
  async updateRecordStatus(
    id: string,
    status: string,
  ): Promise<{ code: number; message: string; data: MedicalRecord }> {
    const response = await api.patch(`/medical-records/${id}/status`, {
      status,
    });
    return response.data;
  },

  // 删除病历
  async deleteRecord(
    id: string,
  ): Promise<{ code: number; message: string; data: null }> {
    const response = await api.delete(`/medical-records/${id}`);
    return response.data;
  },

  // 获取病历统计
  async getStatistics(): Promise<{
    code: number;
    message: string;
    data: MedicalRecordStatistics;
  }> {
    const response = await api.get("/medical-records/statistics");
    return response.data;
  },
};
