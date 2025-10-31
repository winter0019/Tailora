import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { CustomerDetails, StyleSuggestion } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// This function now generates one style at a time to ensure higher quality and easier parsing.
// It will be called multiple times in parallel from the frontend.
export const generateStyle = async (
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails
): Promise<StyleSuggestion | null> => {
  // Simplified prompt, relying on API config for output structure.
  const prompt = `You are a world-renowned, avant-garde fashion AI specializing in **cultural fusion design**. Your talent lies in blending traditional styles from different parts of the world to create stunning, unique, and modern garments.

**Your Task:**
Invent a novel fashion style by fusing elements from **at least two different cultural styles**, one of which must be traditional Nigerian fashion. The output can be a **long gown, a short dress, a skirt and top set, or trousers and a blouse.**

**Inspiration Pool (select from these at random):**
*   **Nigerian:** Ankara prints, Aso-Oke weaving, Adire patterns, Buba/Iro styles, Agbada embroidery.
*   **Middle Eastern:** Abaya silhouettes, Kaftan elegance, intricate embroidery.
*   **East Asian:** Chinese Qipao collars, Japanese Kimono sleeves, Korean Hanbok layering.
*   **European:** Victorian-era corsetry/ruffles, sleek English tailoring, French haute couture draping.
*   **South Asian:** Saree draping, Lehenga skirts, intricate Zari work.

**Inputs:**
1.  **Fabric Image:** The provided Nigerian fabric. This must be the centerpiece of the design.
2.  **Customer Image:** Use their skin complexion to guide flattering color accents.
3.  **Customer Details:**
    *   Body Size: ${customerDetails.bodySize}
    *   Body Nature/Type: ${customerDetails.bodyNature}

**Instructions:**
1.  **Randomly select a Nigerian style element and at least one element from another cultural pool.**
2.  **Vary the garment type and length.** Create a mix of long dresses, short dresses, two-piece outfits, and jumpsuits.
3.  **Combine them creatively.** (e.g., an Ankara print short dress with Kimono sleeves).
4.  Give the style a creative, descriptive name that reflects its fused nature.
5.  **Crucially, every style you generate must be a fresh and random combination.**
6.  Based on your design, provide the style details and generate a professional fashion sketch. The sketch should be on a model with a complexion similar to the customer's, clearly showing the fabric's design.`;

  const fabricImagePart = {
    inlineData: { data: fabricImageBase64, mimeType: fabricMimeType },
  };
  const customerImagePart = {
    inlineData: { data: customerImageBase64, mimeType: customerMimeType },
  };
  const textPart = { text: prompt };

  try {
    const response = await ai.models.generateContent({
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