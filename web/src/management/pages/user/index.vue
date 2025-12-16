<template>
  <div class="user-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">用户管理</h2>
        <span class="page-description">管理系统用户账号和权限</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增用户
        </el-button>
        <el-button :icon="Download" @click="handleExport"> 导出数据 </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-panel">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role"
            placeholder="请选择角色"
            clearable
            style="width: 150px"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="医生" value="doctor" />
            <el-option label="护士" value="nurse" />
            <el-option label="技师" value="technician" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 用户列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">
              {{ row.username }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="真实姓名" min-width="100" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.lastLoginTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="warning"
              size="small"
              :icon="Key"
              @click="handleResetPassword(row)"
            >
              重置密码
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                type="email"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select
                v-model="form.role"
                placeholder="请选择角色"
                style="width: 100%"
              >
                <el-option label="管理员" value="admin" />
                <el-option label="医生" value="doctor" />
                <el-option label="护士" value="nurse" />
                <el-option label="技师" value="technician" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科室" prop="department">
              <el-input v-model="form.department" placeholder="请输入科室" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="!isEdit" :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                placeholder="请输入密码"
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                placeholder="请再次输入密码"
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="用户详情" width="500px">
      <div v-if="viewUser" class="user-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户ID">{{
            viewUser.id
          }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{
            viewUser.username
          }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{
            viewUser.realName
          }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{
            viewUser.email
          }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{
            viewUser.phone
          }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="getRoleTagType(viewUser.role)">
              {{ getRoleText(viewUser.role) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="科室">{{
            viewUser.department
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="viewUser.status ? 'success' : 'danger'">
              {{ viewUser.status ? "启用" : "禁用" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            formatDateTime(viewUser.createdAt)
          }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{
            formatDateTime(viewUser.lastLoginTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{
            viewUser.remark || "无"
          }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Download,
  Search,
  Refresh,
  Edit,
  Delete,
  Key,
} from "@element-plus/icons-vue";
import { userService } from "../../services/user";

export default {
  name: "UserManagement",
  setup() {
    const loading = ref(false);
    const submitLoading = ref(false);
    const dialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const isEdit = ref(false);
    const formRef = ref();
    const viewUser = ref(null);

    // 搜索表单
    const searchForm = reactive({
      username: "",
      role: "",
      status: null,
    });

    // 用户表单
    const form = reactive({
      id: null,
      username: "",
      realName: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      password: "",
      confirmPassword: "",
      status: true,
      remark: "",
    });

    // 分页
    const pagination = reactive({
      page: 1,
      size: 20,
      total: 0,
    });

    // 用户列表数据
    const userList = ref([]);

    // 表单验证规则
    const rules = {
      username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        {
          min: 3,
          max: 20,
          message: "用户名长度在 3 到 20 个字符",
          trigger: "blur",
        },
      ],
      realName: [
        { required: true, message: "请输入真实姓名", trigger: "blur" },
      ],
      email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
      ],
      phone: [
        {
          pattern: /^1[3-9]\d{9}$/,
          message: "请输入正确的手机号格式",
          trigger: "blur",
        },
      ],
      role: [{ required: true, message: "请选择角色", trigger: "change" }],
      password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码长度至少6位", trigger: "blur" },
      ],
      confirmPassword: [
        { required: true, message: "请确认密码", trigger: "blur" },
        {
          validator: (rule, value, callback) => {
            if (value !== form.password) {
              callback(new Error("两次输入的密码不一致"));
            } else {
              callback();
            }
          },
          trigger: "blur",
        },
      ],
    };

    // 计算属性
    const dialogTitle = computed(() => {
      return isEdit.value ? "编辑用户" : "新增用户";
    });

    // 角色相关方法
    const getRoleText = (role) => {
      const roleMap = {
        admin: "管理员",
        doctor: "医生",
        nurse: "护士",
        technician: "技师",
      };
      return roleMap[role] || role;
    };

    const getRoleTagType = (role) => {
      const typeMap = {
        admin: "danger",
        doctor: "primary",
        nurse: "success",
        technician: "warning",
      };
      return typeMap[role] || "info";
    };

    // 日期格式化
    const formatDateTime = (dateTime) => {
      if (!dateTime) return "-";
      return new Date(dateTime).toLocaleString("zh-CN");
    };

    // 获取用户列表
    const fetchUserList = async () => {
      loading.value = true;
      try {
        // 构建查询参数
        const queryParams = {
          page: pagination.page,
          limit: pagination.size,
          username: searchForm.username || undefined,
          status:
            searchForm.status !== null
              ? searchForm.status
                ? "active"
                : "inactive"
              : undefined,
        };

        // 调用真实API
        const response = await userService.getUsers(queryParams);

        // 更新数据
        userList.value = response.data.users.map((user) => ({
          ...user,
          id: user._id,
          role: user.roleIds && user.roleIds.length > 0 ? "admin" : "user", // 简化角色映射
          department: user.departmentId || "未分配", // 简化科室显示
          status: user.status === "active", // 转换为布尔值
          lastLoginTime: user.lastLoginAt, // 字段映射
          remark: "", // 后端暂无此字段
        }));
        pagination.total = response.data.total;
      } catch (error) {
        console.error("获取用户列表失败:", error);
        ElMessage.error("获取用户列表失败");
      } finally {
        loading.value = false;
      }
    };

    // 搜索
    const handleSearch = () => {
      pagination.page = 1;
      fetchUserList();
    };

    // 重置搜索
    const handleReset = () => {
      Object.assign(searchForm, {
        username: "",
        role: "",
        status: null,
      });
      pagination.page = 1;
      fetchUserList();
    };

    // 分页变化
    const handleSizeChange = (size) => {
      pagination.size = size;
      pagination.page = 1;
      fetchUserList();
    };

    const handlePageChange = (page) => {
      pagination.page = page;
      fetchUserList();
    };

    // 新增用户
    const handleAdd = () => {
      isEdit.value = false;
      dialogVisible.value = true;
      resetForm();
    };

    // 编辑用户
    const handleEdit = (row) => {
      isEdit.value = true;
      dialogVisible.value = true;
      Object.assign(form, { ...row, password: "", confirmPassword: "" });
    };

    // 查看用户详情
    const handleView = (row) => {
      viewUser.value = row;
      viewDialogVisible.value = true;
    };

    // 删除用户
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除用户 "${row.username}" 吗？此操作不可恢复！`,
          "删除确认",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        );

        // 调用删除API
        await userService.deleteUser(row._id || row.id);

        ElMessage.success("删除成功");
        fetchUserList();
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除用户失败:", error);
          ElMessage.error("删除失败");
        }
      }
    };

    // 重置密码
    const handleResetPassword = async (row) => {
      try {
        const { value: newPassword } = await ElMessageBox.prompt(
          `请输入用户 "${row.username}" 的新密码：`,
          "重置密码",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            inputType: "password",
            inputValidator: (value) => {
              if (!value || value.length < 6) {
                return "密码长度至少6位";
              }
              return true;
            },
          },
        );

        // 调用重置密码API
        await userService.resetPassword(row._id || row.id, newPassword);

        ElMessage.success("密码重置成功");
      } catch (error) {
        if (error !== "cancel") {
          console.error("重置密码失败:", error);
          ElMessage.error("重置密码失败");
        }
      }
    };

    // 导出数据
    const handleExport = () => {
      ElMessage.info("导出功能开发中...");
    };

    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return;

      try {
        await formRef.value.validate();
        submitLoading.value = true;

        if (isEdit.value) {
          // 更新用户
          const updateData = {
            realName: form.realName,
            email: form.email,
            phone: form.phone,
            status: form.status ? "active" : "inactive",
            isSuperAdmin: form.role === "admin",
          };
          await userService.updateUser(form.id, updateData);
        } else {
          // 创建用户
          const createData = {
            username: form.username,
            password: form.password,
            realName: form.realName,
            email: form.email,
            phone: form.phone,
            isSuperAdmin: form.role === "admin",
          };
          await userService.createUser(createData);
        }

        ElMessage.success(isEdit.value ? "更新成功" : "创建成功");
        dialogVisible.value = false;
        fetchUserList();
      } catch (error) {
        console.error("保存用户失败:", error);
        ElMessage.error("保存失败");
      } finally {
        submitLoading.value = false;
      }
    };

    // 对话框关闭
    const handleDialogClose = () => {
      resetForm();
    };

    // 重置表单
    const resetForm = () => {
      Object.assign(form, {
        id: null,
        username: "",
        realName: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        password: "",
        confirmPassword: "",
        status: true,
        remark: "",
      });
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    };

    // 初始化
    onMounted(() => {
      fetchUserList();
    });

    return {
      loading,
      submitLoading,
      dialogVisible,
      viewDialogVisible,
      isEdit,
      formRef,
      viewUser,
      searchForm,
      form,
      pagination,
      userList,
      rules,
      dialogTitle,
      getRoleText,
      getRoleTagType,
      formatDateTime,
      fetchUserList,
      handleSearch,
      handleReset,
      handleSizeChange,
      handlePageChange,
      handleAdd,
      handleEdit,
      handleView,
      handleDelete,
      handleResetPassword,
      handleExport,
      handleSubmit,
      handleDialogClose,
      Plus,
      Download,
      Search,
      Refresh,
      Edit,
      Delete,
      Key,
    };
  },
};
</script>

<style lang="scss" scoped>
.user-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .header-left {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .page-description {
        color: #909399;
        font-size: 14px;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .search-panel {
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .table-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .pagination-container {
      padding: 20px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid #ebeef5;
    }
  }

  .user-detail {
    .el-descriptions {
      :deep(.el-descriptions__body) {
        background: #fafafa;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-management {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-right {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .search-panel {
      :deep(.el-form--inline) {
        .el-form-item {
          display: block;
          margin-bottom: 18px;
          margin-right: 0;

          .el-input,
          .el-select {
            width: 100% !important;
          }
        }
      }
    }
  }
}
</style>
