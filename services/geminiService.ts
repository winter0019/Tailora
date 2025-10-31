
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { CustomerDetails, StyleSuggestion, StylePreferences } from '../types';

let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!ai) {
    // The API key is now injected directly into the bundle at build time.
    // If it's undefined, it means the build environment was not configured correctly.
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY was not provided at build time. Please configure it in your deployment settings.");
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}


// This function now generates one style at a time to ensure higher quality and easier parsing.
// It will be called multiple times in parallel from the frontend.
export const generateStyle = async (
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  stylePreferences: StylePreferences
): Promise<StyleSuggestion | null> => {
  const client = getAiClient();

  const garmentTypeInstruction = stylePreferences.garmentType === 'Any'
    ? "The output can be a **long gown, a short dress, a skirt and top set, or trousers and a blouse.**"
    : `The output **must be a ${stylePreferences.garmentType}.**`;
    
  const inspirationPool = {
    "Nigerian": "Ankara prints, Aso-Oke weaving, Adire patterns, Buba/Iro styles, Agbada embroidery.",
    "Middle Eastern": "Abaya silhouettes, Kaftan elegance, intricate embroidery.",
    "East Asian": "Chinese Qipao collars, Japanese Kimono sleeves, Korean Hanbok layering.",
    "European": "Victorian-era corsetry/ruffles, sleek English tailoring, French haute couture draping.",
    "South Asian": "Saree draping, Lehenga skirts, intricate Zari work."
  };
  
  const selectedInspirations = ["Nigerian", ...stylePreferences.inspirations];
  const inspirationText = selectedInspirations
      .map(key => `*   **${key}:** ${inspirationPool[key as keyof typeof inspirationPool]}`)
      .join('\n');

  // Simplified prompt, relying on API config for output structure.
  const prompt = `You are 'Tailora', a world-renowned creative partner for fashion designers, specializing in **cultural fusion design**. Your talent lies in blending traditional styles from different parts of the world to create stunning, unique, and modern garments.

**Your Task:**
Invent a novel fashion style by fusing elements from the following cultural styles: **Nigerian fashion and ${stylePreferences.inspirations.join(' & ')} fashion**.
${garmentTypeInstruction}

**Inspiration Pool (You must use elements from these selected styles):**
${inspirationText}

**Inputs:**
1.  **Fabric Image:** The provided Nigerian fabric. This must be the centerpiece of the design.
2.  **Customer Image:** Use their skin complexion to guide flattering color accents.
3.  **Customer Details:**
    *   Body Size: ${customerDetails.bodySize}
    *   Body Nature/Type: ${customerDetails.bodyNature}

**Instructions:**
1.  **Combine elements creatively** from the selected cultural pools.
2.  Give the style a creative, descriptive name that reflects its fused nature.
3.  **Crucially, every style you generate must be a fresh and random combination within the given constraints.**
4.  Based on your design, provide the style details and generate a professional fashion sketch. The sketch should be on a model with a complexion similar to the customer's, clearly showing the fabric's design.`;

  const fabricImagePart = {
    inlineData: { data: fabricImageBase64, mimeType: fabricMimeType },
  };
  const customerImagePart = {
    inlineData: { data: customerImageBase64, mimeType: customerMimeType },
  };
  const textPart = { text: prompt };

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [fabricImagePart, customerImagePart, textPart] },
      config: {
        temperature: 0.9,
        topP: 0.95,
        responseModalities: [Modality.IMAGE],
        // Use response schema for reliable JSON output in the text part
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleName: { type: Type.STRING, description: "A creative, descriptive name that reflects the style's fused nature (e.g., 'Ankara-Kimono Fusion Jumpsuit')." },
            description: { type: Type.STRING, description: "A detailed description of the style, highlighting the fused cultural elements." },
            occasions: { type: Type.STRING, description: "A list of suitable occasions for wearing this outfit (e.g., 'Weddings, formal events, evening parties')." },
          },
          required: ["styleName", "description", "occasions"],
        },
      }
    });
    
    let styleDetails: Omit<StyleSuggestion, 'sketchUrl'> | null = null;
    let sketchUrl: string | null = null;

    // 1. Extract and parse the JSON from the dedicated 'text' property
    const jsonText = response.text;
    if (jsonText) {
      try {
        styleDetails = JSON.parse(jsonText);
      } catch (e) {
        console.warn("Invalid JSON received from API:", jsonText, e);
      }
    }

    // 2. Extract the image from the response parts
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const { mimeType, data } = part.inlineData;
        sketchUrl = `data:${mimeType};base64,${data}`;
        break; // Assume only one image is returned
      }
    }

    if (styleDetails && sketchUrl) {
      return { ...styleDetails, sketchUrl };
    }

    // If we reach here, something was missing. Log for debugging.
    console.error("Failed to extract both style details and sketch from API response", {
        hasJson: !!styleDetails,
        hasImage: !!sketchUrl,
        rawResponseText: jsonText,
    });
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate styles from the API. The API call failed.");
  }
};