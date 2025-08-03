const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  // 建立瀏覽器視窗
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/temple-icon.png'),
    title: '廣清宮快速記帳軟體',
    show: false
  })

  // 載入應用程式
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  // 視窗準備好後顯示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 設定選單
  createMenu()
}

function createMenu() {
  const template = [
    {
      label: '檔案',
      submenu: [
        {
          label: '新增收入',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-income')
          }
        },
        {
          label: '新增支出',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-expense')
          }
        },
        { type: 'separator' },
        {
          label: '匯出報表',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-action', 'export-report')
          }
        },
        { type: 'separator' },
        {
          label: '離開',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '檢視',
      submenu: [
        {
          label: '重新載入',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload()
          }
        },
        {
          label: '開發者工具',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools()
          }
        },
        { type: 'separator' },
        {
          label: '實際大小',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0)
          }
        },
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel()
            mainWindow.webContents.setZoomLevel(currentZoom + 1)
          }
        },
        {
          label: '縮小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel()
            mainWindow.webContents.setZoomLevel(currentZoom - 1)
          }
        }
      ]
    },
    {
      label: '幫助',
      submenu: [
        {
          label: '關於廣清宮記帳軟體',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '關於',
              message: '廣清宮快速記帳軟體',
              detail: '版本 1.0.0\n專為宮廟設計的記帳管理系統\n\n© 2024 廣清宮開發團隊'
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 當所有視窗都關閉時退出應用程式
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC 處理程序
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Excel 檔案', extensions: ['xlsx'] },
      { name: 'PDF 檔案', extensions: ['pdf'] },
      { name: '所有檔案', extensions: ['*'] }
    ]
  })
  return result
})

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel 檔案', extensions: ['xlsx', 'xls'] },
      { name: 'CSV 檔案', extensions: ['csv'] },
      { name: '所有檔案', extensions: ['*'] }
    ]
  })
  return result
})