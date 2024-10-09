import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    axios.post('/api/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        onUploadSuccess();
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        alert('Failed to upload PDF. Please try again.');
      });
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });

  return (
    <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors">
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
      {isDragActive ? (
        <p className="text-lg">Drop the PDF here ...</p>
      ) : (
        <p className="text-lg">Drag & drop a PDF here, or click to select one</p>
      )}
    </div>
  );
};