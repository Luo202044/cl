<template>
  <div class="admin-page">
    <!-- 登录界面 -->
    <div v-if="!isAuthenticated" class="login-container">
      <Card title="管理员登录" icon="fa-lock" :hoverable="false">
        <form @submit.prevent="login" class="login-form">
          <div class="form-group">
            <input 
              type="password" 
              v-model="password" 
              placeholder="请输入管理 Token" 
              required
              :disabled="isLoggingIn"
            />
          </div>
          <button type="submit" class="submit-btn" :disabled="isLoggingIn">
            {{ isLoggingIn ? '验证中...' : '登录' }}
          </button>
          <p class="hint">请输入 Worker 配置的 suppost_tokens</p>
        </form>
      </Card>
    </div>

    <!-- 管理界面 -->
    <div v-else>
      <div class="admin-header">
        <h1>📋 反馈管理后台</h1>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>

      <!-- 筛选栏 -->
      <Card title="筛选与搜索" icon="fa-filter" :hoverable="false" class="filter-card">
        <div class="filter-bar">
          <div class="filter-item">
            <label>反馈类型：</label>
            <select v-model="filterType">
              <option value="all">全部</option>
              <option value="suggestion">功能建议</option>
              <option value="bug">问题反馈</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="filter-item">
            <label>每页显示：</label>
            <select v-model="pageSize" @change="loadFeedbacks(1)">
              <option value="10">10条</option>
              <option value="20">20条</option>
              <option value="50">50条</option>
            </select>
          </div>
          <div class="filter-item search-item">
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="搜索标题或内容..."
              @input="searchFeedbacks"
            >
          </div>
          <button @click="refreshData" class="action-btn refresh-btn">刷新</button>
        </div>
      </Card>

      <!-- 反馈列表 -->
      <div class="feedback-list">
        <Card 
          v-for="item in filteredFeedbacks" 
          :key="item.id"
          :title="item.title"
          hoverable
          class="feedback-card"
        >
          <template #icon>
            <div class="card-custom-icon" :data-type="item.type">
              {{ getTypeEmoji(item.type) }}
            </div>
          </template>

          <div class="feedback-meta">
            <span class="user">👤 {{ item.user_id }}</span>
            <span class="time">{{ formatDateTime(item.time * 1000) }}</span>
          </div>
          <p class="feedback-main">{{ item.main }}</p>
          <div class="feedback-footer">
            <span v-if="item.user_ua" class="user-agent">🌐 {{ item.user_ua }}</span>
            <button class="delete-btn" @click="deleteFeedback(item.id)">删除</button>
          </div>
        </Card>

        <div v-if="filteredFeedbacks.length === 0" class="empty-state">
          <AnnouncementCard title="暂无反馈数据" icon="fa-inbox">
            <p>还没有用户提交反馈，或者筛选条件没有匹配项。</p>
          </AnnouncementCard>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button @click="loadFeedbacks(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
          上一页
        </button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button @click="loadFeedbacks(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Card from '../../components/Card.vue';
import AnnouncementCard from '../../components/AnnouncementCard.vue';

const API_BASE = 'https://api.xn--bgtt50a8xt.top'; // 请替换为你的 Worker 域名

interface FeedbackItem {
  id: number;
  user_id: string;
  title: string;
  main: string;
  type?: string;
  user_ua?: string;
  time: number;
}

// 认证状态
const isAuthenticated = ref(false);
const token = ref('');
const password = ref('');
const isLoggingIn = ref(false);

// 数据状态
const allFeedbacks = ref<FeedbackItem[]>([]);
const filterType = ref<'all' | 'suggestion' | 'bug' | 'other'>('all');
const pageSize = ref(20);
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const searchKeyword = ref('');

// 工具函数
const getTypeEmoji = (type?: string) => {
  const map: Record<string, string> = {
    suggestion: '✨',
    bug: '🐛',
    other: '💬'
  };
  return map[type || 'other'] || '💬';
};

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 前端筛选
const filteredFeedbacks = computed(() => {
  let result = [...allFeedbacks.value];
  if (filterType.value !== 'all') {
    result = result.filter(item => item.type === filterType.value);
  }
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.toLowerCase();
    result = result.filter(item => 
      item.title.toLowerCase().includes(kw) ||
      item.main.toLowerCase().includes(kw)
    );
  }
  return result;
});

// 加载反馈列表（API）
const loadFeedbacks = async (page: number = 1) => {
  if (!token.value) return;
  try {
    const url = `${API_BASE}/api/suppost/list/get?token=${token.value}&page=${page}&limit=${pageSize.value}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code === 200 && result.data) {
      allFeedbacks.value = result.data.list || [];
      currentPage.value = result.data.pagination.page;
      totalPages.value = result.data.pagination.total_pages;
      totalItems.value = result.data.pagination.total;
    } else if (result.code === 502) {
      throw new Error('Token 无效或数据库连接失败');
    } else {
      throw new Error(result.message || '加载失败');
    }
  } catch (error: any) {
    console.error('加载反馈失败:', error);
    alert(error.message || '网络错误，请检查 Worker 服务');
    if (error.message.includes('Token 无效')) {
      isAuthenticated.value = false;
      token.value = '';
      sessionStorage.removeItem('feedback_admin_token');
      sessionStorage.removeItem('feedback_admin_auth');
    }
  }
};

// 删除反馈
const deleteFeedback = async (id: number) => {
  if (!confirm('确定删除这条反馈吗？')) return;
  try {
    const url = `${API_BASE}/api/suppost/list/del?id=${id}&token=${token.value}`;
    const response = await fetch(url);
    const result = await response.json();
    if (result.code === 200) {
      alert('删除成功');
      await loadFeedbacks(currentPage.value);
    } else {
      alert(result.message || '删除失败');
    }
  } catch (error) {
    console.error('删除失败:', error);
    alert('网络错误');
  }
};

// 刷新
const refreshData = () => {
  loadFeedbacks(currentPage.value);
};

// 搜索（重置到第一页）
const searchFeedbacks = () => {
  loadFeedbacks(1);
};

// 登录（严格验证）
const login = async () => {
  if (!password.value.trim()) {
    alert('请输入 Token');
    return;
  }
  isLoggingIn.value = true;
  const testToken = password.value.trim();

  try {
    const url = `${API_BASE}/api/suppost/list/get?token=${testToken}&page=1&limit=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    // 验证成功条件：code === 200 且 data 存在（即使列表为空也算成功）
    if (result.code === 200 && result.data !== undefined) {
      token.value = testToken;
      isAuthenticated.value = true;
      sessionStorage.setItem('feedback_admin_token', token.value);
      sessionStorage.setItem('feedback_admin_auth', 'true');
      await loadFeedbacks(1);
    } else {
      alert(result.message || 'Token 无效，请检查 Worker 配置');
      password.value = '';
    }
  } catch (error: any) {
    console.error('登录验证失败:', error);
    alert('验证失败：' + (error.message || '网络错误，请检查 Worker 服务'));
    password.value = '';
  } finally {
    isLoggingIn.value = false;
  }
};

// 退出
const logout = () => {
  isAuthenticated.value = false;
  token.value = '';
  password.value = '';
  sessionStorage.removeItem('feedback_admin_token');
  sessionStorage.removeItem('feedback_admin_auth');
};

// 检查已登录状态
onMounted(() => {
  const savedAuth = sessionStorage.getItem('feedback_admin_auth');
  const savedToken = sessionStorage.getItem('feedback_admin_token');
  if (savedAuth === 'true' && savedToken) {
    token.value = savedToken;
    isAuthenticated.value = true;
    loadFeedbacks(1);
  }
});
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--bg-primary, #f5f7fb);
  padding: 2rem 1.5rem;
}
.login-container {
  max-width: 450px;
  margin: 80px auto;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: var(--input-bg, white);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  font-size: 1rem;
  color: var(--text-primary);
}
.submit-btn {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.02);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.hint {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}
.admin-header h1 {
  font-size: 1.8rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 500;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.filter-item label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.filter-item select,
.filter-item input {
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-primary);
}
.search-item input {
  width: 200px;
}
.action-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 30px;
  border: none;
  background: var(--gradient-primary);
  color: white;
  cursor: pointer;
  font-weight: 500;
}
.refresh-btn {
  background: #10b981;
}
.refresh-btn:hover {
  background: #059669;
}
.feedback-list {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.card-custom-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  background: var(--gradient-primary);
  border-radius: 16px;
  color: white;
}
.card-custom-icon[data-type="suggestion"] {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.card-custom-icon[data-type="bug"] {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.card-custom-icon[data-type="other"] {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.feedback-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.feedback-main {
  margin: 0.8rem 0;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-line;
}
.feedback-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--border-color);
}
.user-agent {
  font-size: 0.7rem;
  color: var(--text-secondary);
  word-break: break-all;
}
.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: 0.2s;
}
.delete-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}
.empty-state {
  margin: 3rem 0;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
.page-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 0.4rem 1rem;
  border-radius: 30px;
  cursor: pointer;
  color: var(--text-primary);
  transition: 0.2s;
}
.page-btn:hover:not(:disabled) {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
@media (max-width: 640px) {
  .admin-page {
    padding: 1rem;
  }
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-item input {
    width: 100%;
  }
}
</style>

