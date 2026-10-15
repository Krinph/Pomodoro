<script setup>
  import { ref, onMounted } from "vue";

  const historyList = ref([])
  const url = "/api/history"
  const selectedHistory = ref(null)
  const showModal = ref(false)
  const hour = ref(0)
  const minute = ref(0)
  const second = ref(0)

  function loadHistory() {
    fetch (url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
        .then(res => res.json())
        .then(data => {
          if (data && data.code === 200) {
            historyList.value = data.data;
          }
        })
  }

  async function deleteHistory(id) {
    if (!confirm('确定删除这条记录吗？')) return
    const url2 = url + "/" + id;
    fetch(url2, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    })
        .then(res => res.json())
        .then(data => {
          if (data && data.code === 200) {
            alert("success")
            loadHistory();
          }
        })
  }

  function showInfo(history) {
    selectedHistory.value = history
    showTime(selectedHistory.value.workTime)
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
  }

  function showTime(time) {
    hour.value = Math.floor(time / 3600)
    minute.value = Math.floor((time % 3600) / 60)
    second.value = time % 3600 % 60
  }

  // 把秒数格式化成 "x小时x分钟x秒"（给列表展示用）
  function formatWorkTime(sec) {
    if (!sec) return '0秒'
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const parts = []
    if (h) parts.push(h + '小时')
    if (m) parts.push(m + '分钟')
    if (s || parts.length === 0) parts.push(s + '秒')
    return parts.join('')
  }

  onMounted(loadHistory);

</script>

<template>
  <div class="history-page">
    <h2 class="page-title">历史记录</h2>

    <div class="history-list">
      <div class="history-item" v-for="history in historyList" :key="history.id">
        <div class="history-info">
          <div class="history-time">🕐 {{ history.startTime }}</div>
          <div class="history-meta">
            <span class="meta-tag">🍅 {{ history.pomodoroCount }} 个番茄</span>
            <span class="meta-tag">⏱ {{ formatWorkTime(history.workTime) }}</span>
            <span class="meta-tag">⏸ {{ history.pauseTimes }} 次暂停</span>
          </div>
        </div>
        <div class="history-actions">
          <button class="btn-ghost btn-sm" @click="showInfo(history)">查看详情</button>
          <button class="btn-danger btn-sm" @click="deleteHistory(history.id)">删除</button>
        </div>
      </div>
      <div v-if="historyList.length === 0" class="empty-tip">还没有记录，完成一次专注吧 🍅</div>
    </div>

    <!-- 历史记录详情弹窗 -->
    <div v-if="showModal && selectedHistory" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>📊 历史记录详情</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-item">
            <span class="label">开始时间</span>
            <span>{{ selectedHistory.startTime }}</span>
          </div>
          <div class="modal-item">
            <span class="label">结束时间</span>
            <span>{{ selectedHistory.endTime }}</span>
          </div>
          <div class="modal-item">
            <span class="label">专注时长</span>
            <span>
              <span v-if="hour !== 0">{{ hour }}小时</span>
              <span v-if="minute !== 0">{{ minute }}分钟</span>
              <span v-if="second !== 0">{{ second }}秒</span>
            </span>
          </div>
          <div class="modal-item">
            <span class="label">暂停次数</span>
            <span>{{ selectedHistory.pauseTimes }} 次</span>
          </div>
          <div class="modal-item">
            <span class="label">完成番茄数</span>
            <span>{{ selectedHistory.pomodoroCount }} 个</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--card);
    padding: 16px 18px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    transition: transform 0.15s ease;
  }

  .history-item:hover {
    transform: translateY(-2px);
  }

  .history-time {
    font-size: 15px;
    font-weight: 600;
  }

  .history-meta {
    display: flex;
    gap: 14px;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  .meta-tag {
    font-size: 13px;
    color: var(--text-light);
  }

  .history-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ---------- 弹窗 ---------- */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(3px);
  }

  .modal {
    background: var(--card);
    border-radius: 16px;
    width: 360px;
    max-width: 90vw;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    animation: modalIn 0.2s ease;
  }

  @keyframes modalIn {
    from { transform: scale(0.95); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    line-height: 1;
    color: var(--text-light);
    cursor: pointer;
    padding: 0 4px;
  }

  .modal-close:hover {
    color: var(--text);
  }

  .modal-body {
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .modal-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .modal-item .label {
    color: var(--text-light);
  }

  .modal-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--border);
    text-align: right;
  }
</style>
