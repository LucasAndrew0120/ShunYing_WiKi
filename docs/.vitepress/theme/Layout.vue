<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { ImageViewer } from 'vitepress-wiki-kit'
import TwikooComments from './components/TwikooComments.vue'
import Contributors from './components/Contributors.vue'

const route = useRoute()
const showComments = computed(() => route.path !== '/')
const commentPath = computed(() => {
  const routePath = route.path.replace(/\.html$/, '').replace(/\/$/, '')
  if (routePath === '/vip') return '/wiki/'
  return `/wiki${routePath || ''}/`
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-footer-before>
      <Contributors />
    </template>
    <template #doc-after>
      <TwikooComments
        v-if="showComments"
        :key="commentPath"
        env-id="https://twikoo.lris625.top/"
        :path="commentPath"
      />
    </template>
  </DefaultTheme.Layout>
  <ImageViewer />
</template>
