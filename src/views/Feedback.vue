<template>
  <div class="feedback-page">
    <div class="page-header">
      <h1>意见反馈</h1>
      <p>我们非常重视您的每一条建议</p>
    </div>

    <div class="form-wrapper">
      <Card title="提交反馈" icon="fa-pen-alt" :hoverable="false">
        <form @submit.prevent="handleSubmit" class="feedback-form">
          <!-- 昵称 -->
          <div class="form-group" :class="{ 'has-error': errors.user_id }">
            <label>昵称</label>
            <input
              type="text"
              v-model="formData.user_id"
              placeholder="如何称呼您？"
              :disabled="isSubmitting"
              maxlength="50"
            />
            <span class="char-count">{{ formData.user_id.length }}/50</span>
            <span class="error-msg" v-if="errors.user_id">{{ errors.user_id }}</span>
          </div>

          <!-- 标题 -->
          <div class="form-group" :class="{ 'has-error': errors.title }">
            <label>标题</label>
            <input
              type="text"
              v-model="formData.title"
              placeholder="简要描述您的反馈..."
              :disabled="isSubmitting"
              maxlength="100"
            />
            <span class="char-count">{{ formData.title.length }}/100</span>
            <span class="error-msg" v-if="errors.title">{{ errors.title }}</span>
          </div>

          <!-- 详细内容 -->
          <div class="form-group" :class="{ 'has-error': errors.main }">
            <label>详细内容</label>
            <textarea
              v-model="formData.main"
              rows="6"
              placeholder="请详细描述您的想法或遇到的问题..."
              :disabled="isSubmitting"
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ formData.main.length }}/500</span>
            <span class="error-msg" v-if="errors.main">{{ errors.main }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <span v-if="isSubmitting">提交中...</span>
            <span v-else>提交反馈</span>
          </button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import Card from /../components/Card.vue';

const API_BASE = 'https://api.xn--bgtt50a8xt.top'; // 建议改用环境变量

const formData = ref({
  user_id: '',
  title: '',
  main: '',
});

const isSubmitting = ref(false);
const errors = reactive({
  user_id: '',
  title: '',
  main: '',
});

// 清除所有错误信息
const clearErrors = () => {
  errors.user_id = '';
  errors.title = '';
  errors.main = '';
};

// 前端校验
const validateForm = (): boolean => {
  clearErrors();
  let isValid = true;

  if (!formData.value.user_id.trim()) {
    errors.user_id = '请填写昵称';
    isValid = false;
  }
  if (!formData.value.title.trim()) {
    errors.title = '请填写标题';
    isValid = false;
  }
  if (!formData.value.main.trim()) {
    errors.main = '请填写详细内容';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    const response = await fetch(`${API_BASE}/api/suppost/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: formData.value.user_id.trim(),
        title: formData.value.title.trim(),
        main: formData.value.main.trim(),
        user_ua: navigator.userAgent,
      }),
    });

    // 1. 先检查 HTTP 状态码
    if (!response.ok) {
      throw new Error(`服务异常（HTTP ${response.status}），请稍后重试`);
    }

    // 2. 安全解析 JSON（防止返回 HTML 等非 JSON 格式）
    let result: any;
    try {
      result = await response.json();
    } catch {
      throw new Error('服务器返回了无效的数据格式，请联系管理员');
    }

    // 3. 根据业务码处理
    if (result.code === 200) {
      alert('反馈提交成功！感谢您的支持 ❤️');
      formData.value = { user_id: '', title: '', main: '' };
      clearErrors();
    } else {
      throw new Error(result.message || '提交失败，请稍后重试');
    }
  } catch (error: any) {
    console.error('提交反馈失败:', error);
    alert(error.message || '网络错误，请检查服务状态');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* ... 原有样式保留，新增错误相关样式 ... */
.form-group.has-error input,
.form-group.has-error textarea {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}
.error-msg {
  position: absolute;
  left: 0;
  bottom: -18px;
  font-size: 0.75rem;
  color: #e53e3e;
}
/* 让字符计数在错误时依然可见，调整位置 */
.form-group.has-error .char-count {
  bottom: 2px; /* 避免与错误文字重叠 */
}
</style>
