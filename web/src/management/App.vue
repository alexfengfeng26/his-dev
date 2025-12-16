<template>
  <div id="app" class="his-management-app">
    <!-- 登录页面使用完整布局 -->
    <template v-if="$route.name === 'login'">
      <router-view />
    </template>
    <!-- 其他页面使用管理端布局 -->
    <template v-else>
      <Layout />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import Layout from "./components/Layout.vue";

onMounted(() => {
  console.log("🏥 HIS-DEV 管理端已启动");
  console.log("📋 电子病历系统管理端");
});
</script>

<style lang="scss">
.his-management-app {
  font-family:
    "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
</style>
