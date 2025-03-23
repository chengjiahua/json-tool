const { contextBridge } = require("electron");
const fs = require("fs");
const path = require("path");

// 获取data目录路径
const getDataPath = (filename) => {
  // 获取应用根目录
  const appPath = process.cwd();
  // 构建data目录路径
  const dataPath = path.join(appPath, "data");

  // 确保data目录存在
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  return path.join(dataPath, filename);
};

// 在window对象上暴露服务API
contextBridge.exposeInMainWorld("services", {
  // 读取JSON文件
  readJsonFile: (filename) => {
    try {
      const filePath = getDataPath(filename);
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading JSON file:", error);
      return [];
    }
  },

  // 写入JSON文件
  writeJsonFile: (filename, data) => {
    try {
      const filePath = getDataPath(filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (error) {
      console.error("Error writing JSON file:", error);
      return false;
    }
  },

  // 示例API
  hello: () => "Hello from preload!",
});
