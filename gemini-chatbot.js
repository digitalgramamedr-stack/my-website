// ==========================================================================
// Digital Gramam CSC — Gemini 2.5 Flash AI Chatbot with Google Search Grounding
// ==========================================================================
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function askChatbot(userMessage) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        // ചാറ്റ്ബോട്ടിന്റെ ഭാഷയും സ്വഭാവവും നിശ്ചയിക്കുന്ന നിർദ്ദേശം
        systemInstruction: `നിങ്ങൾ ഡിജിറ്റൽ ഗ്രാമം CSC (Digital Gramam CSC, എടക്കളത്തൂർ, തൃശൂർ - 680552 | ഓണർ: മിഥുൻ ലാൽ വി ബി | ഫോൺ: 0487 2083582 | വാട്സാപ്പ്: 7356437712 | ഇമെയിൽ: digitalgramamcsc@gmail.com) എന്ന ഓൺലൈൻ സേവന കേന്ദ്രത്തിന്റെ വിദഗ്ദ്ധനായ AI സഹായിയാണ്.
1. ഉപയോക്താവ് ഏത് ഭാഷയിൽ ചോദിച്ചാലും മറുപടി പൂർണ്ണമായും സ്വാഭാവികവും ലളിതവുമായ മലയാളത്തിൽ (Natural Malayalam) നൽകണം.
2. പുതിയ വിവരങ്ങൾ, വാർത്തകൾ, സർക്കാർ കാര്യങ്ങൾ, സർട്ടിഫിക്കറ്റുകൾക്ക് ആവശ്യമായ രേഖകൾ, ലൈവ് വിവരങ്ങൾ എന്നിവ ചോദിക്കുമ്പോൾ നൽകിയിട്ടുള്ള ഗൂഗിൾ സെർച്ച് ടൂൾ നിർബന്ധമായും ഉപയോഗിച്ച് കണ്ടെത്തി ഉത്തരം നൽകണം.
3. മറുപടികൾ വ്യക്തമായി പോയിന്റുകളാക്കി നൽകുക.`,

        // തത്സമയം നെറ്റിൽ തിരയാൻ ഗൂഗിൾ സെർച്ച് ഓൺ ചെയ്യുന്നു
        tools: [{ googleSearch: {} }]
      }
    });

    // സെർച്ചിൽ നിന്ന് കണ്ടെത്തിയ വിവരങ്ങൾ ചേർത്ത് മലയാളത്തിലുള്ള ഉത്തരം
    return response.text;
  } catch (error) {
    console.error("Error:", error);
    return "ക്ഷമിക്കണം, വിവരങ്ങൾ ലഭിക്കുന്നതിൽ ചെറിയൊരു തടസ്സം നേരിട്ടു. ദയവായി അല്പം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.";
  }
}
