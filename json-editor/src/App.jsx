import { useState } from "react";
import JsonEditor from "./components/JsonEditor";
import HistorySidebar from "./components/HistorySidebar";
import "./App.css";

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };
  return (
    <div className="App">
      <div className="main-container">
        <HistorySidebar
          className="HistorySidebar"
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <JsonEditor
          className="JsonEditor"
          content={editorContent}
          onContentChange={handleEditorChange}
        />
      </div>
    </div>
  );
}

export default App;
