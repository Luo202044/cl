<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

interface Category {
  title: string
  icon: string
  description: string
  path: string
  color: string
  disabled?: boolean
}

const categories: Category[] = [
  {
    title: 'ClassIn',
    icon: 'fa-mobile-alt',
    description: 'ClassIn群聊链接导航',
    path: '/classin',
    color: '#FF66B2'
  },
  {
    title: '网页跳转',
    icon: 'fa-laptop-code',
    description: '本站收录网站的跳转服务',
    path: '/weblinks',
    color: '#4CAF50'
  },
  {
    title: '待添加',
    icon: 'fa-gamepad',
    description: '敬请期待',
    path: '#',
    color: '#9E9E9E',
    disabled: true
  },
  {
    title: '待添加',
    icon: 'fa-film',
    description: '敬请期待',
    path: '#',
    color: '#9E9E9E',
    disabled: true
  }
]

function goToCategory(cat: Category) {
  if (cat.disabled) return
  router.push(cat.path)
}
</script>

<template>
  <main class="center-page">
    <section class="hero-section anim-entry">
      <h1 class="hero-title">资源分类中心</h1>
      <p class="hero-subtitle">选择分类查看详细内容</p>
    </section>
    
    <section class="section container">
      <div class="categories-grid">
        <div 
          v-for="(cat, index) in categories" 
          :key="cat.title"
          :class="['category-card', 'anim-entry', `anim-${index + 2}`, { disabled: cat.disabled }]"
          :style="{ '--card-color': cat.color }"
          @click="goToCategory(cat)"
        >
          <div class="category-icon">
            <i :class="['fas', cat.icon]"></i>
          </div>
          <h3 class="category-title">{{ cat.title }}</h3>
          <p class="category-desc">{{ cat.description }}</p>
          <span v-if="!cat.disabled" class="category-link">
            查看详情 <i class="fas fa-arrow-right"></i>
          </span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.center-page {
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--card-border);
  border-top: 4px solid var(--card-color);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.category-card:hover:not(.disabled) {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px var(--primary-glow);
}

.category-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  margin: 0 auto 1.25rem;
  background: linear-gradient(135deg, var(--card-color), var(--card-color));
  border-radius: var(--border-radius-sm);
  color: #ffffff;
  font-size: 1.75rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.category-title {
  color: var(--text-sub);
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.category-desc {
  color: var(--text-main);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.category-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--card-color);
  font-weight: 600;
  transition: all var(--transition-fast);
}

.category-card:hover:not(.disabled) .category-link {
  gap: 12px;
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
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
