/**
 * Electron 启动参数测试脚本
 * 用法：node electron/test-flags.cjs
 *
 * 目的：找出在你这台机器（Windows 11 Insider build 26200/26300 的已知 GPU 沙箱崩溃问题）上，
 *       哪组启动参数能让 Electron 正常存活（即窗口能打开）。
 *
 * 判断方式：启动 Electron 后等 4 秒——
 *   - 进程还活着  → OK（说明窗口已经打开）
 *   - 进程已退出  → FAIL（打印退出码，0x80000003 = -2147483645 / 2147483651 即崩溃）
 */
const { spawn } = require('child_process')
const path = require('path')

const exe = path.join(__dirname, '..', 'node_modules', 'electron', 'dist', 'electron.exe')
const appPath = path.join(__dirname, '..')

// 待测试的参数组合（从"最推荐"到"最激进"）
const combos = [
	[],
	['--disable-gpu-sandbox'],
	['--disable-gpu'],
	['--disable-gpu', '--disable-gpu-sandbox'],
	['--no-sandbox'],
	['--disable-gpu-sandbox', '--no-sandbox'],
	['--in-process-gpu'],
	['--disable-gpu-compositing'],
	['--disable-features=GpuProcessHighPriorityWin'],
]

// 环境变量：清掉可能干扰 Electron 的变量
const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_NO_ATTACH_CONSOLE

function test(flags) {
	return new Promise((resolve) => {
		let settled = false
		let stderr = ''

		const child = spawn(exe, [...flags, appPath], { env })

		child.stderr.on('data', (d) => { stderr += d.toString() })

		child.on('error', (err) => {
			if (!settled) { settled = true; resolve({ ok: false, code: 'spawn失败: ' + err.message }) }
		})

		child.on('exit', (code) => {
			if (!settled) { settled = true; resolve({ ok: false, code, stderr }) }
		})

		// 4 秒后仍存活 → 视为成功
		setTimeout(() => {
			if (!settled) {
				settled = true
				try { child.kill() } catch (e) { /* 忽略 */ }
				resolve({ ok: true })
			}
		}, 4000)
	})
}

;(async () => {
	console.log('开始测试 Electron 启动参数（每组最多等 4 秒）...\n')

	const working = []

	for (const flags of combos) {
		const label = flags.length ? flags.join(' ') : '(无参数)'
		const r = await test(flags)

		if (r.ok) {
			console.log(`OK    [${label}]  -> 启动成功，窗口应已出现（已自动关闭）`)
			working.push(label)
		} else {
			console.log(`FAIL  [${label}]  -> 启动即退出，退出码 ${r.code}`)
			if (r.stderr && r.stderr.trim()) {
				console.log(`       错误输出：${r.stderr.trim().split('\n')[0]}`)
			}
		}

		// 每组之间稍作间隔，避免进程互相干扰
		await new Promise((res) => setTimeout(res, 800))
	}

	console.log('\n===== 结果汇总 =====')
	if (working.length === 0) {
		console.log('全部失败：说明这些参数都不足以绕过该问题。')
		console.log('下一步建议：降级 Electron 版本（例如 electron@33）再试。')
	} else {
		console.log('以下参数组合可以让 Electron 正常启动：')
		working.forEach((w) => console.log('  - ' + w))
		console.log('\n推荐使用第一个可用的：' + working[0])
		console.log('在 PowerShell 里这样用：')
		console.log(`  $env:ELECTRON_EXTRA_ARGS='${working[0]}'`)
		console.log('  npm run dev:electron')
	}
})()
