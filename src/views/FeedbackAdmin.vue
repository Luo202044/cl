<template>
  <div class="admin-page">
    <div v-if="!isAuthenticated" class="login-card">
      <div class="login-card-inner">
        <h2>管理员登录</h2>
        <form @submit.prevent="login">
          <input type="password" v-model="password" placeholder="管理 Token" required />
          <button type="submit">登录</button>
          <p class="hint">请输入 Worker 配置的 suppost_tokens</p>
        </form>
      </div>
    </div>

    <div v-else>
      <div class="admin-header">
        <h1>📋 反馈管理后台</h1>
        <button @click="logout">退出登录</button>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-card">
        <div class="filter-bar">
          <div class="filter-item">
            <label>类型：</label>
            <select v-model="filterType">
              <option value="all">全部</option>
              <option value="suggestion">功能建议</option>
              <option value="bug">问题反馈</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="filter-item">
            <label>每页：</label>
            <select v-model="pageSize" @change="loadFeedbacks(1)">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="filter-item">
            <input type="text" v-model="searchKeyword" placeholder="搜索标题/内容" @input="searchFeedbacks" />
          </div>
          <button @click="refreshData">刷新</button>
        </div>
      </div>

      <!-- 反馈列表 -->
      <div class="feedback-list">
        <div v-for="item in filteredFeedbacks" :key="item.id" class="feedback-card">
          <div class="card-header">
            <div class="card-icon" :data-type="item.type">{{ getTypeEmoji(item.type) }}</div>
            <div class="card-title">{{ item.title }}</div>
            <div class="card-actions">
              <button @click="deleteFeedback(item.id)" class="delete-btn">删除</button>
            </div>
          </div>
          <div class="card-meta">
            <span>👤 {{ item.user_id }}</span>
            <span>{{ formatDateTime(item.time * 1000) }}</span>
          </div>
          <div class="card-content">{{ item.main }}</div>
          <div v-if="item.user_ua" class="card-ua">🌐 {{ item.user_ua }}</div>
        </div>
        <div v-if="filteredFeedbacks.length === 0" class="empty-card">
          <p>📭 暂无反馈数据</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button @click="loadFeedbacks(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="loadFeedbacks(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const API_BASE = 'https://api.xn--bgtt50a8xt.top'

interface FeedbackItem {
  id: number;
  user_id: string;
  title: string;
  main: string;
  type?: string;
  user_ua?: string;
  time: number;
}

const isAuthenticated = ref(false)
const token = ref('')
const password = ref('')
const allFeedbacks = ref<FeedbackItem[]>([])
const filterType = ref<'all' | 'suggestion' | 'bug' | 'other'>('all')
const pageSize = ref(20)
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const searchKeyword = ref('')

const getTypeEmoji = (type?: string) => {
  const map: Record<string, string> = { suggestion: '✨', bug: '🐛', other: '💬' }
  return map[type || 'other'] || '💬'
}
const formatDateTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
const filteredFeedbacks = computed(() => {
  let list = [...allFeedbacks.value]
  if (filterType.value !== 'all') list = list.filter(i => i.type === filterType.value)
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(i => i.title.toLowerCase().includes(kw) || i.main.toLowerCase().includes(kw))
  }
  return list
})

const loadFeedbacks = async (page = 1) => {
  if (!token.value) return
  try {
    const url = `${API_BASE}/api/suppost/list/get?token=${token.value}&page=${page}&limit=${pageSize.value}`
    const res = await fetch(url)
    const result = await res.json()
    if (result.code === 200 && result.data) {
      allFeedbacks.value = result.data.list || []
      currentPage.value = result.data.pagination.page
      totalPages.value = result.data.pagination.total_pages
      totalItems.value = result.data.pagination.total
    } else if (result.code === 502) {
      alert('Token 无效或数据库连接失败')
      isAuthenticated.value = false
      token.value = ''
    }
  } catch (error) {
    console.error(error)
    alert('网络错误')
  }
}
const deleteFeedback = async (id: number) => {
  if (!confirm('确定删除？')) return
  try {
    const url = `${API_BASE}/api/suppost/list/del?id=${id}&token=${token.value}`
    const res = await fetch(url)
    const result = await res.json()
    if (result.code === 200) {
      alert('删除成功')
      await loadFeedbacks(currentPage.value)
    } else {
      alert(result.message || '删除失败')
    }
  } catch {
    alert('网络错误')
  }
}
const refreshData = () => loadFeedbacks(currentPage.value)
const searchFeedbacks = () => loadFeedbacks(1)
const login = async () => {
  if (!password.value.trim()) return alert('请输入 Token')
  token.value = password.value.trim()
  await loadFeedbacks(1)
  isAuthenticated.value = true
  sessionStorage.setItem('feedback_admin_token', token.value)
  sessionStorage.setItem('feedback_admin_auth', 'true')
}
const logout = () => {
  isAuthenticated.value = false
  token.value = ''
  password.value = ''
  sessionStorage.removeItem('feedback_admin_token')
  sessionStorage.removeItem('feedback_admin_auth')
}
onMounted(() => {
  const savedToken = sessionStorage.getItem('feedback_admin_token')
  if (savedToken) {
    token.value = savedToken
    isAuthenticated.value = true
    loadFeedbacks(1)
  }
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--bg-primary, #f5f7fb);
  padding: 2rem 1.5rem;
}
.login-card {
  max-width: 400px;
  margin: 80px auto;
  background: var(--card-bg, white);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
.login-card input {
  width: 100%;
  padding: 0.8rem;
  margin: 1rem 0;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
.login-card button {
  width: 100%;
  padding: 0.8rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 40px;
  cursor: pointer;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 1rem;
}
.admin-header h1 {
  font-size: 1.8rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.admin-header button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 30px;
  cursor: pointer;
}
.filter-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
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
}
.filter-item select, .filter-item input {
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
}
.filter-bar button {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 30px;
  cursor: pointer;
}
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.feedback-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.2rem;
  border: 1px solid var(--card-border);
  transition: 0.2s;
}
.feedback-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--gradient-primary);
  color: white;
  font-size: 1.3rem;
}
.card-icon[data-type="suggestion"] { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.card-icon[data-type="bug"] { background: linear-gradient(135deg, #ef4444, #dc2626); }
.card-icon[data-type="other"] { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.card-title {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
}
.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
}
.card-content {
  margin: 10px 0;
  line-height: 1.4;
  color: var(--text-primary);
}
.card-ua {
  font-size: 0.7rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
  margin-top: 8px;
}
.empty-card {
  text-align: center;
  padding: 3rem;
  background: var(--card-bg);
  border-radius: 20px;
  color: var(--text-secondary);
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}
.pagination button {
  padding: 0.4rem 1rem;
  border-radius: 30px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (max-width: 640px) {
  .admin-page { padding: 1rem; }
  .filter-bar { flex-direction: column; align-items: stretch; }
}
</style>
