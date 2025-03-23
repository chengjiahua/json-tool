# JSON Tool - 强大的 JSON 编辑与处理工具

## 项目介绍

JSON Tool 是一个功能强大的 JSON 编辑与处理工具，基于 React 和 Monaco Editor 开发，提供了丰富的 JSON 操作功能，包括格式化、压缩、转换、历史记录等。该工具可以帮助开发者更高效地处理 JSON 数据，提高开发效率。

## 功能特点

### 核心功能

- **JSON 编辑**：集成 Monaco Editor，提供语法高亮、代码折叠、自动补全等功能
- **格式化 JSON**：一键美化 JSON 格式，提高可读性
- **压缩 JSON**：压缩 JSON 数据，减小体积
- **历史记录**：自动保存编辑历史，方便回溯和恢复
- **主题切换**：支持明暗两种主题，适应不同使用环境

### 高级功能

- **注释处理**：支持去除 JSON 中的注释
- **代码折叠/展开**：一键折叠或展开所有代码块
- **复制功能**：支持复制格式化或压缩后的 JSON
- **文件操作**：支持读取和保存 JSON 文件
- **转换功能**：支持 JSON 与其他格式的相互转换

## 安装说明

### 环境要求

- Node.js 16.0+
- npm 8.0+

### 安装步骤

1. 克隆仓库

```bash
git clone <仓库地址>
cd json-tool
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

## 使用方法

### 基本操作

1. **编辑 JSON**：在编辑器中直接编辑 JSON 内容
2. **格式化**：点击工具栏中的格式化按钮，美化 JSON 格式
3. **折叠/展开**：使用工具栏中的折叠/展开按钮控制代码显示
4. **主题切换**：点击主题切换按钮在明暗主题间切换

### 历史记录

- 左侧边栏显示编辑历史记录
- 点击历史记录项可恢复到该版本
- 可通过侧边栏开关按钮控制历史记录面板的显示/隐藏

### 文件操作

- **读取文件**：通过「读文件」功能或拖拽文件到编辑器中
- **保存文件**：使用「保存为文件」功能将内容保存到本地

## 项目结构

```
json-tool/
├── public/             # 静态资源
│   ├── logo.png        # 应用图标
│   ├── plugin.json     # 插件配置
│   ├── preload/        # 预加载脚本
│   └── test-data.json  # 测试数据
├── src/                # 源代码
│   ├── components/     # 组件
│   │   ├── History/    # 历史记录组件
│   │   └── JsonEditor/ # JSON编辑器组件
│   ├── App.jsx         # 主应用组件
│   └── main.jsx        # 应用入口
└── package.json        # 项目配置
```

## 技术栈

- **React**: UI 构建
- **Monaco Editor**: 代码编辑器
- **Vite**: 构建工具
- **uTools API**: 系统集成

## 贡献指南

欢迎贡献代码或提出建议！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)
