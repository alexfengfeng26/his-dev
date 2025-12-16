<template>
  <div class="template-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      @submit.prevent="handleSubmit"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入模板名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板代码" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入模板代码"
              :disabled="!!template"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板类型" prop="type">
            <el-select
              v-model="formData.type"
              placeholder="请选择模板类型"
              style="width: 100%"
            >
              <el-option label="基础模板" value="basic" />
              <el-option label="专科模板" value="specialty" />
              <el-option label="自定义模板" value="custom" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号" prop="version">
            <el-input v-model="formData.version" placeholder="如：1.0.0" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="模板描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入模板描述"
        />
      </el-form-item>

      <el-form-item label="适用科室">
        <el-select
          v-model="formData.departmentIds"
          multiple
          placeholder="请选择适用科室"
          style="width: 100%"
        >
          <!-- TODO: 从科室管理API获取科室列表 -->
          <el-option label="内科" value="1" />
          <el-option label="外科" value="2" />
          <el-option label="儿科" value="3" />
          <el-option label="妇产科" value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="标签">
        <el-select
          v-model="formData.tags"
          multiple
          filterable
          allow-create
          placeholder="请输入或选择标签"
          style="width: 100%"
        >
          <el-option label="急诊" value="急诊" />
          <el-option label="门诊" value="门诊" />
          <el-option label="住院" value="住院" />
          <el-option label="慢病" value="慢病" />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">模板配置</el-divider>

      <el-form-item label="模板配置">
        <el-card class="config-card">
          <template #header>
            <div class="config-header">
              <span>JSON 配置</span>
              <el-button size="small" @click="formatConfig">格式化</el-button>
            </div>
          </template>
          <el-input
            v-model="configJson"
            type="textarea"
            :rows="6"
            placeholder="请输入模板配置（JSON格式）"
            @blur="validateConfig"
          />
        </el-card>
      </el-form-item>

      <el-form-item label="模板结构">
        <el-card class="structure-card">
          <template #header>
            <div class="structure-header">
              <span>结构定义</span>
              <el-button size="small" @click="formatStructure"
                >格式化</el-button
              >
            </div>
          </template>
          <el-input
            v-model="structureJson"
            type="textarea"
            :rows="6"
            placeholder="请输入模板结构（JSON格式）"
            @blur="validateStructure"
          />
        </el-card>
      </el-form-item>

      <el-form-item label="字段配置">
        <el-card class="fields-card">
          <template #header>
            <div class="fields-header">
              <span>字段定义</span>
              <el-button size="small" type="primary" @click="addField"
                >添加字段</el-button
              >
            </div>
          </template>

          <div v-if="formData.fields.length === 0" class="empty-fields">
            <el-empty description="暂无字段配置" />
          </div>

          <div v-else class="fields-list">
            <el-row
              v-for="(field, index) in formData.fields"
              :key="index"
              :gutter="10"
              class="field-row"
            >
              <el-col :span="4">
                <el-form-item
                  :prop="`fields.${index}.key`"
                  :rules="[{ required: true, message: '请输入字段键' }]"
                >
                  <el-input v-model="field.key" placeholder="字段键" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item
                  :prop="`fields.${index}.name`"
                  :rules="[{ required: true, message: '请输入字段名称' }]"
                >
                  <el-input v-model="field.name" placeholder="字段名称" />
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item
                  :prop="`fields.${index}.type`"
                  :rules="[{ required: true, message: '请选择字段类型' }]"
                >
                  <el-select v-model="field.type" placeholder="类型">
                    <el-option label="文本" value="string" />
                    <el-option label="数字" value="number" />
                    <el-option label="日期" value="date" />
                    <el-option label="布尔" value="boolean" />
                    <el-option label="数组" value="array" />
                    <el-option label="对象" value="object" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-input v-model="field.placeholder" placeholder="占位符" />
              </el-col>
              <el-col :span="2">
                <el-form-item>
                  <el-checkbox v-model="field.required">必填</el-checkbox>
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-input v-model="field.defaultValue" placeholder="默认值" />
              </el-col>
              <el-col :span="2">
                <el-button
                  type="danger"
                  icon="Delete"
                  @click="removeField(index)"
                />
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-form-item>

      <el-form-item label="验证规则">
        <el-card class="validation-card">
          <el-input
            v-model="validationJson"
            type="textarea"
            :rows="4"
            placeholder="请输入验证规则（JSON格式，可选）"
            @blur="validateValidation"
          />
        </el-card>
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="formData.isEnabled">启用模板</el-checkbox>
        <el-checkbox v-model="formData.isSystem" :disabled="!isAdmin"
          >系统模板</el-checkbox
        >
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ template ? "更新" : "创建" }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import type { Template, CreateTemplateDto } from "../../services/template";

interface Props {
  template?: Template | null;
}

interface Emits {
  (e: "submit", data: CreateTemplateDto): void;
  (e: "cancel"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单引用
const formRef = ref<FormInstance>();

// 状态
const submitting = ref(false);
const isAdmin = ref(false); // TODO: 从用户状态获取

// 表单数据
const formData = reactive<CreateTemplateDto>({
  name: "",
  code: "",
  description: "",
  type: "basic",
  departmentIds: [],
  config: {},
  structure: {},
  fields: [],
  validationRules: {},
  version: "1.0.0",
  isSystem: false,
  tags: [],
});

// JSON 配置字符串
const configJson = ref("");
const structureJson = ref("");
const validationJson = ref("");

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: "请输入模板名称", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "模板名称长度在 2 到 50 个字符",
      trigger: "blur",
    },
  ],
  code: [
    { required: true, message: "请输入模板代码", trigger: "blur" },
    {
      min: 2,
      max: 30,
      message: "模板代码长度在 2 到 30 个字符",
      trigger: "blur",
    },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: "模板代码只能包含字母、数字和下划线，且必须以字母开头",
      trigger: "blur",
    },
  ],
  type: [{ required: true, message: "请选择模板类型", trigger: "change" }],
  version: [
    { required: true, message: "请输入版本号", trigger: "blur" },
    {
      pattern: /^\d+\.\d+\.\d+$/,
      message: "版本号格式不正确（如：1.0.0）",
      trigger: "blur",
    },
  ],
};

// 初始化表单数据
const initFormData = () => {
  if (props.template) {
    Object.assign(formData, {
      name: props.template.name,
      code: props.template.code,
      description: props.template.description || "",
      type: props.template.type,
      departmentIds: props.template.departmentIds || [],
      config: props.template.config,
      structure: props.template.structure,
      fields: props.template.fields || [],
      validationRules: props.template.validationRules || {},
      version: props.template.version,
      isSystem: props.template.isSystem,
      tags: props.template.tags || [],
    });
  } else {
    // 重置为默认值
    Object.assign(formData, {
      name: "",
      code: "",
      description: "",
      type: "basic",
      departmentIds: [],
      config: {},
      structure: {},
      fields: [],
      validationRules: {},
      version: "1.0.0",
      isSystem: false,
      tags: [],
    });
  }

  // 更新JSON字符串
  updateJsonStrings();
};

// 更新JSON字符串
const updateJsonStrings = () => {
  configJson.value = JSON.stringify(formData.config, null, 2);
  structureJson.value = JSON.stringify(formData.structure, null, 2);
  validationJson.value = formData.validationRules
    ? JSON.stringify(formData.validationRules, null, 2)
    : "";
};

// 验证和解析JSON
const validateConfig = () => {
  try {
    if (configJson.value.trim()) {
      formData.config = JSON.parse(configJson.value);
    } else {
      formData.config = {};
    }
  } catch (error) {
    ElMessage.error("模板配置格式不正确");
  }
};

const validateStructure = () => {
  try {
    if (structureJson.value.trim()) {
      formData.structure = JSON.parse(structureJson.value);
    } else {
      formData.structure = {};
    }
  } catch (error) {
    ElMessage.error("模板结构格式不正确");
  }
};

const validateValidation = () => {
  try {
    if (validationJson.value.trim()) {
      formData.validationRules = JSON.parse(validationJson.value);
    } else {
      formData.validationRules = {};
    }
  } catch (error) {
    ElMessage.error("验证规则格式不正确");
  }
};

// 格式化JSON
const formatConfig = () => {
  validateConfig();
  configJson.value = JSON.stringify(formData.config, null, 2);
};

const formatStructure = () => {
  validateStructure();
  structureJson.value = JSON.stringify(formData.structure, null, 2);
};

// 字段管理
const addField = () => {
  formData.fields.push({
    key: "",
    name: "",
    type: "string",
    placeholder: "",
    required: false,
    defaultValue: "",
  });
};

const removeField = (index: number) => {
  formData.fields.splice(index, 1);
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 验证JSON格式
    validateConfig();
    validateStructure();
    validateValidation();

    submitting.value = true;
    emit("submit", { ...formData });
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitting.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  emit("cancel");
};

// 监听模板变化
watch(
  () => props.template,
  () => {
    initFormData();
  },
  { immediate: true },
);

// 组件挂载
onMounted(() => {
  initFormData();
});
</script>

<style scoped>
.template-form {
  padding: 20px;
}

.config-card,
.structure-card,
.fields-card,
.validation-card {
  margin-bottom: 20px;
}

.config-header,
.structure-header,
.fields-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-fields {
  text-align: center;
  padding: 20px;
}

.fields-list {
  max-height: 400px;
  overflow-y: auto;
}

.field-row {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.field-row:hover {
  background-color: #f5f7fa;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
