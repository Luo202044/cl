<script setup lang="ts">
import { ref, computed } from 'vue'
import groupsData from '../data/groups.json'

interface GroupLink {
  name: string
  id: string
  description: string
  link: string
  category: number
}

interface Category {
  id: number
  name: string
  icon: string
}

const categories: Category[] = groupsData.categories
const groups: GroupLink[] = groupsData.groups

const activeCategory = ref<number | null>(null)

const filteredGroups = computed(() => {
  if (activeCategory.value === null) {
    return groups
  }
  return groups.filter(g => g.category === activeCategory.value)
})

function openGroup(link: string) {
  window.open(link, '_blank', 'noopener,noreferrer')
}

function selectCategory(id: number | null) {
  activeCategory.value = activeCategory.value === id ? null : id
}
</script>

<template>
  <main class="classin-page">
    <section class="hero-section anim-entry">
      <h1 class="hero-title">ClassIn 群聊</h1>
      <p class="hero-subtitle">ClassIn群组导航列表</p>
    </section>
    
    <section class="section container">
      <h2 class="section-title anim-entry anim-2">
        <i class="fas fa-layer-group"></i>
        选择组别
      </h2>
      
      <div class="categories-grid anim-entry anim-3">
        <div 
          v-for="cat in categories" 
          :key="cat.id"
          :class="['category-btn', { active: activeCategory === cat.id }]"
          @click="selectCategory(cat.id)"
        >
          <i :class="['fas', cat.icon]"></i>
          <span>{{ cat.name }}</span>
        </div>
        <div 
          :class="['category-btn', { active: activeCategory === null }]"
          @click="selectCategory(null)"
        >
          <i class="fas fa-th-large"></i>
          <span>全部</span>
        </div>
      </div>
      
      <h2 class="section-title anim-entry anim-4">
        <i class="fas fa-users"></i>
        群聊列表
        <span v-if="activeCategory" class="filter-hint">- {{ categories.find(c => c.id === activeCategory)?.name }}</span>
      </h2>
      
      <div class="groups-grid">
        <div 
          v-for="(group, index) in filteredGroups" 
          :key="group.id"
          :class="['group-card', 'anim-entry', `anim-${(index % 3) + 5}`]"
          @click="openGroup(group.link)"
        >
          <div class="group-header">
            <div class="group-icon">
              <i class="fas fa-users"></i>
            </div>
            <span class="group-id">群号: {{ group.id }}</span>
          </div>
          <h3 class="group-name">{{ group.name }}</h3>
          <p class="group-desc">{{ group.description }}</p>
          <span class="group-link">
            加入群聊 <i class="fas fa-arrow-right"></i>
          </span>
        </div>
      </div>
      
      <div class="notice-card anim-entry anim-8">
        <h3><i class="fas fa-info-circle"></i> 加入须知</h3>
        <ul>
          <li>遵守群规，尊重群内其他成员</li>
          <li>如遇到问题，可联系群管理员</li>
        </ul>
      </div>
    </section>
  </main>
</template>

<style scoped>
.classin-page {
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
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid var(--secondary);
}

.section-title i {
  color: var(--primary);
}

.filter-hint {
  color: var(--primary);
  font-size: 1rem;
  font-weight: 600;
}

.categories-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: var(--border-radius-sm);
  color: var(--text-main);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.category-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.group-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  border: 1px solid var(--card-border);
  border-left: 4px solid var(--primary);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.group-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px var(--primary-glow);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.group-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-sm);
  color: white;
  font-size: 1rem;
}

.group-id {
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 600;
}

.group-name {
  color: var(--text-sub);
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.group-desc {
  color: var(--text-main);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  opacity: 0.85;
}

.group-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--gradient-green);
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all var(--transition-fast);
}

.group-card:hover .group-link {
  gap: 12px;
}

.notice-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  border: 1px solid var(--card-border);
  margin-bottom: 2rem;
}

.notice-card h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-sub);
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.notice-card h3 i {
  color: var(--primary);
}

.notice-card ul {
  margin-left: 1.5rem;
  color: var(--text-main);
}

.notice-card li {
  margin-bottom: 0.5rem;
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
    justify-content: center;
  }
  
  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>
