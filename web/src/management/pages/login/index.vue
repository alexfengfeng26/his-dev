<template>
  <div class="simple-login">
    <h2>HIS-DEV 登录</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label>用户名:</label>
        <input v-model="username" type="text" required />
      </div>
      <div>
        <label>密码:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "登录中..." : "登录" }}
      </button>
    </form>
    <div v-if="message" :class="messageType">
      {{ message }}
    </div>
    <div class="test-info">
      <p>测试用户: admin</p>
      <p>测试密码: Admin123!</p>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores";
import { ElMessage } from "element-plus";

export default {
  name: "SimpleLogin",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const username = ref("admin");
    const password = ref("Admin123!");
    const loading = ref(false);
    const message = ref("");
    const messageType = ref("");

    const handleLogin = async () => {
      loading.value = true;
      message.value = "";

      try {
        await authStore.login({
          username: username.value,
          password: password.value,
        });

        message.value = "登录成功！正在跳转...";
        messageType.value = "success";
        ElMessage.success("登录成功");

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } catch (error) {
        console.error("登录错误:", error);
        message.value = error.response?.data?.message || "登录失败";
        messageType.value = "error";
        ElMessage.error(message.value);
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      loading,
      message,
      messageType,
      handleLogin,
    };
  },
};
</script>

<style scoped>
.simple-login {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.simple-login h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.simple-login form div {
  margin-bottom: 15px;
}

.simple-login label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.simple-login input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.simple-login button {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.simple-login button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.simple-login button:hover:not(:disabled) {
  background: #0056b3;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.test-info {
  margin-top: 20px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 4px;
  font-size: 14px;
  color: #0066cc;
}

.test-info p {
  margin: 5px 0;
}
</style>
