/**
 * 开发启动脚本：一条命令同时拉起 Vite 和 Electron
 * 用法：npm run dev:electron
 *
 * 为什么不用 "vite & electron ."？
 *  - Windows 的 & 是"顺序执行"，vite 常驻不退出，electron 永远轮不到
 *  - npx 在部分机器上解析有问题（无输出），所以这里直接用 node_modules 里的本地可执行文件
 */
const { spawn } = require('child_process')
const path = require('path')
const http = require('http')

const VITE_PORT = 5173

// node_modules/.bin 里的可执行文件（Windows 下是 .cmd）
const binDir = path.join(__dirname, '..', 'node_modules', '.bin')
const viteBin = path.join(binDir, 'vite.cmd')
const electronBin = path.join(binDir, 'electron.cmd')

// 1. 启动 Vite
console.log('[dev] 启动 Vite...')
const vite = spawn(viteBin, [], { stdio: 'inherit', shell: true })

// 2. 轮询等待 Vite 就绪（最多等 15 秒）
function waitForVite(retries) {
	if (retries <= 0) {
		console.error('[dev] Vite 启动超时，请检查端口是否被占用')
		vite.kill()
		process.exit(1)
	}

	const req = http.get(`http://localhost:${VITE_PORT}`, (res) => {
		res.resume() // 读完响应，释放连接
		launchElectron()
	})
	req.on('error', () => {
		setTimeout(() => waitForVite(retries - 1), 300)
	})
}

// 3. Vite 就绪后，启动 Electron
function launchElectron() {
	console.log('[dev] Vite 已就绪，启动 Electron...')

	// 关键修复：彻底删除 ELECTRON_RUN_AS_NODE
	// 某些编辑器/工具的集成终端会设置这个变量，它会让 Electron 以"纯 Node 模式"运行，
	// 表现为：不报错、也不显示窗口。这里必须用 delete（真正移除），不能只设为空字符串。
	const env = { ...process.env }
	delete env.ELECTRON_RUN_AS_NODE
	delete env.ELECTRON_NO_ATTACH_CONSOLE

	if (process.env.ELECTRON_RUN_AS_NODE) {
		console.log('[dev] 注意：检测到 ELECTRON_RUN_AS_NODE，已为 Electron 清除（否则窗口不会显示）')
	}

	const startedAt = Date.now()

	// Windows 11 Insider build 26200/26300 的已知问题：
	// Electron 的 GPU 沙箱进程启动即崩溃（STATUS_BREAKPOINT / 0x80000003），表现为"不报错、无窗口、秒退"。
	// 参考：https://github.com/desktop/desktop/issues/22306
	// 如需换其他参数测试，可设环境变量覆盖，例如：
	//   $env:ELECTRON_EXTRA_ARGS='--no-sandbox'; npm run dev:electron
	const extraArgs = (process.env.ELECTRON_EXTRA_ARGS ?? '--disable-gpu-sandbox').split(' ').filter(Boolean)
	console.log(`[dev] Electron 启动参数：${extraArgs.join(' ') || '(无)'}`)

	const electron = spawn(electronBin, [...extraArgs, '.'], { stdio: 'inherit', shell: true, env })

	electron.on('error', (err) => {
		console.error('[dev] Electron 启动失败：', err.message)
	})

	// Electron 退出时，把 Vite 一起关掉
	electron.on('exit', (code) => {
		const lived = Date.now() - startedAt

		if (lived < 3000) {
			console.error(`[dev] Electron 启动后仅 ${lived}ms 就退出了（退出码 ${code}），窗口没有正常打开。`)
			console.error('[dev] 常见原因：终端里有 ELECTRON_RUN_AS_NODE 残留、或 Electron 启动崩溃。')
			console.error('[dev] 请把终端里的完整输出发出来以便定位。')
		} else {
			console.log(`[dev] Electron 已退出（退出码 ${code}）`)
		}

		vite.kill()
		process.exit(code ?? 0)
	})
}

waitForVite(50)
