import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { debounce } from "lodash";

const JSONEditor = ({ content, onContentChange }) => {
  const editorRef = useRef(null);

  const options = {
    minimap: { enabled: false },
    lineNumbers: "on",
    scrollBeyondLastLine: false,
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    fontSize: 14,
    glyphMargin: false,
  };

  const handleEditorChange = debounce((value) => {
    onContentChange(value);
    try {
      JSON.parse(value);
      editorRef.current.getAction("editor.action.formatDocument").run();
    } catch (error) {
      // 保持错误处理逻辑
    }
  }, 500);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="json"
        theme="vs-dark"
        value={content}
        options={options}
        onChange={handleEditorChange}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
    </div>
  );
};

export default JSONEditor;