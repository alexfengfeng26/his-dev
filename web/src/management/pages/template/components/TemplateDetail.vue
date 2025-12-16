<template>
  <div class="template-detail">
    <!-- 基本信息 -->
    <el-descriptions title="基本信息" :column="2" border>
      <el-descriptions-item label="模板名称">{{
        template.name
      }}</el-descriptions-item>
      <el-descriptions-item label="模板代码">{{
        template.code
      }}</el-descriptions-item>
      <el-descriptions-item label="模板类型">
        <el-tag :type="getTypeTagType(template.type)">
          {{ getTypeLabel(template.type) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="版本号">{{
        template.version
      }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="template.isEnabled ? 'success' : 'warning'">
          {{ template.isEnabled ? "启用" : "停用" }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="系统模板">
        <el-tag :type="template.isSystem ? 'danger' : 'success'">
          {{ template.isSystem ? "是" : "否" }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="使用次数">{{
        template.usageCount
      }}</el-descriptions-item>
      <el-descriptions-item label="创建者">{{
        template.createdBy
      }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{
        formatDateTime(template.createdAt)
      }}</el-descriptions-item>
      <el-descriptions-item label="最后修改">{{
        formatDateTime(template.updatedAt)
      }}</el-descriptions-item>
      <el-descriptions-item label="标签" :span="2">
        <div class="tags-container">
          <el-tag
            v-for="tag in template.tags"
            :key="tag"
            size="small"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
          <span
            v-if="!template.tags || template.tags.length === 0"
            class="no-tags"
            >暂无标签</span
          >
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">
        {{ template.description || "暂无描述" }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 适用科室 -->
    <el-card class="section-card" header="适用科室">
      <div v-if="template.departmentIds && template.departmentIds.length > 0">
        <el-tag
          v-for="deptId in template.departmentIds"
          :key="deptId"
          class="dept-tag"
        >
          {{ getDepartmentName(deptId) }}
        </el-tag>
      </div>
      <div v-else class="empty-content">适用于所有科室</div>
    </el-card>

    <!-- 模板配置 -->
    <el-card class="section-card" header="模板配置">
      <div class="json-viewer">
        <el-button
          size="small"
          type="primary"
          @click="copyToClipboard(template.config)"
        >
          复制配置
        </el-button>
        <pre class="json-content">{{ formatJson(template.config) }}</pre>
      </div>
    </el-card>

    <!-- 模板结构 -->
    <el-card class="section-card" header="模板结构">
      <div class="json-viewer">
        <el-button
          size="small"
          type="primary"
          @click="copyToClipboard(template.structure)"
        >
          复制结构
        </el-button>
        <pre class="json-content">{{ formatJson(template.structure) }}</pre>
      </div>
    </el-card>

    <!-- 字段配置 -->
    <el-card class="section-card" header="字段配置">
      <div class="fields-section">
        <el-button size="small" type="primary" @click="copyFieldsToClipboard">
          复制字段配置
        </el-button>

        <div
          v-if="template.fields && template.fields.length > 0"
          class="fields-table"
        >
          <el-table :data="template.fields" stripe>
            <el-table-column prop="key" label="字段键" width="150" />
            <el-table-column prop="name" label="字段名称" width="150" />
            <el-table-column prop="type" label="字段类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getFieldTypeTagType(row.type)">
                  {{ getFieldTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="placeholder" label="占位符" />
            <el-table-column prop="required" label="必填" width="80">
              <template #default="{ row }">
                <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                  {{ row.required ? "是" : "否" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="defaultValue" label="默认值" />
          </el-table>
        </div>
        <div v-else class="empty-content">暂无字段配置</div>
      </div>
    </el-card>

    <!-- 验证规则 -->
    <el-card class="section-card" header="验证规则">
      <div class="json-viewer">
        <el-button
          size="small"
          type="primary"
          @click="copyToClipboard(template.validationRules)"
        >
          复制规则
        </el-button>
        <pre v-if="template.validationRules" class="json-content">
          {{ formatJson(template.validationRules) }}
        </pre>
        <div v-else class="empty-content">暂无验证规则</div>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="actions">
      <el-button v-if="!template.isSystem" type="primary" @click="handleEdit">
        编辑模板
      </el-button>
      <el-button
        v-if="!template.isSystem"
        type="success"
        @click="handleDuplicate"
      >
        复制模板
      </el-button>
      <el-button @click="handleExport">导出配置</el-button>
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import type { Template } from "../../services/template";

interface Props {
  template: Template;
}

interface Emits {
  (e: "edit", template: Template): void;
  (e: "duplicate", template: Template): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 科室映射（TODO: 从API获取）
const departmentMap: Record<string, string> = {
  "1": "内科",
  "2": "外科",
  "3": "儿科",
  "4": "妇产科",
  "5": "骨科",
  "6": "眼科",
  "7": "耳鼻喉科",
  "8": "口腔科",
};

// 辅助函数
const getTypeLabel = (type: string) => {
  const typeMap = {
    basic: "基础模板",
    specialty: "专科模板",
    custom: "自定义模板",
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getTypeTagType = (type: string) => {
  const typeMap = {
    basic: "",
    specialty: "success",
    custom: "warning",
  };
  return typeMap[type as keyof typeof typeMap] || "";
};

const getFieldTypeLabel = (type: string) => {
  const typeMap = {
    string: "文本",
    number: "数字",
    date: "日期",
    boolean: "布尔",
    array: "数组",
    object: "对象",
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getFieldTypeTagType = (type: string) => {
  const typeMap = {
    string: "primary",
    number: "success",
    date: "warning",
    boolean: "info",
    array: "danger",
    object: "",
  };
  return typeMap[type as keyof typeof typeMap] || "";
};

const getDepartmentName = (deptId: string) => {
  return departmentMap[deptId] || `科室${deptId}`;
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

const formatJson = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return "格式错误";
  }
};

// 操作函数
const copyToClipboard = async (data: any) => {
  try {
    const text = formatJson(data);
    await navigator.clipboard.writeText(text);
    ElMessage.success("复制成功");
  } catch (error) {
    ElMessage.error("复制失败");
  }
};

const copyFieldsToClipboard = async () => {
  try {
    const text = formatJson(props.template.fields);
    await navigator.clipboard.writeText(text);
    ElMessage.success("字段配置复制成功");
  } catch (error) {
    ElMessage.error("复制失败");
  }
};

const handleEdit = () => {
  emit("edit", props.template);
};

const handleDuplicate = () => {
  emit("duplicate", props.template);
};

const handleExport = () => {
  const exportData = {
    name: props.template.name,
    code: props.template.code,
    description: props.template.description,
    type: props.template.type,
    version: props.template.version,
    config: props.template.config,
    structure: props.template.structure,
    fields: props.template.fields,
    validationRules: props.template.validationRules,
    tags: props.template.tags,
    exportedAt: new Date().toISOString(),
    exportedBy: "HIS系统", // TODO: 获取当前用户信息
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `template-${props.template.code}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  ElMessage.success("模板配置导出成功");
};

const handleClose = () => {
  // 这个方法会由父组件调用关闭对话框
};
</script>

<style scoped>
.template-detail {
  padding: 20px;
}

.section-card {
  margin-top: 20px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

.no-tags {
  color: #999;
  font-style: italic;
}

.dept-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.json-viewer {
  position: relative;
}

.json-content {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  margin-top: 10px;
  font-family: "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.fields-section {
  margin-top: 10px;
}

.fields-table {
  margin-top: 10px;
}

.empty-content {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
  margin-top: 10px;
}

.actions {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.actions .el-button {
  margin: 0 8px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  background-color: #fafafa;
}

:deep(.el-descriptions__content) {
  word-break: break-word;
}
</style>
