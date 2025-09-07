import React, { useState, useCallback } from "react";
import { generateImage } from "./services/geminiService";
import { fileToBase64 } from "./utils/fileUtils";
import ImageUploader from "./components/ImageUploader";
import GeneratedImage from "./components/GeneratedImage";
import Loader from "./components/Loader";
import ImageEditor from "./components/ImageEditor";
import ImagePreviewModal from "./components/ImagePreviewModal";
import { SparklesIcon, XIcon } from "./components/Icons";

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    "A photo of the person transformed into a fantasy elf warrior, with glowing tattoos and silver armor. The background is an enchanted forest at twilight."
  );
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<
    string | null
  >(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [refinePrompt, setRefinePrompt] = useState<string>("");
  const [maskBase64, setMaskBase64] = useState<string | null>(null);
  const [remixingIndex, setRemixingIndex] = useState<number | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setOriginalImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setOriginalImage(null);
      setOriginalImagePreview(null);
    }
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setError(null);
  };

  const handleGenerate = useCallback(async () => {
    if (!originalImage || !prompt) {
      setError("Please upload an image and provide a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setSelectedImageIndex(null);

    try {
      const base64Image = await fileToBase64(originalImage);
      const mimeType = originalImage.type;

      const initialPrompt = `${prompt}. Transform the person in the image to fit this description, including their clothing, pose, and the camera angle. Create a completely new portrait, not just a new background.`;

      const promises = Array(5)
        .fill(0)
        .map(() => generateImage(base64Image, mimeType, initialPrompt));

      const results = await Promise.allSettled(promises);

      const successfulImages = results
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => (result as PromiseFulfilledResult<string>).value);

      if (successfulImages.length === 0) {
        throw new Error(
          "The AI was unable to generate images. Please try a different prompt or image."
        );
      }

      setGeneratedImages(successfulImages);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);

  const handleSelectImage = (index: number) => {
    if (isLoading || remixingIndex !== null) return;
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    } else {
      setSelectedImageIndex(index);
      setRefinePrompt("");
      setMaskBase64(null);
    }
  };

  const handleRecreateSingleImage = async () => {
    if (selectedImageIndex === null || !refinePrompt) {
      setError("Please select an image and provide a refinement prompt.");
      return;
    }

    const sourceImageBase64 = generatedImages[selectedImageIndex];
    const mimeTypeMatch = sourceImageBase64.match(
      /data:(image\/[a-zA-Z]+);base64,/
    );
    if (!mimeTypeMatch) {
      setError("Could not determine image type for recreation.");
      return;
    }
    const mimeType = mimeTypeMatch[1];

    const indexToRecreate = selectedImageIndex;
    setRemixingIndex(indexToRecreate);
    setSelectedImageIndex(null);
    setError(null);

    try {
      let finalPrompt: string;
      if (maskBase64) {
        finalPrompt = `In the masked area, ${refinePrompt.toLowerCase()}. Blend it seamlessly with the rest of the image.`;
      } else {
        finalPrompt = `Refine the entire image based on this description: ${refinePrompt}. Keep the person's identity but adjust the style, clothing, and background as requested.`;
      }

      const newImage = await generateImage(
        sourceImageBase64,
        mimeType,
        finalPrompt,
        maskBase64
      );

      setGeneratedImages((prevImages) => {
        const newImages = [...prevImages];
        newImages[indexToRecreate] = newImage;
        return newImages;
      });

      setRefinePrompt("");
      setMaskBase64(null);
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred during recreation."
      );
    } finally {
      setRemixingIndex(null);
    }
  };

  const handleOpenPreview = (url: string) => {
    if (isLoading || remixingIndex !== null) return;
    setPreviewImageUrl(url);
  };

  const handleClosePreview = () => {
    setPreviewImageUrl(null);
  };

  const isGenerateDisabled =
    !originalImage || !prompt || isLoading || remixingIndex !== null;

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center bg-gradient-to-br from-gray-900 to-gray-800">
      {isLoading && <Loader />}
      {previewImageUrl && (
        <ImagePreviewModal src={previewImageUrl} onClose={handleClosePreview} />
      )}

      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            AI Photo Generator
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Turn your photo into stunning, unique images.
          </p>
        </header>

        <main className="flex flex-col gap-10">
          <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-cyan-300/20">
            <div className="flex flex-col space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  1. Upload Photo
                </label>
                <ImageUploader
                  onImageChange={handleImageChange}
                  preview={originalImagePreview}
                />
              </div>
              <div>
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  2. Describe Your Vision
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A cyberpunk hacker in a neon-lit alley..."
                  rows={3}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors placeholder:text-slate-500 text-slate-200"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 hover-glow"
              >
                <SparklesIcon />
                {isLoading ? "Generating..." : "Generate 5 Images"}
              </button>
              {error && (
                <p className="text-center text-red-400 p-2 bg-red-900/30 rounded-md animate-fade-in">
                  {error}
                </p>
              )}
            </div>
          </div>

          {generatedImages.length > 0 && !isLoading && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-100">
                  Your Results
                </h2>
                <p className="text-slate-300 mt-2">
                  Click an image to refine, preview, or download.
                </p>
              </div>

              {/* Increased spacing between images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {generatedImages.map((imgSrc, index) => (
                  <GeneratedImage
                    key={`${index}-${imgSrc.slice(-10)}`}
                    src={imgSrc}
                    index={index}
                    isSelected={selectedImageIndex === index}
                    isRemixing={remixingIndex === index}
                    onSelect={() => handleSelectImage(index)}
                    onPreview={() => handleOpenPreview(imgSrc)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedImageIndex !== null && (
            <div className="p-6 bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-400/20 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-100">
                  Refine Selected Image
                </h3>
                <button
                  onClick={() => setSelectedImageIndex(null)}
                  className="p-1 rounded-full hover:bg-slate-700 transition-colors"
                  disabled={isLoading || remixingIndex !== null}
                >
                  <XIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ImageEditor
                  src={generatedImages[selectedImageIndex]}
                  onMaskChange={setMaskBase64}
                />
                <div className="flex flex-col space-y-6 justify-center">
                  <div>
                    <label
                      htmlFor="refine-prompt"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      3. Describe your changes
                    </label>
                    <textarea
                      id="refine-prompt"
                      value={refinePrompt}
                      onChange={(e) => setRefinePrompt(e.target.value)}
                      placeholder={
                        maskBase64
                          ? "e.g., add futuristic glasses"
                          : "e.g., Change jacket to blue"
                      }
                      rows={3}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder:text-slate-500 text-slate-200"
                    />
                  </div>
                  <button
                    onClick={handleRecreateSingleImage}
                    disabled={
                      !refinePrompt || isLoading || remixingIndex !== null
                    }
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-4 focus:ring-purple-300/50"
                  >
                    <SparklesIcon />
                    Recreate Image
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
