import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { CustomerDetails, StyleSuggestion, StylePreferences } from '../types';

function getAiClient(): GoogleGenAI {
  // The API key is expected to be available as a pre-configured environment variable.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This error will be caught by the UI and displayed to the user.
    throw new Error("API key not found. Please ensure it is configured in the environment.");
  }
  return new GoogleGenAI({ apiKey });
}

const inspirationPool = {
    "Nigerian": "Ankara prints, Aso-Oke weaving, Adire patterns, Buba/Iro styles, Agbada embroidery.",
    "Middle Eastern": "Abaya silhouettes, Kaftan elegance, intricate embroidery.",
    "East Asian": "Chinese Qipao collars, Japanese Kimono sleeves, Korean Hanbok layering.",
    "European": "Victorian-era corsetry/ruffles, sleek English tailoring, French haute couture draping.",
    "South Asian": "Saree draping, Lehenga skirts, intricate Zari work."
};

export const generateStyle = async (
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  stylePreferences: StylePreferences
): Promise<Omit<StyleSuggestion, 'id'> | null> => {
  const client = getAiClient();
  const textModel = 'gemini-2.5-flash';
  const imageModel = 'gemini-2.5-flash-image';

  try {
    // Step 1: Generate style details (JSON)
    const garmentTypeInstruction = stylePreferences.garmentType === 'Any'
      ? "The output can be a **long gown, a short dress, a skirt and top set, or trousers and a blouse.**"
      : `The output **must be a ${stylePreferences.garmentType}.**`;
      
    const selectedInspirations = ["Nigerian", ...stylePreferences.inspirations];
    const inspirationText = selectedInspirations
        .map(key => `*   **${key}:** ${inspirationPool[key as keyof typeof inspirationPool]}`)
        .join('\n');
        
    const textPrompt = `You are 'Tailora', a world-renowned creative partner for fashion designers, specializing in **cultural fusion design**. Your talent lies in blending traditional styles from different parts of the world to create stunning, unique, and modern garments.

**Your Task:**
Invent a novel fashion style by fusing elements from the following cultural styles: **Nigerian fashion and ${stylePreferences.inspirations.join(' & ')} fashion**.
${garmentTypeInstruction}

**Inspiration Pool (You must use elements from these selected styles):**
${inspirationText}

**Inputs:**
1.  **Fabric Image:** Analyze the provided Nigerian fabric for its pattern, texture, and colors.
2.  **Customer Image:** Use their skin complexion to guide flattering color accents in your description.
3.  **Customer Details:**
    *   Body Size: ${customerDetails.bodySize}
    *   Body Nature/Type: ${customerDetails.bodyNature}

**Instructions:**
1.  **Branding Mandate:** Every design must subtly incorporate an element inspired by the Tailora brand logo's typography. This could be through an embroidery pattern that mimics the elegant serifs of the 'T', a clasp design shaped like the circular dot of the 'i', or a cut that flows like the curves of the 'a' and 'r'. **You must mention how the logo's typography is incorporated in your description.**
2.  **Combine elements creatively** from the selected cultural pools.
3.  Give the style a creative, descriptive name that reflects its fused nature.
4.  **Crucially, every style you generate must be a fresh and random combination within the given constraints.**
5.  Describe the final design in detail. This description will be used to generate a sketch, so be specific about the silhouette, cut, details, and how the fabric is used.

**Output Format:** Your response MUST be a single, valid JSON object with the specified schema.`;

    const fabricImagePart = { inlineData: { data: fabricImageBase64, mimeType: fabricMimeType } };
    const customerImagePart = { inlineData: { data: customerImageBase64, mimeType: customerMimeType } };
    const textPart = { text: textPrompt };

    const textResponse = await client.models.generateContent({
      model: textModel,
      contents: { parts: [fabricImagePart, customerImagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleName: { type: Type.STRING, description: "A creative, descriptive name for the fused style." },
            description: { type: Type.STRING, description: "A detailed description of the garment, including silhouette, cut, how the fabric is used, and how the Tailora brand logo is incorporated. This will be used to generate a sketch." },
            occasions: { type: Type.STRING, description: "Suitable occasions for wearing this style." },
          },
          required: ["styleName", "description", "occasions"],
        },
      },
    });

    const styleDetails = JSON.parse(textResponse.text);

    if (!styleDetails?.description) {
        console.error("Failed to generate valid style details from text model.", textResponse.text);
        return null;
    }

    // Step 2: Generate fashion sketch based on the description
    const imagePrompt = `Generate a professional fashion sketch of a model wearing the outfit described below.
- The model should have a complexion similar to the one in the customer photo.
- The model **must be wearing a stylish turban (headwrap)** made from the same fabric as the outfit.
- The outfit in the sketch MUST be made from the provided fabric pattern.
- Pay special attention to the part of the description that mentions the integration of the **Tailora brand logo's typography** and ensure it is visually represented in the sketch.

**Style Description:**
${styleDetails.description}`;

    const imageTextPart = { text: imagePrompt };

    const imageResponse = await client.models.generateContent({
      model: imageModel,
      contents: { parts: [fabricImagePart, customerImagePart, imageTextPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    let sketchUrl: string | null = null;
    const parts = imageResponse.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const { mimeType, data } = part.inlineData;
        sketchUrl = `data:${mimeType};base64,${data}`;
        break;
      }
    }

    if (!sketchUrl) {
      console.error("Failed to generate sketch from image model.");
      return null;
    }
    
    return { ...styleDetails, sketchUrl };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
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
  const textModel = 'gemini-2.5-flash';
  const imageModel = 'gemini-2.5-flash-image';

  try {
    // Step 1: Refine style details (JSON)
    const textPrompt = `You are 'Tailora', a fashion design assistant.

**Your Task:**
Refine a previous design based on user feedback and provide updated details.

**Previous Design:**
*   **Name:** ${previousSuggestion.styleName}
*   **Description:** ${previousSuggestion.description}

**User's Refinement Request:**
"${refinementPrompt}"

**Contextual Inputs:**
1.  **Fabric Image:** The fabric for the design.
2.  **Customer Image:** The customer who will wear the design.
3.  **Customer Details:**
    *   Body Size: ${customerDetails.bodySize}
    *   Body Nature/Type: ${customerDetails.bodyNature}

**Instructions:**
1.  **Branding Mandate:** Ensure the refined design still subtly incorporates an element inspired by the Tailora brand logo's typography (e.g., elegant serifs, letter curves).
2.  **Modify the previous design's description** according to the user's request. Do not create a completely new design.
3.  Update the style name to reflect the changes (e.g., "Embroidered [Original Name]").
4.  Keep the "occasions" suitable for the modified design.

**Output Format:** Your response MUST be a single, valid JSON object with the specified schema.`;

    const fabricImagePart = { inlineData: { data: fabricImageBase64, mimeType: fabricMimeType } };
    const customerImagePart = { inlineData: { data: customerImageBase64, mimeType: customerMimeType } };
    const textPart = { text: textPrompt };

    const textResponse = await client.models.generateContent({
      model: textModel,
      contents: { parts: [fabricImagePart, customerImagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleName: { type: Type.STRING, description: "The updated creative name for the refined style." },
            description: { type: Type.STRING, description: "The updated detailed description of the refined garment, including the brand element. This will be used to generate a new sketch." },
            occasions: { type: Type.STRING, description: "Suitable occasions for the refined style." },
          },
          required: ["styleName", "description", "occasions"],
        },
      },
    });

    const styleDetails = JSON.parse(textResponse.text);

    if (!styleDetails?.description) {
      console.error("Failed to generate valid refined style details from text model.", textResponse.text);
      return null;
    }

    // Step 2: Generate new fashion sketch
    const imagePrompt = `Generate a new professional fashion sketch of a model wearing the refined outfit described below.
- The model should have a complexion similar to the one in the customer photo.
- The model **must be wearing a stylish turban (headwrap)** made from the same fabric as the outfit.
- The outfit in the sketch MUST be made from the provided fabric pattern.
- Pay special attention to the part of the description that mentions the integration of the **Tailora brand logo's typography** and ensure it is visually represented in the sketch.

**Refined Style Description:**
${styleDetails.description}`;

    const imageTextPart = { text: imagePrompt };

    const imageResponse = await client.models.generateContent({
      model: imageModel,
      contents: { parts: [fabricImagePart, customerImagePart, imageTextPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    let sketchUrl: string | null = null;
    const parts = imageResponse.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const { mimeType, data } = part.inlineData;
        sketchUrl = `data:${mimeType};base64,${data}`;
        break;
      }
    }

    if (!sketchUrl) {
      console.error("Failed to generate refined sketch from image model.");
      return null;
    }
    
    return { ...styleDetails, sketchUrl };

  } catch (error) {
    console.error("Error calling Gemini API for refinement:", error);
    throw error;
  }
};