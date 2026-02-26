<script setup lang="ts">
interface Props {
  title: string
  icon?: string
  isHighlight?: boolean
}

defineProps<Props>()
</script>

<template>
  <div :class="['announcement-card', 'anim-entry', { highlight: isHighlight }]">
    <h3 class="announcement-title">
      <i v-if="icon" :class="['fas', icon]"></i>
      {{ title }}
    </h3>
    <div class="announcement-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.announcement-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 24px;
  border: 1px solid var(--card-border);
  border-left: 5px solid var(--primary);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-normal);
}

.announcement-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px var(--primary-glow);
}

.announcement-card.highlight {
  background: var(--gradient-primary);
  border-left-color: var(--secondary);
  text-align: center;
}

.announcement-card.highlight .announcement-title,
.announcement-card.highlight .announcement-content {
  color: white;
}

.announcement-card.highlight .announcement-content p {
  color: rgba(255, 255, 255, 0.9);
}

.announcement-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-sub);
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.announcement-card.highlight .announcement-title {
  color: white;
}

.announcement-content {
  color: var(--text-main);
}

.announcement-content p {
  margin-bottom: 0.5rem;
}

.announcement-content p:last-child {
  margin-bottom: 0;
}
</style>
