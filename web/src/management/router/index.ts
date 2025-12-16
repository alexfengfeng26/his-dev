import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/login/index.vue"),
    meta: { title: "登录", hideInMenu: true },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("../pages/dashboard/index.vue"),
    meta: { title: "仪表盘", icon: "Dashboard", needLogin: true },
  },
  {
    path: "/users",
    name: "users",
    component: () => import("../pages/user/index.vue"),
    meta: { title: "用户管理", icon: "User", needLogin: true },
  },
  {
    path: "/patients",
    name: "patients",
    component: () => import("../pages/patient/index.vue"),
    meta: { title: "患者管理", icon: "UserFilled", needLogin: true },
  },
  {
    path: "/medical-records",
    name: "medical-records",
    component: () => import("../pages/medical-record/index.vue"),
    meta: { title: "病历管理", icon: "Document", needLogin: true },
  },
  {
    path: "/templates",
    name: "templates",
    component: () => import("../pages/template/index.vue"),
    meta: { title: "模板管理", icon: "Document", needLogin: true },
  },
  {
    path: "/plugins",
    name: "plugins",
    component: () => import("../pages/plugin/index.vue"),
    meta: { title: "插件管理", icon: "SetUp", needLogin: true },
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../pages/settings/index.vue"),
    meta: { title: "系统设置", icon: "Setting", needLogin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - HIS-DEV 管理端`;
  }

  // 登录验证
  if (to.meta?.needLogin) {
    const authStore = useAuthStore();
    if (!authStore.checkAuth()) {
      next({ name: "login" });
      return;
    }
  }

  // 如果已登录用户访问登录页，重定向到仪表盘
  if (to.name === "login") {
    const authStore = useAuthStore();
    if (authStore.checkAuth()) {
      next({ name: "dashboard" });
      return;
    }
  }

  next();
});

export default router;
