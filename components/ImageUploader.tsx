import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  preview: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, preview }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageChange(e.dataTransfer.files[0]);
    }
  }, [onImageChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  return (
    <label
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
        isDragging ? 'border-cyan-400 bg-cyan-500/20' : 'border-slate-700 bg-transparent hover:bg-cyan-500/10 hover:border-cyan-500'
      }`}
    >
      {preview ? (
        <img src={preview} alt="Preview" className="object-contain w-full h-full rounded-lg p-2" />
      ) : (
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
          <UploadIcon />
          <p className="mb-2 text-sm"><span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop</p>
          <p className="text-xs">PNG, JPG, or WEBP</p>
        </div>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </label>
  );
};

export default ImageUploader;