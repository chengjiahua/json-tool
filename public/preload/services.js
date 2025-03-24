const fs = require("node:fs");
const path = require("node:path");

// 添加全局错误处理
process.on("uncaughtException", (error) => {
  console.error("未捕获的异常:", error);
  // 可以选择在这里显示错误通知
  if (window.utools) {
    window.utools.showNotification("发生错误: " + error.message);
  }
});

// 初始化时记录一些调试信息
console.log("preload 脚本已加载");
console.log("node 版本:", process.versions.node);
console.log("electron 版本:", process.versions.electron);

// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 读文件
  readFile(file) {
    try {
      return fs.readFileSync(file, { encoding: "utf-8" });
    } catch (err) {
      console.error("读取文件错误:", err);
      throw err;
    }
  },
  // 文本写入到下载目录
  writeTextFile(text) {
    try {
      const filePath = path.join(
        window.utools.getPath("downloads"),
        Date.now().toString() + ".txt"
      );
      fs.writeFileSync(filePath, text, { encoding: "utf-8" });
      return filePath;
    } catch (err) {
      console.error("写入文本文件错误:", err);
      throw err;
    }
  },
  // 图片写入到下载目录
  writeImageFile(base64Url) {
    try {
      const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url);
      if (!matchs) return;
      const filePath = path.join(
        window.utools.getPath("downloads"),
        Date.now().toString() + "." + matchs[1]
      );
      fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), {
        encoding: "base64",
      });
      return filePath;
    } catch (err) {
      console.error("写入图片文件错误:", err);
      throw err;
    }
  },
  // 添加调试方法
  debug() {
    return {
      node: process.versions.node,
      electron: process.versions.electron,
      platform: process.platform,
      arch: process.arch,
      utoolsReady: !!window.utools,
    };
  },
};
