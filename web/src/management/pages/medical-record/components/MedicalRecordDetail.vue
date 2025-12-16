<template>
  <div class="medical-record-detail">
    <div class="detail-header">
      <div class="record-info">
        <h2>{{ formData.recordNo }}</h2>
        <div class="meta-info">
          <el-tag :type="getTypeTagType(formData.type)">
            {{ getTypeLabel(formData.type) }}
          </el-tag>
          <el-tag :type="getStatusTagType(formData.status)" class="ml-2">
            {{ getStatusLabel(formData.status) }}
          </el-tag>
        </div>
      </div>
      <div class="actions">
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <el-divider />

    <div class="detail-content">
      <!-- 基本信息 -->
      <el-descriptions title="基本信息" :column="3" border>
        <el-descriptions-item label="病历编号">
          {{ formData.recordNo }}
        </el-descriptions-item>
        <el-descriptions-item label="病历类型">
          <el-tag :type="getTypeTagType(formData.type)">
            {{ getTypeLabel(formData.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="科室">
          {{ formData.department }}
        </el-descriptions-item>
        <el-descriptions-item label="就诊日期">
          {{ formatDate(formData.visitDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="复诊时间">
          {{ formData.followUpDate ? formatDate(formData.followUpDate) : "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(formData.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 主诉 -->
      <div class="section">
        <h3 class="section-title">主诉</h3>
        <div class="section-content">
          {{ formData.chiefComplaint }}
        </div>
      </div>

      <!-- 现病史 -->
      <div v-if="formData.presentIllness" class="section">
        <h3 class="section-title">现病史</h3>
        <div class="section-content">
          {{ formData.presentIllness }}
        </div>
      </div>

      <!-- 既往史 -->
      <div
        v-if="
          formData.pastHistory &&
          formData.pastHistory.length > 0 &&
          formData.pastHistory.some((item) => item.trim())
        "
        class="section"
      >
        <h3 class="section-title">既往史</h3>
        <div class="section-content">
          <ul>
            <li
              v-for="(item, index) in formData.pastHistory.filter((item) =>
                item.trim(),
              )"
              :key="index"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 体格检查 -->
      <div v-if="formData.physicalExam" class="section">
        <h3 class="section-title">体格检查</h3>
        <div class="section-content">
          {{ formData.physicalExam }}
        </div>
      </div>

      <!-- 辅助检查 -->
      <div v-if="formData.auxiliaryExam" class="section">
        <h3 class="section-title">辅助检查</h3>
        <div class="section-content">
          {{ formData.auxiliaryExam }}
        </div>
      </div>

      <!-- 诊断 -->
      <div class="section">
        <h3 class="section-title">诊断</h3>
        <div class="section-content">
          <div
            v-for="(diagnosis, index) in formData.diagnosis.filter((item) =>
              item.trim(),
            )"
            :key="index"
            class="diagnosis-item"
          >
            <el-tag type="danger">{{ diagnosis }}</el-tag>
          </div>
        </div>
      </div>

      <!-- 治疗方案 -->
      <div v-if="formData.treatment" class="section">
        <h3 class="section-title">治疗方案</h3>
        <div class="section-content">
          {{ formData.treatment }}
        </div>
      </div>

      <!-- 处方 -->
      <div
        v-if="
          formData.prescription &&
          formData.prescription.length > 0 &&
          formData.prescription.some((item) => item.trim())
        "
        class="section"
      >
        <h3 class="section-title">处方</h3>
        <div class="section-content">
          <ul>
            <li
              v-for="(item, index) in formData.prescription.filter((item) =>
                item.trim(),
              )"
              :key="index"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 医嘱 -->
      <div v-if="formData.medicalAdvice" class="section">
        <h3 class="section-title">医嘱</h3>
        <div class="section-content">
          {{ formData.medicalAdvice }}
        </div>
      </div>

      <!-- 备注 -->
      <div v-if="formData.notes" class="section">
        <h3 class="section-title">备注</h3>
        <div class="section-content">
          {{ formData.notes }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { Edit, Printer, Download } from "@element-plus/icons-vue";
import type { MedicalRecord } from "../../../services/medical-record";

// Props
interface Props {
  record: MedicalRecord;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  edit: [record: MedicalRecord];
}>();

// 表单数据
const formData = reactive({
  recordNo: "",
  type: "outpatient",
  department: "",
  visitDate: "",
  chiefComplaint: "",
  presentIllness: "",
  pastHistory: [] as string[],
  physicalExam: "",
  auxiliaryExam: "",
  diagnosis: [] as string[],
  treatment: "",
  prescription: [] as string[],
  medicalAdvice: "",
  followUpDate: "",
  status: "draft",
  notes: "",
  createdAt: "",
});

// 监听props变化
watch(
  () => props.record,
  (newRecord) => {
    if (newRecord) {
      Object.assign(formData, {
        recordNo: newRecord.recordNo,
        type: newRecord.type,
        department: newRecord.department,
        visitDate: newRecord.visitDate,
        chiefComplaint: newRecord.chiefComplaint,
        presentIllness: newRecord.presentIllness || "",
        pastHistory: newRecord.pastHistory || [],
        physicalExam: newRecord.physicalExam || "",
        auxiliaryExam: newRecord.auxiliaryExam || "",
        diagnosis: newRecord.diagnosis || [],
        treatment: newRecord.treatment || "",
        prescription: newRecord.prescription || [],
        medicalAdvice: newRecord.medicalAdvice || "",
        followUpDate: newRecord.followUpDate || "",
        status: newRecord.status,
        notes: newRecord.notes || "",
        createdAt: newRecord.createdAt,
      });
    }
  },
  { immediate: true },
);

// 处理编辑
const handleEdit = () => {
  emit("edit", props.record);
};

// 处理打印
const handlePrint = () => {
  window.print();
};

// 处理导出
const handleExport = () => {
  try {
    const content = formatForExport();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `病历_${formData.recordNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    ElMessage.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败");
  }
};

// 格式化导出内容
const formatForExport = () => {
  return `
病历编号：${formData.recordNo}
病历类型：${getTypeLabel(formData.type)}
科室：${formData.department}
就诊日期：${formatDate(formData.visitDate)}
状态：${getStatusLabel(formData.status)}

主诉：
${formData.chiefComplaint}

${formData.presentIllness ? `现病史：\n${formData.presentIllness}\n\n` : ""}${formData.pastHistory && formData.pastHistory.some((item) => item.trim()) ? `既往史：\n${formData.pastHistory.filter((item) => item.trim()).join("\n")}\n\n` : ""}${formData.physicalExam ? `体格检查：\n${formData.physicalExam}\n\n` : ""}${formData.auxiliaryExam ? `辅助检查：\n${formData.auxiliaryExam}\n\n` : ""}诊断：
${formData.diagnosis.filter((item) => item.trim()).join("\n")}

${formData.treatment ? `治疗方案：\n${formData.treatment}\n\n` : ""}${formData.prescription && formData.prescription.some((item) => item.trim()) ? `处方：\n${formData.prescription.filter((item) => item.trim()).join("\n")}\n\n` : ""}${formData.medicalAdvice ? `医嘱：\n${formData.medicalAdvice}\n\n` : ""}${formData.notes ? `备注：\n${formData.notes}\n\n` : ""}创建时间：${formatDateTime(formData.createdAt)}
  `.trim();
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
    outpatient: "门诊病历",
    inpatient: "住院病历",
    emergency: "急诊病历",
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
</script>

<style scoped>
.medical-record-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.record-info h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 500;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.actions {
  display: flex;
  gap: 8px;
}

.detail-content {
  padding: 0;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-left: 4px solid #409eff;
  padding-left: 12px;
}

.section-content {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.section-content ul {
  margin: 0;
  padding-left: 20px;
}

.section-content li {
  margin-bottom: 8px;
}

.section-content li:last-child {
  margin-bottom: 0;
}

.diagnosis-item {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 8px;
}

/* 打印样式 */
@media print {
  .medical-record-detail {
    max-height: none;
    overflow: visible;
  }

  .detail-header .actions {
    display: none;
  }

  .section-content {
    background-color: white;
    border: 1px solid #ddd;
  }

  .el-descriptions {
    border: 1px solid #ddd !important;
  }
}
</style>
