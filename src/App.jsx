import React, { useState } from "react";
import JSONEditor from "./components/JsonEditor";
import History from "./components/History";
import "./App.css";

/**
 * 主应用组件，包含JSON编辑器、历史记录侧边栏和主题切换功能
 * @component
 */
function App() {
  /**
   * 编辑器内容状态
   * @type {[string, Function]}
   */
  const [editorContent, setEditorContent] = useState("{\n\t\n}");

  /**
   * 编辑器主题状态（vs-dark/light）
   * @type {[string, Function]}
   */
  const [theme, setTheme] = useState("vs-dark");

  /**
   * 历史侧边栏可见性状态
   * @type {[boolean, Function]}
   */
  const [historyVisible, setHistoryVisible] = useState(true);

  /**
   * 切换历史侧边栏可见性
   * @function
   */
  const toggleHistoryVisible = () => {
    setHistoryVisible((prev) => !prev);
  };

  /**
   * 从历史记录中选择内容
   * @function
   * @param {string} content - 选中的历史记录内容
   */
  const handleSelectHistory = (content) => {
    setEditorContent(content);
  };

  return (
    <div className={`App ${theme}`}>
      <div className="app-container">
        <History
          currentContent={editorContent}
          onSelectHistory={handleSelectHistory}
          visible={historyVisible}
          onToggleVisible={toggleHistoryVisible}
          theme={theme}
        />
        <div
          className={`editor-container ${
            historyVisible ? "with-history" : "full-width"
          }`}
        >
          <JSONEditor
            content={editorContent}
            onContentChange={setEditorContent}
            theme={theme}
            onThemeChange={setTheme}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
