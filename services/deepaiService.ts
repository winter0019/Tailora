export async function generateStyle(...args: any[]) {
  const [fabricImageBase64, fabricMimeType, customerImageBase64, customerMimeType, customerDetails, stylePreferences] = args;

  const formData = new FormData();
  formData.append("image", `data:${fabricMimeType};base64,${fabricImageBase64}`);
  formData.append("text", `Create ${stylePreferences.garmentType} inspired by ${stylePreferences.inspirations.join(", ")} for ${customerDetails.bodyNature}`);

  const res = await fetch("https://api.deepai.org/api/text2img", {
    method: "POST",
    headers: { "api-key": import.meta.env.VITE_DEEPAI_KEY },
    body: formData,
  });

  const data = await res.json();
  if (!data.output_url) throw new Error("DeepAI failed to generate image");

  return {
    imageUrl: data.output_url,
    description: "Generated with DeepAI fallback",
  };
}

export async function refineStyle(...args: any[]) {
  return generateStyle(...args);
}
