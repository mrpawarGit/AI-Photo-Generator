import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushIcon, TrashIcon } from './Icons';

interface ImageEditorProps {
  src: string;
  onMaskChange: (maskDataUrl: string | null) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ src, onMaskChange }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const [brushSize, setBrushSize] = useState(40);
  const [hasDrawing, setHasDrawing] = useState(false);

  const setCanvasDimensions = useCallback(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (image && canvas) {
      canvas.width = image.clientWidth;
      canvas.height = image.clientHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setHasDrawing(false);
      onMaskChange(null);
    }
  }, [onMaskChange]);

  useEffect(() => {
    clearCanvas();
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, setCanvasDimensions]);

  const getCoordinates = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
        return null;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };
  
  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const coords = getCoordinates(e);

    if (ctx && coords) {
      ctx.beginPath();
      if (lastPosRef.current) {
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      } else {
        ctx.moveTo(coords.x, coords.y);
      }
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastPosRef.current = coords;
    }
  }, [brushSize]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDrawingRef.current = true;
    lastPosRef.current = getCoordinates(e.nativeEvent);
    draw(e.nativeEvent);
  }, [draw]);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
          const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
          const hasContent = pixelBuffer.some(color => color !== 0);
          setHasDrawing(hasContent);
          if (hasContent) {
              onMaskChange(canvas.toDataURL('image/png'));
          } else {
              onMaskChange(null);
          }
      }
    }
  }, [onMaskChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawing(false);
      onMaskChange(null);
    }
  }, [onMaskChange]);
  
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (e instanceof TouchEvent) {
      e.preventDefault();
    }
    draw(e);
  }, [draw]);

  const pencilCursorStyle = {
    cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"></path></svg>') 4 20, auto",
  };

  return (
    <div className="flex flex-col space-y-4">
        <p className="text-sm text-slate-400">Optional: Brush over the area you want to change.</p>
        <div 
          className="relative w-full aspect-square rounded-lg overflow-hidden select-none touch-none bg-slate-900/80 border border-slate-700"
          onMouseMove={(e) => handleMove(e.nativeEvent)}
          onTouchMove={(e) => handleMove(e.nativeEvent)}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
        >
            <img 
                ref={imageRef} 
                src={src} 
                alt="Selected for refinement" 
                className="w-full h-full object-cover" 
                onLoad={setCanvasDimensions}
                draggable="false"
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                style={pencilCursorStyle}
            />
        </div>
        <div className="flex items-center justify-between gap-4 p-2 bg-slate-900/80 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 flex-grow">
                <BrushIcon className="w-5 h-5 text-slate-400" />
                <input
                    type="range"
                    min="10"
                    max="100"
                    step="2"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    aria-label="Brush size"
                />
            </div>
            <button
                onClick={clearCanvas}
                disabled={!hasDrawing}
                className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                aria-label="Clear mask"
            >
                <TrashIcon className="w-5 h-5" />
                Clear
            </button>
        </div>
    </div>
  );
};

export default ImageEditor;