import React, { useState } from "react";
import JSONEditor from "./components/JsonEditor";
/**
 * 主应用组件，包含JSON编辑器和主题切换功能
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
   * 切换编辑器主题
   * @function
   */
  const toggleTheme = () => {
    setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
  };

  return (
    <div className={`App ${theme}`}>
      <JSONEditor
        content={editorContent}
        onContentChange={setEditorContent}
        theme={theme}
      />
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === "vs-dark" ? "☀️" : "🌙"}
      </button>
    </div>
  );
}

export default App;
