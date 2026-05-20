<template>
  <div class="admin-page">
    <!-- 登录界面 -->
    <div v-if="!isAuthenticated" class="login-card">
      <div class="login-card-inner">
        <h2>管理员登录</h2>
        <form @submit.prevent="login">
          <input
            type="password"
            v-model="password"
            placeholder="管理 Token"
            :disabled="isLoggingIn"
            required
          />
          <button type="submit" :disabled="isLoggingIn">
            {{ isLoggingIn ? '登录中...' : '登录' }}
          </button>
          <p class="hint">请输入 Worker 配置的 suppost_tokens</p>
        </form>
      </div>
    </div>

    <!-- 管理后台主界面 -->
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
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索标题/内容"
              @input="searchFeedbacks"
            />
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
        <button @click="loadFeedbacks(currentPage - 1)" :disabled="currentPage === 1">
          上一页
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="loadFeedbacks(currentPage + 1)" :disabled="currentPage === totalPages">
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const API_BASE = 'https://api.xn--bgtt50a8xt.top'

interface FeedbackItem {
  id: number
  user_id: string
  title: string
  main: string
  type?: string
  user_ua?: string
  time: number
}

// ========== 状态定义 ==========
const isAuthenticated = ref(false)
const isLoggingIn = ref(false)        // 登录加载状态
const token = ref('')
const password = ref('')
const allFeedbacks = ref<FeedbackItem[]>([])
const filterType = ref<'all' | 'suggestion' | 'bug' | 'other'>('all')
const pageSize = ref(20)
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const searchKeyword = ref('')

// ========== 工具函数 ==========
const getTypeEmoji = (type?: string) => {
  const map: Record<string, string> = { suggestion: '✨', bug: '🐛', other: '💬' }
  return map[type || 'other'] || '💬'
}

const formatDateTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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

// ========== 核心修改：带返回值的 loadFeedbacks ==========
const loadFeedbacks = async (page = 1): Promise<boolean> => {
  if (!token.value) return false

  try {
    const url = `${API_BASE}/api/suppost/list/get?token=${token.value}&page=${page}&limit=${pageSize.value}`
    const res = await fetch(url)
    const result = await res.json()

    if (result.code === 200 && result.data) {
      allFeedbacks.value = result.data.list || []
      currentPage.value = result.data.pagination.page
      totalPages.value = result.data.pagination.total_pages
      totalItems.value = result.data.pagination.total
      return true  // ✅ 成功时返回 true
    } else if (result.code === 502) {
      alert('Token 无效或数据库连接失败')
      return false // ❌ 失败返回 false，不再直接修改 isAuthenticated
    } else {
      alert(result.message || '加载失败')
      return false
    }
  } catch (error) {
    console.error(error)
    alert('网络错误')
    return false
  }
}

// ========== 登录逻辑（关键修复） ==========
const login = async () => {
  if (!password.value.trim()) return alert('请输入 Token')

  isLoggingIn.value = true
  token.value = password.value.trim()

  // 调用 loadFeedbacks，根据返回值决定是否认证通过
  const success = await loadFeedbacks(1)

  if (success) {
    // 登录成功才设置认证状态
    isAuthenticated.value = true
    sessionStorage.setItem('feedback_admin_token', token.value)
    sessionStorage.setItem('feedback_admin_auth', 'true')
  } else {
    // 登录失败，清除所有状态，停留在登录界面
    isAuthenticated.value = false
    token.value = ''
    password.value = ''
    sessionStorage.removeItem('feedback_admin_token')
    sessionStorage.removeItem('feedback_admin_auth')
  }

  isLoggingIn.value = false
}

// ========== 退出登录 ==========
const logout = () => {
  isAuthenticated.value = false
  token.value = ''
  password.value = ''
  sessionStorage.removeItem('feedback_admin_token')
  sessionStorage.removeItem('feedback_admin_auth')
}

// ========== 删除反馈 ==========
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

// ========== 辅助操作 ==========
const refreshData = () => loadFeedbacks(currentPage.value)
const searchFeedbacks = () => loadFeedbacks(1)

// ========== 初始化（自动登录校验） ==========
onMounted(async () => {
  const savedToken = sessionStorage.getItem('feedback_admin_token')
  if (savedToken) {
    token.value = savedToken
    const success = await loadFeedbacks(1)
    if (success) {
      isAuthenticated.value = true
    } else {
      // 自动登录失败，清除过期 token
      token.value = ''
      isAuthenticated.value = false
      sessionStorage.removeItem('feedback_admin_token')
      sessionStorage.removeItem('feedback_admin_auth')
    }
  }
})
</script>

<!-- 样式保持不变，此处省略（与原代码相同） -->
