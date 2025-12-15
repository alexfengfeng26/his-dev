<template>
  <div class="app-layout">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🏥</span>
          <span class="logo-text">HIS-DEV</span>
        </div>
        <span class="subtitle">电子病历管理系统</span>
      </div>

      <div class="header-right">
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              <span class="avatar-text">{{ userInitial }}</span>
            </el-avatar>
            <span class="username">{{ userName }}</span>
            <el-icon class="dropdown-icon"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><user /></el-icon>
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><setting /></el-icon>
                个人设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><switch-button /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <el-button
            :icon="Expand"
            circle
            @click="toggleSidebar"
            class="collapse-btn"
            :title="sidebarCollapsed ? '展开菜单' : '收起菜单'"
          />
          <div v-if="!sidebarCollapsed" class="sidebar-title">
            系统菜单
          </div>
        </div>

        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :collapse="sidebarCollapsed"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><data-analysis /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>

          <el-menu-item index="/users">
            <el-icon><user /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>

          <el-menu-item index="/patients">
            <el-icon><user-filled /></el-icon>
            <template #title>患者管理</template>
          </el-menu-item>

          <el-menu-item index="/medical-records">
            <el-icon><document /></el-icon>
            <template #title>病历管理</template>
          </el-menu-item>

          <el-menu-item index="/templates">
            <el-icon><collection /></el-icon>
            <template #title>模板管理</template>
          </el-menu-item>

          <el-menu-item index="/plugins">
            <el-icon><connection /></el-icon>
            <template #title>插件管理</template>
          </el-menu-item>

          <el-menu-item index="/reports">
            <el-icon><pie-chart /></el-icon>
            <template #title>统计报表</template>
          </el-menu-item>

          <el-menu-item index="/settings">
            <el-icon><setting /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <!-- 面包屑 -->
        <div class="breadcrumb" v-if="currentBreadcrumb.length > 1">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in currentBreadcrumb"
              :key="index"
              :to="index === currentBreadcrumb.length - 1 ? null : item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- 页面内容 -->
        <div class="page-content">
          <router-view />
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="changePasswordVisible"
      title="修改密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入旧密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="changePasswordVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="changePasswordLoading"
            @click="handleChangePassword"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  User,
  Setting,
  SwitchButton,
  Expand,
  DataAnalysis,
  UserFilled,
  Document,
  Collection,
  Connection,
  PieChart
} from '@element-plus/icons-vue'

export default {
  name: 'AppLayout',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const sidebarCollapsed = ref(false)
    const changePasswordVisible = ref(false)
    const changePasswordLoading = ref(false)
    const passwordFormRef = ref()

    // 用户信息 - 这里从认证store获取
    const userName = ref('管理员')
    const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

    const passwordForm = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入旧密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.value.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    const activeMenu = computed(() => route.path)

    // 面包屑
    const currentBreadcrumb = computed(() => {
      const breadcrumbMap = {
        '/dashboard': [{ title: '仪表盘', path: '/dashboard' }],
        '/users': [{ title: '用户管理', path: '/users' }],
        '/patients': [{ title: '患者管理', path: '/patients' }],
        '/medical-records': [{ title: '病历管理', path: '/medical-records' }],
        '/templates': [{ title: '模板管理', path: '/templates' }],
        '/plugins': [{ title: '插件管理', path: '/plugins' }],
        '/reports': [{ title: '统计报表', path: '/reports' }],
        '/settings': [{ title: '系统设置', path: '/settings' }]
      }
      return breadcrumbMap[route.path] || [{ title: '首页', path: '/' }]
    })

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    const handleMenuSelect = (index) => {
      router.push(index)
    }

    const handleCommand = async (command) => {
      switch (command) {
        case 'profile':
          ElMessage.info('个人资料功能开发中...')
          break
        case 'settings':
          ElMessage.info('个人设置功能开发中...')
          break
        case 'logout':
          await handleLogout()
          break
      }
    }

    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 清除本地存储的认证信息
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        ElMessage.success('已退出登录')
        router.push('/login')
      } catch (error) {
        // 用户取消操作
      }
    }

    const handleChangePassword = async () => {
      if (!passwordFormRef.value) return

      try {
        await passwordFormRef.value.validate()
        changePasswordLoading.value = true

        // 这里应该调用修改密码API
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用

        ElMessage.success('密码修改成功')
        changePasswordVisible.value = false

        // 重置表单
        passwordForm.value = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      } catch (error) {
        console.error('修改密码失败:', error)
      } finally {
        changePasswordLoading.value = false
      }
    }

    // 检查登录状态
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      if (!token && route.path !== '/login') {
        router.push('/login')
      }
    }

    onMounted(() => {
      checkAuth()
    })

    // 监听路由变化
    watch(
      () => route.path,
      () => {
        checkAuth()
      }
    )

    return {
      // 图标
      Expand,
      ArrowDown,
      User,
      Setting,
      SwitchButton,
      DataAnalysis,
      UserFilled,
      Document,
      Collection,
      Connection,
      PieChart,
      // 状态和方法
      sidebarCollapsed,
      changePasswordVisible,
      changePasswordLoading,
      passwordFormRef,
      passwordForm,
      passwordRules,
      userName,
      userInitial,
      activeMenu,
      currentBreadcrumb,
      toggleSidebar,
      handleMenuSelect,
      handleCommand,
      handleChangePassword
    }
  }
}
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;

      .logo-icon {
        font-size: 24px;
      }

      .logo-text {
        font-size: 20px;
        font-weight: 600;
        color: #1890ff;
      }
    }

    .subtitle {
      color: #666;
      font-size: 14px;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 6px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f5f5;
      }

      .user-avatar {
        background: #1890ff;
        color: #fff;
        font-weight: 500;
      }

      .username {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }

      .dropdown-icon {
        color: #666;
        transition: transform 0.3s;
      }

      &:hover .dropdown-icon {
        transform: rotate(180deg);
      }
    }
  }
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: 64px;
  }

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 12px;

    .collapse-btn {
      flex-shrink: 0;
    }

    .sidebar-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }
  }

  .sidebar-menu {
    flex: 1;
    border-right: none;

    :deep(.el-menu-item) {
      height: 48px;
      line-height: 48px;

      &:hover {
        background-color: #f5f7fa;
      }

      &.is-active {
        background-color: #1890ff;
        color: #fff;

        &:hover {
          background-color: #40a9ff;
        }
      }
    }
  }
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .breadcrumb {
    padding: 16px 20px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
  }

  .page-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .header {
    padding: 0 16px;

    .header-left {
      .subtitle {
        display: none;
      }
    }

    .header-right {
      .username {
        display: none;
      }
    }
  }

  .sidebar {
    width: 200px;

    &.collapsed {
      width: 64px;
    }
  }
}
</style>