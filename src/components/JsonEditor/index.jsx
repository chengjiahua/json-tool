import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { debounce } from "lodash";
import {
  FaSearch,
  FaCode,
  FaChevronDown,
  FaChevronUp,
  FaEraser,
  FaCopy,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";
import { BiCollapseVertical, BiExpandVertical } from "react-icons/bi";

/**
 * JSON编辑器组件，集成Monaco编辑器实现
 * @component
 * @param {Object} props - 组件属性
 * @param {string} props.content - 编辑器初始内容
 * @param {Function} props.onContentChange - 内容变更回调函数
 * @param {'vs-dark'|'light'} props.theme - 编辑器主题样式
 */
const JSONEditor = ({ content, onContentChange, theme }) => {
  const editorRef = useRef(null);
  const [searchVisible, setSearchVisible] = useState(false);

  // 格式化JSON
  const formatJSON = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument").run();
    }
  };

  // 折叠所有代码
  const collapseAll = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.foldAll").run();
    }
  };

  // 展开所有代码
  const expandAll = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.unfoldAll").run();
    }
  };

  // 去除注释
  const removeComments = () => {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      try {
        const jsonStr = value.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
        editorRef.current.setValue(jsonStr);
        formatJSON();
      } catch (error) {
        console.error("Failed to remove comments:", error);
      }
    }
  };

  // 压缩JSON并复制
  const compressAndCopy = () => {
    if (editorRef.current) {
      try {
        const value = editorRef.current.getValue();
        const jsonObj = JSON.parse(value);
        const compressed = JSON.stringify(jsonObj);
        navigator.clipboard.writeText(compressed);
      } catch (error) {
        console.error("Failed to compress JSON:", error);
      }
    }
  };

  // 压缩转义JSON并复制
  const compressEscapeAndCopy = () => {
    if (editorRef.current) {
      try {
        const value = editorRef.current.getValue();
        const jsonObj = JSON.parse(value);
        const compressed = JSON.stringify(JSON.stringify(jsonObj));
        navigator.clipboard.writeText(compressed);
      } catch (error) {
        console.error("Failed to compress and escape JSON:", error);
      }
    }
  };

  // JSON转XML并复制
  const convertToXMLAndCopy = () => {
    if (editorRef.current) {
      try {
        const value = editorRef.current.getValue();
        const jsonObj = JSON.parse(value);

        const toXML = (obj) => {
          let xml = "";
          for (let prop in obj) {
            xml += obj[prop] instanceof Array ? "" : "<" + prop + ">";
            if (obj[prop] instanceof Array) {
              for (let array in obj[prop]) {
                xml += "<" + prop + ">";
                xml +=
                  typeof obj[prop][array] === "object"
                    ? toXML(obj[prop][array])
                    : obj[prop][array];
                xml += "</" + prop + ">";
              }
            } else if (typeof obj[prop] === "object") {
              xml += toXML(obj[prop]);
            } else {
              xml += obj[prop];
            }
            xml += obj[prop] instanceof Array ? "" : "</" + prop + ">";
          }
          return xml;
        };

        const xmlStr =
          '<?xml version="1.0" encoding="UTF-8"?>\n<root>' +
          toXML(jsonObj) +
          "</root>";
        navigator.clipboard.writeText(xmlStr);
      } catch (error) {
        console.error("Failed to convert to XML:", error);
      }
    }
  };

  // JSON转TypeScript并复制
  const convertToTypeScriptAndCopy = () => {
    if (editorRef.current) {
      try {
        const value = editorRef.current.getValue();
        const jsonObj = JSON.parse(value);

        const toTypeScript = (obj, interfaceName = "RootObject") => {
          let types = `interface ${interfaceName} {\n`;
          for (let prop in obj) {
            const value = obj[prop];
            let type = typeof value;

            if (Array.isArray(value)) {
              if (value.length > 0) {
                if (typeof value[0] === "object" && value[0] !== null) {
                  const arrayInterfaceName =
                    interfaceName +
                    prop.charAt(0).toUpperCase() +
                    prop.slice(1);
                  types = toTypeScript(value[0], arrayInterfaceName) + types;
                  type = `${arrayInterfaceName}[]`;
                } else {
                  type = `${typeof value[0]}[]`;
                }
              } else {
                type = "any[]";
              }
            } else if (type === "object" && value !== null) {
              const childInterfaceName =
                interfaceName + prop.charAt(0).toUpperCase() + prop.slice(1);
              types = toTypeScript(value, childInterfaceName) + types;
              type = childInterfaceName;
            }

            types += `  ${prop}: ${type};\n`;
          }
          return types + "}\n\n";
        };

        const tsStr = toTypeScript(jsonObj);
        navigator.clipboard.writeText(tsStr);
      } catch (error) {
        console.error("Failed to convert to TypeScript:", error);
      }
    }
  };

  // 编辑器配置项
  const options = {
    // 禁用右侧小地图预览
    minimap: { enabled: false },
    // 控制行号显示模式 ('on' | 'off' | 'relative' | 'interval')
    lineNumbers: "on",
    // 禁止滚动超过最后一行内容
    scrollBeyondLastLine: false,
    // 启用自动布局调整（窗口resize时自动适应）
    automaticLayout: true,
    // 粘贴时自动格式化JSON内容
    formatOnPaste: true,
    // 输入时自动格式化当前行
    formatOnType: false,
    // 设置编辑器字体大小(px)
    fontSize: 14,
    // 关闭左侧装订线边距（用于断点调试标记）
    glyphMargin: false,
    // 继承父组件传递的主题样式
    theme: theme,
    // 设置编辑器语言为中文
    language: "zh-cn",
    // 添加主题相关颜色配置
    colors: {
      "editor.background": theme === "vs-dark" ? "#1e1e1e" : "#fffffe",
      "editor.foreground": theme === "vs-dark" ? "#d4d4d4" : "#333333",
    },
  };

  /**
   * 处理编辑器内容变更，带防抖和自动格式化功能
   * @function
   * @param {string} value - 编辑器当前内容
   */
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
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {searchVisible && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            padding: "8px",
            background: theme === "vs-dark" ? "#1e1e1e" : "#ffffff",
            borderBottom:
              "1px solid " + (theme === "vs-dark" ? "#333" : "#ddd"),
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 1,
          }}
        >
          <input
            type="text"
            placeholder="正则表达式搜索..."
            style={{
              padding: "4px 8px",
              border: "1px solid " + (theme === "vs-dark" ? "#333" : "#ddd"),
              borderRadius: "4px",
              background: theme === "vs-dark" ? "#2d2d2d" : "#ffffff",
              color: theme === "vs-dark" ? "#ffffff" : "#000000",
            }}
            onChange={(e) => {
              if (editorRef.current) {
                const searchParams = new URLSearchParams(e.target.value);
                editorRef.current.trigger("", "actions.find", {
                  searchString: searchParams.toString(),
                  isRegex: true,
                });
              }
            }}
          />
        </div>
      )}
      <div style={{ flex: 1, position: "relative" }}>
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="json"
          theme={theme}
          value={content}
          options={options}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>
      <div
        style={{
          padding: "12px 16px",
          background: theme === "vs-dark" ? "#1e1e1e" : "#ffffff",
          borderTop: "1px solid " + (theme === "vs-dark" ? "#333" : "#ddd"),
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={() => setSearchVisible(!searchVisible)}
          style={{
            background: "transparent",
            border: "none",
            color: theme === "vs-dark" ? "#d4d4d4" : "#333333",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "8px",
            fontSize: "16px",
          }}
          title="正则表达式搜索"
        >
          <FaSearch />
          <span style={{ marginLeft: "4px" }}>this</span>
        </button>

        <button
          onClick={formatJSON}
          style={{
            background: "transparent",
            border: "none",
            color: theme === "vs-dark" ? "#d4d4d4" : "#333333",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
          }}
          title="格式化JSON"
        >
          <FaCode />
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={collapseAll}
          style={{
            background: "transparent",
            border: "none",
            color: theme === "vs-dark" ? "#d4d4d4" : "#333333",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
          }}
          title="折叠全部"
        >
          <BiCollapseVertical />
        </button>

        <button
          onClick={expandAll}
          style={{
            background: "transparent",
            border: "none",
            color: theme === "vs-dark" ? "#d4d4d4" : "#333333",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
          }}
          title="展开全部"
        >
          <BiExpandVertical />
        </button>

        <button
          onClick={removeComments}
          style={{
            background: "transparent",
            border: "none",
            color: theme === "vs-dark" ? "#d4d4d4" : "#333333",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
          }}
          title="去除注释"
        >
          <FaEraser />
        </button>

        <button
          onClick={compressAndCopy}
          style={{
            background: "transparent",
            border: "none",
            color: theme === "vs-dark" ? "#d4d4d4" : "#333333",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
          }}
          title="压缩JSON并复制"
        >
          <FaCopy />
        </button>

        <button
          onClick={compressEscapeAndCopy}
          style={{
            background: "transparent",
            border: "none",
            color: theme === "vs-dark" ? "#d4d4d4" : "#333333",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
          }}
          title="压缩转义JSON并复制"
        >
          <FaFileCode />
        </button>

        <button
          onClick={convertToXMLAndCopy}
          style={{
            background: "transparent",
            border: "none",
            color: theme === "vs-dark" ? "#d4d4d4" : "#333333",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
          }}
          title="转换为XML并复制"
        >
          <FaFileAlt />
        </button>

        <button
          onClick={convertToTypeScriptAndCopy}
          style={{
            background: "transparent",
            border: "none",
            color: theme === "vs-dark" ? "#d4d4d4" : "#333333",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
          }}
          title="转换为TypeScript并复制"
        >
          <FaFileCode />
        </button>
      </div>
    </div>
  );
};

export default JSONEditor;
