import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{ path: '/pomodoro', component: () => import('../views/PomodoroView.vue') },
	{ path: '/history', component: () => import('../views/HistoryView.vue') },
	{ path: '/tasks', component: () => import('../views/TasksView.vue') },
	{ path: '/', redirect: '/pomodoro' },
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router