# uTools 插件白屏问题排障指南

## 问题现象

在开发 JSON 工具插件时，出现了以下问题：

1. 本地开发环境运行正常，但在 uTools 开发者工具中运行时插件界面一片空白
2. 没有任何内容显示，也没有明显的错误信息
3. 插件的 preload 脚本已经正确加载（通过控制台可以看到 preload 脚本加载信息）

## 问题分析

### 初始排查

首先观察界面是否完全空白。通过 uTools 开发者控制台（Ctrl+Shift+I），发现 preload 脚本确实已经加载，并正确输出了信息：

这表明：

- Node.js 环境正常
- Electron 环境正常
- preload 脚本已成功加载
- 插件的基本环境已经正确配置

### 问题定位

继续排查时发现 uTools 开发者工具中报错：

这是一个 JSON 解析错误，指出在 plugin.json 文件的第 90 个字符位置附近有格式问题。

## 问题代码

查看 `plugin.json` 文件，发现了以下问题代码：

```json
{
  "main": "index.html",
  "preload": "preload/services.js",
  "logo": "logo.png",
  /*
  "development": {
    "main": "http://localhost:5173"
  },
  */
  "features": [
    // ...其余配置项...
  ]
}
```

问题在于 JSON 文件中使用了 JavaScript 风格的注释（`/* */` 和 `//`），而标准 JSON 不支持注释。

## 排障思路

1. **识别 JSON 格式错误**：JSON 是一种严格的数据交换格式，不支持注释或尾随逗号等在 JavaScript 中常见的语法。

2. **构建配置问题**：项目使用 Vite 构建，输出目录设置不当可能导致文件覆盖或混淆。

3. **入口文件加载问题**：React 应用可能没有正确挂载到 DOM 元素。

4. **提供备选功能**：添加简单的 HTML 文件作为备选功能，确保即使 React 应用加载失败，插件仍然可用。

## 解决步骤

### 1. 修复 JSON 格式错误

删除 plugin.json 中的所有注释，使其符合标准 JSON 格式：

```json
{
  "main": "index.html",
  "preload": "preload/services.js",
  "logo": "logo.png",
  "features": [
    {
      "code": "hello",
      "explain": "这是插件应用的第一个功能",
      "cmds": ["你好", "hello"]
    }
    // ...其余配置项...
  ]
}
```

可以使用以下命令删除多行注释：

```bash
sed -i '/\/\*/,/\*\//d' dist/plugin.json
```

### 2. 添加调试功能

创建专门的调试页面（debug.html），用于验证环境和 API 可用性：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>调试页面</title>
  </head>
  <body>
    <h1>调试页面</h1>
    <div id="status">检查中...</div>
    <script>
      document.addEventListener("DOMContentLoaded", function () {
        const statusEl = document.getElementById("status");

        try {
          if (window.services) {
            statusEl.innerHTML = "preload 加载成功! window.services 对象存在";
            statusEl.style.color = "green";
          } else {
            statusEl.innerHTML = "错误: window.services 对象不存在!";
            statusEl.style.color = "red";
          }
        } catch (err) {
          statusEl.innerHTML = "错误: " + err.message;
          statusEl.style.color = "red";
        }

        // 检查 uTools API
        try {
          if (window.utools) {
            const apiStatus = document.createElement("div");
            apiStatus.innerHTML = "uTools API 可用!";
            apiStatus.style.color = "green";
            document.body.appendChild(apiStatus);

            // 显示更多信息
            const info = document.createElement("pre");
            info.textContent = JSON.stringify(
              {
                versions: window.utools.getAppVersion(),
                path: window.utools.getPath("downloads"),
              },
              null,
              2
            );
            document.body.appendChild(info);
          }
        } catch (err) {
          const apiStatus = document.createElement("div");
          apiStatus.innerHTML = "错误: uTools API 不可用! " + err.message;
          apiStatus.style.color = "red";
          document.body.appendChild(apiStatus);
        }
      });
    </script>
  </body>
</html>
```

### 3. 添加错误处理和调试信息到主页面

修改主界面 index.html，添加错误处理和调试信息：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script>
      // 添加全局错误处理
      window.addEventListener("error", function (event) {
        console.error("捕获到错误:", event.error);
        document.body.innerHTML +=
          '<div style="color:red;background:#ffeeee;padding:10px;margin:10px;border:1px solid red">错误: ' +
          (event.error ? event.error.message : event.message) +
          "</div>";
      });

      // 监控资源加载错误
      window.addEventListener("unhandledrejection", function (event) {
        console.error("未处理的 Promise 拒绝:", event.reason);
        document.body.innerHTML +=
          '<div style="color:orange;background:#fffaee;padding:10px;margin:10px;border:1px solid orange">Promise 错误: ' +
          event.reason +
          "</div>";
      });
    </script>
    <script type="module" crossorigin src="./index.js"></script>
    <link rel="stylesheet" crossorigin href="./assets/index.css" />
  </head>
  <body>
    <div id="root"></div>
    <script>
      // DOM加载完成后检查root元素
      document.addEventListener("DOMContentLoaded", function () {
        console.log("DOM 已加载完成");
        setTimeout(function () {
          const root = document.getElementById("root");
          if (root && root.children.length === 0) {
            console.warn("React 应用可能未成功渲染到 root 元素");

            // 创建备用内容
            const fallbackContent = document.createElement("div");
            fallbackContent.style.padding = "20px";
            fallbackContent.innerHTML = `
              <h2>应用加载状态</h2>
              <p>React 应用可能未成功渲染</p>
              <button onclick="window.location.reload()">刷新页面</button>
              <button onclick="window.location.href='debug.html'">打开调试页面</button>
            `;
            root.appendChild(fallbackContent);
          }
        }, 2000); // 给React应用2秒钟的渲染时间
      });
    </script>
  </body>
</html>
```

### 4. 创建备选功能

创建基础版功能，提供简单但功能完整的 JSON 工具：

```html
<!-- fallback.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>JSON工具 - 基础版</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      textarea {
        width: 100%;
        height: 300px;
        padding: 10px;
        margin: 10px 0;
      }
      button {
        background: #4caf50;
        color: white;
        border: none;
        padding: 10px 15px;
        margin: 5px;
      }
    </style>
  </head>
  <body>
    <h1>JSON工具 - 基础版</h1>

    <div class="toolbar">
      <button id="formatBtn">格式化</button>
      <button id="compressBtn">压缩</button>
      <button id="validateBtn">验证</button>
      <button id="clearBtn">清空</button>
    </div>

    <textarea id="jsonInput" placeholder="在此输入您的JSON数据..."></textarea>
    <div id="errorMsg" class="error" style="display: none;"></div>
    <textarea id="jsonOutput" readonly></textarea>

    <script>
      // 格式化JSON
      function formatJSON(json) {
        try {
          const obj = JSON.parse(json);
          return JSON.stringify(obj, null, 2);
        } catch (e) {
          showError("无效的JSON: " + e.message);
          return json;
        }
      }

      // 事件处理
      document
        .getElementById("formatBtn")
        .addEventListener("click", function () {
          document.getElementById("jsonOutput").value = formatJSON(
            document.getElementById("jsonInput").value
          );
        });

      // ... 其他功能代码 ...
    </script>
  </body>
</html>
```

### 5. 为调试和备选功能添加入口

修改 plugin.json，添加功能入口：

```json
{
  "features": [
    {
      "code": "hello",
      "explain": "这是插件应用的第一个功能",
      "cmds": ["你好", "hello"]
    },
    {
      "code": "debug",
      "explain": "调试页面",
      "cmds": ["调试", "debug"]
    },
    {
      "code": "basic",
      "explain": "JSON工具-基础版",
      "cmds": ["基础版", "basic"]
    }
  ]
}
```

创建功能入口脚本：

```javascript
// debug-entry.js
window.exports = {
  debug: {
    mode: "none",
    args: {
      enter: () => {
        window.location.href = "debug.html";
      },
    },
  },
};

// basic-entry.js
window.exports = {
  basic: {
    mode: "none",
    args: {
      enter: () => {
        window.location.href = "fallback.html";
      },
    },
  },
};
```

### 6. 修改构建配置

修改 Vite 配置，将输出目录从 public 改为 dist，避免文件混淆：

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist", // 改为独立的 dist 目录
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: "index.js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true, // 构建前清空目录
  },
});
```

### 7. 复制所有必要文件到 dist 目录

```bash
mkdir -p dist/preload &&
cp public/preload/*.js dist/preload/ &&
cp public/plugin.json public/logo.png public/debug.html public/debug-entry.js public/fallback.html public/basic-entry.js public/test-data.json dist/
```

## 调试技巧

1. **使用 uTools 开发者工具**：通过 Ctrl+Shift+I 打开控制台，查看错误信息。

2. **检查 plugin.json 格式**：确保它是有效的 JSON 格式，没有注释或非法字符。

3. **创建专门的调试页面**：提供简单的页面验证环境和 API 可用性。

4. **添加全局错误处理**：捕获并显示通常被隐藏的错误。

5. **检查文件路径**：确保所有引用的文件路径正确，特别是相对路径。

6. **提供备选功能**：添加不依赖复杂框架的简单功能，确保基本可用性。

7. **使用命令行工具验证**：使用如下命令验证 JSON 文件格式：
   ```bash
   cat dist/plugin.json | jq
   ```

## 常见问题

1. **JSON 格式错误**：JSON 不允许注释、尾随逗号或未引用的键。

2. **路径问题**：确保所有文件路径都是相对于 plugin.json 的正确路径。

3. **构建输出问题**：Vite/Webpack 输出目录可能与预期不同，导致资源无法找到。

4. **preload 脚本问题**：确保 preload 脚本正确注入了必要的对象和方法。

5. **React/Vue 挂载问题**：前端框架可能未能正确挂载到 DOM 元素。

## 总结

排查 uTools 插件白屏问题，需要从基础的文件格式到复杂的框架渲染逐步排查。添加适当的调试信息和备选功能可以帮助快速定位问题，提高开发效率。最常见的问题是 JSON 格式错误、文件路径错误和前端框架加载问题。

通过本文介绍的方法，可以系统地解决 uTools 插件开发中遇到的白屏问题，确保插件能够正常运行和显示。
