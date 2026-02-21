
import { GoogleGenAI } from "@google/genai";

export interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  async enhancePrompt(basePrompt: string, category: string, imagePart?: ImagePart): Promise<string> {
    const model = 'gemini-3-flash-preview';
    
    const systemInstruction = `You are "Promptiva Vision Core", an elite prompt engineer and visual analysis expert.
    Your task is to synthesize a high-level image generation prompt based on the user's concept and provided visual references.
    
    TECHNICAL CAPABILITIES:
    1. You understand images of any format (PNG, JPG, HEIC, BMP, GIF, SVG).
    2. If an image is provided, analyze composition, color palette, artistic style, and technical details to incorporate them into the final prompt.
    3. Current category: ${category}.
    
    SYNTHESIS RULES:
    - You MUST provide the prompt in TWO languages.
    - First, provide the Brazilian Portuguese (PT-BR) version.
    - Second, provide the highly optimized English version (which works best for AI image generators).
    - Use professional terminology (cinematography, 3D rendering, brushwork styles, etc.).
    - For logos: focus on vectors, minimalism, and geometric precision.
    - For realism: focus on camera specs (lens, aperture, lighting).
    - Format the output clearly with "**Prompt em Português:**" and "**English Prompt:**".`;

    try {
      const parts: any[] = [{ text: `Conceito base: "${basePrompt}"` }];
      if (imagePart) {
        parts.push(imagePart);
        parts.push({ text: "Analise esta referência visual e integre seus elementos estilísticos ao prompt de forma aprimorada." });
      }

      const response = await this.ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return response.text || basePrompt;
    } catch (error) {
      console.error("Erro no Gemini:", error);
      return basePrompt;
    }
  }

  async generateImage(prompt: string, images?: ImagePart[]): Promise<string | null> {
    try {
      const parts: any[] = [{ text: prompt }];
      if (images && images.length > 0) {
        parts.push(...images);
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
