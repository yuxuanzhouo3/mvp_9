import { app, BrowserWindow, ipcMain, dialog, Menu, shell, nativeTheme } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as archiver from 'archiver';
import * as unzipper from 'unzipper';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';

// 配置存储
const store = new Store();

// 主窗口引用
let mainWindow: BrowserWindow | null = null;

// 应用配置
const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    show: false,
    frame: !isMac
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 外部链接处理
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 创建菜单
function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: '文件',
      submenu: [
        {
          label: '选择文件加密',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu-select-files');
          }
        },
        {
          label: '选择文件夹加密',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            mainWindow?.webContents.send('menu-select-folder');
          }
        },
        { type: 'separator' },
        {
          label: '批量处理',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow?.webContents.send('menu-batch-process');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 SecureFiles',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: '关于 SecureFiles',
              message: 'SecureFiles 客户端 v1.0.0',
              detail: '安全、高效的文件加密处理工具\n\n支持三大平台：Windows、macOS、Linux\n\n© 2024 SecureFiles Team'
            });
          }
        },
        {
          label: '检查更新',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          }
        },
        { type: 'separator' },
        {
          label: '访问官网',
          click: () => {
            shell.openExternal('https://securefiles.app');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC 处理器
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '所有文件', extensions: ['*'] },
      { name: '文档', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'] },
      { name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'] },
      { name: '视频', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv'] },
      { name: '音频', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg'] }
    ]
  });
  return result.filePaths;
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('save-file', async (event, defaultPath: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath,
    filters: [
      { name: '加密文件', extensions: ['sfx'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  });
  return result.filePath;
});

ipcMain.handle('encrypt-file', async (event, filePath: string, password: string, options: any) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const encrypted = await encryptBuffer(fileBuffer, password, options);
    
    const outputPath = filePath + '.sfx';
    fs.writeFileSync(outputPath, encrypted);
    
    return {
      success: true,
      outputPath,
      originalSize: fileBuffer.length,
      encryptedSize: encrypted.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('decrypt-file', async (event, filePath: string, password: string) => {
  try {
    const encryptedBuffer = fs.readFileSync(filePath);
    const decrypted = await decryptBuffer(encryptedBuffer, password);
    
    const outputPath = filePath.replace('.sfx', '_decrypted');
    fs.writeFileSync(outputPath, decrypted);
    
    return {
      success: true,
      outputPath,
      size: decrypted.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('batch-process', async (event, files: string[], password: string, options: any) => {
  const results = [];
  
  for (const filePath of files) {
    try {
      const result = await ipcMain.handle('encrypt-file', null, filePath, password, options);
      results.push({
        file: path.basename(filePath),
        ...result
      });
    } catch (error) {
      results.push({
        file: path.basename(filePath),
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
});

ipcMain.handle('get-settings', () => {
  return store.get('settings', {
    theme: 'system',
    language: 'zh',
    autoUpdate: true,
    compressionLevel: 'medium',
    encryptionAlgorithm: 'aes-256-gcm'
  });
});

ipcMain.handle('save-settings', (event, settings: any) => {
  store.set('settings', settings);
  return true;
});

// 加密函数
async function encryptBuffer(buffer: Buffer, password: string, options: any): Promise<Buffer> {
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const cipher = crypto.createCipher('aes-256-gcm', key);
  cipher.setAAD(Buffer.from('SecureFiles', 'utf8'));
  
  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // 组合：salt + iv + authTag + encrypted
  return Buffer.concat([salt, iv, authTag, encrypted]);
}

// 解密函数
async function decryptBuffer(encryptedBuffer: Buffer, password: string): Promise<Buffer> {
  const salt = encryptedBuffer.slice(0, 32);
  const iv = encryptedBuffer.slice(32, 48);
  const authTag = encryptedBuffer.slice(48, 64);
  const encrypted = encryptedBuffer.slice(64);
  
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  decipher.setAAD(Buffer.from('SecureFiles', 'utf8'));
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  return decrypted;
}

// 应用事件
app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  // 自动更新配置
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  
  // 更新事件
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: '发现更新',
      message: '有新版本可用，是否下载？',
      buttons: ['是', '否'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });
  
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: '更新就绪',
      message: '更新已下载完成，重启应用以安装更新',
      buttons: ['现在重启', '稍后重启'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 安全设置
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
}); 