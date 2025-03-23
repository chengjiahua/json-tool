import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { debounce } from "lodash";

const JSONEditor = () => {
  const [content, setContent] = useState("{\n\t\n}");
  const [isValidJSON, setIsValidJSON] = useState(true);
  const editorRef = useRef(null);

  // 编辑器配置
  const options = {
    minimap: { enabled: false }, // 禁用缩略图
    lineNumbers: "on", // 显示行号
    scrollBeyondLastLine: false, // 取消底部空白
    automaticLayout: true, // 自适应布局
    formatOnPaste: true, // 粘贴时自动格式化
    formatOnType: true, // 输入时自动格式化
    fontSize: 14, // 字体大小
    glyphMargin: false, // 关闭字形边距
  };

  // 处理编辑器变化（防抖处理）
  const handleEditorChange = debounce((value) => {
    try {
      JSON.parse(value);
      setIsValidJSON(true);
      // 自动格式化
      editorRef.current.getAction("editor.action.formatDocument").run();
    } catch (error) {
      setIsValidJSON(false);
    }
    setContent(value);
  }, 500);

  // 初始化编辑器
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // 配置JSON语法提示
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [],
      enableSchemaRequest: true,
    });
  }

  return (
    <div
      style={{
        border: isValidJSON ? "1px solid #ccc" : "1px solid #ff4d4f",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0 8px",
          background: "#f5f5f5",
          color: isValidJSON ? "#333" : "#ff4d4f",
          fontSize: 12,
        }}
      >
        {isValidJSON ? "Valid JSON" : "Invalid JSON"}
      </div>

      <Editor
        height="500px"
        defaultLanguage="json"
        theme="vs-light" // 使用VS Code浅色主题
        value={content}
        options={options}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default JSONEditor;
