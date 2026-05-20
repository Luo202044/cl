<template>
  <div class="feedback-page">
    <div class="page-header">
      <h1>意见反馈</h1>
      <p>我们非常重视您的每一条建议</p>
    </div>

    <div class="form-wrapper">
      <Card title="提交反馈" icon="fa-pen-alt" :hoverable="false">
        <form @submit.prevent="handleSubmit" class="feedback-form">
          <div class="form-group">
            <label>昵称</label>
            <input 
              type="text" 
              v-model="formData.user_id" 
              placeholder="如何称呼您？"
              required
              maxlength="50"
            >
            <span class="char-count">{{ formData.user_id.length }}/50</span>
          </div>

          <div class="form-group">
            <label>标题</label>
            <input 
              type="text" 
              v-model="formData.title" 
              placeholder="简要描述您的反馈..."
              required
              maxlength="100"
            >
            <span class="char-count">{{ formData.title.length }}/100</span>
          </div>

          <div class="form-group">
            <label>详细内容</label>
            <textarea 
              v-model="formData.main" 
              rows="6" 
              placeholder="请详细描述您的想法或遇到的问题..."
              required
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ formData.main.length }}/500</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <span v-if="isSubmitting">提交中...</span>
            <span v-else>发确定</span>
          </button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from '@/components/Card.vue';  // 使用别名，如果仍有问题可改为相对路径

const API_BASE = 'https://api.xn--bgtt50a8xt.top';  // 替换为你的 Worker 域名

const formData = ref({
  user_id: '',
  title: '',
  main: ''
});

const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!formData.value.user_id.trim()) {
    alert('请填写昵称');
    return;
  }
  if (!formData.value.title.trim()) {
    alert('请填写标题');
    return;
  }
  if (!formData.value.main.trim()) {
    alert('请填写详细内容');
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch(`${API_BASE}/api/suppost/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: formData.value.user_id.trim(),
        title: formData.value.title.trim(),
        main: formData.value.main.trim(),
        user_ua: navigator.userAgent
      })
    });

    const result = await response.json();

    if (result.code === 200) {
      alert('反馈提交成功！感谢您的支持 ❤️');
      formData.value = { user_id: '', title: '', main: '' };
    } else {
      alert(result.message || '提交失败，请稍后重试');
    }
  } catch (error) {
    console.error('提交失败:', error);
    alert('网络错误，请检查 Worker 服务状态');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: var(--bg-primary, #f5f7fb);
  padding: 2rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
}
.page-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}
.form-wrapper {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-group {
  position: relative;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--input-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--text-primary);
  transition: all 0.2s;
  font-family: inherit;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}
.char-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 0.7rem;
  color: var(--text-secondary);
}
textarea {
  resize: vertical;
}
.submit-btn {
  width: 100%;
  padding: 0.9rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 40px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.02);
  box-shadow: 0 8px 20px var(--primary-glow);
}
.submit-btn:active:not(:disabled) {
  transform: translateY(1px);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
