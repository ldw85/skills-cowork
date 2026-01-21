# Skills Cowork - Tauri + React + TypeScript 开发环境

## 项目概述

Skills Cowork 是一个基于 Tauri + React + TypeScript 构建的现代化桌面应用程序，提供代码编辑、文件管理和开发协作功能。

## 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速构建工具
- **Ant Design** - 企业级 UI 组件库
- **Monaco Editor** - VSCode 同款代码编辑器
- **Zustand** - 轻量级状态管理
- **react-i18next** - 国际化支持

### 后端
- **Tauri 2.0** - 跨平台桌面应用框架
- **Rust** - 系统级编程语言
- **文件系统 API** - 文件读写操作
- **网络请求** - HTTP 客户端支持

## 项目结构

```
skills-cowork/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   │   ├── MainLayout.tsx # 主布局
│   │   ├── CodeEditor.tsx # 代码编辑器
│   │   └── FileExplorer.tsx # 文件管理器
│   ├── store/            # 状态管理
│   ├── i18n/             # 国际化配置
│   ├── hooks/            # 自定义 Hooks
│   ├── utils/            # 工具函数
│   └── assets/           # 静态资源
├── src-tauri/            # Tauri 后端源码
│   ├── src/
│   │   └── main.rs       # Rust 主程序
│   ├── Cargo.toml        # Rust 依赖配置
│   ├── tauri.conf.json   # Tauri 配置
│   └── icons/           # 应用图标
├── public/               # 公共文件
└── package.json          # 前端依赖和脚本
```

## 开发环境搭建

### 前置要求

1. **Node.js** (>= 18.0.0)
2. **Rust** (最新稳定版)
3. **系统依赖** (Linux):
   ```bash
   sudo apt update
   sudo apt install -y libglib2.0-dev libgtk-3-dev libwebkit2gtk-4.1-dev
   ```

### 安装和运行

1. **安装前端依赖**:
   ```bash
   cd skills-cowork
   npm install
   ```

2. **启动开发服务器**:
   ```bash
   # 启动前端开发服务器
   npm run dev

   # 启动 Tauri 应用 (新终端)
   npm run tauri dev
   ```

3. **构建生产版本**:
   ```bash
   # 构建前端
   npm run build

   # 构建 Tauri 应用
   npm run tauri build
   ```

## 可用脚本

- `npm run dev` - 启动前端开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览构建结果
- `npm run tauri dev` - 启动 Tauri 开发模式
- `npm run tauri build` - 构建 Tauri 应用
- `npm run type-check` - TypeScript 类型检查
- `npm run lint` - ESLint 代码检查

## 功能特性

### 文件管理
- 📁 文件浏览器
- 📝 创建/删除文件和文件夹
- 🔍 文件搜索
- 🗂️ 树形文件结构展示

### 代码编辑
- 📝 Monaco Editor 集成
- 🌙 深色/浅色主题
- 🏷️ 多语言语法高亮
- 💾 文件保存功能
- ⚡ 热重载支持

### 国际化
- 🌍 中英文切换
- 📱 Ant Design 本地化支持
- 🌐 统一的 i18n 配置

## 配置说明

### Tauri 配置 (src-tauri/tauri.conf.json)
- 应用 ID: `com.skillscowork.app`
- 窗口尺寸: 1200x800 (最小 800x600)
- 开发服务器: `http://localhost:1420`
- 启用 devtools 调试

### Vite 配置 (vite.config.ts)
- 开发端口: 1420
- 路径别名配置
- 生产环境优化

### TypeScript 配置 (tsconfig.json)
- 严格模式启用
- 路径映射配置
- React JSX 支持

## 开发注意事项

1. **Rust 后端编译**: 确保系统安装了必要的开发库
2. **前端热重载**: Vite 提供快速的开发体验
3. **文件系统权限**: Tauri 需要文件系统访问权限
4. **端口冲突**: 确保 1420 端口未被占用

## 故障排除

### 常见问题

1. **Rust 编译失败**:
   ```bash
   # 更新 Rust 工具链
   rustup update
   # 清理缓存
   cargo clean
   ```

2. **前端依赖安装失败**:
   ```bash
   # 清理 npm 缓存
   npm cache clean --force
   # 删除 node_modules 重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Tauri 启动失败**:
   - 检查 Node.js 版本 (需要 >= 18)
   - 检查系统依赖是否完整安装
   - 查看详细错误日志

## 性能优化

- 代码分割 (Code Splitting)
- 懒加载 (Lazy Loading)
- 资源压缩和优化
- 内存使用优化

## 下一步计划

- [ ] 添加更多编程语言支持
- [ ] 集成 Git 版本控制
- [ ] 插件系统开发
- [ ] 协作功能增强
- [ ] 主题自定义
- [ ] 快捷键配置

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码更改
4. 发起 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。