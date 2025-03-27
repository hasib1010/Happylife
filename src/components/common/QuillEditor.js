// src/components/common/QuillEditor.js
'use client';
import React, { useEffect, useState, useRef } from 'react';  // Add React import here
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-md p-4 min-h-[300px] bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Loading editor...</p>
      </div>
    </div>
  ),
});

// Import Quill styles in the client-side only
const QuillNoSSRWrapper = ({ forwardedRef, ...props }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Import Quill styles
    import('react-quill/dist/quill.snow.css');
  }, []);
  
  if (!mounted) return null;
  
  return <ReactQuill ref={forwardedRef} {...props} />;
};

const QuillEditor = ({ content, onChange, onImageUpload }) => {
  const quillRef = useRef(null);  // Use useRef directly since we've imported it above
  
  // Toolbar options
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'direction': 'rtl' }],  // RTL support
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        'image': handleImageUpload
      }
    }
  };

  // Image upload handler
  function handleImageUpload() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      
      try {
        const url = await onImageUpload(file);
        
        // Get the Quill editor instance
        const editor = quillRef.current.getEditor();
        
        // Get current cursor position
        const range = editor.getSelection(true);
        
        // Insert the image at the current cursor position
        editor.insertEmbed(range.index, 'image', url);
        
        // Move cursor after the image
        editor.setSelection(range.index + 1);
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
  }

  return (
    <div className="bg-white">
      <QuillNoSSRWrapper
        forwardedRef={quillRef}
        value={content}
        onChange={onChange}
        modules={modules}
        placeholder="Write your content here..."
        theme="snow"
        className="min-h-[300px]"
      />
    </div>
  );
};

export default QuillEditor;