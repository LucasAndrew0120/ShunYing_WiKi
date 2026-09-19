<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  envId: string
  path: string
  lang?: string
}>(), {
  lang: 'zh-CN',
})

const container = ref<HTMLElement | null>(null)
const loadFailed = ref(false)

onMounted(async () => {
  await nextTick()
  try {
    const twikoo = await import('twikoo')
    await twikoo.init({
      envId: props.envId,
      el: container.value,
      path: props.path,
      lang: props.lang,
    })
  } catch (error) {
    loadFailed.value = true
    console.error('Failed to initialize Twikoo:', error)
  }
})
</script>

<template>
  <section class="wiki-comments" aria-labelledby="wiki-comments-title">
    <h2 id="wiki-comments-title">评论</h2>
    <div ref="container" />
    <p v-if="loadFailed" class="wiki-comments-error">评论加载失败，请稍后重试。</p>
  </section>
</template>

<style scoped>
.wiki-comments {
  margin-top: 56px;
  padding-top: 28px;
  border-top: 1px solid var(--vp-c-divider);
}

.wiki-comments h2 {
  margin: 0 0 24px;
  border: 0;
  padding: 0;
  font-size: 24px;
  line-height: 32px;
}

.wiki-comments-error {
  color: var(--vp-c-danger-1);
  font-size: 14px;
}
</style>
