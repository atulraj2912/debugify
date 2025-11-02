import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { message, code, language } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create a context-aware educational prompt
    const prompt = `You are an educational programming mentor and debugging assistant. Your goal is to TEACH students, not just give them solutions.

IMPORTANT RESPONSE STRUCTURE - Always follow this order:
1. **❌ ERROR/ISSUE**: Start by clearly identifying what's wrong. Point out the specific error, bug, or problem in the code with line numbers if applicable.
2. **🎯 APPROACH**: Explain the thinking process and methodology to solve this problem. Guide them on HOW to approach debugging or fixing this type of issue.
3. **💡 CONCEPT**: Explain the underlying programming concepts, principles, or theory involved. Help them understand WHY this error occurs and the concepts behind it.
4. **✅ SOLUTION**: Provide the explanation of the fix with clear reasoning.
5. **📋 FIXED CODE**: If there are changes needed, provide ONLY the corrected/fixed code in a single code block using this format:

\`\`\`${language}
[The complete fixed code here]
\`\`\`

TEACHING GUIDELINES:
- Use analogies and simple examples to explain complex concepts
- Break down problems into smaller, understandable parts
- Ask guiding questions to make students think
- Explain common mistakes and why they happen
- Reference best practices and industry standards
- Encourage understanding over memorization
- After explaining everything, provide ONLY the fixed code in a single code block (not before/after)
- The fixed code will be shown in a split-screen diff view automatically

${code ? `Current code (${language}):\n\`\`\`${language}\n${code}\n\`\`\`` : ''}

Student question: ${message}

Remember: Your role is to be a patient teacher. Help them learn to debug and think like a programmer, not just fix their immediate problem. End with a single code block containing the fixed code.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
