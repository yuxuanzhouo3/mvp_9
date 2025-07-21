import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import * as fs from 'fs'
import { FileManager } from './fileManager'
import { EncryptionEngine } from './encryption'
import { CompressionEngine } from './compression'
import { LicenseManager } from './license'

// 保持对窗口对象的全局引用
let mainWindow: BrowserWindow | null = null

// 初始化引擎
const fileManager = new FileManager()
const encryptionEngine = new EncryptionEngine()
const compressionEngine = new CompressionEngine()
const licenseManager = new LicenseManager()

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  })

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 窗口关闭时清理
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow()

  // 检查更新
  autoUpdater.checkForUpdatesAndNotify()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC 处理器
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '所有文件', extensions: ['*'] },
      { name: '文档', extensions: ['pdf', 'doc', 'docx', 'txt'] },
      { name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] },
      { name: '视频', extensions: ['mp4', 'avi', 'mov', 'mkv'] },
      { name: '音频', extensions: ['mp3', 'wav', 'flac', 'aac'] }
    ]
  })
  return result.filePaths
})

ipcMain.handle('select-save-path', async (event, defaultName: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultName,
    filters: [
      { name: '所有文件', extensions: ['*'] }
    ]
  })
  return result.filePath
})

ipcMain.handle('encrypt-file', async (event, filePath: string, key: string, algorithm: string) => {
  try {
    const result = await encryptionEngine.encryptFile(filePath, key, algorithm)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('decrypt-file', async (event, filePath: string, key: string, algorithm: string) => {
  try {
    const result = await encryptionEngine.decryptFile(filePath, key, algorithm)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('compress-file', async (event, filePath: string, algorithm: string, level: number) => {
  try {
    const result = await compressionEngine.compressFile(filePath, algorithm, level)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('decompress-file', async (event, filePath: string) => {
  try {
    const result = await compressionEngine.decompressFile(filePath)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('batch-process', async (event, files: string[], operation: string, options: any) => {
  try {
    const result = await fileManager.batchProcess(files, operation, options)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('check-license', async (event, licenseKey: string) => {
  try {
    const result = await licenseManager.validateLicense(licenseKey)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates()
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 进度更新
ipcMain.handle('update-progress', (event, progress: number, message: string) => {
  if (mainWindow) {
    mainWindow.webContents.send('progress-update', { progress, message })
  }
})

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  dialog.showErrorBox('错误', `发生未捕获的异常: ${error.message}`)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  dialog.showErrorBox('错误', `未处理的Promise拒绝: ${reason}`)
}) 