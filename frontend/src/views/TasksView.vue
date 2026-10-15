<script setup>
  import { ref, onMounted, computed } from "vue";

  const tasks = ref([]);
  const form = ref({ title: "", description: "", status: "confirmed", deadline: ""})
  const editId = ref(null);
  const baseurl = ref("/api/tasks")
  const STATUS = ref({'completed': '已完成', 'unfinished': '未完成'})

  function toBackendFormat(dt) {
    if (!dt) return null
    const [date, time] = dt.split('T')
    const t = time.length === 5 ? time + ':00' : time
    return `${date} ${t}`
  }

  function toFrontendFormat(dt) {
    if (!dt) return ''
    return dt.replace(' ', 'T').slice(0, 16)
  }

  async function handleSubmit() {
    const method = editId.value ? "PUT" : "POST";
    let deadline = toBackendFormat(form.value.deadline);
    const body = editId.value ? {id: editId.value, ...form.value, deadline: deadline} : {...form.value, deadline: deadline};
    fetch(baseurl.value, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
          if (data && data.code === 200) {
            alert("success")
            loadTasks()
            resetForm()
          }
        })
  }

  async function handleDelete(eid) {
    const url = baseurl.value + "/" + eid;
    fetch(url, {
      method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.code === 200) {
        alert("success")
        loadTasks()
      }
    })
  }

  function startEdit(task) {
    editId.value = task.id;
    form.value = { ...task, deadline: toFrontendFormat(task.deadline)}
  }

  function finish(task) {
    editId.value = task.id;
    form.value = { ...task, deadline: toFrontendFormat(task.deadline), status: "completed"}
    handleSubmit()
  }

  function resetForm() {
    form.value = { title: "", description: "", status: "unfinished", deadline: ""}
    editId.value = null
  }

  function loadTasks() {
    fetch(baseurl.value, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
        .then(res => res.json())
        .then(data => {
          if (data && data.code === 200) {
            tasks.value = data.data;
          }
        })
  }

  const isFormValid = computed(() =>
    form.value.title.trim() && form.value.description.trim()
  )

  onMounted(loadTasks);
</script>

<template>
  <div class="tasks-page">
    <h2 class="page-title">任务列表</h2>

    <div class="task-form">
      <input class="task-input" v-model="form.title" placeholder="任务标题">
      <input class="task-input" v-model="form.description" placeholder="任务描述">
      <input class="task-input" v-model="form.deadline" type="datetime-local">
      <button class="btn-primary" :disabled="!isFormValid" @click="handleSubmit">{{ editId ? '更新' : '新建' }}</button>
      <button v-if="editId" class="btn-ghost" @click="resetForm">取消</button>
    </div>

    <div class="task-list">
      <div class="task-item" v-for="task in tasks" :key="task.id">
        <div class="task-info">
          <div class="task-title-row">
            <span class="task-title">{{ task.title }}</span>
            <span class="task-status" :class="task.status === 'completed' ? 'status-done' : 'status-pending'">
              {{ STATUS[task.status] }}
            </span>
          </div>
          <div class="task-meta">
            <span v-if="task.description" class="task-desc">{{ task.description }}</span>
            <span v-if="task.deadline" class="task-deadline">📅 {{ task.deadline }}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-success btn-sm" v-if="task.status === 'unfinished'" @click="finish(task)">完成</button>
          <button class="btn-ghost btn-sm" @click="startEdit(task)">编辑</button>
          <button class="btn-danger btn-sm" @click="handleDelete(task.id)">删除</button>
        </div>
      </div>
      <div v-if="tasks.length === 0" class="empty-tip">还没有任务，先创建一个吧 🍅</div>
    </div>
  </div>
</template>

<style scoped>
  .task-form {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    background: var(--card);
    padding: 16px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    margin-bottom: 20px;
  }

  .task-input {
    flex: 1;
    min-width: 140px;
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--card);
    padding: 16px 18px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    transition: transform 0.15s ease;
  }

  .task-item:hover {
    transform: translateY(-2px);
  }

  .task-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .task-title {
    font-size: 15px;
    font-weight: 600;
  }

  .task-status {
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 600;
  }

  .status-done {
    background: var(--success-bg);
    color: var(--green);
  }

  .status-pending {
    background: var(--warn-bg);
    color: var(--warn-text);
  }

  .task-meta {
    display: flex;
    gap: 16px;
    margin-top: 6px;
    font-size: 13px;
    color: var(--text-light);
  }

  .task-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
</style>
