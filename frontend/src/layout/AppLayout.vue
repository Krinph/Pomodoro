<script setup>
import { useTheme } from '../composables/useTheme.js'

const { mode, setMode } = useTheme()

// 三个可选模式。数组顺序决定了按钮顺序：浅色 / 深色 / 跟随系统
const THEME_OPTIONS = [
  { value: 'light', icon: '☀️', label: '浅色' },
  { value: 'dark', icon: '🌙', label: '深色' },
  { value: 'system', icon: '🖥️', label: '跟随系统' },
]
</script>

<template>
  <div class="app">
    <div class="titlebar"></div>
    <div class="body">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-icon">🍅</span>
          <span class="brand-name">番茄钟</span>
        </div>
        <nav class="nav">
          <router-link to="/pomodoro" class="nav-item">⏱️ 专注计时</router-link>
          <router-link to="/tasks" class="nav-item">📋 任务列表</router-link>
          <router-link to="/history" class="nav-item">📊 历史记录</router-link>
        </nav>

        <!-- 主题切换器：☀️ 浅色 / 🌙 深色 / 🖥️ 跟随系统 -->
        <div class="theme-switch" role="group" aria-label="主题模式">
          <button
            v-for="opt in THEME_OPTIONS"
            :key="opt.value"
            class="theme-btn"
            :class="{ active: mode === opt.value }"
            :title="opt.label"
            :aria-label="opt.label"
            :aria-pressed="mode === opt.value"
            @click="setMode(opt.value)"
          >
            {{ opt.icon }}
          </button>
        </div>

        <div class="sidebar-footer">保持专注 🍀</div>
      </aside>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .sidebar {
    width: 200px;
    background: var(--sidebar-bg);
    display: flex;
    flex-direction: column;
    color: var(--sidebar-text);
    flex-shrink: 0;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 22px 20px;
    font-size: 18px;
    font-weight: 700;
    border-bottom: 1px solid var(--sidebar-divider);
  }

  .brand-icon {
    font-size: 24px;
  }

  .nav {
    flex: 1;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    color: var(--sidebar-text-dim);
    text-decoration: none;
    font-size: 14px;
    border-radius: 8px;
    transition: all 0.2s;
    position: relative;
  }

  .nav-item:hover {
    background: var(--sidebar-hover);
    color: var(--sidebar-text);
  }

  /* 当前页面对应链接：左侧红色小竖条 + 淡红底色 */
  .nav-item.router-link-active {
    background: var(--nav-active-bg);
    color: var(--sidebar-text);
    font-weight: 600;
  }

  .nav-item.router-link-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 22px;
    background: var(--primary);
    border-radius: 4px;
  }

  /* ---------- 主题切换器 ---------- */
  .theme-switch {
    display: flex;
    gap: 4px;
    margin: 0 10px 10px;
    padding: 4px;
    background: var(--sidebar-hover);
    border-radius: 10px;
  }

  /* 注意：全局 button 样式在 style.css 里，这里靠 class 选择器把它盖掉 */
  .theme-btn {
    flex: 1;
    padding: 7px 0;
    font-size: 15px;
    line-height: 1;
    background: transparent;
    color: var(--sidebar-text-dim);
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }

  .theme-btn:hover {
    background: var(--sidebar-hover);
    color: var(--sidebar-text);
  }

  /* 当前生效的模式 */
  .theme-btn.active {
    background: var(--nav-active-bg);
    color: var(--sidebar-text);
  }

  .sidebar-footer {
    padding: 16px 20px;
    font-size: 12px;
    color: var(--sidebar-text-faint);
    border-top: 1px solid var(--sidebar-divider);
  }

  .content {
    flex: 1;
    padding: 28px 32px;
    overflow-y: auto;
  }

  .titlebar {
    height: 32.5px;
    flex-shrink: 0;
    background: var(--sidebar-bg);
    -webkit-app-region: drag;
  }

  /* 新增：承接原来 .app 的左右布局 */
  .body {
    display: flex;
    flex: 1;
    min-height: 0;
  }
</style>
