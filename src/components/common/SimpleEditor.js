// src/components/common/SimpleEditor.js
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
);

// Import EditorState and other required components from draft-js
const { EditorState, ContentState, convertToRaw, convertFromHTML } = dynamic(
  () => import('draft-js'),
  { ssr: false }
);

// Also dynamically import the css
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const SimpleEditor = ({ content, onChange, onImageUpload }) => {
  const [editorState, setEditorState] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize editor with content if available
    if (content && mounted) {
      const blocksFromHTML = convertFromHTML(content);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      setEditorState(EditorState.createWithContent(contentState));
    } else {
      setEditorState(EditorState.createEmpty());
    }
  }, [content, mounted]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    
    // Convert to HTML and call the onChange handler
    const contentState = state.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    const html = draftToHtml(rawContentState);
    onChange(html);
  };

  const uploadImageCallback = async (file) => {
    try {
      const url = await onImageUpload(file);
      return { data: { link: url } };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { error: 'Failed to upload image' };
    }
  };

  if (!mounted || !editorState) {
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
    <div className="border border-gray-300 rounded">
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        wrapperClassName="demo-wrapper"
        editorClassName="demo-editor"
        toolbar={{
          options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
          textAlign: { 
            inDropdown: false,
            options: ['left', 'center', 'right', 'justify'],
          },
          image: {
            uploadCallback: uploadImageCallback,
            previewImage: true,
            alt: { present: true, mandatory: false },
            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
          },
        }}
      />
    </div>
  );
};

export default SimpleEditor;