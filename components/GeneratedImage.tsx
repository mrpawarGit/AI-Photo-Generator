import React from "react";
import { DownloadIcon, SparklesIcon, MagnifyingGlassIcon } from "./Icons";

interface GeneratedImageProps {
  src: string;
  index: number;
  isSelected: boolean;
  isRemixing: boolean;
  onSelect: () => void;
  onPreview: () => void;
  style?: React.CSSProperties;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({
  src,
  index,
  isSelected,
  onSelect,
  isRemixing,
  onPreview,
  style,
}) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = src;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview();
  };

  const borderClass = isSelected
    ? "ring-4 ring-offset-2 ring-offset-slate-900 ring-cyan-400"
    : "ring-2 ring-transparent";

  // Default sizing classes — makes each generated image larger by default but still responsive.
  // Parent can still override with the `style` prop or by placing this component inside a different layout.
  const sizeClasses = "w-60 sm:w-72 md:w-80 lg:w-96";

  return (
    <div
      className={`relative group ${sizeClasses} aspect-square overflow-hidden rounded-lg shadow-lg transition-all duration-300 animate-reveal ${borderClass} ${
        isRemixing ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={!isRemixing ? onSelect : undefined}
      aria-label={`Select generated image ${index + 1} for refinement`}
      role="button"
      tabIndex={isRemixing ? -1 : 0}
      style={style}
    >
      <img
        src={src}
        alt={`Generated image ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {isRemixing && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-16 w-16 rounded-full border-t-2 border-b-2 border-cyan-400 animate-spin"></div>
            <SparklesIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      )}

      {!isRemixing && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
          <div className="flex justify-end items-center gap-2">
            <button
              onClick={handlePreview}
              className="p-2 bg-black/50 hover:bg-cyan-500/80 backdrop-blur-sm text-white rounded-full transition-all"
              aria-label={`Preview image ${index + 1}`}
            >
              <MagnifyingGlassIcon />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-black/50 hover:bg-cyan-500/80 backdrop-blur-sm text-white rounded-full transition-all"
              aria-label={`Download image ${index + 1}`}
            >
              <DownloadIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedImage;
