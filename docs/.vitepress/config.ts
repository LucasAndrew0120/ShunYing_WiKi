import { readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type DefaultTheme } from 'vitepress'
import { createContentTree, createContentTreeWatcher, createSiteStats, sidebarItemToNav, tokenizeChineseSearch } from 'vitepress-wiki-kit/config'
import { installWikiMarkdown } from 'vitepress-wiki-kit/markdown'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const docsRoot = resolve(currentDirectory, '..')
const base = process.env.SITE_BASE || '/'
const siteStats = createSiteStats(docsRoot)
const formattedWordCount = siteStats.wordCount >= 1000
  ? `${(siteStats.wordCount / 1000).toFixed(1)}K`
  : String(siteStats.wordCount)

function directoryRoutes(root: string, directory = root): Record<string, string> {
  const routes: Record<string, string> = {}
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.vitepress' || entry.name === 'public') continue
    const file = join(directory, entry.name)
    if (entry.isDirectory()) {
      Object.assign(routes, directoryRoutes(root, file))
      continue
    }
    if (!entry.name.endsWith('.md')) continue
    const source = relative(root, file).replace(/\\/g, '/')
    if (source === 'index.md' || source.endsWith('/index.md')) continue
    routes[source] = `${source.slice(0, -3)}/index.md`
  }
  return routes
}

function directoryLink(item: DefaultTheme.SidebarItem): DefaultTheme.SidebarItem {
  const link = item.link === '/index'
    ? '/'
    : item.link?.endsWith('/index') ? item.link.slice(0, -5) : item.link ? `${item.link}/` : undefined
  return {
    ...item,
    ...(link ? { link } : {}),
    ...(item.items ? { items: item.items.map(directoryLink) } : {}),
  }
}

const buildPages = () => createContentTree({ root: docsRoot, routeBase: '/' }).map(directoryLink)
const pages = buildPages()

export default defineConfig({
  lang: 'zh-CN',
  title: '瞬影 Emby',
  description: '瞬影 Emby 服务说明、使用指南与常见问题',
  cleanUrls: true,
  lastUpdated: true,
  base,
  rewrites: directoryRoutes(docsRoot),
  outDir: resolve(currentDirectory, '../../site'),
  vite: {
    plugins: [createContentTreeWatcher(docsRoot, buildPages)],
  },
  markdown: {
    config: (md) => installWikiMarkdown(md, { xlsx: { docsRoot } }),
  },
  head: [
    ['script', {
      defer: '',
      src: 'https://umami.lris625.top/script.js',
      'data-website-id': '40d7b394-2b99-48dc-b6b6-66c43dd0c4fa',
    }],
  ],
  themeConfig: {
    siteTitle: '瞬影 WiKi',
    nav: pages.map(sidebarItemToNav),
    sidebar: pages,
    outline: { level: [2, 3], label: '本页目录' },
    sidebarMenuLabel: '文档目录',
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换浅色模式',
    darkModeSwitchTitle: '切换深色模式',
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdatedText: '最后更新于',
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize: tokenizeChineseSearch,
            processTerm: (term) => term.toLowerCase(),
          },
        },
        async _render(source, env, md) {
          if ((env as any).frontmatter?.search === false) return ''
          return md.render(source, env).replace(/<span class="wk-word-count">.*?<\/span>/g, '')
        },
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '清空搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '回车键',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '上方向键',
              navigateDownKeyAriaLabel: '下方向键',
              closeText: '关闭',
              closeKeyAriaLabel: 'Esc 键',
            },
          },
        },
      },
    },
    footer: {
      message: `瞬影 Emby · 全站 ${siteStats.articleCount} 篇 · 共 ${formattedWordCount} 字`,
      copyright: '文档内容仅供瞬影用户参考',
    },
  },
})
