<template>
  <div class="medical-record-management">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <h1>病历管理</h1>
      <div class="actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新增病历
        </el-button>
        <el-button @click="loadRecords">
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
              <div class="stat-number">{{ statistics.totalRecords }}</div>
              <div class="stat-label">总病历数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.outpatientRecords }}</div>
              <div class="stat-label">门诊病历</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.inpatientRecords }}</div>
              <div class="stat-label">住院病历</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.completedRecords }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-form">
      <el-form :model="queryParams" inline>
        <el-form-item label="病历编号">
          <el-input
            v-model="queryParams.recordNo"
            placeholder="请输入病历编号"
            clearable
          />
        </el-form-item>
        <el-form-item label="病历类型">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择类型"
            clearable
          >
            <el-option label="门诊病历" value="outpatient" />
            <el-option label="住院病历" value="inpatient" />
            <el-option label="急诊病历" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="科室">
          <el-input
            v-model="queryParams.department"
            placeholder="请输入科室"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="草稿" value="draft" />
            <el-option label="完成" value="completed" />
            <el-option label="归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索主诉、诊断等"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 病历列表 -->
    <el-card>
      <el-table v-loading="loading" :data="recordList" stripe>
        <el-table-column prop="recordNo" label="病历编号" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="visitDate" label="就诊日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.visitDate) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="chiefComplaint"
          label="主诉"
          show-overflow-tooltip
        />
        <el-table-column prop="diagnosis" label="诊断" width="150">
          <template #default="{ row }">
            {{ row.diagnosis?.join(", ") || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-dropdown trigger="click" @command="handleCommand">
              <el-button size="small" type="warning">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="row.status !== 'completed'"
                    :command="`status-${row._id}`"
                  >
                    标记完成
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'completed'"
                    :command="`archive-${row._id}`"
                  >
                    归档
                  </el-dropdown-item>
                  <el-dropdown-item :command="`delete-${row._id}`" divided>
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

    <!-- 创建/编辑病历对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="currentRecord ? '编辑病历' : '新增病历'"
      width="800px"
      @close="handleDialogClose"
    >
      <medical-record-form
        v-if="showCreateDialog"
        :record="currentRecord"
        @submit="handleSubmit"
        @cancel="handleDialogClose"
      />
    </el-dialog>

    <!-- 查看病历对话框 -->
    <el-dialog v-model="showViewDialog" title="病历详情" width="800px">
      <medical-record-detail
        v-if="showViewDialog && currentRecord"
        :record="currentRecord"
        @edit="handleEdit"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh, ArrowDown } from "@element-plus/icons-vue";
import { medicalRecordService } from "../../services/medical-record";
import type {
  MedicalRecord,
  QueryMedicalRecordDto,
} from "../../services/medical-record";
import MedicalRecordForm from "./components/MedicalRecordForm.vue";
import MedicalRecordDetail from "./components/MedicalRecordDetail.vue";

// 响应式数据
const loading = ref(false);
const recordList = ref<MedicalRecord[]>([]);
const statistics = ref<any>(null);
const showCreateDialog = ref(false);
const showViewDialog = ref(false);
const currentRecord = ref<MedicalRecord | null>(null);

// 查询参数
const queryParams = reactive<QueryMedicalRecordDto>({
  page: 1,
  limit: 20,
  recordNo: "",
  type: undefined,
  department: "",
  status: undefined,
  keyword: "",
});

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

// 加载病历列表
const loadRecords = async () => {
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

    const response = await medicalRecordService.getRecords(params);
    recordList.value = response.records;
    pagination.total = response.total;
  } catch (error) {
    console.error("获取病历列表失败:", error);
    ElMessage.error("获取病历列表失败");
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await medicalRecordService.getStatistics();
    statistics.value = response.data;
  } catch (error) {
    console.error("获取统计数据失败:", error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadRecords();
};

// 重置搜索
const handleReset = () => {
  queryParams.recordNo = "";
  queryParams.type = undefined;
  queryParams.department = "";
  queryParams.status = undefined;
  queryParams.keyword = "";
  pagination.page = 1;
  loadRecords();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  loadRecords();
};

// 页码变化
const handleCurrentChange = (page: number) => {
  pagination.page = page;
  loadRecords();
};

// 查看病历
const handleView = (record: MedicalRecord) => {
  currentRecord.value = record;
  showViewDialog.value = true;
};

// 编辑病历
const handleEdit = (record: MedicalRecord) => {
  currentRecord.value = record;
  showCreateDialog.value = true;
  showViewDialog.value = false;
};

// 处理更多操作命令
const handleCommand = async (command: string) => {
  const [action, id] = command.split("-");

  try {
    switch (action) {
      case "status":
        await medicalRecordService.updateRecordStatus(id, "completed");
        ElMessage.success("病历已标记为完成");
        loadRecords();
        break;
      case "archive":
        await medicalRecordService.updateRecordStatus(id, "archived");
        ElMessage.success("病历已归档");
        loadRecords();
        break;
      case "delete":
        await ElMessageBox.confirm("确定要删除该病历吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        await medicalRecordService.deleteRecord(id);
        ElMessage.success("病历已删除");
        loadRecords();
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
    if (currentRecord.value) {
      await medicalRecordService.updateRecord(currentRecord.value._id, data);
      ElMessage.success("病历更新成功");
    } else {
      await medicalRecordService.createRecord(data);
      ElMessage.success("病历创建成功");
    }

    showCreateDialog.value = false;
    currentRecord.value = null;
    loadRecords();
    loadStatistics();
  } catch (error) {
    console.error("保存病历失败:", error);
    ElMessage.error("保存病历失败");
  }
};

// 关闭对话框
const handleDialogClose = () => {
  showCreateDialog.value = false;
  showViewDialog.value = false;
  currentRecord.value = null;
};

// 辅助函数
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

const getTypeLabel = (type: string) => {
  const typeMap = {
    outpatient: "门诊",
    inpatient: "住院",
    emergency: "急诊",
  };
  return typeMap[type] || type;
};

const getTypeTagType = (type: string) => {
  const typeMap = {
    outpatient: "",
    inpatient: "success",
    emergency: "danger",
  };
  return typeMap[type] || "";
};

const getStatusLabel = (status: string) => {
  const statusMap = {
    draft: "草稿",
    completed: "完成",
    archived: "归档",
  };
  return statusMap[status] || status;
};

const getStatusTagType = (status: string) => {
  const statusMap = {
    draft: "info",
    completed: "success",
    archived: "warning",
  };
  return statusMap[status] || "";
};

// 初始化
onMounted(() => {
  loadRecords();
  loadStatistics();
});
</script>

<style scoped>
.medical-record-management {
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
</style>
