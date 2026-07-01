import { ref, watch } from 'vue'
import type { ThemeColor, ThemeMode } from '../config/theme'

const STORAGE_KEY = 'cottie-theme-config'

interface ThemeConfig {
  color: ThemeColor
  mode: ThemeMode
}

function loadConfig(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (isValidColor(parsed.color) && isValidMode(parsed.mode)) {
        return parsed as ThemeConfig
      }
    }
  } catch { /* invalid json, fall through */ }
  return { color: 'pink', mode: detectSystemMode() }
}

function detectSystemMode(): ThemeMode {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function isValidColor(v: unknown): v is ThemeColor {
  return typeof v === 'string' && ['pink', 'amber', 'mint'].includes(v)
}

function isValidMode(v: unknown): v is ThemeMode {
  return v === 'light' || v === 'dark'
}

const config = ref<ThemeConfig>(loadConfig())

function applyTheme() {
  document.documentElement.setAttribute('data-color', config.value.color)
  document.documentElement.setAttribute('data-mode', config.value.mode)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
}

export function useTheme() {
  const setThemeColor = (color: ThemeColor) => {
    config.value.color = color
    applyTheme()
  }

  const setThemeMode = (mode: ThemeMode) => {
    config.value.mode = mode
    applyTheme()
  }

  const toggleMode = () => {
    config.value.mode = config.value.mode === 'light' ? 'dark' : 'light'
    applyTheme()
  }

  watch(config, applyTheme, { immediate: true, deep: true })

  return {
    config,
    setThemeColor,
    setThemeMode,
    toggleMode,
    isDark: () => config.value.mode === 'dark',
  }
}

/** Sync with system color scheme changes when user hasn't explicitly set a mode */
const systemModeMedia = window.matchMedia('(prefers-color-scheme: dark)')
systemModeMedia.addEventListener('change', (e) => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    config.value.mode = e.matches ? 'dark' : 'light'
  }
})
