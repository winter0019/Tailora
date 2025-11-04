import axios from "axios";
import type { CustomerDetails, StyleSuggestion, StylePreferences } from "../types";

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

export async function generateStyle(
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  stylePreferences: StylePreferences
): Promise<Omit<StyleSuggestion, 'id'> | null> {
  const textDescription = `
  Design a fashion outfit combining ${stylePreferences.inspirations.join(", ")} and Nigerian cultural aesthetics.
  Body type: ${customerDetails.bodyNature}. Size: ${customerDetails.bodySize}.
  Include elegant gold accents and logo-inspired typography lines.
  `;

  const response = await axios.post(
    "https://api.stability.ai/v2beta/stable-image/generate/sd3",
    { prompt: textDescription, output_format: "base64" },
    { headers: { Authorization: `Bearer ${STABILITY_API_KEY}`, "Content-Type": "application/json" } }
  );

  return {
    styleName: "Fusion Design",
    description: textDescription,
    occasions: "Cultural, formal, casual",
    sketchUrl: `data:image/png;base64,${response.data.image}`
  };
}

export const refineStyle = generateStyle;
