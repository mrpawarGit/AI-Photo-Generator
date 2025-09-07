import { GoogleGenAI, Modality } from "@google/genai";

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates an image using the Gemini API.
 * @param base64Image The base64 encoded string of the source image, can be a data URL.
 * @param mimeType The MIME type of the source image (e.g., 'image/jpeg').
 * @param prompt The text prompt describing the desired transformation.
 * @param maskBase64 Optional base64 encoded string of the mask image for inpainting.
 * @returns A promise that resolves to the base64 string of the generated image.
 */
export const generateImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  maskBase64?: string | null
): Promise<string> => {
  try {
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const parts = [
      {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      },
      {
        text: prompt,
      },
    ];

    if (maskBase64) {
      const maskData = maskBase64.split(',')[1];
      parts.push({
        inlineData: {
          data: maskData,
          mimeType: 'image/png', // Masks are sent as PNG
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        // Must include both Modality.IMAGE and Modality.TEXT for this model
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let generatedImageData: string | null = null;
    let textResponse = '';

    const contentParts = response.candidates?.[0]?.content?.parts;
    if (contentParts) {
      for (const part of contentParts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const imageMimeType = part.inlineData.mimeType;
          generatedImageData = `data:${imageMimeType};base64,${base64Data}`;
          break; // Stop after finding the first image
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (generatedImageData) {
      return generatedImageData;
    } else {
      const errorMessage = textResponse.toLowerCase().includes('policy')
          ? 'Generation failed. The prompt may have violated content policies. Please try again with a different prompt.'
          : textResponse || 'No image was generated. The model may have refused the request.';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error generating image with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("Failed to generate image due to an unknown error.");
  }
};