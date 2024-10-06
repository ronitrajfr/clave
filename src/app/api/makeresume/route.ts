import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const urlSchema = z.object({
  url: z.string().url(),
});

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
    const parsedBody = urlSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.format() },
        { status: 422 },
      );
    }

    const { url } = parsedBody.data;

    const res = await axios.get(`https://md.dhr.wtf/?url=${url}`);

    const parts = [
      {
        text: `You are a professional resume builder. You will receive user data in markdown format, as follows: ${res.data}. Based on this information, create a well-structured and professional resume for the user.`,
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      safetySettings,
    });

    const responseText: string =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({ res: responseText }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
