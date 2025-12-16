import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Member } from "../types";

const parsePromptWithGemini = async (text: string, members: Member[]): Promise<any> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const membersList = members.map(m => `${m.name} (ID: ${m.id})`).join(", ");
  const today = new Date().toISOString().split('T')[0];

  const systemInstruction = `
    You are a helpful assistant for a "Personal Expense Tracker" app.
    Your job is to parse natural language user input into structured data for either a "Deposit" or an "Expense".
    The user input might be in English or Bangla (Bengali). You should understand both.

    Current Date: ${today}
    Existing Members: ${membersList}

    Rules:
    1. If the input looks like someone paying money TO the mess/fund, it is a DEPOSIT.
    2. If the input looks like buying items, shopping, or spending money, it is an EXPENSE.
    3. If the member is mentioned, try to match their ID. If ambiguous, use closest match.
    4. Return null if the input is unclear.
    5. 'summary' field should be in the same language as the user's input (English or Bangla).
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      actionType: { type: Type.STRING, enum: ["DEPOSIT", "EXPENSE", "UNKNOWN"] },
      amount: { type: Type.NUMBER },
      date: { type: Type.STRING, description: "YYYY-MM-DD format" },
      // For Deposits
      memberId: { type: Type.STRING, description: "The ID of the member if it is a deposit" },
      // For Expenses
      shopperName: { type: Type.STRING, description: "Who did the shopping" },
      items: { type: Type.STRING, description: "List of items bought" },
      summary: { type: Type.STRING, description: "A short confirmation message of what was parsed" }
    },
    required: ["actionType", "amount", "date", "summary"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const resultText = response.text;
    if (!resultText) return null;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    throw error;
  }
};

export { parsePromptWithGemini };