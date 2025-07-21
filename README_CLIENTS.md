# SecureFiles 客户端应用

## 📱 三大主流平台 + 移动端客户端

SecureFiles 提供完整的跨平台客户端解决方案，支持 Windows、macOS、Linux 桌面端以及 iOS、Android 移动端。

## 🖥️ 桌面端客户端

### 支持平台
- **Windows** (Windows 10/11)
- **macOS** (macOS 10.15+)
- **Linux** (Ubuntu 18.04+, CentOS 7+)

### 核心功能
- 🔐 **军用级加密**: AES-256-GCM 加密算法
- 📁 **批量处理**: 支持多文件同时加密/解密
- 🎯 **系统集成**: 原生菜单、文件拖拽、系统托盘
- 🔄 **自动更新**: 版本检查、自动下载、静默安装
- 🎨 **现代界面**: 基于 React + TypeScript 的现代化 UI

### 安装方式

#### Windows
1. 下载 `.exe` 安装包
2. 双击运行安装程序
3. 按照向导完成安装
4. 从开始菜单启动应用

#### macOS
1. 下载 `.dmg` 镜像文件
2. 双击挂载镜像
3. 拖拽应用到 Applications 文件夹
4. 从启动台启动应用

#### Linux
1. 下载 `.AppImage` 文件
2. 添加执行权限: `chmod +x SecureFiles-*.AppImage`
3. 双击运行或命令行执行

### 使用指南

#### 文件加密
1. 点击"选择文件"或"选择文件夹"
2. 输入加密密码
3. 选择加密算法和压缩级别
4. 点击"开始加密"
5. 等待处理完成

#### 文件解密
1. 选择要解密的 `.sfx` 文件
2. 输入解密密码
3. 点击"开始解密"
4. 查看解密结果

#### 批量处理
1. 选择多个文件或文件夹
2. 设置统一的加密参数
3. 点击"批量处理"
4. 监控处理进度

## 📱 移动端客户端

### 支持平台
- **iOS** (iOS 13.0+)
- **Android** (Android 6.0+)

### 核心功能
- 🔐 **安全加密**: 移动端优化的加密算法
- 📱 **生物识别**: Face ID、Touch ID、指纹识别
- ☁️ **云端同步**: 支持 iCloud、Google Drive
- 🔔 **智能通知**: 处理进度、完成提醒
- 🌙 **暗色模式**: 自动跟随系统设置

### 安装方式

#### iOS
1. 在 App Store 搜索"SecureFiles"
2. 点击"获取"下载安装
3. 首次启动时授权生物识别
4. 开始使用应用

#### Android
1. 在 Google Play 搜索"SecureFiles"
2. 点击"安装"下载应用
3. 授予必要权限
4. 配置生物识别解锁

### 使用指南

#### 快速加密
1. 打开应用首页
2. 点击"文件加密"按钮
3. 选择要加密的文件
4. 输入密码或使用生物识别
5. 等待加密完成

#### 文件管理
1. 在"最近文件"中查看历史记录
2. 点击文件查看详细信息
3. 支持分享、重命名、删除操作
4. 云端同步自动备份

#### 安全设置
1. 进入"设置"页面
2. 配置生物识别解锁
3. 设置应用锁定时间
4. 管理云端同步选项

## 🔧 开发指南

### 环境要求
- **Node.js** 18.0+
- **npm** 8.0+
- **Git** 2.0+

### 桌面端开发
```bash
# 克隆项目
git clone https://github.com/securefiles/client.git
cd client

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建应用
npm run build

# 打包分发
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

### 移动端开发
```bash
# 克隆项目
git clone https://github.com/securefiles/mobile.git
cd mobile

# 安装依赖
npm install

# iOS开发
npm run ios

# Android开发
npm run android

# 构建发布
npm run build:ios     # iOS
npm run build:android # Android
```

### 使用构建脚本
```bash
# 构建所有平台
./build-clients.sh -a all

# 构建特定平台
./build-clients.sh -d win        # Windows桌面端
./build-clients.sh -m ios        # iOS移动端

# 清理构建文件
./build-clients.sh -c
```

## 🔐 安全特性

### 加密标准
- **算法**: AES-256-GCM
- **密钥派生**: PBKDF2 (100,000次迭代)
- **随机数**: 系统级熵源
- **完整性**: HMAC-SHA256

### 数据保护
- **内存安全**: 敏感数据不持久化
- **存储加密**: 本地数据加密存储
- **传输安全**: TLS 1.3 加密传输
- **生物识别**: 本地验证，不上传

### 权限管理
- **最小权限**: 只请求必要权限
- **透明说明**: 详细说明权限用途
- **用户控制**: 可随时撤销权限
- **隐私保护**: 不收集用户数据

## 📊 性能指标

### 桌面端性能
- **启动时间**: < 2秒
- **文件处理**: 100MB/s
- **内存占用**: < 100MB
- **CPU使用**: < 10%

### 移动端性能
- **启动时间**: < 1秒
- **文件处理**: 50MB/s
- **内存占用**: < 50MB
- **电池影响**: < 5%

## 🆘 常见问题

### 桌面端问题

**Q: 应用无法启动？**
A: 检查系统要求，确保已安装最新版本的运行时环境。

**Q: 加密失败？**
A: 检查文件权限，确保有足够的磁盘空间。

**Q: 更新失败？**
A: 检查网络连接，尝试手动下载最新版本。

### 移动端问题

**Q: 生物识别不工作？**
A: 检查设备是否支持，在系统设置中重新配置。

**Q: 文件无法选择？**
A: 检查应用权限，确保已授权文件访问。

**Q: 云端同步失败？**
A: 检查网络连接，确认云端服务状态。

## 📞 技术支持

### 官方渠道
- **官网**: https://securefiles.app
- **文档**: https://docs.securefiles.app
- **社区**: https://community.securefiles.app
- **邮箱**: support@securefiles.app

### 开发资源
- **GitHub**: https://github.com/securefiles/client
- **API文档**: https://api.securefiles.app
- **SDK下载**: https://sdk.securefiles.app

### 反馈渠道
- **Bug报告**: GitHub Issues
- **功能建议**: GitHub Discussions
- **安全漏洞**: security@securefiles.app

## 📄 许可证

SecureFiles 客户端应用采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献指南

我们欢迎社区贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

---

**© 2024 SecureFiles Team. All rights reserved.** 