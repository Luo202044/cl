<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { themeColors, colorLabels, type ThemeColor } from '../config/theme'

const route = useRoute()
const router = useRouter()
const { config, toggleMode } = useTheme()

const navLinks = [
  { path: '/', name: '首页', icon: 'fa-home' },
  { path: '/about', name: '关于', icon: 'fa-info-circle' },
  { path: '/center', name: '资源中心', icon: 'fa-compass' },
  { path: '/terms', name: '服务协议', icon: 'fa-file-contract' },
  { path: '/feedback', name: '意见反馈', icon: 'fa-file-contract'},
  { path: '/admin/feedback', name: '反馈后台', icon: 'fa-file-contract'},
]

const isActive = (path: string) => {
  return route.path === path
}

const showBackBtn = () => {
  const subPages = ['/classin', '/weblinks']
  return subPages.includes(route.path)
}

const showMobileMenu = ref(false)
const showThemePanel = ref(false)

function selectColor(color: ThemeColor) {
  config.value.color = color
  showThemePanel.value = false
}
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
        v-if="showBackBtn()"
        to="/center"
        class="back-btn"
      >
        <i class="fas fa-arrow-left"></i>
        <span>返回资源中心</span>
      </router-link>

      <div class="theme-controls">
        <button
          class="theme-toggle"
          @click="toggleMode"
          :title="config.mode === 'dark' ? '切换到亮色模式' : '切换到暗色模式'"
        >
          <i :class="['fas', config.mode === 'dark' ? 'fa-sun' : 'fa-moon']"></i>
        </button>

        <div class="color-picker-wrapper">
          <button
            class="color-picker-trigger"
            @click="showThemePanel = !showThemePanel"
            title="切换颜色主题"
          >
            <i class="fas fa-palette"></i>
          </button>

          <Transition name="fade">
            <div v-if="showThemePanel" class="color-panel glass-panel">
              <p class="color-panel-title">主题颜色</p>
              <div class="color-options">
                <button
                  v-for="color in themeColors"
                  :key="color"
                  :class="['color-swatch', color, { active: config.color === color }]"
                  @click="selectColor(color)"
                  :title="colorLabels[color]"
                >
                  <i v-if="config.color === color" class="fas fa-check"></i>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <button class="mobile-menu-btn" @click="showMobileMenu = !showMobileMenu">
      <i :class="['fas', showMobileMenu ? 'fa-times' : 'fa-bars']"></i>
    </button>

    <Transition name="slide">
      <nav v-if="showMobileMenu" class="mobile-nav glass-panel">
        <router-link
          v-if="showBackBtn()"
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

        <!-- 移动端颜色主题选择 -->
        <div class="mobile-theme-section">
          <p class="mobile-theme-label">主题颜色</p>
          <div class="mobile-color-options">
            <button
              v-for="color in themeColors"
              :key="color"
              :class="['color-swatch', color, { active: config.color === color }]"
              @click="config.color = color"
              :title="colorLabels[color]"
            ></button>
          </div>
        </div>

        <!-- 移动端暗色模式切换 -->
        <button
          class="mobile-nav-link theme-toggle-mobile"
          @click="toggleMode"
          :title="config.mode === 'dark' ? '切换到亮色模式' : '切换到暗色模式'"
          style="width: 100%; margin-top: 0.5em;"
        >
          <i :class="['fas', config.mode === 'dark' ? 'fa-sun' : 'fa-moon']"></i>
          <span>{{ config.mode === 'dark' ? '切换到亮色' : '切换到暗色' }}</span>
        </button>
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
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
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

/* ========== 主题控制区域 ========== */
.theme-controls {
  display: flex;
  align-items: center;
  gap: 6px;
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

.color-picker-wrapper {
  position: relative;
}

.color-picker-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 1.1rem;
  transition: all var(--transition-fast);
}

.color-picker-trigger:hover {
  background: var(--primary);
  color: white;
}

.color-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  padding: 12px;
  min-width: 180px;
  z-index: 200;
}

.color-panel-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-sub);
  margin-bottom: 8px;
  text-align: center;
}

.color-options {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: white;
  transition: all var(--transition-fast);
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch.active {
  border-color: white;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.color-swatch.indigo {
  background: #91CFD5;
}

.color-swatch.brown {
  background: #D8C7B5;
}

.color-swatch.camellia {
  background: #E72D48;
}

/* ========== 移动端 ========== */

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
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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

.theme-toggle-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: var(--border-radius-sm);
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
  font-size: 1rem;
  transition: all var(--transition-fast);
  padding: 12px 0;
  border: none;
}

.theme-toggle-mobile:hover {
  background: var(--primary);
  color: white;
}

.mobile-theme-section {
  padding: 12px 0;
  border-top: 1px solid var(--glass-border);
  margin-top: 8px;
}

.mobile-theme-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-sub);
  margin-bottom: 10px;
  text-align: center;
}

.mobile-color-options {
  display: flex;
  gap: 12px;
  justify-content: center;
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
