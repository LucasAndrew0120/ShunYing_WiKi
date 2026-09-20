<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import contributorsData from '../../contributors.json'

interface Contributor {
  name: string
  github?: string
  avatar?: string
  commits: number
}

const { page } = useData()

const contributors = computed<Contributor[]>(() => {
  const path = page.value?.relativePath
  if (!path) return []
  const sourcePath = path === 'index.md' ? path : path.replace(/\/index\.md$/, '.md')
  const data = contributorsData as Record<string, Contributor[]>
  return data[path] || data[sourcePath] || []
})

const lastUpdated = computed(() => {
  const timestamp = page.value?.lastUpdated
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
})

function avatarUrl(contributor: Contributor) {
  if (contributor.avatar) return contributor.avatar
  if (contributor.github) return `https://github.com/${contributor.github}.png?size=40`
  return null
}

function initials(name: string) {
  const ascii = name.match(/[A-Za-z]+/g)
  if (ascii?.length) return ascii.map((part) => part[0].toUpperCase()).join('').slice(0, 2)
  return name.slice(0, 2).toUpperCase()
}

function hue(name: string) {
  let hash = 0
  for (let index = 0; index < name.length; index++) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}
</script>

<template>
  <div v-if="contributors.length" class="contributors">
    <h3 class="contributors-title">本文贡献者</h3>
    <div class="contributors-row">
      <div class="contributors-list">
        <a
          v-for="(contributor, index) in contributors"
          :key="contributor.github || `${contributor.name}-${index}`"
          class="contributor-item"
          :href="contributor.github ? `https://github.com/${contributor.github}` : undefined"
          :target="contributor.github ? '_blank' : undefined"
          :rel="contributor.github ? 'noopener noreferrer' : undefined"
          :title="contributor.name"
        >
          <img
            v-if="avatarUrl(contributor)"
            :src="avatarUrl(contributor) || undefined"
            :alt="contributor.name"
            class="contributor-avatar"
            loading="lazy"
          >
          <span
            v-else
            class="contributor-avatar contributor-avatar-text"
            :style="{ background: `hsl(${hue(contributor.name)}, 50%, 50%)` }"
          >{{ initials(contributor.name) }}</span>
          <span class="contributor-name">{{ contributor.name }}</span>
        </a>
      </div>
      <span v-if="lastUpdated" class="contributors-date">更新于：{{ lastUpdated }}</span>
    </div>
  </div>
</template>

<style scoped>
.contributors {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.contributors-title {
  margin: 0 0 10px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
}

.contributors-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.contributors-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.contributors-date {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
  font-size: 13px;
  white-space: nowrap;
}

.contributor-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 3px;
  border-radius: 20px;
  color: inherit;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: background 0.15s;
}

.contributor-item:hover {
  background: var(--vp-c-bg-mute);
}

.contributor-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.contributor-avatar-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.contributor-name {
  color: var(--vp-c-text-1);
  font-size: 13px;
}
</style>
