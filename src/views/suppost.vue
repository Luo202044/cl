<template>
  <div class="feedback-page">
    <!-- 头部横幅 -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">💬</div>
        <h1>意见反馈</h1>
        <p>我们非常重视您的每一条建议，让我们一起让 Cottie 变得更好。</p>
      </div>
    </div>

    <div class="content-grid">
      <!-- 反馈提交表单 -->
      <div class="form-card">
        <form @submit.prevent="handleSubmit">
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
            <label>反馈类型</label>
            <select v-model="formData.type" class="type-select">
              <option value="suggestion">功能建议</option>
              <option value="bug">问题反馈</option>
              <option value="other">其他</option>
            </select>
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
              maxlength="350"
            ></textarea>
            <span class="char-count">{{ formData.main.length }}/350</span>
          </div>

          <button type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">提交中...</span>
            <span v-else>提交反馈</span>
          </button>
        </form>
      </div>

      <!-- 反馈墙（展示最近5条） -->
      <div class="feedback-wall">
        <div class="section-header">
          <h2>📢 用户声音 · 最新</h2>
          <span class="feedback-count">共 {{ totalCount }} 条反馈</span>
        </div>

        <div v-if="recentFeedbacks.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂无反馈，来做第一个留言的人吧~</p>
        </div>

        <div v-else class="feedback-list">
          <div v-for="item in recentFeedbacks" :key="item.id" class="feedback-item">
            <div class="feedback-header">
              <span class="feedback-type" :data-type="item.type">{{ getTypeLabel(item.type) }}</span>
              <span class="feedback-time">{{ formatTime(item.time * 1000) }}</span>
            </div>
            <h3 class="feedback-title">{{ item.title }}</h3>
            <p class="feedback-content">{{ item.main }}</p>
            <div class="user-info">📝 {{ item.user_id }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// 配置 - 替换为你的 Worker 域名
const API_BASE = 'https://api.xn--bgtt50a8xt.top';  // 从 classinapi README 获取

interface FeedbackItem {
  id: number;
  user_id: string;
  title: string;
  main: string;
  type?: string;
  time: number;
}

const formData = ref({
  user_id: '',
  type: 'suggestion',
  title: '',
  main: ''
});

const isSubmitting = ref(false);
const allFeedbacks = ref<FeedbackItem[]>([]);

// 获取类型标签（用于显示）
const getTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    suggestion: '✨ 功能建议',
    bug: '🐛 问题反馈',
    other: '💬 其他'
  };
  return map[type || 'other'] || '💬 其他';
};

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)}天前`;
  
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 加载反馈列表
const loadFeedbacks = async () => {
  try {
    // 调用列表接口（不需要 token，使用 limit=5 获取最新5条）
    const url = `${API_BASE}/api/suppost/list/get?limit=5`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.code === 200 && result.data) {
      allFeedbacks.value = result.data.list || [];
    }
  } catch (error) {
    console.error('加载反馈失败:', error);
  }
};

// 提交反馈
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
    const payload = {
      user_id: formData.value.user_id.trim(),
      title: formData.value.title.trim(),
      main: formData.value.main.trim(),
      user_ua: navigator.userAgent
    };
    
    const response = await fetch(`${API_BASE}/api/suppost/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      alert('反馈提交成功！感谢您的支持 ❤️');
      formData.value = { user_id: '', type: 'suggestion', title: '', main: '' };
      await loadFeedbacks(); // 刷新列表
    } else {
      alert(result.message || '提交失败，请稍后重试');
    }
  } catch (error) {
    console.error('提交反馈失败:', error);
    alert('网络错误，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 计算总条数
const totalCount = computed(() => allFeedbacks.value.length);

// 最近5条反馈
const recentFeedbacks = computed(() => {
  return allFeedbacks.value.slice(0, 5);
});

onMounted(() => {
  loadFeedbacks();
});
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: var(--bg-primary, #f5f7fb);
  padding-bottom: 60px;
}

/* 头部区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 24px 80px;
  text-align: center;
  color: white;
  margin-bottom: -40px;
}

[data-theme='dark'] .hero-section {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.hero-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.hero-section h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
}

.hero-section p {
  font-size: 16px;
  opacity: 0.9;
  max-width: 500px;
  margin: 0 auto;
}

/* 内容网格 */
.content-grid {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 32px;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

/* 卡片样式 */
.form-card,
.feedback-wall {
  background: var(--card-bg, #ffffff);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 28px 32px;
  transition: transform 0.2s, box-shadow 0.2s;
}

[data-theme='dark'] .form-card,
[data-theme='dark'] .feedback-wall {
  background: var(--card-bg, #1f2937);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.form-card:hover,
.feedback-wall:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
}

/* 表单样式 */
.form-group {
  margin-bottom: 22px;
  position: relative;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .form-group label {
  color: var(--text-primary, #f3f4f6);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  font-size: 15px;
  background: var(--input-bg, #ffffff);
  color: var(--text-primary, #1f2937);
  transition: all 0.2s;
}

[data-theme='dark'] .form-group input,
[data-theme='dark'] .form-group select,
[data-theme='dark'] .form-group textarea {
  background: var(--input-bg, #374151);
  border-color: var(--border-color, #4b5563);
  color: var(--text-primary, #f9fafb);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.type-select {
  cursor: pointer;
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

textarea {
  resize: vertical;
  font-family: inherit;
}

button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

[data-theme='dark'] button {
  background: linear-gradient(135deg, #4c51bf 0%, #5b3a7a 100%);
}

button:hover {
  transform: translateY(-1px);
  filter: brightness(1.02);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(1px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 反馈墙样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color, #e5e7eb);
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .section-header h2 {
  color: var(--text-primary, #f9fafb);
}

.feedback-count {
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-secondary, #6b7280);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.7;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 6px;
}

.feedback-list::-webkit-scrollbar {
  width: 6px;
}

.feedback-list::-webkit-scrollbar-track {
  background: var(--border-color, #e5e7eb);
  border-radius: 3px;
}

.feedback-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.feedback-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.feedback-item:last-child {
  border-bottom: none;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.feedback-type {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 30px;
  background: #f3f4f6;
}

[data-theme='dark'] .feedback-type {
  background: #374151;
}

.feedback-type[data-type="suggestion"] {
  background: #dbeafe;
  color: #1e40af;
}

[data-theme='dark'] .feedback-type[data-type="suggestion"] {
  background: #1e3a8a;
  color: #bfdbfe;
}

.feedback-type[data-type="bug"] {
  background: #fee2e2;
  color: #991b1b;
}

[data-theme='dark'] .feedback-type[data-type="bug"] {
  background: #7f1d1d;
  color: #fecaca;
}

.feedback-type[data-type="other"] {
  background: #e0e7ff;
  color: #3730a3;
}

[data-theme='dark'] .feedback-type[data-type="other"] {
  background: #312e81;
  color: #c7d2fe;
}

.feedback-time {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.feedback-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .feedback-title {
  color: var(--text-primary, #f9fafb);
}

.feedback-content {
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 8px 0;
  color: var(--text-secondary, #4b5563);
}

[data-theme='dark'] .feedback-content {
  color: var(--text-secondary, #9ca3af);
}

.user-info {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  margin-top: 8px;
}
</style>
