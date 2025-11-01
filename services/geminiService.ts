import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import type { CustomerDetails, StyleSuggestion, StylePreferences } from '../types';

let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!ai) {
    // The API key is expected to be available as a pre-configured environment variable.
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set. Please configure it in your deployment settings.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

const inspirationPool = {
    "Nigerian": "Ankara prints, Aso-Oke weaving, Adire patterns, Buba/Iro styles, Agbada embroidery.",
    "Middle Eastern": "Abaya silhouettes, Kaftan elegance, intricate embroidery.",
    "East Asian": "Chinese Qipao collars, Japanese Kimono sleeves, Korean Hanbok layering.",
    "European": "Victorian-era corsetry/ruffles, sleek English tailoring, French haute couture draping.",
    "South Asian": "Saree draping, Lehenga skirts, intricate Zari work."
};

const parseApiResponse = (response: GenerateContentResponse): { styleDetails: Omit<StyleSuggestion, 'sketchUrl' | 'id'> | null, sketchUrl: string | null } => {
    let styleDetails = null;
    let sketchUrl = null;

    const jsonText = response.text;
    if (jsonText) {
      try {
        const cleanedJsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        styleDetails = JSON.parse(cleanedJsonText);
      } catch (e) {
        console.warn("Invalid JSON received from API:", jsonText, e);
      }
    }

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const { mimeType, data } = part.inlineData;
        sketchUrl = `data:${mimeType};base64,${data}`;
        break;
      }
    }

    return { styleDetails, sketchUrl };
}

export const generateStyle = async (
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  stylePreferences: StylePreferences
): Promise<Omit<StyleSuggestion, 'id'> | null> => {
  const client = getAiClient();

  const garmentTypeInstruction = stylePreferences.garmentType === 'Any'
    ? "The output can be a **long gown, a short dress, a skirt and top set, or trousers and a blouse.**"
    : `The output **must be a ${stylePreferences.garmentType}.**`;
    
  const selectedInspirations = ["Nigerian", ...stylePreferences.inspirations];
  const inspirationText = selectedInspirations
      .map(key => `*   **${key}:** ${inspirationPool[key as keyof typeof inspirationPool]}`)
      .join('\n');
      
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
4.  Based on your design, provide the style details and generate a professional fashion sketch. The sketch should be on a model with a complexion similar to the customer's, clearly showing the fabric's design.

**Output Format:** Your text response MUST be a single, valid JSON object containing three keys: "styleName", "description", and "occasions". Do not include any other text or markdown formatting like \`\`\`json.`;

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
        responseModalities: [Modality.IMAGE],
      }
    });
    
    const { styleDetails, sketchUrl } = parseApiResponse(response);

    if (styleDetails && sketchUrl) {
      return { ...styleDetails, sketchUrl };
    }

    console.error("Failed to extract both style details and sketch from API response", {
        hasJson: !!styleDetails,
        hasImage: !!sketchUrl,
        rawResponseText: response.text,
    });
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate styles from the API. The API call failed.");
  }
};


export const refineStyle = async (
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  previousSuggestion: StyleSuggestion,
  refinementPrompt: string
): Promise<Omit<StyleSuggestion, 'id'> | null> => {
  const client = getAiClient();

  const prompt = `You are 'Tailora', a fashion design assistant.

**Your Task:**
You are refining a previous design based on user feedback.

**Previous Design:**
*   **Name:** ${previousSuggestion.styleName}
*   **Description:** ${previousSuggestion.description}

**User's Refinement Request:**
"${refinementPrompt}"

**Inputs (use these as context):**
1.  **Fabric Image:** The provided Nigerian fabric. This is the same fabric as the original design.
2.  **Customer Image:** Use their skin complexion for color guidance.
3.  **Customer Details:**
    *   Body Size: ${customerDetails.bodySize}
    *   Body Nature/Type: ${customerDetails.bodyNature}

**Instructions:**
1.  **Modify the previous design** according to the user's request. Do not create a completely new design.
2.  Update the style name and description to reflect the changes. For example, if adding embroidery, the name could become "Embroidered [Original Name]".
3.  Generate a new professional fashion sketch showing the refined design. The model should have a similar complexion to the customer, and the sketch must feature the provided fabric.

**Output Format:** Your text response MUST be a single, valid JSON object containing "styleName", "description", and "occasions". Do not include any other text or markdown formatting like \`\`\`json.`;

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
        responseModalities: [Modality.IMAGE],
      }
    });

    const { styleDetails, sketchUrl } = parseApiResponse(response);

    if (styleDetails && sketchUrl) {
      return { ...styleDetails, sketchUrl };
    }

    console.error("Failed to extract both style details and sketch from refinement API response", {
        hasJson: !!styleDetails,
        hasImage: !!sketchUrl,
        rawResponseText: response.text,
    });
    return null;

  } catch (error) {
    console.error("Error calling Gemini API for refinement:", error);
    throw new Error("Failed to refine the style from the API. The API call failed.");
  }
};