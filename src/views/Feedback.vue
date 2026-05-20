<template>
  <div class="feedback-page">
    <div class="page-header">
      <h1>意见反馈</h1>
      <p>我们非常重视您的每一条建议</p>
    </div>

    <div class="form-wrapper">
      <div class="custom-card">
        <div class="custom-card-header">
          <div class="custom-card-icon">✍️</div>
          <h3>提交反馈</h3>
        </div>
        <form @submit.prevent="handleSubmit" class="feedback-form">
          <!-- 表单字段同上 -->
          <div class="form-group">
            <label>昵称</label>
            <input type="text" v-model="formData.user_id" placeholder="如何称呼您？" required maxlength="50">
            <span class="char-count">{{ formData.user_id.length }}/50</span>
          </div>
          <div class="form-group">
            <label>反馈类型</label>
            <select v-model="formData.type">
              <option value="suggestion">✨ 功能建议</option>
              <option value="bug">🐛 问题反馈</option>
              <option value="other">💬 其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>标题</label>
            <input type="text" v-model="formData.title" placeholder="简要描述..." required maxlength="100">
            <span class="char-count">{{ formData.title.length }}/100</span>
          </div>
          <div class="form-group">
            <label>详细内容</label>
            <textarea v-model="formData.main" rows="6" placeholder="请详细描述..." required maxlength="500"></textarea>
            <span class="char-count">{{ formData.main.length }}/500</span>
          </div>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : '发确定' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const API_BASE = 'https://api.xn--bgtt50a8xt.top'

const formData = ref({
  user_id: '',
  type: 'suggestion',
  title: '',
  main: ''
})
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!formData.value.user_id.trim()) return alert('请填写昵称')
  if (!formData.value.title.trim()) return alert('请填写标题')
  if (!formData.value.main.trim()) return alert('请填写详细内容')
  isSubmitting.value = true
  try {
    const res = await fetch(`${API_BASE}/api/suppost/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: formData.value.user_id.trim(),
        title: formData.value.title.trim(),
        main: formData.value.main.trim(),
        user_ua: navigator.userAgent
      })
    })
    const result = await res.json()
    if (result.code === 200) {
      alert('提交成功！')
      formData.value = { user_id: '', type: 'suggestion', title: '', main: '' }
    } else {
      alert(result.message || '提交失败')
    }
  } catch {
    alert('网络错误')
  } finally {
    isSubmitting.value = false
  }
}
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
}
.form-wrapper {
  width: 100%;
  max-width: 700px;
}
.custom-card {
  background: var(--card-bg, #fff);
  border-radius: var(--border-radius, 20px);
  padding: 24px;
  border: 1px solid var(--card-border, #e2e8f0);
  box-shadow: var(--glass-shadow, 0 4px 20px rgba(0,0,0,0.08));
  transition: all 0.3s;
}
.custom-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.custom-card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: 16px;
  font-size: 1.5rem;
  color: white;
}
.custom-card-header h3 {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-sub, #1f2937);
  margin: 0;
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
.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--input-bg, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--text-primary);
}
.char-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 0.7rem;
  color: var(--text-secondary);
}
.submit-btn {
  width: 100%;
  padding: 0.9rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
}
</style>
