import React, { useRef, useState, useEffect } from "react";
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
  FaSun,
  FaMoon,
  FaCaretDown,
  FaFileExport,
  FaCompress,
  FaFolder,
} from "react-icons/fa";
import { BiCollapseVertical, BiExpandVertical } from "react-icons/bi";
import "./styles.css";

/**
 * JSON编辑器组件，集成Monaco编辑器实现
 * @component
 * @param {Object} props - 组件属性
 * @param {string} props.content - 编辑器初始内容
 * @param {Function} props.onContentChange - 内容变更回调函数
 * @param {'vs-dark'|'light'} props.theme - 编辑器主题样式
 */
const JSONEditor = ({ content, onContentChange, theme, onThemeChange }) => {
  const editorRef = useRef(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // 点击文档其他地方时关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

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

  // JSON转YAML并复制
  const convertToYAMLAndCopy = () => {
    if (editorRef.current) {
      try {
        const value = editorRef.current.getValue();
        const jsonObj = JSON.parse(value);

        const toYAML = (obj, indent = 0) => {
          let yaml = "";
          const spaces = " ".repeat(indent);

          if (Array.isArray(obj)) {
            if (obj.length === 0) return spaces + "[]\n";

            for (let i = 0; i < obj.length; i++) {
              const value = obj[i];
              if (typeof value === "object" && value !== null) {
                yaml += spaces + "- \n" + toYAML(value, indent + 2);
              } else {
                yaml += spaces + "- " + JSON.stringify(value) + "\n";
              }
            }
          } else {
            for (const key in obj) {
              const value = obj[key];
              if (typeof value === "object" && value !== null) {
                yaml += spaces + key + ":\n" + toYAML(value, indent + 2);
              } else {
                yaml += spaces + key + ": " + JSON.stringify(value) + "\n";
              }
            }
          }

          return yaml;
        };

        const yamlStr = toYAML(jsonObj);
        navigator.clipboard.writeText(yamlStr);
      } catch (error) {
        console.error("Failed to convert to YAML:", error);
      }
    }
  };

  // 去除回车
  const removeLineBreaks = () => {
    if (editorRef.current) {
      try {
        const value = editorRef.current.getValue();
        const noLineBreaks = value.replace(/[\r\n]/g, "");
        editorRef.current.setValue(noLineBreaks);
      } catch (error) {
        console.error("Failed to remove line breaks:", error);
      }
    }
  };

  // 去除转义
  const removeEscapes = () => {
    if (editorRef.current) {
      try {
        const value = editorRef.current.getValue();
        const unescaped = value.replace(/\\([\\"'\/bfnrt])/g, "$1");
        editorRef.current.setValue(unescaped);
      } catch (error) {
        console.error("Failed to remove escapes:", error);
      }
    }
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === "vs-dark" ? "light" : "vs-dark";
    // 通知父组件主题已更改
    if (typeof onThemeChange === "function") {
      onThemeChange(newTheme);
    }
  };

  // 处理下拉菜单点击
  const handleDropdownToggle = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
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
    // 输入时不自动格式化
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
  // 自动识别并转换其他格式为JSON
  const autoConvertToJson = (value) => {
    try {
      // 尝试解析为JSON
      JSON.parse(value);
      return value;
    } catch (error) {
      try {
        // 尝试解析为YAML
        const yamlToJson = (yamlStr) => {
          const lines = yamlStr.split("\n");
          let jsonObj = {};
          let currentObj = jsonObj;
          let stack = [jsonObj];
          let currentIndent = 0;

          for (let line of lines) {
            if (!line.trim()) continue;
            const indent = line.search(/\S/);
            const [key, ...valueParts] = line.trim().split(":");
            let value = valueParts.join(":").trim();

            if (key.startsWith("- ")) {
              // 处理数组
              if (!Array.isArray(currentObj)) {
                currentObj = [];
                stack[stack.length - 1] = currentObj;
              }
              currentObj.push(value || {});
            } else if (value) {
              // 处理键值对
              currentObj[key] = value;
            } else {
              // 处理嵌套对象
              if (indent > currentIndent) {
                const newObj = {};
                currentObj[key] = newObj;
                stack.push(newObj);
                currentObj = newObj;
                currentIndent = indent;
              } else if (indent < currentIndent) {
                stack.pop();
                currentObj = stack[stack.length - 1];
                currentIndent = indent;
              }
            }
          }
          return JSON.stringify(jsonObj);
        };
        return yamlToJson(value);
      } catch (yamlError) {
        try {
          // 尝试解析为XML
          const xmlToJson = (xmlStr) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlStr, "text/xml");

            const convert = (node) => {
              if (node.nodeType === 3) return node.nodeValue.trim();

              const obj = {};
              if (node.attributes) {
                for (let attr of node.attributes) {
                  obj[`@${attr.name}`] = attr.value;
                }
              }

              for (let child of node.childNodes) {
                if (child.nodeType === 3 && child.nodeValue.trim()) {
                  return child.nodeValue.trim();
                } else if (child.nodeType === 1) {
                  const childResult = convert(child);
                  if (obj[child.nodeName]) {
                    if (!Array.isArray(obj[child.nodeName])) {
                      obj[child.nodeName] = [obj[child.nodeName]];
                    }
                    obj[child.nodeName].push(childResult);
                  } else {
                    obj[child.nodeName] = childResult;
                  }
                }
              }
              return obj;
            };

            return JSON.stringify(convert(xmlDoc.documentElement));
          };
          return xmlToJson(value);
        } catch (xmlError) {
          return value;
        }
      }
    }
  };

  // 处理编辑器内容变更
  const handleEditorChange = debounce((value) => {
    // 直接传递用户输入的值，不进行自动转换
    onContentChange(value);
  }, 500);

  // 处理编辑器键盘事件
  const handleEditorKeyDown = (event) => {
    // 检测Ctrl+S组合键
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      try {
        editorRef.current.getAction("editor.action.formatDocument").run();
      } catch (error) {
        // 保持错误处理逻辑
      }
    }
  };

  return (
    <div className="json-editor-container">
      {searchVisible && (
        <div className={`search-container ${theme}`}>
          <input
            type="text"
            placeholder="正则表达式搜索..."
            className={`search-input ${theme}`}
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
      <div className="input-section">
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
            // 添加键盘事件监听
            editor.onKeyDown(handleEditorKeyDown);
          }}
        />
      </div>
      <div className={`editor-toolbar ${theme}`}>
        {/* 搜索按钮 */}
        <button
          onClick={() => setSearchVisible(!searchVisible)}
          className="toolbar-button"
          title="正则表达式搜索"
        >
          <FaSearch />
        </button>

        {/* 格式化按钮 */}
        <button
          onClick={formatJSON}
          className="toolbar-button"
          title="格式化JSON"
        >
          <FaCode />
        </button>

        <div style={{ flex: 1 }} />

        {/* 1. 折叠/展开类 - 下拉菜单 */}
        <div className="dropdown-container">
          <button
            onClick={() => handleDropdownToggle("fold")}
            className="toolbar-button"
            title="折叠/展开选项"
          >
            <FaFolder />
            <span className="dropdown-icon">
              {activeDropdown === "fold" ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>
          {activeDropdown === "fold" && (
            <div className={`dropdown-menu ${theme}`}>
              <div
                className="dropdown-item"
                onClick={() => {
                  collapseAll();
                  setActiveDropdown(null);
                }}
              >
                <BiCollapseVertical />
                <span>折叠全部</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  expandAll();
                  setActiveDropdown(null);
                }}
              >
                <BiExpandVertical />
                <span>展开全部</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. 消除类 - 下拉菜单 */}
        <div className="dropdown-container">
          <button
            onClick={() => handleDropdownToggle("erase")}
            className="toolbar-button"
            title="消除选项"
          >
            <FaEraser />
            <span className="dropdown-icon">
              {activeDropdown === "erase" ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>
          {activeDropdown === "erase" && (
            <div className={`dropdown-menu ${theme}`}>
              <div
                className="dropdown-item"
                onClick={() => {
                  removeComments();
                  setActiveDropdown(null);
                }}
              >
                <FaEraser />
                <span>去除注释</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  removeLineBreaks();
                  setActiveDropdown(null);
                }}
              >
                <FaEraser />
                <span>去除回车</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  removeEscapes();
                  setActiveDropdown(null);
                }}
              >
                <FaEraser />
                <span>去除转义</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. 压缩类 - 下拉菜单 */}
        <div className="dropdown-container">
          <button
            onClick={() => handleDropdownToggle("compress")}
            className="toolbar-button"
            title="压缩选项"
          >
            <FaCompress />
            <span className="dropdown-icon">
              {activeDropdown === "compress" ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </span>
          </button>
          {activeDropdown === "compress" && (
            <div className={`dropdown-menu ${theme}`}>
              <div
                className="dropdown-item"
                onClick={() => {
                  compressAndCopy();
                  setActiveDropdown(null);
                }}
              >
                <FaCopy />
                <span>压缩JSON并复制</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  compressEscapeAndCopy();
                  setActiveDropdown(null);
                }}
              >
                <FaFileCode />
                <span>压缩转义JSON并复制</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. 转换类 - 下拉菜单 */}
        <div className="dropdown-container">
          <button
            onClick={() => handleDropdownToggle("convert")}
            className="toolbar-button"
            title="转换选项"
          >
            <FaFileExport />
            <span className="dropdown-icon">
              {activeDropdown === "convert" ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </span>
          </button>
          {activeDropdown === "convert" && (
            <div className={`dropdown-menu ${theme}`}>
              <div
                className="dropdown-item"
                onClick={() => {
                  convertToYAMLAndCopy();
                  setActiveDropdown(null);
                }}
              >
                <FaFileAlt />
                <span>转换为YAML并复制</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  convertToXMLAndCopy();
                  setActiveDropdown(null);
                }}
              >
                <FaFileAlt />
                <span>转换为XML并复制</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  convertToTypeScriptAndCopy();
                  setActiveDropdown(null);
                }}
              >
                <FaFileCode />
                <span>转换为TypeScript并复制</span>
              </div>
            </div>
          )}
        </div>

        {/* 主题切换按钮 */}
        <button
          onClick={toggleTheme}
          className="toolbar-button theme-toggle-button"
          title={theme === "vs-dark" ? "切换到光亮模式" : "切换到暗黑模式"}
        >
          {theme === "vs-dark" ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </div>
  );
};

export default JSONEditor;
