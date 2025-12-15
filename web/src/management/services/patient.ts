import { api } from '../stores/auth'

// 患者接口定义
export interface Patient {
  _id: string
  patientNo: string
  name: string
  gender: 'male' | 'female' | 'unknown'
  birthDate: string
  age: number
  idCard: string
  phone: string
  email?: string
  address: string
  occupation?: string
  bloodType: 'A' | 'B' | 'AB' | 'O' | 'unknown'
  allergies?: string[]
  medicalHistory?: string[]
  familyHistory?: string[]
  emergencyContactName?: string
  emergencyContactRelation?: string
  emergencyContactPhone?: string
  status: 'active' | 'inactive' | 'deceased'
  deathDate?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 创建患者DTO
export interface CreatePatientDto {
  patientNo: string
  name: string
  gender: 'male' | 'female' | 'unknown'
  birthDate: string
  idCard: string
  phone: string
  email?: string
  address: string
  occupation?: string
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'unknown'
  allergies?: string[]
  medicalHistory?: string[]
  familyHistory?: string[]
  emergencyContactName?: string
  emergencyContactRelation?: string
  emergencyContactPhone?: string
}

// 更新患者DTO
export interface UpdatePatientDto {
  name?: string
  gender?: 'male' | 'female' | 'unknown'
  birthDate?: string
  idCard?: string
  phone?: string
  email?: string
  address?: string
  occupation?: string
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'unknown'
  allergies?: string[]
  medicalHistory?: string[]
  familyHistory?: string[]
  emergencyContactName?: string
  emergencyContactRelation?: string
  emergencyContactPhone?: string
  status?: 'active' | 'inactive' | 'deceased'
  deathDate?: string
}

// 查询参数
export interface QueryPatientDto {
  page?: number
  limit?: number
  name?: string
  phone?: string
  idCard?: string
  status?: 'active' | 'inactive' | 'deceased'
  gender?: 'male' | 'female' | 'unknown'
}

// 统计信息
export interface PatientStatistics {
  totalPatients: number
  activePatients: number
  inactivePatients: number
  deceasedPatients: number
  malePatients: number
  femalePatients: number
  unknownGender: number
}

// API响应类型
export interface PatientListResponse {
  patients: Patient[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 患者服务
export const patientService = {
  // 获取患者列表
  async getPatients(query: QueryPatientDto = {}): Promise<PatientListResponse> {
    const response = await api.get('/patients', { params: query })
    return response
  },

  // 获取患者统计信息
  async getStatistics(): Promise<PatientStatistics> {
    const response = await api.get('/patients/statistics')
    return response
  },

  // 根据ID获取患者
  async getPatientById(id: string): Promise<Patient> {
    const response = await api.get(`/patients/${id}`)
    return response
  },

  // 根据身份证号获取患者
  async getPatientByIdCard(idCard: string): Promise<Patient> {
    const response = await api.get(`/patients/idcard/${idCard}`)
    return response
  },

  // 根据手机号获取患者列表
  async getPatientsByPhone(phone: string): Promise<Patient[]> {
    const response = await api.get(`/patients/phone/${phone}`)
    return response
  },

  // 根据姓名获取患者列表
  async getPatientsByName(name: string): Promise<Patient[]> {
    const response = await api.get(`/patients/name/${name}`)
    return response
  },

  // 创建患者
  async createPatient(data: CreatePatientDto): Promise<Patient> {
    const response = await api.post('/patients', data)
    return response
  },

  // 更新患者信息
  async updatePatient(id: string, data: UpdatePatientDto): Promise<Patient> {
    const response = await api.patch(`/patients/${id}`, data)
    return response
  },

  // 删除患者
  async deletePatient(id: string): Promise<void> {
    await api.delete(`/patients/${id}`)
  }
}