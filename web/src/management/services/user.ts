import { api } from "../utils/api";

// 用户接口定义
export interface User {
  _id: string;
  username: string;
  realName: string;
  phone: string;
  email?: string;
  avatar?: string;
  departmentId?: string;
  roleIds: string[];
  status: "active" | "inactive";
  isSuperAdmin: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
}

// 创建用户DTO
export interface CreateUserDto {
  username: string;
  password: string;
  realName: string;
  phone: string;
  email?: string;
  departmentId?: string;
  roleIds?: string[];
  isSuperAdmin?: boolean;
}

// 更新用户DTO
export interface UpdateUserDto {
  realName?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  departmentId?: string;
  roleIds?: string[];
  status?: "active" | "inactive";
  isSuperAdmin?: boolean;
}

// 查询参数
export interface QueryUserDto {
  page?: number;
  limit?: number;
  username?: string;
  realName?: string;
  phone?: string;
  status?: "active" | "inactive";
  departmentId?: string;
}

// API响应类型
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 用户服务
export const userService = {
  // 获取用户列表
  async getUsers(query: QueryUserDto = {}): Promise<UserListResponse> {
    const response = await api.get("/users", { params: query });
    return response.data.data;
  },

  // 根据ID获取用户
  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.data || response.data;
  },

  // 创建用户
  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post("/users", data);
    return response.data.data || response.data;
  },

  // 更新用户信息
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch(`/users/${id}`, data);
    return response.data.data || response.data;
  },

  // 删除用户
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // 重置用户密码
  async resetPassword(id: string, newPassword: string): Promise<void> {
    await api.patch(`/users/${id}/reset-password`, { password: newPassword });
  },

  // 更新用户状态
  async updateUserStatus(
    id: string,
    status: "active" | "inactive",
  ): Promise<void> {
    await api.patch(`/users/${id}/status`, { status });
  },
};
