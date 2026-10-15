const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		title: '番茄钟',
		// 后面可以加：图标、菜单栏隐藏等
		autoHideMenuBar: true,
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: '#1e293b',
			symbolColor: '#ffffff',
			height: 32.5,
		},
	})

	// 开发时：加载 Vite 开发服务器；生产时：加载打包后的 index.html
	const isDev = !app.isPackaged
	if (isDev) {
		win.loadURL('http://localhost:5173')   // 你的 vite dev 地址
	} else {
		win.loadFile(path.join(__dirname, '../dist/index.html'))
	}
}

app.whenReady().then(createWindow)