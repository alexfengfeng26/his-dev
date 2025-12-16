<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    @submit.prevent="handleSubmit"
  >
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="病历编号" prop="recordNo">
          <el-input v-model="formData.recordNo" placeholder="请输入病历编号" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="病历类型" prop="type">
          <el-select
            v-model="formData.type"
            placeholder="请选择病历类型"
            style="width: 100%"
          >
            <el-option label="门诊病历" value="outpatient" />
            <el-option label="住院病历" value="inpatient" />
            <el-option label="急诊病历" value="emergency" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="科室" prop="department">
          <el-input v-model="formData.department" placeholder="请输入科室" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="就诊日期" prop="visitDate">
          <el-date-picker
            v-model="formData.visitDate"
            type="date"
            placeholder="选择就诊日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="主诉" prop="chiefComplaint">
      <el-input
        v-model="formData.chiefComplaint"
        type="textarea"
        :rows="3"
        placeholder="请输入主诉"
      />
    </el-form-item>

    <el-form-item label="现病史">
      <el-input
        v-model="formData.presentIllness"
        type="textarea"
        :rows="4"
        placeholder="请输入现病史"
      />
    </el-form-item>

    <el-form-item label="既往史">
      <div class="array-input">
        <div
          v-for="(item, index) in formData.pastHistory"
          :key="index"
          class="array-item"
        >
          <el-input
            v-model="formData.pastHistory[index]"
            placeholder="请输入既往史项目"
          />
          <el-button
            type="danger"
            size="small"
            @click="removeArrayItem('pastHistory', index)"
          >
            删除
          </el-button>
        </div>
        <el-button
          type="primary"
          size="small"
          @click="addArrayItem('pastHistory')"
        >
          添加既往史
        </el-button>
      </div>
    </el-form-item>

    <el-form-item label="体格检查">
      <el-input
        v-model="formData.physicalExam"
        type="textarea"
        :rows="4"
        placeholder="请输入体格检查结果"
      />
    </el-form-item>

    <el-form-item label="辅助检查">
      <el-input
        v-model="formData.auxiliaryExam"
        type="textarea"
        :rows="4"
        placeholder="请输入辅助检查结果"
      />
    </el-form-item>

    <el-form-item label="诊断" prop="diagnosis">
      <div class="array-input">
        <div
          v-for="(item, index) in formData.diagnosis"
          :key="index"
          class="array-item"
        >
          <el-input
            v-model="formData.diagnosis[index]"
            placeholder="请输入诊断"
          />
          <el-button
            type="danger"
            size="small"
            :disabled="formData.diagnosis.length <= 1"
            @click="removeArrayItem('diagnosis', index)"
          >
            删除
          </el-button>
        </div>
        <el-button
          type="primary"
          size="small"
          @click="addArrayItem('diagnosis')"
        >
          添加诊断
        </el-button>
      </div>
    </el-form-item>

    <el-form-item label="治疗方案">
      <el-input
        v-model="formData.treatment"
        type="textarea"
        :rows="4"
        placeholder="请输入治疗方案"
      />
    </el-form-item>

    <el-form-item label="处方">
      <div class="array-input">
        <div
          v-for="(item, index) in formData.prescription"
          :key="index"
          class="array-item"
        >
          <el-input
            v-model="formData.prescription[index]"
            placeholder="请输入处方项目"
          />
          <el-button
            type="danger"
            size="small"
            @click="removeArrayItem('prescription', index)"
          >
            删除
          </el-button>
        </div>
        <el-button
          type="primary"
          size="small"
          @click="addArrayItem('prescription')"
        >
          添加处方
        </el-button>
      </div>
    </el-form-item>

    <el-form-item label="医嘱">
      <el-input
        v-model="formData.medicalAdvice"
        type="textarea"
        :rows="4"
        placeholder="请输入医嘱"
      />
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="复诊时间">
          <el-date-picker
            v-model="formData.followUpDate"
            type="date"
            placeholder="选择复诊时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="formData.status"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="完成" value="completed" />
            <el-option label="归档" value="archived" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="备注">
      <el-input
        v-model="formData.notes"
        type="textarea"
        :rows="3"
        placeholder="请输入备注"
      />
    </el-form-item>

    <!-- 表单按钮 -->
    <el-form-item>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? "更新" : "保存" }}
      </el-button>
      <el-button @click="handleCancel">取消</el-button>
      <el-button v-if="!isEdit" type="info" @click="handleSaveDraft">
        保存为草稿
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import type {
  MedicalRecord,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
} from "../../../services/medical-record";

// Props
interface Props {
  record?: MedicalRecord | null;
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
});

// Emits
const emit = defineEmits<{
  submit: [data: CreateMedicalRecordDto | UpdateMedicalRecordDto];
  cancel: [];
}>();

// 响应式数据
const formRef = ref<FormInstance>();
const submitting = ref(false);
const isEdit = ref(false);

// 表单数据
const formData = reactive<CreateMedicalRecordDto>({
  patientId: "",
  recordNo: "",
  type: "outpatient",
  department: "",
  visitDate: "",
  chiefComplaint: "",
  presentIllness: "",
  pastHistory: [""],
  physicalExam: "",
  auxiliaryExam: "",
  diagnosis: [""],
  treatment: "",
  prescription: [""],
  medicalAdvice: "",
  followUpDate: "",
  status: "draft",
  notes: "",
});

// 表单验证规则
const formRules: FormRules = {
  recordNo: [{ required: true, message: "请输入病历编号", trigger: "blur" }],
  type: [{ required: true, message: "请选择病历类型", trigger: "change" }],
  department: [{ required: true, message: "请输入科室", trigger: "blur" }],
  visitDate: [{ required: true, message: "请选择就诊日期", trigger: "change" }],
  chiefComplaint: [{ required: true, message: "请输入主诉", trigger: "blur" }],
  diagnosis: [
    { required: true, message: "请至少添加一个诊断", trigger: "change" },
    {
      validator: (rule, value, callback) => {
        if (
          !value ||
          value.length === 0 ||
          value.every((item) => !item.trim())
        ) {
          callback(new Error("请至少添加一个诊断"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 监听props变化
watch(
  () => props.record,
  (newRecord) => {
    if (newRecord) {
      isEdit.value = true;
      // 填充表单数据
      Object.assign(formData, {
        patientId: newRecord.patientId,
        recordNo: newRecord.recordNo,
        type: newRecord.type,
        department: newRecord.department,
        visitDate: newRecord.visitDate?.split("T")[0] || "",
        chiefComplaint: newRecord.chiefComplaint,
        presentIllness: newRecord.presentIllness || "",
        pastHistory: newRecord.pastHistory?.length
          ? newRecord.pastHistory
          : [""],
        physicalExam: newRecord.physicalExam || "",
        auxiliaryExam: newRecord.auxiliaryExam || "",
        diagnosis: newRecord.diagnosis?.length ? newRecord.diagnosis : [""],
        treatment: newRecord.treatment || "",
        prescription: newRecord.prescription?.length
          ? newRecord.prescription
          : [""],
        medicalAdvice: newRecord.medicalAdvice || "",
        followUpDate: newRecord.followUpDate?.split("T")[0] || "",
        status: newRecord.status,
        notes: newRecord.notes || "",
      });
    } else {
      isEdit.value = false;
      resetForm();
    }
  },
  { immediate: true },
);

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    patientId: "",
    recordNo: "",
    type: "outpatient",
    department: "",
    visitDate: "",
    chiefComplaint: "",
    presentIllness: "",
    pastHistory: [""],
    physicalExam: "",
    auxiliaryExam: "",
    diagnosis: [""],
    treatment: "",
    prescription: [""],
    medicalAdvice: "",
    followUpDate: "",
    status: "draft",
    notes: "",
  });
};

// 添加数组项
const addArrayItem = (field: "pastHistory" | "diagnosis" | "prescription") => {
  formData[field].push("");
};

// 删除数组项
const removeArrayItem = (
  field: "pastHistory" | "diagnosis" | "prescription",
  index: number,
) => {
  if (field === "diagnosis" && formData[field].length <= 1) {
    ElMessage.warning("至少需要保留一个诊断项");
    return;
  }
  formData[field].splice(index, 1);
};

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // 清理空值
    const submitData = {
      ...formData,
      pastHistory: formData.pastHistory.filter((item) => item.trim()),
      diagnosis: formData.diagnosis.filter((item) => item.trim()),
      prescription: formData.prescription.filter((item) => item.trim()),
    };

    emit("submit", submitData);
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitting.value = false;
  }
};

// 保存为草稿
const handleSaveDraft = async () => {
  if (!formRef.value) return;

  try {
    const draftData = {
      ...formData,
      status: "draft",
      pastHistory: formData.pastHistory.filter((item) => item.trim()),
      diagnosis: formData.diagnosis.filter((item) => item.trim()),
      prescription: formData.prescription.filter((item) => item.trim()),
    };

    // 跳过验证，直接保存草稿
    emit("submit", draftData);
  } catch (error) {
    console.error("保存草稿失败:", error);
  }
};

// 取消
const handleCancel = () => {
  emit("cancel");
};

// 生成病历编号
const generateRecordNo = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, "");
  const randomStr = Math.random().toString(36).slice(2, 6).toUpperCase();
  formData.recordNo = `MR${dateStr}${timeStr}${randomStr}`;
};

// 初始化
onMounted(() => {
  if (!isEdit.value) {
    generateRecordNo();
    // 设置默认就诊日期为今天
    formData.visitDate = new Date().toISOString().slice(0, 10);
  }
});
</script>

<style scoped>
.array-input {
  width: 100%;
}

.array-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.array-item .el-input {
  flex: 1;
}

.array-item .el-button {
  flex-shrink: 0;
}
</style>
