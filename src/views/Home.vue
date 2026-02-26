<script setup lang="ts">
import { useRouter } from 'vue-router'
import AnnouncementCard from '../components/AnnouncementCard.vue'
import { config } from '../config'

const router = useRouter()

const announcements = [
  {
    title: '广告位招租',
    icon: 'fa-bullhorn',
    content: ['添加收录网站链接(仅合法网站)，宣传你的群 (仅cl)', `发邮件到邮箱 ${config.contact.email}`]
  },
  {
    title: '功能更新',
    icon: 'fa-code',
    content: ['网站已重构为Vue3单页应用', '新增主题切换功能', '优化音乐播放器体验']
  },
  {
    title: '使用提示',
    icon: 'fa-lightbulb',
    content: ['点击右侧箭头展开音乐播放器', '使用空格键播放/暂停音乐', 'Ctrl+左右箭头切换歌曲']
  }
]

function goToCenter() {
  router.push('/center')
}
</script>

<template>
  <main class="home-page">
    <section class="hero-section anim-entry">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到 Cottie</h1>
        <p class="hero-subtitle">面向ClassIn用户的公共导航平台</p>
        <div class="hero-actions">
          <button class="btn btn-primary hero-btn" @click="goToCenter">
            <i class="fas fa-compass"></i>
            进入资源中心
          </button>
        </div>
      </div>
    </section>
    
    <section class="section container">
      <h2 class="section-title anim-entry anim-2">
        <i class="fas fa-bullhorn"></i>
        公告
      </h2>
      
      <div class="announcements-grid">
        <AnnouncementCard 
          v-for="(item, index) in announcements"
          :key="index"
          :title="item.title"
          :icon="item.icon"
          :class="['anim-entry', `anim-${index + 3}`]"
        >
          <p v-for="(line, i) in item.content" :key="i">{{ line }}</p>
        </AnnouncementCard>
      </div>
      
      <AnnouncementCard 
        title="友链" 
        icon="fa-link" 
        :is-highlight="true"
        class="anim-entry anim-6"
      >
        <p>本站计算服务由雨云提供</p>
        <a :href="config.links.rainyun" target="_blank" rel="noopener noreferrer" class="friend-link">
          访问雨云 <i class="fas fa-external-link-alt"></i>
        </a>
      </AnnouncementCard>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  min-height: calc(100vh - 200px);
}

.hero-section {
  background: var(--gradient-primary);
  padding: 4rem 2rem 5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-top: -1px;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  color: white;
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.hero-subtitle {
  color: rgba(255,255,255,0.95);
  font-size: 1.25rem;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 16px 32px;
  font-size: 1.1rem;
  border-radius: 50px;
  background: white;
  color: var(--primary);
  border: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.hero-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
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

.announcements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.friend-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: var(--primary);
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 1rem;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.friend-link:hover {
  background: var(--secondary);
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 1.5rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .section {
    padding: 2rem 1rem;
  }
  
  .announcements-grid {
    grid-template-columns: 1fr;
  }
}
</style>
