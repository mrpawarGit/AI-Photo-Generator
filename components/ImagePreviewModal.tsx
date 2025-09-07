import React, { useEffect } from 'react';
import { XIcon } from './Icons';

interface ImagePreviewModalProps {
  src: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ src, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full transition-colors z-10"
        aria-label="Close preview"
      >
        <XIcon className="w-8 h-8" />
      </button>
      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" 
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Full-size preview"
          className="object-contain w-auto h-auto max-w-full max-h-full rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
