import { ref, computed, watch } from 'vue'

/* ------------------------------------------------------------------
   主题状态管理（浅色 / 深色 / 跟随系统）

   ⚠️ STORAGE_KEY 这个字符串在 index.html 的内联脚本里也出现了一次
      （用来在页面渲染前就把主题定好，防止深色模式闪白）。
      如果你要改键名，两处必须一起改。
   ------------------------------------------------------------------ */
const STORAGE_KEY = 'tomatoclock-theme-mode'
const MODES = ['light', 'dark', 'system']

function readSavedMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return MODES.includes(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

/* ------------------------------------------------------------------
   下面这些变量写在"模块作用域"里（不在 useTheme 函数内部），
   所以整个应用只有一份 —— 这就是最简单的"全局状态"写法。

   如果把 ref 写进 useTheme() 里面，每个调用它的组件都会拿到自己的
   一份副本，切换主题时就会各说各话、互相不同步。
   ------------------------------------------------------------------ */

// 用户选择的模式：'light' | 'dark' | 'system'
const mode = ref(readSavedMode())

// 系统当前是不是深色（Windows 设置里那个"选择模式"）
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(mediaQuery.matches)

// 系统主题变了会触发这个事件 —— "跟随系统"能实时响应就靠它
mediaQuery.addEventListener('change', (event) => {
  systemDark.value = event.matches
})

// 最终到底用不用深色：'system' 要问系统，另外两种用户说了算
const isDark = computed(() => {
  if (mode.value === 'dark') return true
  if (mode.value === 'light') return false
  return systemDark.value
})

// isDark 一变，就同步写到 <html data-theme="...">，CSS 认的就是这个属性
watch(
  isDark,
  (dark) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  },
  { immediate: true } // 立即执行一次，保证首屏就是对的
)

// 用户一改模式就记下来，下次启动还认这个选择
watch(mode, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* localStorage 不可用时静默忽略，不影响使用 */
  }
})

function setMode(value) {
  if (MODES.includes(value)) {
    mode.value = value
  }
}

export function useTheme() {
  return { mode, isDark, setMode }
}
