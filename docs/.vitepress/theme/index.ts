import DefaultTheme from 'vitepress/theme'
import { installWikiComponents } from 'vitepress-wiki-kit'
import Layout from './Layout.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    installWikiComponents(app)
  },
}
