import React, { useEffect } from "react";
import { XIcon } from "./Icons";

interface ImagePreviewModalProps {
  src: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  src,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end w-full mb-2">
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full transition-colors z-10 hover:bg-white/10"
            aria-label="Close preview"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden w-full h-full flex items-center justify-center p-2">
          <img
            src={src}
            alt="Full-size preview"
            className="object-contain w-auto h-auto max-w-full max-h-[70vh] rounded-lg"
          />
        </div>

        <div className="mt-4 text-sm text-gray-300">
          Click anywhere outside the image to close
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
