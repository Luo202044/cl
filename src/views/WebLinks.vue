<script setup lang="ts">
import webLinksData from '../data/weblinks.json'

interface WebLink {
  name: string
  description: string
  url: string
  icon?: string
  color?: string
}

const webLinks: WebLink[] = webLinksData

function openLink(url: string) {
  if (url === '#') return
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <main class="weblinks-page">
    <section class="hero-section anim-entry">
      <h1 class="hero-title">网页跳转</h1>
      <p class="hero-subtitle">本站收录的网站链接</p>
    </section>
    
    <section class="section container">
      <div class="links-grid">
        <div 
          v-for="(link, index) in webLinks" 
          :key="index"
          :class="['link-card', 'anim-entry', `anim-${index + 2}`, { disabled: link.url === '#' }]"
          :style="{ '--card-color': link.color || 'var(--primary)' }"
          @click="openLink(link.url)"
        >
          <div class="link-icon">
            <i :class="['fas', link.icon || 'fa-globe']"></i>
          </div>
          <h3 class="link-name">{{ link.name }}</h3>
          <p class="link-desc">{{ link.description }}</p>
          <span v-if="link.url !== '#'" class="link-action">
            访问网站 <i class="fas fa-external-link-alt"></i>
          </span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.weblinks-page {
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

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.link-card {
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

.link-card:hover:not(.disabled) {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px var(--primary-glow);
}

.link-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, var(--card-color), var(--card-color));
  border-radius: var(--border-radius-sm);
  color: #ffffff;
  font-size: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.link-name {
  color: var(--text-sub);
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.link-desc {
  color: var(--text-main);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.link-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--card-color);
  font-weight: 600;
  font-size: 0.9rem;
}

.link-card:hover:not(.disabled) .link-action {
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
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
