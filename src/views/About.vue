<script setup lang="ts">
interface Developer {
  name: string
  role: string
  avatar?: string
  description: string
  link?: string
}

const developers: Developer[] = [
  {
    name: '洛鸢',
    role: '站长',
    avatar: '/images/user1.jpg',
    description: 'Cottie网站创始人，负责网站运营和维护'
  },
  {
    name: 'DeepSeek',
    role: '网页开发',
    avatar: '/images/user2.jpg',
    description: 'AI辅助开发，chat.deepseek.com'
  },
  {
    name: '待添加',
    role: '待定',
    description: '期待您的加入'
  },
  {
    name: '待添加',
    role: '待定',
    description: '期待您的加入'
  }
]
</script>

<template>
  <main class="about-page">
    <section class="hero-section anim-entry">
      <h1 class="hero-title">关于我们</h1>
      <p class="hero-subtitle">开发者介绍</p>
    </section>
    
    <section class="section container">
      <h2 class="section-title anim-entry anim-2">
        <i class="fas fa-users"></i>
        开发团队
      </h2>
      
      <div class="developers-grid">
        <div v-for="(dev, index) in developers" :key="index" :class="['developer-card', 'anim-entry', `anim-${index + 3}`]">
          <div class="developer-avatar" v-if="dev.avatar">
            <img :src="dev.avatar" :alt="dev.name" />
          </div>
          <div class="developer-avatar placeholder" v-else>
            <i class="fas fa-user-plus"></i>
          </div>
          <h3 class="developer-name">{{ dev.name }}</h3>
          <span class="developer-role">{{ dev.role }}</span>
          <p class="developer-desc">{{ dev.description }}</p>
          <a v-if="dev.link" :href="dev.link" target="_blank" rel="noopener" class="developer-link">
            查看详情 <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>
    
    <section class="section container">
      <h2 class="section-title anim-entry anim-7">
        <i class="fas fa-info-circle"></i>
        项目信息
      </h2>
      
      <div class="info-card anim-entry anim-8">
        <h3>关于 Cottie</h3>
        <p>Cottie是一个面向ClassIn用户的公共导航平台，主要提供ClassIn群聊链接的分类导航服务。</p>
        <p>同时集成了音乐播放器、网页跳转等功能，为用户提供便捷的访问体验。</p>
        
        <div class="info-stats">
          <div class="stat-item">
            <i class="fas fa-calendar-alt"></i>
            <span>2025-2026</span>
            <small>运营时间</small>
          </div>
          <div class="stat-item">
            <i class="fas fa-code-branch"></i>
            <span>Vue3</span>
            <small>技术栈</small>
          </div>
          <div class="stat-item">
            <i class="fas fa-heart"></i>
            <span>四季亭</span>
            <small>版权所有</small>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about-page {
  min-height: calc(100vh - 200px);
}

.hero-section {
  background: var(--gradient-primary);
  padding: 4rem 2rem;
  text-align: center;
}

.hero-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  color: rgba(255,255,255,0.9);
  font-size: 1.1rem;
}

.section {
  padding: 3rem 2rem;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-sub);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid var(--secondary);
}

.section-title i {
  color: var(--primary);
}

.developers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.developer-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 2rem 1.5rem;
  text-align: center;
  border: 1px solid var(--card-border);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-normal);
}

.developer-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px var(--primary-glow);
}

.developer-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1rem;
  border: 4px solid var(--secondary);
  box-shadow: 0 4px 10px var(--primary-glow);
}

.developer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.developer-avatar.placeholder {
  background: var(--gradient-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
}

.developer-name {
  color: var(--text-sub);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.developer-role {
  display: inline-block;
  color: white;
  background: var(--gradient-primary);
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.developer-desc {
  color: var(--text-main);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.developer-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  font-weight: 600;
  padding: 8px 16px;
  border-radius: var(--border-radius-sm);
  border: 2px solid var(--secondary);
  transition: all var(--transition-fast);
}

.developer-link:hover {
  background: var(--secondary);
  color: white;
}

.info-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 2rem;
  border: 1px solid var(--card-border);
  box-shadow: var(--glass-shadow);
}

.info-card h3 {
  color: var(--text-sub);
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.info-card p {
  color: var(--text-main);
  margin-bottom: 0.75rem;
  line-height: 1.7;
}

.info-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--card-border);
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-item i {
  font-size: 1.5rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.stat-item span {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-sub);
}

.stat-item small {
  color: var(--text-main);
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 1.5rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .section {
    padding: 2rem 1rem;
  }
  
  .developers-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
  
  .developer-avatar {
    width: 75px;
    height: 75px;
  }
}
</style>
