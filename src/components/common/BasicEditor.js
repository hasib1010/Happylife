// src/components/common/BasicEditor.js
'use client';
import React, { useRef, useEffect } from 'react';

export default function BasicEditor({ content, onChange, onImageUpload }) {
  const editorRef = useRef(null);

  // Initialize the editor with content
  useEffect(() => {
    if (editorRef.current) {
      // Only set the content if it's different to avoid cursor position issues
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '';
      }
      
      // Set the direction to auto to properly handle both LTR and RTL text
      editorRef.current.dir = 'auto';
    }
  }, [content]);

  // Handle changes to the editor content
  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Execute a command on the editor
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      if (!input.files || !input.files[0]) return;
      
      const file = input.files[0];
      
      try {
        // Show upload indicator
        const placeholderId = 'img-' + Date.now();
        executeCommand('insertHTML', `<div id="${placeholderId}" style="padding: 20px; background-color: #f0f0f0; text-align: center; border-radius: 4px; margin: 10px 0;">
          <p>Uploading image...</p>
        </div>`);

        // Upload the image using the provided handler
        const imageUrl = await onImageUpload(file);
        
        // Replace the placeholder with the actual image
        const placeholder = editorRef.current.querySelector(`#${placeholderId}`);
        if (placeholder) {
          placeholder.outerHTML = `<img src="${imageUrl}" alt="Uploaded Image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
          handleInput(); // Make sure we update the content
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
        
        // Remove the placeholder if there was an error
        const placeholder = editorRef.current.querySelector(`#${placeholderId}`);
        if (placeholder) {
          placeholder.remove();
          handleInput();
        }
      }
    };
    
    input.click();
  };

  // Handle creating a link
  const createLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('bold')}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('italic')}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('underline')}
          title="Underline"
        >
          <u>U</u>
        </button>
        <span className="mx-1 border-r border-gray-300"></span>
        
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('formatBlock', '<h1>')}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('formatBlock', '<p>')}
          title="Paragraph"
        >
          P
        </button>
        <span className="mx-1 border-r border-gray-300"></span>
        
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
        >
          1. List
        </button>
        <span className="mx-1 border-r border-gray-300"></span>
        
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('justifyLeft')}
          title="Align Left"
        >
          ←
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('justifyCenter')}
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('justifyRight')}
          title="Align Right"
        >
          →
        </button>
        <span className="mx-1 border-r border-gray-300"></span>
        
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.dir = 'ltr';
              handleInput();
            }
          }}
          title="Left to Right"
        >
          LTR
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.dir = 'rtl';
              handleInput();
            }
          }}
          title="Right to Left"
        >
          RTL
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.dir = 'auto';
              handleInput();
            }
          }}
          title="Auto Direction"
        >
          Auto
        </button>
        <span className="mx-1 border-r border-gray-300"></span>
        
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={createLink}
          title="Insert Link"
        >
          Link
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={handleImageUpload}
          title="Upload Image"
        >
          Image
        </button>
        <span className="mx-1 border-r border-gray-300"></span>
        
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('undo')}
          title="Undo"
        >
          Undo
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => executeCommand('redo')}
          title="Redo"
        >
          Redo
        </button>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        className="p-4 min-h-[400px] focus:outline-none prose prose-sm max-w-none"
        contentEditable="true"
        onInput={handleInput}
        data-placeholder="Start writing your content here..."
        dir="auto"
        style={{ minHeight: '300px' }}
      ></div>
    </div>
  );
}