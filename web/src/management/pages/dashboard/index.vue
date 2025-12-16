<template>
  <div class="dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">数据仪表盘</h1>
        <p class="page-description">实时监控医院运营数据和系统状态</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="refreshData">
          刷新数据
        </el-button>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="margin-left: 12px"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col v-for="(stat, index) in stats" :key="index" :span="6">
          <el-card
            class="stat-card"
            shadow="hover"
            :body-style="{ padding: '20px' }"
          >
            <div class="stat-content">
              <div class="stat-icon" :class="stat.type">
                <component :is="stat.icon" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                  <component :is="stat.trend > 0 ? TrendCharts : Bottom" />
                  {{ Math.abs(stat.trend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 就诊趋势图 -->
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>就诊趋势</span>
                <el-radio-group v-model="visitChartPeriod" size="small">
                  <el-radio-button label="week">周</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                  <el-radio-button label="year">年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="visitChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 科室分布 -->
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>科室患者分布</span>
                <el-button
                  type="text"
                  size="small"
                  @click="refreshDepartmentChart"
                >
                  <el-icon><refresh /></el-icon>
                </el-button>
              </div>
            </template>
            <div ref="departmentChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 病历类型统计 -->
        <el-col :span="8">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <span>病历类型统计</span>
            </template>
            <div ref="recordTypeChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 用户活跃度 -->
        <el-col :span="8">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <span>用户活跃度</span>
            </template>
            <div ref="userActivityChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 系统性能 -->
        <el-col :span="8">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <span>系统性能监控</span>
            </template>
            <div class="performance-metrics">
              <div class="metric-item">
                <div class="metric-label">CPU使用率</div>
                <el-progress
                  :percentage="systemMetrics.cpu"
                  :color="getProgressColor(systemMetrics.cpu)"
                />
              </div>
              <div class="metric-item">
                <div class="metric-label">内存使用率</div>
                <el-progress
                  :percentage="systemMetrics.memory"
                  :color="getProgressColor(systemMetrics.memory)"
                />
              </div>
              <div class="metric-item">
                <div class="metric-label">磁盘使用率</div>
                <el-progress
                  :percentage="systemMetrics.disk"
                  :color="getProgressColor(systemMetrics.disk)"
                />
              </div>
              <div class="metric-item">
                <div class="metric-label">API响应时间</div>
                <div class="metric-value">
                  {{ systemMetrics.responseTime }}ms
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格区域 -->
    <div class="tables-section">
      <el-row :gutter="20">
        <!-- 最新患者 -->
        <el-col :span="12">
          <el-card class="table-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>最新就诊患者</span>
                <el-button
                  type="text"
                  size="small"
                  @click="$router.push('/patients')"
                >
                  查看全部
                </el-button>
              </div>
            </template>
            <el-table :data="recentPatients" style="width: 100%" size="small">
              <el-table-column prop="name" label="姓名" width="80" />
              <el-table-column prop="gender" label="性别" width="60">
                <template #default="{ row }">
                  <el-tag
                    size="small"
                    :type="row.gender === '男' ? 'primary' : 'success'"
                  >
                    {{ row.gender }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="age" label="年龄" width="60" />
              <el-table-column prop="department" label="科室" width="80" />
              <el-table-column prop="doctor" label="主治医生" width="80" />
              <el-table-column prop="visitTime" label="就诊时间">
                <template #default="{ row }">
                  {{ formatDateTime(row.visitTime) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <!-- 系统通知 -->
        <el-col :span="12">
          <el-card class="notification-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>系统通知</span>
                <el-button type="text" size="small" @click="markAllRead">
                  全部已读
                </el-button>
              </div>
            </template>
            <div class="notification-list">
              <div
                v-for="(notification, index) in notifications"
                :key="index"
                class="notification-item"
                :class="{ unread: !notification.read }"
                @click="markAsRead(index)"
              >
                <div class="notification-icon" :class="notification.type">
                  <component :is="getNotificationIcon(notification.type)" />
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-desc">
                    {{ notification.description }}
                  </div>
                  <div class="notification-time">
                    {{ formatDateTime(notification.time) }}
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import {
  User,
  UserFilled,
  Document,
  Setting,
  Plus,
  DataLine,
  TrendCharts,
  Monitor,
  Refresh,
  Bottom,
  Warning,
  InfoFilled,
  SuccessFilled,
  CircleCloseFilled,
} from "@element-plus/icons-vue";

export default {
  name: "Dashboard",
  setup() {
    // 响应式数据
    const dateRange = ref([]);
    const visitChartPeriod = ref("week");
    const visitChartRef = ref();
    const departmentChartRef = ref();
    const recordTypeChartRef = ref();
    const userActivityChartRef = ref();

    // 统计数据
    const stats = ref([
      {
        label: "今日就诊",
        value: "256",
        type: "primary",
        icon: UserFilled,
        trend: 12.5,
      },
      {
        label: "在院患者",
        value: "1,842",
        type: "success",
        icon: Monitor,
        trend: -3.2,
      },
      {
        label: "新增病历",
        value: "148",
        type: "warning",
        icon: Document,
        trend: 8.7,
      },
      {
        label: "活跃医生",
        value: "89",
        type: "danger",
        icon: User,
        trend: 5.1,
      },
    ]);

    // 系统性能指标
    const systemMetrics = reactive({
      cpu: 45,
      memory: 62,
      disk: 78,
      responseTime: 125,
    });

    // 最新患者数据
    const recentPatients = ref([
      {
        name: "张三",
        gender: "男",
        age: 45,
        department: "内科",
        doctor: "李医生",
        visitTime: new Date("2024-01-15 10:30:00"),
      },
      {
        name: "李四",
        gender: "女",
        age: 32,
        department: "外科",
        doctor: "王医生",
        visitTime: new Date("2024-01-15 09:45:00"),
      },
      {
        name: "王五",
        gender: "男",
        age: 58,
        department: "心内科",
        doctor: "张医生",
        visitTime: new Date("2024-01-15 09:20:00"),
      },
      {
        name: "赵六",
        gender: "女",
        age: 28,
        department: "妇产科",
        doctor: "刘医生",
        visitTime: new Date("2024-01-15 08:55:00"),
      },
    ]);

    // 系统通知
    const notifications = ref([
      {
        title: "系统维护通知",
        description: "今晚22:00-24:00进行系统维护，期间服务可能中断",
        type: "warning",
        time: new Date("2024-01-15 08:00:00"),
        read: false,
      },
      {
        title: "数据备份完成",
        description: "昨日数据备份已成功完成，共备份12,345条记录",
        type: "success",
        time: new Date("2024-01-14 23:30:00"),
        read: false,
      },
      {
        title: "新用户注册",
        description: "心外科新增陈医生用户账号",
        type: "info",
        time: new Date("2024-01-14 15:20:00"),
        read: true,
      },
      {
        title: "存储空间警告",
        description: "影像存储空间使用率已达到85%，请及时清理",
        type: "error",
        time: new Date("2024-01-14 10:15:00"),
        read: true,
      },
    ]);

    // 工具方法
    const formatDateTime = (dateTime) => {
      if (!dateTime) return "-";
      return new Date(dateTime).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getProgressColor = (percentage) => {
      if (percentage < 60) return "#67c23a";
      if (percentage < 80) return "#e6a23c";
      return "#f56c6c";
    };

    const getNotificationIcon = (type) => {
      const iconMap = {
        success: SuccessFilled,
        warning: Warning,
        error: CircleCloseFilled,
        info: InfoFilled,
      };
      return iconMap[type] || InfoFilled;
    };

    // 数据刷新方法
    const refreshData = async () => {
      ElMessage.info("正在刷新数据...");
      try {
        // 模拟数据刷新
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 更新统计数据
        stats.value.forEach((stat) => {
          const randomChange = (Math.random() - 0.5) * 10;
          stat.trend = Math.round(randomChange * 10) / 10;
          const currentValue = parseInt(stat.value.replace(/,/g, ""));
          const newValue = Math.max(0, currentValue + Math.round(randomChange));
          stat.value = newValue.toLocaleString();
        });

        // 更新系统指标
        systemMetrics.cpu = Math.round(30 + Math.random() * 40);
        systemMetrics.memory = Math.round(40 + Math.random() * 30);
        systemMetrics.disk = Math.round(60 + Math.random() * 25);
        systemMetrics.responseTime = Math.round(80 + Math.random() * 100);

        ElMessage.success("数据刷新成功");
      } catch (error) {
        console.error("数据刷新失败:", error);
        ElMessage.error("数据刷新失败");
      }
    };

    const handleDateChange = (dates) => {
      console.log("日期范围变化:", dates);
      // 这里可以根据日期范围重新加载数据
      refreshData();
    };

    // 通知处理方法
    const markAsRead = (index) => {
      notifications.value[index].read = true;
    };

    const markAllRead = () => {
      notifications.value.forEach((notification) => {
        notification.read = true;
      });
      ElMessage.success("已全部标记为已读");
    };

    // 图表刷新方法（占位实现）
    const refreshDepartmentChart = () => {
      ElMessage.info("刷新科室分布数据...");
    };

    // 模拟图表初始化
    const initCharts = async () => {
      await nextTick();

      // 这里可以集成 ECharts 或其他图表库
      // 目前先显示占位内容
      console.log("图表初始化完成");
    };

    // 生命周期
    onMounted(() => {
      initCharts();

      // 定时刷新数据
      setInterval(() => {
        // 模拟实时数据更新
        systemMetrics.cpu = Math.round(30 + Math.random() * 40);
        systemMetrics.memory = Math.round(40 + Math.random() * 30);
        systemMetrics.responseTime = Math.round(80 + Math.random() * 100);
      }, 5000);
    });

    return {
      dateRange,
      visitChartPeriod,
      visitChartRef,
      departmentChartRef,
      recordTypeChartRef,
      userActivityChartRef,
      stats,
      systemMetrics,
      recentPatients,
      notifications,
      formatDateTime,
      getProgressColor,
      getNotificationIcon,
      refreshData,
      handleDateChange,
      markAsRead,
      markAllRead,
      refreshDepartmentChart,
      User,
      UserFilled,
      Document,
      Setting,
      Plus,
      DataLine,
      TrendCharts,
      Monitor,
      Refresh,
      Bottom,
      Warning,
      InfoFilled,
      SuccessFilled,
      CircleCloseFilled,
    };
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .header-content {
      .page-title {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }

      .page-description {
        color: #909399;
        margin: 0;
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .stats-section {
    margin-bottom: 24px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          svg {
            width: 28px;
            height: 28px;
            color: #fff;
          }

          &.primary {
            background: linear-gradient(135deg, #409eff, #66b1ff);
          }

          &.success {
            background: linear-gradient(135deg, #67c23a, #85ce61);
          }

          &.warning {
            background: linear-gradient(135deg, #e6a23c, #ebb563);
          }

          &.danger {
            background: linear-gradient(135deg, #f56c6c, #f78989);
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 32px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
            margin-bottom: 8px;
          }

          .stat-label {
            color: #909399;
            font-size: 14px;
            margin-bottom: 8px;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            font-size: 12px;
            font-weight: 500;

            svg {
              width: 14px;
              height: 14px;
              margin-right: 4px;
            }

            &.up {
              color: #67c23a;
            }

            &.down {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 24px;

    .chart-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        color: #303133;
      }

      .chart-container {
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        border-radius: 6px;
        color: #909399;
        font-size: 14px;

        &::before {
          content: "图表区域 (可集成 ECharts)";
        }
      }

      .performance-metrics {
        .metric-item {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }

          .metric-label {
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .metric-value {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            text-align: center;
            padding: 12px;
            background: #f5f7fa;
            border-radius: 6px;
          }
        }
      }
    }
  }

  .tables-section {
    .table-card,
    .notification-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        color: #303133;
      }
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;

      .notification-item {
        display: flex;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background-color 0.3s;

        &:hover {
          background: #fafafa;
          margin: 0 -16px;
          padding-left: 16px;
          padding-right: 16px;
          border-radius: 6px;
        }

        &.unread {
          position: relative;

          &::before {
            content: "";
            position: absolute;
            left: -8px;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            background: #409eff;
            border-radius: 50%;
          }
        }

        &:last-child {
          border-bottom: none;
        }

        .notification-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;

          svg {
            width: 18px;
            height: 18px;
            color: #fff;
          }

          &.success {
            background: #67c23a;
          }

          &.warning {
            background: #e6a23c;
          }

          &.error {
            background: #f56c6c;
          }

          &.info {
            background: #409eff;
          }
        }

        .notification-content {
          flex: 1;
          min-width: 0;

          .notification-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
            line-height: 1.4;
          }

          .notification-desc {
            font-size: 12px;
            color: #909399;
            margin-bottom: 8px;
            line-height: 1.4;
          }

          .notification-time {
            font-size: 12px;
            color: #c0c4cc;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard {
    .stats-section {
      .el-col:nth-child(n + 5) {
        margin-top: 20px;
      }
    }

    .charts-section {
      .el-col {
        margin-bottom: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;

      .header-actions {
        width: 100%;
        justify-content: flex-end;

        .el-date-picker {
          width: auto;
          min-width: 280px;
        }
      }
    }

    .stats-section {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .charts-section {
      .chart-container {
        height: 250px;
      }
    }

    .tables-section {
      .el-col {
        margin-bottom: 20px;
      }

      .notification-list {
        max-height: 300px;
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 12px;

    .dashboard-header {
      padding: 16px;

      .page-title {
        font-size: 24px;
      }

      .header-actions {
        .el-date-picker {
          min-width: 100%;
        }
      }
    }

    .stats-section {
      .stat-card {
        .stat-content {
          .stat-icon {
            width: 48px;
            height: 48px;

            svg {
              width: 20px;
              height: 20px;
            }
          }

          .stat-info {
            .stat-value {
              font-size: 24px;
            }
          }
        }
      }
    }

    .charts-section {
      .chart-container {
        height: 200px;
      }
    }
  }
}
</style>
