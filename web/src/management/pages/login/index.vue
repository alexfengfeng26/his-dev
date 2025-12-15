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
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
    <div v-if="message" :class="messageType">
      {{ message }}
    </div>
    <div class="test-info">
      <p>测试用户: testuser</p>
      <p>测试密码: Test123!@#</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SimpleLogin',
  setup() {
    const router = useRouter()
    const username = ref('testuser')
    const password = ref('Test123!@#')
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('')

    const handleLogin = async () => {
      loading.value = true
      message.value = ''

      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username.value,
            password: password.value
          })
        })

        const data = await response.json()

        if (response.ok) {
          // 保存认证信息
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          message.value = '登录成功！正在跳转...'
          messageType.value = 'success'

          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        } else {
          message.value = data.message || '登录失败'
          messageType.value = 'error'
        }
      } catch (error) {
        console.error('登录错误:', error)
        message.value = '网络错误，请检查后端服务是否运行'
        messageType.value = 'error'
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      password,
      loading,
      message,
      messageType,
      handleLogin
    }
  }
}
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