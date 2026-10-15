<script setup>
import { computed, ref, onUnmounted } from 'vue';

  const MODES = {
    WORK:         { label: '专注', second: 25 * 60 },
    SHORT_BREAK:  { label: '短休息', second: 5 * 60 },
    LONG_BREAK:   { label: '长休息', second: 15 * 60 }
  }

  const mode = ref('WORK')
  const status = ref('IDLE')
  const remaining = ref(MODES.WORK.second)
  const pauseCount = ref(0)

  const formatted = computed(() => {
    const m = String(Math.floor(remaining.value / 60)).padStart(2, '0')
    const s = String(remaining.value % 60).padStart(2, '0')
    return `${m}:${s}`
  })

  const changeButton = ref(false)
  function tick() {
    const left = Math.round((endAt - Date.now()) / 1000 )
    remaining.value = Math.max(0, left)
    if (left <= 0) {
      clearInterval(timerId)
      status.value = "FINISHED"
      changeButton.value = true
    }
  }

  let count = 0
  let workTime = 0
  function changeMode() {
    if (mode.value === 'WORK' && count % 4 === 3) {
      workTime += MODES[mode.value].second
      mode.value = 'LONG_BREAK'
      changeButton.value = false
      start();
      return
    }
    switch (mode.value) {
      case 'WORK': workTime += MODES[mode.value].second; mode.value = 'SHORT_BREAK'; break;
      case 'SHORT_BREAK': mode.value = 'WORK'; count ++; break;
      case 'LONG_BREAK': mode.value = 'WORK'; count ++; break;
    }
    changeButton.value = false
    start()
  }

  let endAt, startAt
  let timerId
  function start() {
    if (status.value === 'RUNNING') { return }
    if (status.value === 'IDLE') {
      startAt = Date.now()
      remaining.value = MODES[mode.value].second
      pauseCount.value = 0
    } else if (status.value === 'FINISHED') {
      remaining.value = MODES[mode.value].second
    }
    endAt = Date.now() + remaining.value * 1000
    status.value = 'RUNNING'
    clearInterval(timerId)
    timerId = setInterval(tick, 250)
  }

  function reset() {
    clearInterval(timerId)
    mode.value = 'WORK'
    status.value = 'IDLE'
    remaining.value = MODES.WORK.second
    count = 0
    workTime = 0
    pauseCount.value = 0
    startAt = Date.now()
    changeButton.value = false
  }

  function pause() {
    clearInterval(timerId)
    timerId = null
    status.value = 'PAUSE'
    pauseCount.value ++
  }

  function finished() {
    clearInterval(timerId)
    status.value = 'FINISHED'
    timerId = null
    if (mode.value === 'WORK') {
      workTime += (MODES[mode.value].second - remaining.value)
    }
    if (mode.value !== 'WORK') {
      count ++
    }
    const record = {
      startTime: formatTime(new Date(startAt)),
      endTime: formatTime(new Date()),
      pauseTimes: pauseCount.value,
      workTime: workTime,
      pomodoroCount: count
    }

    fetch ('/api/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record)
    })
        .then(res => res.json())
        .then(data => {
          if (data && data.code === 200) {
            alert("success")
          }
        })
    console.log(record)
    reset()
  }

  function formatTime(ts) {
    const d = new Date(ts)
    const p = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} `
        + `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  }

  /* ===== 下面是纯展示用的计算属性（不影响计时逻辑）===== */

  // 圆环进度：0% ~ 100%
  const progress = computed(() => {
    const total = MODES[mode.value].second
    if (!total) return 0
    return Math.min(100, Math.max(0, Math.round((1 - remaining.value / total) * 100)))
  })

  // 圆环颜色：专注红 / 短休息绿 / 长休息蓝
  const RING_COLORS = { WORK: '#e74c3c', SHORT_BREAK: '#27ae60', LONG_BREAK: '#2980b9' }
  const ringColor = computed(() => RING_COLORS[mode.value])

  // 模式对应的 class（控制标题颜色）
  const modeClass = computed(() => 'mode-' + mode.value.toLowerCase())

  // 状态文字
  const STATUS_TEXT = { IDLE: '准备开始', RUNNING: '专注中', PAUSE: '已暂停', FINISHED: '已完成' }
  const statusText = computed(() => STATUS_TEXT[status.value] || '')

  onUnmounted(() => {
    clearInterval(timerId)
  })
</script>

<template>
  <div class="pomodoro">
    <div class="mode-label" :class="modeClass">{{ MODES[mode].label }}</div>

    <!-- 圆环计时器：--progress 和 --ring-color 由上面的计算属性提供 -->
    <div class="timer-ring" :style="{ '--progress': progress + '%', '--ring-color': ringColor }">
      <div class="timer-inner">
        <span class="time-display">{{ formatted }}</span>
        <span class="timer-status">{{ statusText }}</span>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn-primary btn-lg" v-if="status !== 'RUNNING' && changeButton === false" @click="start">▶ 开始</button>
      <button class="btn-success btn-lg" v-if="changeButton" @click="changeMode">切换模式</button>
      <button class="btn-ghost btn-lg" v-if="status === 'RUNNING' && changeButton === false" @click="pause">⏸ 暂停</button>
      <button class="btn-danger btn-lg" v-if="status !== 'IDLE'" @click="finished">■ 结束</button>
      <button class="btn-ghost btn-lg" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
  .pomodoro {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 36px;
  }

  .mode-label {
    font-size: 22px;
    font-weight: 600;
  }
  .mode-work { color: var(--primary); }
  .mode-short { color: var(--green); }
  .mode-long { color: var(--blue); }

  /* 圆环（外圈彩色渐变） */
  .timer-ring {
    --progress: 0%;
    --ring-color: var(--primary);
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: conic-gradient(var(--ring-color) var(--progress), var(--ring-track) 0);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-ring);
  }

  /* 圆环内圈（白色，形成"环"的厚度） */
  .timer-inner {
    width: 226px;
    height: 226px;
    border-radius: 50%;
    background: var(--card);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .time-display {
    font-size: 62px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 2px;
    color: var(--text);
  }

  .timer-status {
    font-size: 14px;
    color: var(--text-light);
  }

  .btn-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-lg {
    padding: 12px 26px;
    font-size: 15px;
    border-radius: 12px;
  }
</style>