import { useState, useEffect } from "react";
import "./styles.css";

export default function HistorySidebar({ isCollapsed, toggleCollapse }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("jsonEditorHistory") || "[]"
    );
    setHistory(savedHistory);
  }, []);

  const addHistoryEntry = (content) => {
    const newEntry = {
      id: Date.now(),
      content,
      timestamp: new Date().toLocaleString(),
    };
    const updatedHistory = [newEntry, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem("jsonEditorHistory", JSON.stringify(updatedHistory));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="toggle-btn" onClick={toggleCollapse}>
        {isCollapsed ? "→" : "←"}
      </button>
      <div className="history-list">
        {history.map((entry) => (
          <div key={entry.id} className="history-item">
            <div className="item-header">
              <span>{entry.timestamp}</span>
              <button onClick={() => copyToClipboard(entry.content)}>
                复制
              </button>
            </div>
            <pre>{entry.content}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
