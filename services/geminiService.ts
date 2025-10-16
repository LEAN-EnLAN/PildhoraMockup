import { GoogleGenAI } from "@google/genai";

export const generateSimpleInstructions = async (medicationName: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `Genera instrucciones extremadamente simples para que un adulto mayor tome "${medicationName}".
        Sé breve y directo. Usa un máximo de 3 pasos muy cortos. No uses markdown ni saludos.
        
        Ejemplo para "Aspirina":
        
        1. Tomar con un vaso de agua.
        2. Hacerlo después de comer.
        3. Solo una pastilla al día.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Hubo un error al generar las instrucciones. Por favor, intente de nuevo más tarde.";
    }
};