import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "create a quiz for coding\n",
});
const inputSchema = z.object({
  input: z.string(),
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsedBody = inputSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.format() },
        { status: 422 },
      );
    }

    const { input } = parsedBody.data;
    console.log(input);

    const parts = [
      {
        text: 'You are coding quiz generator. The important data\'s like language, topic, difficulty level will be provided to you. Please return the output strictly as a JSON object without any preceding text. The JSON object should have a key named "quiz," which is an array of question objects. Each question object should include the following keys: "question", "options" (without numbers or letters), "correct_answer", and "explanation.',
      },
      { text: `input: ${input}` },
      {
        text: 'output: {\n      "quiz": [\n        {\n          "question": "Your question here",\n          "options": [\n            "Option 1",\n            "Option 2",\n            "Option 3",\n            "Option 4"\n          ],\n          "correct_answer": "The correct answer",\n          "explanation": "The explanation for the correct answer."\n        }\n      ]\n    }',
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });
    const response = result.response.text();
    const jsonRespone = JSON.parse(response); // Parse the text into JSON

    return NextResponse.json({ jsonRespone }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
