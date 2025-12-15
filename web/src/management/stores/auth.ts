import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// 配置axios基础设置
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理token过期
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<any | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const userRoles = computed(() => user.value?.roleIds || [])
  const isSuperAdmin = computed(() => user.value?.isSuperAdmin || false)
  const userName = computed(() => user.value?.realName || user.value?.username || '')

  // 登录
  const login = async (credentials: { username: string; password: string }) => {
    try {
      loading.value = true
      const response = await api.post('/auth/login', credentials)

      // 保存token和用户信息
      token.value = response.token
      user.value = response.user

      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return response
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (userData: {
    username: string
    password: string
    realName: string
    phone: string
  }) => {
    try {
      loading.value = true
      const response = await api.post('/auth/register', userData)
      return response
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      // 即使登出API失败也要清除本地数据
      console.error('Logout API error:', error)
    } finally {
      // 清除本地存储
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // 获取用户信息
  const fetchProfile = async () => {
    try {
      loading.value = true
      const response = await api.get('/auth/profile')
      user.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
      return response
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 修改密码
  const changePassword = async (passwords: {
    oldPassword: string
    newPassword: string
  }) => {
    try {
      loading.value = true
      const response = await api.put('/auth/change-password', passwords)
      return response
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 刷新token
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh')
      token.value = response.token
      localStorage.setItem('token', response.token)
      return response
    } catch (error) {
      // 刷新失败，清除登录状态
      await logout()
      throw error
    }
  }

  // 检查权限
  const hasRole = (roleId: string | string[]) => {
    if (isSuperAdmin.value) return true
    if (!userRoles.value || userRoles.value.length === 0) return false

    if (typeof roleId === 'string') {
      return userRoles.value.includes(roleId)
    }

    return roleId.some(id => userRoles.value.includes(id))
  }

  // 检查是否登录
  const checkAuth = () => {
    return !!token.value && !!user.value
  }

  return {
    // 状态
    token,
    user,
    loading,

    // 计算属性
    isAuthenticated,
    userRoles,
    isSuperAdmin,
    userName,

    // 方法
    login,
    register,
    logout,
    fetchProfile,
    changePassword,
    refreshToken,
    hasRole,
    checkAuth,
  }
})

// 导出axios实例，供其他store使用
export { api }