import React from "react";
import DOMPurify from "dompurify";

import FroalaEditor from "react-froala-wysiwyg";
import "froala-editor/js/plugins.pkgd.min.js";
import "froala-editor/css/froala_editor.pkgd.min.css";
const Editor = ({ editorContent = "", setEditorContent }) => {
  
  const handleModelChange = (content) => {
    setEditorContent(content);
  };

  return (
    <FroalaEditor
      model={editorContent}
      onModelChange={handleModelChange}
      config={{
        toolbarButtons: ["bold", "italic", "underline"],
        events: {
          "froalaEditor.initialized": function () {
            console.log("Froala Editor initialized");
          },
          "froalaEditor.contentChanged": function () {
            console.log("Content changed");
          },
          "froalaEditor.focus": function () {
            console.log("Editor focused");
          },
          "froalaEditor.blur": function () {
            console.log("Editor blurred");
          },
          // 'image.beforeUpload': function (files) {
          //   return false; // Mencegah upload gambar
          // },
          // 'image.inserted': function ($img, response) {
          //   $img.remove(); // Menghapus gambar yang sudah dimasukkan
          // },
        },
        imageUpload: false,
        imageManagerUpload: false,
        videoUpload: false,
        videoManagerUpload: false,
      }}
    />
  );
};

export default Editor;
