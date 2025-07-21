import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { 
  FileUp, 
  Lock, 
  Unlock, 
  FolderOpen, 
  Settings, 
  Download, 
  Upload,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface FileItem {
  path: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  autoUpdate: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
  encryptionAlgorithm: 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';
}

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    language: 'zh',
    autoUpdate: true,
    compressionLevel: 'medium',
    encryptionAlgorithm: 'aes-256-gcm'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<'encrypt' | 'decrypt' | null>(null);

  useEffect(() => {
    // 加载设置
    loadSettings();
    
    // 监听菜单事件
    window.electronAPI.onMenuSelectFiles(() => handleSelectFiles());
    window.electronAPI.onMenuSelectFolder(() => handleSelectFolder());
    window.electronAPI.onMenuBatchProcess(() => handleBatchProcess());
    
    return () => {
      window.electronAPI.removeAllListeners('menu-select-files');
      window.electronAPI.removeAllListeners('menu-select-folder');
      window.electronAPI.removeAllListeners('menu-batch-process');
    };
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await window.electronAPI.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await window.electronAPI.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleSelectFiles = async () => {
    try {
      const filePaths = await window.electronAPI.selectFiles();
      const newFiles: FileItem[] = filePaths.map(path => ({
        path,
        name: path.split('/').pop() || path.split('\\').pop() || path,
        size: 0, // 实际应用中需要获取文件大小
        status: 'pending',
        progress: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Failed to select files:', error);
    }
  };

  const handleSelectFolder = async () => {
    try {
      const folderPath = await window.electronAPI.selectFolder();
      if (folderPath) {
        // 这里需要递归获取文件夹中的所有文件
        console.log('Selected folder:', folderPath);
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  };

  const handleEncrypt = async () => {
    if (!password.trim()) {
      alert('请输入密码');
      return;
    }

    if (files.length === 0) {
      alert('请选择要加密的文件');
      return;
    }

    setIsProcessing(true);
    setCurrentOperation('encrypt');

    const options = {
      algorithm: settings.encryptionAlgorithm,
      compressionLevel: settings.compressionLevel
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 更新文件状态为处理中
      setFiles(prev => prev.map((f, index) => 
        index === i ? { ...f, status: 'processing', progress: 0 } : f
      ));

      try {
        const result = await window.electronAPI.encryptFile(file.path, password, options);
        
        if (result.success) {
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, status: 'completed', progress: 100 } : f
          ));
        } else {
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, status: 'error', error: result.error } : f
          ));
        }
      } catch (error) {
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'error', error: '处理失败' } : f
        ));
      }
    }

    setIsProcessing(false);
    setCurrentOperation(null);
  };

  const handleDecrypt = async () => {
    if (!password.trim()) {
      alert('请输入密码');
      return;
    }

    if (files.length === 0) {
      alert('请选择要解密的文件');
      return;
    }

    setIsProcessing(true);
    setCurrentOperation('decrypt');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      setFiles(prev => prev.map((f, index) => 
        index === i ? { ...f, status: 'processing', progress: 0 } : f
      ));

      try {
        const result = await window.electronAPI.decryptFile(file.path, password);
        
        if (result.success) {
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, status: 'completed', progress: 100 } : f
          ));
        } else {
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, status: 'error', error: result.error } : f
          ));
        }
      } catch (error) {
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'error', error: '解密失败' } : f
        ));
      }
    }

    setIsProcessing(false);
    setCurrentOperation(null);
  };

  const handleBatchProcess = async () => {
    if (!password.trim()) {
      alert('请输入密码');
      return;
    }

    if (files.length === 0) {
      alert('请选择要处理的文件');
      return;
    }

    setIsProcessing(true);

    const options = {
      algorithm: settings.encryptionAlgorithm,
      compressionLevel: settings.compressionLevel
    };

    try {
      const results = await window.electronAPI.batchProcess(
        files.map(f => f.path), 
        password, 
        options
      );

      setFiles(prev => prev.map((file, index) => ({
        ...file,
        status: results[index]?.success ? 'completed' : 'error',
        progress: results[index]?.success ? 100 : 0,
        error: results[index]?.error
      })));
    } catch (error) {
      console.error('Batch process failed:', error);
    }

    setIsProcessing(false);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Zap className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">SecureFiles 客户端</h1>
              <p className="text-muted-foreground">安全、高效的文件加密处理工具</p>
            </div>
          </div>
          <Badge variant="outline">v1.0.0</Badge>
        </div>

        <Tabs defaultValue="encrypt" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="encrypt" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              文件加密
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              文件解密
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              设置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encrypt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  选择文件
                </CardTitle>
                <CardDescription>
                  选择要加密的文件或文件夹，支持批量处理
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleSelectFiles} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    选择文件
                  </Button>
                  <Button onClick={handleSelectFolder} variant="outline" className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    选择文件夹
                  </Button>
                  <Button onClick={clearFiles} variant="outline">
                    清空列表
                  </Button>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>已选择的文件 ({files.length})</Label>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(file.status)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.status === 'processing' && (
                              <Progress value={file.progress} className="w-20" />
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(index)}
                              disabled={file.status === 'processing'}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>加密设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">加密密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入加密密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleEncrypt} 
                    disabled={isProcessing || files.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    开始加密
                  </Button>
                  <Button 
                    onClick={handleBatchProcess} 
                    disabled={isProcessing || files.length === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    批量处理
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decrypt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  选择加密文件
                </CardTitle>
                <CardDescription>
                  选择要解密的 .sfx 文件
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleSelectFiles} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    选择文件
                  </Button>
                  <Button onClick={clearFiles} variant="outline">
                    清空列表
                  </Button>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>已选择的文件 ({files.length})</Label>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(file.status)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.status === 'processing' && (
                              <Progress value={file.progress} className="w-20" />
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(index)}
                              disabled={file.status === 'processing'}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>解密设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="decrypt-password">解密密码</Label>
                  <Input
                    id="decrypt-password"
                    type="password"
                    placeholder="请输入解密密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleDecrypt} 
                  disabled={isProcessing || files.length === 0}
                  className="flex items-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  开始解密
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>应用设置</CardTitle>
                <CardDescription>
                  配置应用的行为和外观
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>主题</Label>
                    <select 
                      value={settings.theme}
                      onChange={(e) => saveSettings({...settings, theme: e.target.value as any})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="light">浅色</option>
                      <option value="dark">深色</option>
                      <option value="system">跟随系统</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>语言</Label>
                    <select 
                      value={settings.language}
                      onChange={(e) => saveSettings({...settings, language: e.target.value as any})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="zh">中文</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>压缩级别</Label>
                    <select 
                      value={settings.compressionLevel}
                      onChange={(e) => saveSettings({...settings, compressionLevel: e.target.value as any})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>加密算法</Label>
                    <select 
                      value={settings.encryptionAlgorithm}
                      onChange={(e) => saveSettings({...settings, encryptionAlgorithm: e.target.value as any})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="aes-256-gcm">AES-256-GCM</option>
                      <option value="aes-256-cbc">AES-256-CBC</option>
                      <option value="chacha20-poly1305">ChaCha20-Poly1305</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoUpdate"
                    checked={settings.autoUpdate}
                    onChange={(e) => saveSettings({...settings, autoUpdate: e.target.checked})}
                  />
                  <Label htmlFor="autoUpdate">自动检查更新</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              正在{currentOperation === 'encrypt' ? '加密' : '解密'}文件，请稍候...
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default App; 