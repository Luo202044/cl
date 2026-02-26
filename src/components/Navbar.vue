<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const router = useRouter()
const { currentTheme, toggleTheme } = useTheme()

const navLinks = [
  { path: '/', name: '首页', icon: 'fa-home' },
  { path: '/about', name: '关于', icon: 'fa-info-circle' },
  { path: '/center', name: '资源中心', icon: 'fa-compass' },
  { path: '/terms', name: '服务协议', icon: 'fa-file-contract' }
]

const isActive = (path: string) => {
  return route.path === path
}

const isDark = computed(() => currentTheme.value === 'dark')

const showBackBtn = computed(() => {
  const subPages = ['/classin', '/weblinks']
  return subPages.includes(route.path)
})

const showMobileMenu = ref(false)
</script>

<template>
  <header class="navbar glass-panel">
    <div class="navbar-brand" @click="router.push('/')">
      <i class="fas fa-compass"></i>
      <h1>Cottie</h1>
    </div>
    
    <nav class="navbar-nav">
      <router-link 
        v-for="link in navLinks" 
        :key="link.path"
        :to="link.path"
        :class="['nav-link', { active: isActive(link.path) }]"
      >
        <i :class="['fas', link.icon]"></i>
        <span>{{ link.name }}</span>
      </router-link>
    </nav>
    
    <div class="navbar-actions">
      <router-link 
        v-show="showBackBtn" 
        to="/center" 
        class="back-btn"
      >
        <i class="fas fa-arrow-left"></i>
        <span>返回资源中心</span>
      </router-link>
      
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'">
        <i :class="['fas', isDark ? 'fa-sun' : 'fa-moon']"></i>
      </button>
    </div>
    
    <button class="mobile-menu-btn" @click="showMobileMenu = !showMobileMenu">
      <i :class="['fas', showMobileMenu ? 'fa-times' : 'fa-bars']"></i>
    </button>
    
    <Transition name="slide">
      <nav v-if="showMobileMenu" class="mobile-nav glass-panel">
        <router-link 
          v-if="showBackBtn"
          to="/center"
          class="mobile-nav-link back-link-mobile"
          @click="showMobileMenu = false"
        >
          <i class="fas fa-arrow-left"></i>
          <span>返回资源中心</span>
        </router-link>
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          :class="['mobile-nav-link', { active: isActive(link.path) }]"
          @click="showMobileMenu = false"
        >
          <i :class="['fas', link.icon]"></i>
          <span>{{ link.name }}</span>
        </router-link>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
}

:root[data-theme='dark'] .navbar {
  background: rgba(60, 50, 58, 0.92);
  border-bottom: 1px solid rgba(255, 102, 178, 0.15);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform var(--transition-fast);
  justify-self: start;
}

.navbar-brand:hover {
  transform: scale(1.02);
}

.navbar-brand i {
  font-size: 2rem;
  color: var(--primary);
}

.navbar-brand h1 {
  color: var(--text-main);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--border-radius-sm);
  color: var(--text-main);
  font-weight: 600;
  font-size: 1rem;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  background-color: var(--primary-light);
  color: var(--primary);
  transform: translateY(-2px);
}

.nav-link.active {
  background-color: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-end;
  justify-self: end;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--border-radius-sm);
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateX(-3px);
}

.back-btn i {
  transition: transform var(--transition-fast);
}

.back-btn:hover i {
  transform: translateX(-3px);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 1.2rem;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--primary);
  color: white;
  transform: rotate(15deg);
}

.mobile-menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  border-radius: var(--border-radius-sm);
  background: var(--primary-light);
  color: var(--primary);
  font-size: 1.2rem;
}

.mobile-nav {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  flex-direction: column;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

:root[data-theme='dark'] .mobile-nav {
  background: rgba(60, 50, 58, 0.95);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: var(--text-main);
  font-weight: 600;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background: var(--primary);
  color: white;
}

.back-link-mobile {
  background: var(--primary-light);
  color: var(--primary);
}

.back-link-mobile:hover {
  background: var(--primary);
  color: white;
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }
  
  .navbar-nav {
    display: none;
  }
  
  .navbar-actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .mobile-nav {
    display: flex;
  }
}
</style>
