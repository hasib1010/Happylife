'use client';
// src/components/common/RichTextEditor.js
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import CKEditor to avoid SSR issues
const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

// Also dynamically import the editor build
const ClassicEditor = dynamic(
  () => import('@ckeditor/ckeditor5-build-classic'),
  { ssr: false }
);

const RichTextEditor = ({ content, onChange, onImageUpload }) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);

  // Set editor as loaded once we're on the client side
  useEffect(() => {
    setEditorLoaded(true);
  }, []);

  // Custom image upload adapter
  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file.then(file => {
        return new Promise((resolve, reject) => {
          // Execute the onImageUpload function passed as prop
          onImageUpload(file)
            .then(url => {
              resolve({ default: url });
            })
            .catch(error => {
              reject(error);
            });
        });
      });
    }

    abort() {
      // Abort upload implementation if needed
    }
  }

  // Function to add the upload adapter to the editor
  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  // Configuration for CKEditor
  const editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'blockQuote',
      'insertTable',
      'mediaEmbed',
      'undo',
      'redo',
      '|',
      'alignment',
    ],
    language: {
      // The UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
      ui: 'en',
      // The content language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
      content: 'auto',
    },
    // Enable image upload through the adapter
    extraPlugins: [MyCustomUploadAdapterPlugin],
    // Allow content alignment for RTL support
    alignment: {
      options: ['left', 'right', 'center', 'justify']
    },
  };

  if (!editorLoaded) {
    return (
      <div className="border border-gray-300 rounded-md p-4 min-h-[300px] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        onReady={editor => {
          // You can store the "editor" and use it when needed.
          setEditorInstance(editor);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};

export default RichTextEditor;