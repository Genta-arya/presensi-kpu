import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css"; // Menggunakan tema snow (standar)

const Editor = ({ editorContent = "", setEditorContent }) => {
  
  // Fungsi untuk menangani perubahan teks
  const handleChange = (content) => {
    setEditorContent(content);
  };

  // Konfigurasi modul dan toolbar (hanya bold, italic, underline)
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
    ],
  };

  const formats = [
    "bold", 
    "italic", 
    "underline"
  ];

  return (
    <div className="editor-container">
      <ReactQuill
        theme="snow"
        value={editorContent}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="Tulis sesuatu di sini..."
      />
    </div>
  );
};

export default Editor;