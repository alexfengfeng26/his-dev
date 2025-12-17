<template>
  <div class="template-management">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <h1>模板管理</h1>
      <div class="actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新增模板
        </el-button>
        <el-button @click="loadTemplates">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div v-if="statistics" class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.totalTemplates }}</div>
              <div class="stat-label">总模板数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.systemTemplates }}</div>
              <div class="stat-label">系统模板</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.customTemplates }}</div>
              <div class="stat-label">自定义模板</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.enabledTemplates }}</div>
              <div class="stat-label">启用模板</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-form">
      <el-form :model="queryParams" inline>
        <el-form-item label="模板名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入模板名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="模板代码">
          <el-input
            v-model="queryParams.code"
            placeholder="请输入模板代码"
            clearable
          />
        </el-form-item>
        <el-form-item label="模板类型">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择类型"
            clearable
          >
            <el-option label="基础模板" value="basic" />
            <el-option label="专科模板" value="specialty" />
            <el-option label="自定义模板" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统模板">
          <el-select
            v-model="queryParams.isSystem"
            placeholder="请选择"
            clearable
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.isEnabled"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索名称、描述、标签"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 模板列表 -->
    <el-card>
      <el-table v-loading="loading" :data="templateList" stripe>
        <el-table-column prop="code" label="模板代码" width="150" />
        <el-table-column prop="name" label="模板名称" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column prop="usageCount" label="使用次数" width="100">
          <template #default="{ row }">
            <el-badge :value="row.usageCount" :max="99" class="usage-badge">
              {{ row.usageCount }}
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isSystem" label="系统模板" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isSystem ? 'danger' : 'success'">
              {{ row.isSystem ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isEnabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'warning'">
              {{ row.isEnabled ? "启用" : "停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button
              size="small"
              type="primary"
              :disabled="row.isSystem"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="success"
              :disabled="row.isSystem"
              @click="handleDuplicate(row)"
            >
              复制
            </el-button>
            <el-dropdown trigger="click" @command="handleCommand">
              <el-button size="small" type="warning">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    :command="`status-${row._id}-${!row.isEnabled}`"
                  >
                    {{ row.isEnabled ? "停用" : "启用" }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="`usage-${row._id}`" divided>
                    增加使用次数
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="`delete-${row._id}`"
                    divided
                    :disabled="row.isSystem"
                  >
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑模板对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="currentTemplate ? '编辑模板' : '新增模板'"
      width="1000px"
      @close="handleDialogClose"
    >
      <template-form
        v-if="showCreateDialog"
        :template="currentTemplate"
        @submit="handleSubmit"
        @cancel="handleDialogClose"
      />
    </el-dialog>

    <!-- 查看模板对话框 -->
    <el-dialog v-model="showViewDialog" title="模板详情" width="1000px">
      <template-detail
        v-if="showViewDialog && currentTemplate"
        :template="currentTemplate"
        @edit="handleEdit"
        @duplicate="handleDuplicate"
      />
    </el-dialog>

    <!-- 复制模板对话框 -->
    <el-dialog v-model="showDuplicateDialog" title="复制模板" width="500px">
      <el-form
        ref="duplicateFormRef"
        :model="duplicateForm"
        :rules="duplicateRules"
        label-width="100px"
      >
        <el-form-item label="新模板名称" prop="newName">
          <el-input
            v-model="duplicateForm.newName"
            placeholder="请输入新模板名称"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="duplicating"
            @click="handleDuplicateSubmit"
          >
            确认复制
          </el-button>
          <el-button @click="showDuplicateDialog = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh, ArrowDown } from "@element-plus/icons-vue";
import { templateService } from "../../services/template";
import type { Template, QueryTemplateDto } from "../../services/template";

import TemplateForm from "./components/TemplateForm.vue";
import TemplateDetail from "./components/TemplateDetail.vue";
import type { FormInstance, FormRules } from "element-plus";

// 响应式数据
const loading = ref(false);
const templateList = ref<Template[]>([]);
const statistics = ref<any>(null);
const showCreateDialog = ref(false);
const showViewDialog = ref(false);
const showDuplicateDialog = ref(false);
const currentTemplate = ref<Template | null>(null);
const duplicateFormRef = ref<FormInstance>();
const duplicating = ref(false);

// 查询参数
const queryParams = reactive<QueryTemplateDto>({
  page: 1,
  limit: 20,
  name: "",
  code: "",
  type: undefined,
  isSystem: undefined,
  isEnabled: undefined,
  keyword: "",
});

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

// 复制表单
const duplicateForm = reactive({
  newName: "",
});

const duplicateRules: FormRules = {
  newName: [{ required: true, message: "请输入新模板名称", trigger: "blur" }],
};

// 加载模板列表
const loadTemplates = async () => {
  try {
    loading.value = true;
    const params = {
      ...queryParams,
      page: pagination.page,
      limit: pagination.limit,
    };
    // 移除空值
    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] === undefined) {
        delete params[key];
      }
    });

    const response = await templateService.getTemplates(params);
    templateList.value = response.templates;
    pagination.total = response.total;
  } catch (error) {
    console.error("获取模板列表失败:", error);
    ElMessage.error("获取模板列表失败");
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await templateService.getStatistics();
    statistics.value = response.data;
  } catch (error) {
    console.error("获取统计数据失败:", error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadTemplates();
};

// 重置搜索
const handleReset = () => {
  queryParams.name = "";
  queryParams.code = "";
  queryParams.type = undefined;
  queryParams.isSystem = undefined;
  queryParams.isEnabled = undefined;
  queryParams.keyword = "";
  pagination.page = 1;
  loadTemplates();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  loadTemplates();
};

// 页码变化
const handleCurrentChange = (page: number) => {
  pagination.page = page;
  loadTemplates();
};

// 查看模板
const handleView = (template: Template) => {
  currentTemplate.value = template;
  showViewDialog.value = true;
};

// 编辑模板
const handleEdit = (template: Template) => {
  currentTemplate.value = template;
  showCreateDialog.value = true;
  showViewDialog.value = false;
};

// 复制模板
const handleDuplicate = (template: Template) => {
  currentTemplate.value = template;
  duplicateForm.newName = `${template.name} - 副本`;
  showDuplicateDialog.value = true;
};

// 处理更多操作命令
const handleCommand = async (command: string) => {
  const [action, id, value] = command.split("-");

  try {
    switch (action) {
      case "status":
        await templateService.updateTemplateStatus(id, value === "true");
        ElMessage.success(`模板已${value === "true" ? "启用" : "停用"}`);
        loadTemplates();
        break;
      case "usage":
        await templateService.incrementUsageCount(id);
        ElMessage.success("使用次数已更新");
        loadTemplates();
        break;
      case "delete":
        await ElMessageBox.confirm("确定要删除该模板吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        await templateService.deleteTemplate(id);
        ElMessage.success("模板已删除");
        loadTemplates();
        loadStatistics();
        break;
    }
  } catch (error) {
    console.error("操作失败:", error);
    ElMessage.error("操作失败");
  }
};

// 处理表单提交
const handleSubmit = async (data: any) => {
  try {
    if (currentTemplate.value) {
      await templateService.updateTemplate(currentTemplate.value._id, data);
      ElMessage.success("模板更新成功");
    } else {
      await templateService.createTemplate(data);
      ElMessage.success("模板创建成功");
    }

    showCreateDialog.value = false;
    currentTemplate.value = null;
    loadTemplates();
    loadStatistics();
  } catch (error) {
    console.error("保存模板失败:", error);
    ElMessage.error("保存模板失败");
  }
};

// 处理复制提交
const handleDuplicateSubmit = async () => {
  if (!duplicateFormRef.value) return;

  try {
    await duplicateFormRef.value.validate();
    duplicating.value = true;

    if (currentTemplate.value) {
      await templateService.duplicateTemplate(currentTemplate.value._id, {
        newName: duplicateForm.newName,
      });
      ElMessage.success("模板复制成功");
      showDuplicateDialog.value = false;
      duplicateForm.newName = "";
      currentTemplate.value = null;
      loadTemplates();
      loadStatistics();
    }
  } catch (error) {
    console.error("复制模板失败:", error);
    ElMessage.error("复制模板失败");
  } finally {
    duplicating.value = false;
  }
};

// 关闭对话框
const handleDialogClose = () => {
  showCreateDialog.value = false;
  showViewDialog.value = false;
  showDuplicateDialog.value = false;
  currentTemplate.value = null;
  duplicateForm.newName = "";
};

// 辅助函数
const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

const getTypeLabel = (type: string) => {
  const typeMap = {
    basic: "基础模板",
    specialty: "专科模板",
    custom: "自定义模板",
  };
  return typeMap[type] || type;
};

const getTypeTagType = (type: string) => {
  const typeMap = {
    basic: "",
    specialty: "success",
    custom: "warning",
  };
  return typeMap[type] || "";
};

// 初始化
onMounted(() => {
  loadTemplates();
  loadStatistics();
});
</script>

<style scoped>
.template-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 10px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 4px;
}

.usage-badge {
  font-weight: normal;
}
</style>
