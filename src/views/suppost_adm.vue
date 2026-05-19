<template>
  <div class="admin-container">
    <!-- 登录界面 -->
    <div v-if="!isAuthenticated" class="login-box">
      <h2>管理员登录</h2>
      <input 
        type="password" 
        v-model="password" 
        placeholder="请输入管理 Token" 
        @keyup.enter="login" 
      />
      <button @click="login">登录</button>
      <p class="hint">请输入配置的 tokens</p>
    </div>

    <!-- 管理界面 -->
    <div v-else>
      <div class="admin-header">
        <h1>📋 反馈管理后台</h1>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>

      <!-- 刷新与筛选 -->
      <div class="filter-bar">
        <div class="filter-item">
          <label>筛选类型：</label>
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
        <div class="search-item">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索标题或内容..."
            @input="searchFeedbacks"
          >
        </div>
        <button @click="refreshData" class="refresh-btn">刷新</button>
      </div>

      <!-- 反馈列表 -->
      <div class="feedback-list-admin">
        <div 
          v-for="item in filteredFeedbacks" 
          :key="item.id" 
          class="admin-card"
        >
          <div class="card-header">
            <div class="left-info">
              <span class="type-badge" :data-type="item.type">{{ getTypeLabel(item.type) }}</span>
              <span class="user-name">👤 {{ item.user_id }}</span>
            </div>
            <div class="right-info">
              <span class="time">{{ formatDateTime(item.time * 1000) }}</span>
              <div class="actions">
                <button class="delete-btn" @click="deleteFeedback(item.id)">删除</button>
              </div>
            </div>
          </div>
          <div class="card-title">{{ item.title }}</div>
          <div class="card-content">{{ item.main }}</div>
          <div class="card-footer">
            <span class="user-agent" v-if="item.user_ua">🌐 {{ item.user_ua }}</span>
          </div>
        </div>

        <div v-if="filteredFeedbacks.length === 0" class="empty-tip">
          暂无反馈数据
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="loadFeedbacks(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn"
        >上一页</button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button 
          @click="loadFeedbacks(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// 配置 - 替换为你的 Worker 域名
const API_BASE = 'https://api.xn--bgtt50a8xt.top';

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
const token = ref(''); // 存储管理 Token
const password = ref('');

// 数据状态
const allFeedbacks = ref<FeedbackItem[]>([]);
const filterType = ref<'all' | 'suggestion' | 'bug' | 'other'>('all');
const pageSize = ref<number>(20);
const currentPage = ref<number>(1);
const totalPages = ref<number>(1);
const totalItems = ref<number>(0);
const searchKeyword = ref<string>('');

// 筛选后的列表
const filteredFeedbacks = computed(() => {
  let result = [...allFeedbacks.value];
  
  // 类型筛选
  if (filterType.value !== 'all') {
    result = result.filter(item => item.type === filterType.value);
  }
  
  // 搜索筛选（标题或内容）
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.main.toLowerCase().includes(keyword)
    );
  }
  
  return result;
});

// 工具函数
const getTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    suggestion: '✨ 功能建议',
    bug: '🐛 问题反馈',
    other: '💬 其他'
  };
  return map[type || 'other'] || '💬 其他';
};

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 加载反馈列表（API 请求）
const loadFeedbacks = async (page: number = 1) => {
  if (!token.value) return;
  
  try {
    const url = `${API_BASE}/api/suppost/list/get?token=${token.value}&page=${page}&limit=${pageSize.value}`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.code === 200 && result.data) {
      allFeedbacks.value = result.data.list || [];
      currentPage.value = result.data.pagination.page;
      totalPages.value = result.data.pagination.total_pages;
      totalItems.value = result.data.pagination.total;
    } else if (result.code === 502) {
      alert('Token 无效或数据库连接失败');
      isAuthenticated.value = false;
      token.value = '';
    } else {
      console.error('加载反馈失败:', result.message);
      allFeedbacks.value = [];
    }
  } catch (error) {
    console.error('网络错误:', error);
    alert('网络错误，请检查 Worker 服务状态');
  }
};

// 删除反馈
const deleteFeedback = async (id: number) => {
  if (!confirm('确定要删除这条反馈吗？')) return;
  
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

// 刷新数据（保持当前页）
const refreshData = () => {
  loadFeedbacks(currentPage.value);
};

// 搜索反馈（重置到第一页）
const searchFeedbacks = () => {
  loadFeedbacks(1);
};

// 登录
const login = async () => {
  if (!password.value.trim()) {
    alert('请输入管理 Token');
    return;
  }
  
  token.value = password.value.trim();
  await loadFeedbacks(1);
  
  if (allFeedbacks.value.length > 0 || totalItems.value > 0) {
    isAuthenticated.value = true;
    sessionStorage.setItem('feedback_admin_token', token.value);
    sessionStorage.setItem('feedback_admin_auth', 'true');
  } else {
    // 即使列表为空，只要 API 没有返回 502 错误，也算登录成功
    isAuthenticated.value = true;
    sessionStorage.setItem('feedback_admin_token', token.value);
    sessionStorage.setItem('feedback_admin_auth', 'true');
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
  const isLogged = sessionStorage.getItem('feedback_admin_auth');
  const savedToken = sessionStorage.getItem('feedback_admin_token');
  if (isLogged === 'true' && savedToken) {
    token.value = savedToken;
    isAuthenticated.value = true;
    loadFeedbacks(1);
  }
});
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  background: var(--bg-primary, #f5f7fb);
  border-radius: 20px;
  min-height: 80vh;
}

/* 登录框样式 */
.login-box {
  max-width: 350px;
  margin: 80px auto;
  text-align: center;
  background: var(--card-bg, white);
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] .login-box {
  background: var(--card-bg, #1f2937);
}

.login-box h2 {
  margin-bottom: 24px;
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .login-box h2 {
  color: var(--text-primary, #f3f4f6);
}

.login-box input {
  width: 100%;
  padding: 12px;
  margin: 15px 0;
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  font-size: 15px;
  background: var(--input-bg, white);
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .login-box input {
  background: var(--input-bg, #374151);
  border-color: var(--border-color, #4b5563);
  color: var(--text-primary, #f9fafb);
}

.login-box button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.login-box button:hover {
  transform: translateY(-1px);
  filter: brightness(1.02);
}

.hint {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  margin-top: 12px;
}

/* 管理界面样式 */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color, #e5e7eb);
}

.admin-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .admin-header h1 {
  color: var(--text-primary, #f3f4f6);
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* 过滤栏 */
.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  background: var(--card-bg, white);
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

[data-theme='dark'] .filter-bar {
  background: var(--card-bg, #1f2937);
}

.filter-item, .search-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .filter-item label {
  color: var(--text-primary, #f3f4f6);
}

.filter-item select, .search-item input {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #e5e7eb);
  background: var(--input-bg, white);
  color: var(--text-primary, #1f2937);
  font-size: 14px;
}

[data-theme='dark'] .filter-item select,
[data-theme='dark'] .search-item input {
  background: var(--input-bg, #374151);
  border-color: var(--border-color, #4b5563);
  color: var(--text-primary, #f9fafb);
}

.search-item input {
  width: 200px;
}

.refresh-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* 反馈列表 */
.feedback-list-admin {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.admin-card {
  background: var(--card-bg, white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

[data-theme='dark'] .admin-card {
  background: var(--card-bg, #1f2937);
}

.admin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.left-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.right-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.type-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 30px;
  font-weight: 500;
}

.type-badge[data-type="suggestion"] {
  background: #dbeafe;
  color: #1e40af;
}

[data-theme='dark'] .type-badge[data-type="suggestion"] {
  background: #1e3a8a;
  color: #bfdbfe;
}

.type-badge[data-type="bug"] {
  background: #fee2e2;
  color: #991b1b;
}

[data-theme='dark'] .type-badge[data-type="bug"] {
  background: #7f1d1d;
  color: #fecaca;
}

.type-badge[data-type="other"] {
  background: #e0e7ff;
  color: #3730a3;
}

[data-theme='dark'] .type-badge[data-type="other"] {
  background: #312e81;
  color: #c7d2fe;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .user-name {
  color: var(--text-primary, #f3f4f6);
}

.time {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 4px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .card-title {
  color: var(--text-primary, #f3f4f6);
}

.card-content {
  color: var(--text-secondary, #4b5563);
  line-height: 1.5;
  margin-bottom: 12px;
}

[data-theme='dark'] .card-content {
  color: var(--text-secondary, #9ca3af);
}

.card-footer {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.user-agent {
  font-size: 11px;
  color: var(--text-secondary, #6b7280);
  word-break: break-all;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary, #6b7280);
  background: var(--card-bg, white);
  border-radius: 16px;
}

[data-theme='dark'] .empty-tip {
  background: var(--card-bg, #1f2937);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page-btn {
  background: var(--card-bg, white);
  color: var(--text-primary, #1f2937);
  border: 1.5px solid var(--border-color, #e5e7eb);
  padding: 8px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

[data-theme='dark'] .page-btn {
  background: var(--card-bg, #1f2937);
  border-color: var(--border-color, #4b5563);
  color: var(--text-primary, #f3f4f6);
}

.page-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: var(--text-primary, #1f2937);
}

[data-theme='dark'] .page-info {
  color: var(--text-primary, #f3f4f6);
}
</style>
