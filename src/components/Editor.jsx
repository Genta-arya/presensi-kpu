import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css"; // Menggunakan tema snow (standar)

const Editor = ({ editorContent = "", setEditorContent }) => {
  const [wordCount, setWordCount] = useState(0);

  // Fungsi untuk menangani perubahan teks & menghitung jumlah kata
  const handleChange = (content, delta, source, editor) => {
    setEditorContent(content);

    // Mengambil teks murni tanpa tag HTML untuk menghitung jumlah kata yang akurat
    const text = editor.getText().trim();
    const words = text === "" ? 0 : text.split(/\s+/).length;
    setWordCount(words);
  };

  // Konfigurasi modul (ditambah ordered & bullet list)
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
    ],
  };

  const formats = [
    "bold", 
    "italic", 
    "underline",
    "list",
    "bullet"
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
      {/* Tampilan Penghitung Kata */}
      <div className="editor-footer" style={{ marginTop: "8px", fontSize: "12px", color: "#666", textAlign: "right" }}>
        Jumlah Kata: <strong>{wordCount}</strong>
      </div>
    </div>
  );
};

export default Editor;