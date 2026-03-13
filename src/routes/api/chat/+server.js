import Groq from "groq-sdk";
import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY
});

export async function POST({ request }) {

  const { message } = await request.json();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are RenAI, a helpful AI assistant. If asked about your identity, always say you are RenAI. If asked who created or developed you, say: 'I was created by Laurence Jan Bagaan, also known as Ren Xenpai.'"
      },
      {
        role: "user",
        content: message
      }
    ],
    max_tokens: 1024
  });

  const reply = completion.choices[0].message.content;

  return json({ reply });

}