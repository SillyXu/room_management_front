<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="left-side">
        <img :src="logoSrc" alt="Logo" class="logo">
        <h2>中建新疆建工公寓管理系统</h2>
        <p>欢迎登录</p>
      </div>
      <div class="separator"></div>
      <div class="right-side">
        <div class="login-form">
          <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" clearable placeholder="用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" clearable type="password" placeholder="密码"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm">登录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      logoSrc: require('@/assets/images/logo.jpg') // 假设这是你的logo路径
    };
  },
  methods: {
    submitForm() {
      // 确保组件已经挂载
      if (this.$refs.loginFormRef) {
        this.$refs.loginFormRef.validate(valid => {
          if (valid) {
            console.log('提交表单:', this.loginForm);
            ElMessage.success('登录成功！');
            this.$router.push({ name: 'Dashboard' });
          } else {
            console.log('表单验证失败');
            return false;
          }
        }).catch(error => {
          console.error('表单验证错误:', error);
        });
      } else {
        console.warn('$refs.loginFormRef 未找到，组件可能未挂载或已卸载。');
      }
    }
  }
};
</script>

<style scoped>

.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #169fcc, #FFFFFF); /* 上蓝下白渐变背景 */
}

.login-wrapper {
  display: flex;
  width: 80%;
  max-width: 800px;
  background-color: rgba(247, 247, 247, 0.8); /* 灰色背景，80%不透明度 */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  align-items: center; /* 新增：确保垂直居中 */
  justify-content: space-between; /* 或者使用center根据布局需求 */
}

.left-side {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.right-side {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center; /* 确保内部元素垂直居中 */
  padding: 20px;
}

.logo {
  width: 100px; /* 调整logo大小 */
  height: auto;
  margin-bottom: 20px;
}

.left-side h2,
.left-side p {
  color: #333;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: stretch; /* 保持垂直方向上的拉伸 */
  justify-content: center; /* 水平方向上居中对齐 */
}

.el-form-item {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}

.el-form-item__label {
  flex-shrink: 0; /* 防止标签缩小 */
  width: 100px; /* 设定标签的宽度 */
}

.el-input {
  flex-grow: 1; /* 输入框将填充剩余的空间 */
  flex-basis: 300px; /* 确保输入框从零开始扩展 */
}
</style>;