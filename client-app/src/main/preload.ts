import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  saveFile: (defaultPath: string) => ipcRenderer.invoke('save-file', defaultPath),
  
  // 加密解密
  encryptFile: (filePath: string, password: string, options: any) => 
    ipcRenderer.invoke('encrypt-file', filePath, password, options),
  decryptFile: (filePath: string, password: string) => 
    ipcRenderer.invoke('decrypt-file', filePath, password),
  
  // 批量处理
  batchProcess: (files: string[], password: string, options: any) => 
    ipcRenderer.invoke('batch-process', files, password, options),
  
  // 设置
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  
  // 菜单事件监听
  onMenuSelectFiles: (callback: () => void) => 
    ipcRenderer.on('menu-select-files', callback),
  onMenuSelectFolder: (callback: () => void) => 
    ipcRenderer.on('menu-select-folder', callback),
  onMenuBatchProcess: (callback: () => void) => 
    ipcRenderer.on('menu-batch-process', callback),
  
  // 移除监听器
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
});

// 类型定义
declare global {
  interface Window {
    electronAPI: {
      selectFiles: () => Promise<string[]>;
      selectFolder: () => Promise<string>;
      saveFile: (defaultPath: string) => Promise<string>;
      encryptFile: (filePath: string, password: string, options: any) => Promise<any>;
      decryptFile: (filePath: string, password: string) => Promise<any>;
      batchProcess: (files: string[], password: string, options: any) => Promise<any[]>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<boolean>;
      onMenuSelectFiles: (callback: () => void) => void;
      onMenuSelectFolder: (callback: () => void) => void;
      onMenuBatchProcess: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
} 