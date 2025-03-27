'use client';
// src/components/common/ImageUploader.js
import { useState } from 'react';

export default function ImageUploader({ 
  value, 
  onChange, 
  folder = 'uploads',
  className = '',
  aspectRatio = '1:1',
  maxSizeMB = 5,
  previewSize = 'medium' // small, medium, large
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Calculate dimensions based on preview size
  const getDimensions = () => {
    switch (previewSize) {
      case 'small':
        return { width: 80, height: aspectRatio === '1:1' ? 80 : 60 };
      case 'large':
        return { width: 240, height: aspectRatio === '1:1' ? 240 : 180 };
      case 'medium':
      default:
        return { width: 160, height: aspectRatio === '1:1' ? 160 : 120 };
    }
  };

  const { width, height } = getDimensions();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setError(null);
    setUploadProgress(0);
    
    // Check file size (in MB)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image size should be less than ${maxSizeMB}MB`);
      return;
    }

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      // Setup the progress event
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Setup the completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          onChange(response.fileUrl);
          setIsUploading(false);
        } else {
          throw new Error('Upload failed');
        }
      });

      // Setup error handling
      xhr.addEventListener('error', () => {
        setError('Upload failed. Please try again.');
        setIsUploading(false);
      });

      // Open and send the request
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      const response = await fetch('/api/delete-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Update the form state
      onChange('');
      setError(null);
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image. Please try again.');
    }
  };

  return (
    <div className={`${className}`}>
      {error && (
        <div className="mb-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-start space-x-4">
        {/* Image preview or placeholder */}
        {isUploading ? (
          <div 
            className="flex-shrink-0 relative border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50"
            style={{ width, height }}
          >
            <div className="text-center p-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{uploadProgress}%</p>
            </div>
          </div>
        ) : value ? (
          <div className="flex-shrink-0 relative" style={{ width, height }}>
            <img 
              src={value} 
              alt="Uploaded image" 
              className="h-full w-full object-cover rounded-md border border-gray-300"
              style={{ width, height }}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100 border border-gray-200"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div 
            className="flex-shrink-0 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50"
            style={{ width, height }}
          >
            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Upload controls */}
        <div className="space-y-1">
          <label
            htmlFor="file-upload"
            className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-medium text-blue-600 shadow-sm hover:text-blue-500 border border-gray-300"
          >
            {value ? 'Change Image' : 'Upload Image'}
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="sr-only"
          />
          <p className="text-xs text-gray-500">
            JPG, PNG, GIF up to {maxSizeMB}MB
          </p>
          {isUploading && (
            <p className="text-xs text-blue-600">Uploading... {uploadProgress}%</p>
          )}
        </div>
      </div>
    </div>
  );
}