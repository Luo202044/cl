<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  hoverable: true
})
</script>

<template>
  <div :class="['card-base', 'anim-entry', { hoverable }]">
    <div v-if="icon || $slots.icon" class="card-icon">
      <slot name="icon">
        <i :class="['fas', icon]"></i>
      </slot>
    </div>
    <h3 v-if="title" class="card-title">{{ title }}</h3>
    <slot></slot>
  </div>
</template>

<style scoped>
.card-base {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 24px;
  border: 1px solid var(--card-border);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-normal);
}

.card-base.hoverable:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px var(--primary-glow);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-sm);
  color: white;
  font-size: 1.5rem;
}

.card-title {
  color: var(--text-sub);
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
</style>
