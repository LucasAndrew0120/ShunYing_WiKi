# 瞬影 WiKi

基于 VitePress 构建的瞬影 Emby 文档站。

需要 Node.js `22.20.0` 或更高版本。

```bash
npm ci
npm run dev
```

生产构建输出到 `site/`：

```bash
npm run build
npm run preview
```

也可以使用 PowerShell 脚本依次完成构建和预览。脚本不会安装依赖，首次运行前仍需手动执行 `npm ci`：

```powershell
.\build.ps1
```

站点配置位于 `docs/.vitepress/config.ts`，文章位于 `docs/`。新增 Markdown 后会自动加入导航，标题优先读取 frontmatter `title`，未配置时读取文章的一级标题；使用 `order` 控制排序。

仓库内完整安装了 `packages/vitepress-wiki-kit`，包含自动导航、中文搜索、字数统计、图片题注、Gallery、AppCards、Flink/Flinks、ImageViewer、Twikoo 入口和 XLSX 渲染。
