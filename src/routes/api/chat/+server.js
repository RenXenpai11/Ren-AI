import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY
});

const MAX_TEXT_ATTACHMENT_CHARS = 8000;
const MAX_PDF_PAGES = 8;

function decodeBase64(base64Text = "") {
  return Buffer.from(base64Text, "base64");
}

async function extractPdfText(base64Data) {
  const raw = decodeBase64(base64Data);
  const loadingTask = getDocument({ data: new Uint8Array(raw) });
  const pdf = await loadingTask.promise;
  const maxPages = Math.min(pdf.numPages, MAX_PDF_PAGES);

  const collected = [];
  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => (typeof item.str === "string" ? item.str : ""))
      .join(" ")
      .trim();

    if (pageText) {
      collected.push(`[Page ${pageNumber}] ${pageText}`);
    }
  }

  return collected.join("\n").slice(0, MAX_TEXT_ATTACHMENT_CHARS);
}

async function extractTextAttachment(attachment) {
  try {
    let text = "";
    if (attachment.type === "application/pdf") {
      text = await extractPdfText(attachment.data);
    } else {
      const raw = decodeBase64(attachment.data);
      text = raw.toString("utf8").slice(0, MAX_TEXT_ATTACHMENT_CHARS);
    }

    return `File: ${attachment.name}\n${text}`;
  } catch (error) {
    const fallbackReason = error?.message ? ` (${error.message})` : "";
    if (attachment.type === "application/pdf") {
      return `File: ${attachment.name}\n[Unable to parse PDF content${fallbackReason}.]`;
    }

    return `File: ${attachment.name}\n[Unable to parse this file as text.]`;
  }
}

function formatAttachmentPrompt(message, textParts, imageParts) {
  const textSection = textParts.length
    ? `\n\nAttached file content:\n${textParts.join("\n\n---\n\n")}`
    : "";
  const imageSection = imageParts.length
    ? `\n\nAttached images: ${imageParts.map((img) => img.name).join(", ")}. Analyze these images before answering.`
    : "";

  return `${message || "Please analyze the provided attachments."}${textSection}${imageSection}`;
}

async function getGroqReply(prompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are AuraAI, a helpful AI assistant. When file context is supplied, use it directly in your answer."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 1024
  });

  return completion.choices[0].message.content;
}

async function getGeminiVisionReply(prompt, imageParts) {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const parts = [{ text: prompt }];
  for (const image of imageParts) {
    parts.push({
      inlineData: {
        mimeType: image.type,
        data: image.data
      }
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }]
  });

  const text = result.response.text();
  return text || "I analyzed the image, but I could not generate a detailed response.";
}

export async function POST({ request }) {
  try {
    const { message, attachments = [] } = await request.json();
    const safeAttachments = Array.isArray(attachments) ? attachments : [];

    const imageParts = safeAttachments.filter((item) => String(item.type || "").startsWith("image/"));
    const textAttachmentCandidates = safeAttachments
      .filter((item) => {
        const type = String(item.type || "");
        return type.startsWith("text/") || ["application/pdf", "application/json", "application/javascript", "application/typescript"].includes(type);
      });

    const textParts = await Promise.all(textAttachmentCandidates.map(extractTextAttachment));

    const prompt = formatAttachmentPrompt(message, textParts, imageParts);

    let reply = "";
    if (imageParts.length > 0) {
      if (env.GEMINI_API_KEY) {
        reply = await getGeminiVisionReply(prompt, imageParts);
      } else {
        const fallbackPrompt = `${prompt}\n\nNote: Image analysis is not available right now because GEMINI_API_KEY is not configured. Explain this limitation briefly, then answer only based on the text and user question.`;
        reply = await getGroqReply(fallbackPrompt);
      }
    } else {
      reply = await getGroqReply(prompt);
    }

    return json({ reply });
  } catch (error) {
    return json(
      {
        error: true,
        message: error?.message || "Failed to process chat request."
      },
      { status: 500 }
    );
  }
}