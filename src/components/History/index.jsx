import React, { useState, useEffect } from "react";
import {
  FaHistory,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
} from "react-icons/fa";
import "./styles.css";

/**
 * JSON历史记录组件
 * @component
 * @param {Object} props - 组件属性
 * @param {string} props.currentContent - 当前编辑器内容
 * @param {Function} props.onSelectHistory - 选择历史记录的回调函数
 * @param {boolean} props.visible - 侧边栏是否可见
 * @param {Function} props.onToggleVisible - 切换侧边栏可见性的回调函数
 * @param {'vs-dark'|'light'} props.theme - 编辑器主题样式
 */
const History = ({
  currentContent,
  onSelectHistory,
  visible,
  onToggleVisible,
  theme,
}) => {
  // 历史记录状态
  const [history, setHistory] = useState([]);
  // 最大历史记录数量
  const MAX_HISTORY_COUNT = 100;

  // 初始化时加载历史记录
  useEffect(() => {
    loadHistory();
  }, []);

  // 当前内容变更时，保存到历史记录
  useEffect(() => {
    if (currentContent && currentContent.trim() !== "") {
      saveToHistory(currentContent);
    }
  }, [currentContent]);

  // 加载历史记录
  const loadHistory = async () => {
    try {
      // 使用preload中的服务读取历史记录文件
      const historyData = await window.services.readJsonFile("history.json");
      if (Array.isArray(historyData)) {
        setHistory(historyData);
      }
    } catch (error) {
      console.log("No history found or error loading history:", error);
      setHistory([]);
    }
  };

  // 保存历史记录
  const saveToHistory = async (content) => {
    try {
      // 检查是否为有效的JSON
      JSON.parse(content);

      // 创建新的历史记录项
      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        content,
        preview: generatePreview(content),
      };

      // 检查是否与最新的历史记录相同
      if (history.length > 0 && history[0].content === content) {
        return; // 如果相同，不添加到历史记录
      }

      // 更新历史记录状态
      const updatedHistory = [newHistoryItem, ...history].slice(
        0,
        MAX_HISTORY_COUNT
      );
      setHistory(updatedHistory);

      // 保存到文件
      await window.services.writeJsonFile("history.json", updatedHistory);
    } catch (error) {
      // 如果不是有效的JSON，不保存到历史记录
      console.error("Invalid JSON or error saving history:", error);
    }
  };

  // 生成历史记录预览
  const generatePreview = (content) => {
    try {
      const jsonObj = JSON.parse(content);
      // 获取JSON的第一个键值对作为预览
      const keys = Object.keys(jsonObj);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const firstValue = jsonObj[firstKey];
        return `${firstKey}: ${JSON.stringify(firstValue).substring(0, 30)}${
          JSON.stringify(firstValue).length > 30 ? "..." : ""
        }`;
      }
      return "Empty JSON";
    } catch (error) {
      return "Invalid JSON";
    }
  };

  // 选择历史记录
  const handleSelectHistory = (historyItem) => {
    if (onSelectHistory) {
      onSelectHistory(historyItem.content);
    }
  };

  // 清除所有历史记录
  const clearAllHistory = async () => {
    if (window.confirm("确定要清除所有历史记录吗？")) {
      setHistory([]);
      await window.services.writeJsonFile("history.json", []);
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div
      className={`history-sidebar ${visible ? "visible" : "hidden"} ${theme}`}
    >
      <div className="history-toggle-button" onClick={onToggleVisible}>
        {visible ? <FaChevronLeft /> : <FaChevronRight />}
      </div>

      <div className="history-content">
        <div className="history-header">
          <h3>
            <FaHistory /> JSON历史记录
          </h3>
          {history.length > 0 && (
            <button
              className="clear-history-button"
              onClick={clearAllHistory}
              title="清除所有历史记录"
            >
              <FaTrash />
            </button>
          )}
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="no-history">暂无历史记录</div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleSelectHistory(item)}
              >
                <div className="history-item-preview">{item.preview}</div>
                <div className="history-item-time">
                  {formatTimestamp(item.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
