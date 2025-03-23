import React, { useRef, useState } from "react";
import JSONEditor from "./components/JsonEditor";

function App() {
  const [editorContent, setEditorContent] = useState("{\n\t\n}");

  return (
    <div className="App">
      <JSONEditor content={editorContent} onContentChange={setEditorContent} />
    </div>
  );
}

export default App;
