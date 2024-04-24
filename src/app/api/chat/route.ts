import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import {env} from "@/env";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: env.DATABRICKS_OPENAI_TOKEN,
    baseURL: env.DATABRICKS_OPENAI_URL,
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const { messages } = await req.json();

    // // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
        model: 'databricks-dbrx-instruct',
        stream: true,
        messages,

    });
    //
    // // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
}