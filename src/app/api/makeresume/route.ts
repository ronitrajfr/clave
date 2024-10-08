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
    console.log(res.data);

    const parts = [
      {
        text: `You are a highly skilled resume builder. You will receive user data in markdown format, as follows: ${res.data}. Based on this information, create a well-structured, stylish, and professional resume in HTML format, similar to the one in the provided PDF.
    
        - Ensure the HTML is well-organized, visually appealing, and professionally designed, closely matching the layout and style of the provided PDF.
        - Use a **header section** for the user's name, contact information (phone, email, LinkedIn, etc.), styled in a clean, professional manner, with the name in **bold** and larger font.
        - Include **sections for Objective, Education, Skills, Experience, Projects, Extra-curricular Activities, and Leadership**, using headers (h1, h2) to organize them.
        - Use **bold** text for significant details and *italics* for emphasis where needed.
        - Implement bullet points for work experience, projects, and activities to present key information effectively, ensuring each entry has dates, roles, and accomplishments.
        - Use anchor tags for links to websites and social media profiles, styled in blue for clarity.
        - Ensure that the entire resume is **centered on the screen** and fits within **A4 size dimensions** (8.27 x 11.69 inches) for proper printing.
        - The **background should be clean** and light-colored, with subtle styling elements like box shadows or borders for visual appeal, while keeping it professional.
        - Apply a **responsive, modern layout** using Flexbox where appropriate.
        - Use a professional font such as Arial or Helvetica, with consistent font sizes for section headers and content.
        - Add underlines or other styling cues where necessary for emphasis.
    
        <!-- Example structure for guidance (this should not be displayed in the output):
        <div class="resume">
          <header>
            <h1>Firstname Lastname</h1>
            <p>+1 (123) 456-7890 | email@example.com | linkedin.com/in/username</p>
          </header>
          <section>
            <h2>Objective</h2>
            <p>Seeking a full-time position in...</p>
          </section>
          <section>
            <h2>Education</h2>
            <p>Master of Computer Science, Stanford University, Expected 2020</p>
            <p>Bachelor of Science, XYZ University, 2017</p>
          </section>
          <section>
            <h2>Skills</h2>
            <ul>
              <li>JavaScript, Python, SQL</li>
              <li>React, Node.js</li>
            </ul>
          </section>
          <section>
            <h2>Experience</h2>
            <p>Software Engineer, Company Name (2017-2019)</p>
            <ul>
              <li>Developed XYZ, leading to a 10% increase in...</li>
            </ul>
          </section>
        </div>
        -->
        `,
      },
      { text: `Input: ${res.data}` },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      safetySettings,
    });

    const responseText: string =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log(responseText);

    return NextResponse.json({ res: responseText }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
