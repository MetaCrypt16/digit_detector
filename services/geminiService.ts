import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

// 1. COMPRESSION & ENHANCEMENT
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1000; // Increased size slightly for better detail

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // 1. Fill background white (Fixes transparent PNGs)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          
          // 2. High Contrast Filter (Helps with faint handwriting)
          ctx.filter = 'contrast(1.2) brightness(1.05)';
          
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = (err) => reject(new Error("Failed to load image for compression"));
    };
    reader.onerror = (err) => reject(new Error("Failed to read file"));
  });
};

export const identifyHandwrittenNumber = async (file: File): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const modelId = "gemini-2.5-flash"; 

    const base64Data = await compressImage(file);

    // SIMPLIFIED PROMPT - mimicking natural language requests
    const prompt = `
      Look at this image. It contains handwritten digits.
      Identify the numbers visible in the image, reading from left to right.
      
      Rules:
      1. Ignore scribbles, cross-outs, or noise.
      2. If a number is messy, make your best guess.
      3. Distinguish 4 from 9, and 1 from 7 carefully.
      4. If there are multiple numbers (like "4 2 1"), list them all.
      5. If the image does not contain any digits (e.g. it's a face, landscape, or letters), return an empty fullString.
      
      Return ONLY a JSON object in this format:
      {
        "fullString": "421",
        "digits": [
          { "value": "4", "confidence": "High" },
          { "value": "2", "confidence": "Medium" },
          { "value": "1", "confidence": "High" }
        ]
      }
    `;

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Connection to the Void timed out.")), 60000)
    );

    const responsePromise = ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1, // Slight creativity helps with messy writing
      }
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    const textResponse = response.text || "";
    
    // ROBUST JSON EXTRACTION
    // Finds the substring starting with '{' and ending with '}'
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    let cleanJson = jsonMatch ? jsonMatch[0] : "{}";
    
    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("JSON Parse Failed, attempting fallback regex", textResponse);
      
      // FALLBACK: Regex search for numbers in the raw text if JSON fails
      const numberMatch = textResponse.match(/\b\d+\b/g);
      if (numberMatch) {
        const fullString = numberMatch.join('');
        parsed = {
          fullString: fullString,
          digits: fullString.split('').map(d => ({ value: d, confidence: 'Low' }))
        };
      } else {
        // Instead of throwing, we return an empty object to trigger the 'Unknown' UI
        parsed = { fullString: "", digits: [] };
      }
    }

    const digits = Array.isArray(parsed.digits) ? parsed.digits : [];
    const fullString = parsed.fullString || digits.map((d: any) => d.value).join('');

    // Gracefully handle "Unknown" case
    if (!fullString) {
       return {
         classification: 'unknown',
         identifiedNumber: "Unknown",
         digits: [],
         rawResponse: textResponse
       };
    }

    return {
      classification: digits.length > 1 ? 'multiple' : 'single',
      identifiedNumber: fullString,
      digits: digits,
      rawResponse: textResponse
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMessage = "Failed to process image.";
    
    if (error.message.includes("timed out")) errorMessage = "Network Latency Critical.";
    else if (error.message.includes("API_KEY")) errorMessage = "Access Denied. Invalid Key.";
    
    throw new Error(errorMessage);
  }
};