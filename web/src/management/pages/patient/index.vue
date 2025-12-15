<template>
  <div class="patient-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">患者管理</h2>
        <span class="page-description">管理患者基本信息和就诊记录</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增患者
        </el-button>
        <el-button :icon="Upload" @click="handleImport">
          批量导入
        </el-button>
        <el-button :icon="Download" @click="handleExport">
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-panel">
      <el-form :model="searchForm" inline>
        <el-form-item label="患者姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入患者姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input
            v-model="searchForm.idCard"
            placeholder="请输入身份证号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="科室">
          <el-select
            v-model="searchForm.department"
            placeholder="请选择科室"
            clearable
            style="width: 150px"
          >
            <el-option label="内科" value="内科" />
            <el-option label="外科" value="外科" />
            <el-option label="妇产科" value="妇产科" />
            <el-option label="儿科" value="儿科" />
            <el-option label="心内科" value="心内科" />
            <el-option label="神经科" value="神经科" />
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

    <!-- 患者列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="patientList"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="patientNo" label="患者编号" width="120" />
        <el-table-column prop="_id" label="ID" width="80">
          <template #default="{ row }">
            {{ (row._id || '').slice(-6) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="80">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="60">
          <template #default="{ row }">
            <el-tag :type="row.gender === 'male' ? 'primary' : 'success'" size="small">
              {{ row.gender === 'male' ? '男' : row.gender === 'female' ? '女' : '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="60" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="address" label="地址" width="150" show-overflow-tooltip />
        <el-table-column prop="occupation" label="职业" width="100" show-overflow-tooltip />
        <el-table-column prop="bloodType" label="血型" width="60" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="success"
              size="small"
              :icon="Document"
              @click="handleMedicalRecord(row)"
            >
              病历
            </el-button>
            <el-button
              type="warning"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
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

    <!-- 患者表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-tabs v-model="activeTab" type="card">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input
                    v-model="form.name"
                    placeholder="请输入患者姓名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="form.gender">
                    <el-radio label="男">男</el-radio>
                    <el-radio label="女">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="出生日期" prop="birthDate">
                  <el-date-picker
                    v-model="form.birthDate"
                    type="date"
                    placeholder="请选择出生日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="身份证号" prop="idCard">
                  <el-input
                    v-model="form.idCard"
                    placeholder="请输入身份证号"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input
                    v-model="form.phone"
                    placeholder="请输入手机号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="form.email"
                    placeholder="请输入邮箱"
                    type="email"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="地址" prop="address">
              <el-input
                v-model="form.address"
                placeholder="请输入详细地址"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 就诊信息 -->
          <el-tab-pane label="就诊信息" name="medical">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="就诊科室" prop="department">
                  <el-select
                    v-model="form.department"
                    placeholder="请选择科室"
                    style="width: 100%"
                  >
                    <el-option label="内科" value="内科" />
                    <el-option label="外科" value="外科" />
                    <el-option label="妇产科" value="妇产科" />
                    <el-option label="儿科" value="儿科" />
                    <el-option label="心内科" value="心内科" />
                    <el-option label="神经科" value="神经科" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主治医生" prop="doctor">
                  <el-input
                    v-model="form.doctor"
                    placeholder="请输入主治医生"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="就诊卡号" prop="cardNumber">
                  <el-input
                    v-model="form.cardNumber"
                    placeholder="请输入就诊卡号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="患者状态" prop="status">
                  <el-select
                    v-model="form.status"
                    placeholder="请选择状态"
                    style="width: 100%"
                  >
                    <el-option label="在院" value="inpatient" />
                    <el-option label="门诊" value="outpatient" />
                    <el-option label="出院" value="discharged" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="过敏史" prop="allergies">
              <el-input
                v-model="form.allergies"
                type="textarea"
                placeholder="请输入过敏史"
                :rows="3"
              />
            </el-form-item>

            <el-form-item label="既往病史" prop="medicalHistory">
              <el-input
                v-model="form.medicalHistory"
                type="textarea"
                placeholder="请输入既往病史"
                :rows="3"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 紧急联系人 -->
          <el-tab-pane label="紧急联系人" name="emergency">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系人姓名" prop="emergencyContact">
                  <el-input
                    v-model="form.emergencyContact"
                    placeholder="请输入紧急联系人姓名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="关系" prop="emergencyRelation">
                  <el-select
                    v-model="form.emergencyRelation"
                    placeholder="请选择关系"
                    style="width: 100%"
                  >
                    <el-option label="配偶" value="配偶" />
                    <el-option label="父母" value="父母" />
                    <el-option label="子女" value="子女" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系人电话" prop="emergencyPhone">
                  <el-input
                    v-model="form.emergencyPhone"
                    placeholder="请输入紧急联系人电话"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系人地址" prop="emergencyAddress">
                  <el-input
                    v-model="form.emergencyAddress"
                    placeholder="请输入紧急联系人地址"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
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

    <!-- 患者详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="患者详情"
      width="900px"
    >
      <div v-if="viewPatient" class="patient-detail">
        <el-descriptions title="基本信息" :column="3" border>
          <el-descriptions-item label="患者ID">{{ viewPatient.id }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ viewPatient.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            <el-tag :type="viewPatient.gender === '男' ? 'primary' : 'success'">
              {{ viewPatient.gender }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="年龄">{{ viewPatient.age }}岁</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ viewPatient.idCard }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ viewPatient.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱" :span="2">{{ viewPatient.email || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="3">{{ viewPatient.address || '未填写' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="就诊信息" :column="3" border style="margin-top: 20px;">
          <el-descriptions-item label="就诊科室">{{ viewPatient.department }}</el-descriptions-item>
          <el-descriptions-item label="主治医生">{{ viewPatient.doctor }}</el-descriptions-item>
          <el-descriptions-item label="就诊卡号">{{ viewPatient.cardNumber }}</el-descriptions-item>
          <el-descriptions-item label="患者状态">
            <el-tag :type="getStatusType(viewPatient.status)">
              {{ getStatusText(viewPatient.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后就诊">{{ formatDateTime(viewPatient.lastVisitTime) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(viewPatient.createdAt) }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="医疗信息" :column="1" border style="margin-top: 20px;">
          <el-descriptions-item label="过敏史">{{ viewPatient.allergies || '无' }}</el-descriptions-item>
          <el-descriptions-item label="既往病史">{{ viewPatient.medicalHistory || '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="紧急联系人" :column="3" border style="margin-top: 20px;">
          <el-descriptions-item label="联系人">{{ viewPatient.emergencyContact }}</el-descriptions-item>
          <el-descriptions-item label="关系">{{ viewPatient.emergencyRelation }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ viewPatient.emergencyPhone }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="3">{{ viewPatient.emergencyAddress }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Download,
  Search,
  Refresh,
  View,
  Edit,
  Delete,
  Document
} from '@element-plus/icons-vue'
import { patientService } from '../../services/patient'

export default {
  name: 'PatientManagement',
  setup() {
    const loading = ref(false)
    const submitLoading = ref(false)
    const dialogVisible = ref(false)
    const viewDialogVisible = ref(false)
    const isEdit = ref(false)
    const formRef = ref()
    const viewPatient = ref(null)
    const activeTab = ref('basic')

    // 搜索表单
    const searchForm = reactive({
      name: '',
      idCard: '',
      phone: '',
      department: ''
    })

    // 患者表单
    const form = reactive({
      id: null,
      name: '',
      gender: '男',
      birthDate: '',
      idCard: '',
      phone: '',
      email: '',
      address: '',
      department: '',
      doctor: '',
      cardNumber: '',
      status: 'outpatient',
      allergies: '',
      medicalHistory: '',
      emergencyContact: '',
      emergencyRelation: '',
      emergencyPhone: '',
      emergencyAddress: ''
    })

    // 分页
    const pagination = reactive({
      page: 1,
      size: 20,
      total: 0
    })

    // 患者列表数据
    const patientList = ref([])

    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入患者姓名', trigger: 'blur' }
      ],
      gender: [
        { required: true, message: '请选择性别', trigger: 'change' }
      ],
      birthDate: [
        { required: true, message: '请选择出生日期', trigger: 'change' }
      ],
      idCard: [
        { required: true, message: '请输入身份证号', trigger: 'blur' },
        { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ],
      department: [
        { required: true, message: '请选择就诊科室', trigger: 'change' }
      ],
      doctor: [
        { required: true, message: '请输入主治医生', trigger: 'blur' }
      ]
    }

    // 计算属性
    const dialogTitle = computed(() => {
      return isEdit.value ? '编辑患者' : '新增患者'
    })

    // 状态相关方法
    const getStatusText = (status) => {
      const statusMap = {
        active: '活跃',
        inactive: '非活跃',
        deceased: '已故'
      }
      return statusMap[status] || status
    }

    const getStatusType = (status) => {
      const typeMap = {
        active: 'primary',
        inactive: 'warning',
        deceased: 'danger'
      }
      return typeMap[status] || 'info'
    }

    // 日期格式化
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    }

    // 计算年龄
    const calculateAge = (birthDate) => {
      if (!birthDate) return 0
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    }

    // 获取患者列表
    const fetchPatientList = async () => {
      loading.value = true
      try {
        // 构建查询参数
        const queryParams = {
          page: pagination.page,
          limit: pagination.size,
          name: searchForm.name || undefined,
          idCard: searchForm.idCard || undefined,
          phone: searchForm.phone || undefined,
          status: undefined, // 前端暂无status筛选，可根据需要添加
          gender: undefined  // 前端暂无gender筛选，可根据需要添加
        }

        // 调用真实API
        const response = await patientService.getPatients(queryParams)

        // 更新数据
        patientList.value = response.patients
        pagination.total = response.total

      } catch (error) {
        console.error('获取患者列表失败:', error)
        ElMessage.error('获取患者列表失败')
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      pagination.page = 1
      fetchPatientList()
    }

    // 重置搜索
    const handleReset = () => {
      Object.assign(searchForm, {
        name: '',
        idCard: '',
        phone: '',
        department: ''
      })
      pagination.page = 1
      fetchPatientList()
    }

    // 分页变化
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.page = 1
      fetchPatientList()
    }

    const handlePageChange = (page) => {
      pagination.page = page
      fetchPatientList()
    }

    // 新增患者
    const handleAdd = () => {
      isEdit.value = false
      dialogVisible.value = true
      activeTab.value = 'basic'
      resetForm()
    }

    // 编辑患者
    const handleEdit = (row) => {
      isEdit.value = true
      dialogVisible.value = true
      activeTab.value = 'basic'

      // 将后端数据转换为前端表单格式
      Object.assign(form, {
        id: row._id || row.id,
        patientNo: row.patientNo,
        name: row.name,
        gender: row.gender === 'male' ? '男' : row.gender === 'female' ? '女' : '未知',
        birthDate: row.birthDate,
        idCard: row.idCard,
        phone: row.phone,
        email: row.email || '',
        address: row.address,
        occupation: row.occupation || '',
        bloodType: row.bloodType || 'unknown',
        allergies: row.allergies ? row.allergies.join('，') : '',
        medicalHistory: row.medicalHistory ? row.medicalHistory.join('，') : '',
        familyHistory: row.familyHistory ? row.familyHistory.join('，') : '',
        emergencyContact: row.emergencyContactName || '',
        emergencyRelation: row.emergencyContactRelation || '',
        emergencyPhone: row.emergencyContactPhone || '',
        status: row.status === 'active' ? '门诊' : row.status === 'inactive' ? '出院' : '在院'
      })
    }

    // 查看患者详情
    const handleView = (row) => {
      viewPatient.value = row
      viewDialogVisible.value = true
    }

    // 查看病历
    const handleMedicalRecord = (row) => {
      ElMessage.info(`查看患者 ${row.name} 的病历`)
      // 这里可以跳转到病历页面或打开病历对话框
    }

    // 删除患者
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除患者 "${row.name}" 吗？此操作不可恢复！`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 调用真实的删除API
        await patientService.deletePatient(row._id || row.id)

        ElMessage.success('删除成功')
        fetchPatientList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除患者失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }

    // 批量导入
    const handleImport = () => {
      ElMessage.info('批量导入功能开发中...')
    }

    // 导出数据
    const handleExport = () => {
      ElMessage.info('导出功能开发中...')
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return

      try {
        await formRef.value.validate()
        submitLoading.value = true

        // 构建患者数据
        const patientData = {
          name: form.name,
          gender: form.gender === '男' ? 'male' : form.gender === '女' ? 'female' : 'unknown',
          birthDate: form.birthDate,
          idCard: form.idCard,
          phone: form.phone,
          email: form.email || undefined,
          address: form.address,
          occupation: form.occupation || undefined,
          bloodType: form.bloodType || 'unknown',
          allergies: form.allergies ? form.allergies.split('，').filter(a => a.trim()) : undefined,
          medicalHistory: form.medicalHistory ? form.medicalHistory.split('，').filter(m => m.trim()) : undefined,
          familyHistory: form.familyHistory ? form.familyHistory.split('，').filter(f => f.trim()) : undefined,
          emergencyContactName: form.emergencyContact || undefined,
          emergencyContactRelation: form.emergencyRelation || undefined,
          emergencyContactPhone: form.emergencyPhone || undefined
        }

        if (isEdit.value && form.id) {
          // 更新患者
          const updateData = {
            ...patientData,
            status: form.status === '在院' ? 'active' : form.status === '门诊' ? 'active' : 'inactive'
          }
          await patientService.updatePatient(form.id, updateData)
          ElMessage.success('更新成功')
        } else {
          // 创建患者 - 需要生成患者编号
          const createData = {
            ...patientData,
            patientNo: form.patientNo || `P${Date.now()}`, // 如果没有患者编号，生成一个
            status: 'active'
          }
          await patientService.createPatient(createData)
          ElMessage.success('创建成功')
        }

        dialogVisible.value = false
        fetchPatientList()
      } catch (error) {
        console.error('保存患者失败:', error)
        ElMessage.error('保存失败')
      } finally {
        submitLoading.value = false
      }
    }

    // 对话框关闭
    const handleDialogClose = () => {
      resetForm()
    }

    // 重置表单
    const resetForm = () => {
      Object.assign(form, {
        id: null,
        name: '',
        gender: '男',
        birthDate: '',
        idCard: '',
        phone: '',
        email: '',
        address: '',
        department: '',
        doctor: '',
        cardNumber: '',
        status: 'outpatient',
        allergies: '',
        medicalHistory: '',
        emergencyContact: '',
        emergencyRelation: '',
        emergencyPhone: '',
        emergencyAddress: ''
      })
      if (formRef.value) {
        formRef.value.clearValidate()
      }
    }

    // 初始化
    onMounted(() => {
      fetchPatientList()
    })

    return {
      loading,
      submitLoading,
      dialogVisible,
      viewDialogVisible,
      isEdit,
      formRef,
      viewPatient,
      activeTab,
      searchForm,
      form,
      pagination,
      patientList,
      rules,
      dialogTitle,
      getStatusText,
      getStatusType,
      formatDateTime,
      fetchPatientList,
      handleSearch,
      handleReset,
      handleSizeChange,
      handlePageChange,
      handleAdd,
      handleEdit,
      handleView,
      handleMedicalRecord,
      handleDelete,
      handleImport,
      handleExport,
      handleSubmit,
      handleDialogClose,
      Plus,
      Upload,
      Download,
      Search,
      Refresh,
      View,
      Edit,
      Delete,
      Document
    }
  }
}
</script>

<style lang="scss" scoped>
.patient-management {
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

  .patient-detail {
    .el-descriptions {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
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
  .patient-management {
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

    .table-container {
      :deep(.el-table) {
        .el-table__fixed-right {
          right: 0 !important;
        }
      }
    }
  }
}
</style>