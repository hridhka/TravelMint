
import Groq from "groq-sdk";
import pool from "../config/db.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const planTripWithAI = async (req, res) => {
  try {
    const { days, preferences, travelStyle } = req.body;

    // Validate the request before calling Groq.
    const duration = Number(days);

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 60 ||
      typeof preferences !== "string" ||
      !preferences.trim() ||
      typeof travelStyle !== "string" ||
      !travelStyle.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a valid duration, travel style, and preferences.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing.");

      return res.status(500).json({
        message: "AI planning is not configured on the server.",
      });
    }

    const prompt = `
Create exactly 3 distinct travel trip options for:
Days: ${duration}
Travel Style: ${travelStyle.trim()}
Preferences: ${preferences.trim()}

Estimate budgets in Indian rupees (INR).
The total budget should be a positive number.
Daily budget should be the approximate per-day cost.
Return one JSON object with this exact structure:

{
  "options": [
    {
      "title": "Destination or trip title",
      "destination": "Destination name",
      "vibe": "Short description",
      "budget": 25000,
      "dailyBudget": 3125,
      "highlights": ["Highlight 1", "Highlight 2"],
      "breakdown": {
        "stay": 10000,
        "food": 5000,
        "transport": 5000,
        "activities": 5000
      }
    }
  ]
}

Return valid JSON only. Do not include Markdown or code fences.
`;

    const completion = await groq.chat.completions.create({
      // Verify that this model is currently available to your Groq project.
model: "openai/gpt-oss-120b",      messages: [
        {
          role: "system",
          content:
            "You are a professional travel planner. Return only valid JSON matching the requested structure.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed.options) || parsed.options.length === 0) {
      throw new Error("Groq returned an invalid options array.");
    }

    return res.json({
      aiGenerated: true,
      options: parsed.options,
    });
  } catch (err) {
    // Log the real cause in the backend terminal.
    console.error("AI PLANNING ERROR:", {
      message: err.message,
      status: err.status,
      code: err.code,
      type: err.type,
    });

    return res.status(500).json({
      message: "AI planning failed",
    });
  }
};

// TRAVELMINT AI ASSISTANT
export const askTravelMintAI = async (req, res) => {
  try {
    const { question, conversationId } = req.body;

    if (
      typeof question !== "string" ||
      !question.trim() ||
      question.trim().length > 1500
    ) {
      return res.status(400).json({
        message: "Please enter a question of up to 1500 characters.",
      });
    }

    if (!conversationId || !/^\d+$/.test(String(conversationId))) {
      return res.status(400).json({
        message: "A valid conversation ID is required.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        message: "TravelMint AI is not configured on the server.",
      });
    }

    const conversationResult = await pool.query(
      `SELECT id, title
       FROM conversations
       WHERE id = $1 AND user_id = $2`,
      [conversationId, req.user.id]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    const historyResult = await pool.query(
      `SELECT role, content
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 12`,
      [conversationId]
    );

    const previousMessages = historyResult.rows
      .reverse()
      .map((message) => ({
        role: message.role,
        content: message.content.slice(-4000),
      }));

    await pool.query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'user', $2)`,
      [conversationId, question.trim()]
    );

    await pool.query(
      `UPDATE conversations
       SET title = CASE
         WHEN title = 'New chat' THEN LEFT($1, 60)
         ELSE title
       END,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3`,
      [question.trim(), conversationId, req.user.id]
    );

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `
You are TravelMint AI, a smart, engaging and thoughtful travel companion.

Your job is to make travel planning exciting, simple and genuinely useful. Talk like an experienced traveller who understands what makes a trip memorable.

PERSONALITY:
- Friendly, warm, confident and conversational.
- Have personality without sounding childish or overly enthusiastic.
- Give honest recommendations instead of generic answers.
- Make the user feel like they are planning a trip with a knowledgeable friend.

WRITING STYLE:
- Make every response easy and enjoyable to read.
- Start with an interesting, relevant opening. Avoid generic introductions.
- Use short paragraphs and clear sentences.
- Use descriptive headings to organize longer answers.
- Highlight important destinations, costs and recommendations in bold.
- Use tasteful emojis where they add personality. Don't overuse them.
- Avoid repetitive explanations and unnecessary conclusions.
- Never overwhelm the user with huge walls of text.

FORMATTING RULES:
- Prefer concise bullet points over lengthy paragraphs.
- For itineraries, organize information by day and time when useful.
- Include practical details such as estimated costs, travel time and transport when relevant.
- Use Markdown tables ONLY when comparing multiple options or when a table genuinely improves readability.
- Never turn an entire answer into a table.
- Keep table cells concise.
- Use headings, spacing and bullet points to make longer responses scannable.
- Avoid unnecessary sections that do not answer the user's question.

PERSONALIZATION:
- Pay attention to the user's budget, destination, travel style and preferences.
- Remember relevant details from the conversation history.
- Recommend experiences that match the user's interests.
- Explain briefly why a recommendation is worth considering.
- When information is missing, ask a relevant follow-up question instead of making assumptions.

TRAVEL EXPERTISE:
Help with destination discovery, itineraries, budgets in INR, accommodation, transport, food, local culture, packing, safety, solo travel and family travel.

ACCURACY:
- Never invent live prices, weather, availability, visa rules or booking confirmations.
- Clearly label budget figures as estimates.
- Mention when information should be verified before travelling.
- Never claim to have made a reservation or booking.

RESPONSE LENGTH:
- Simple questions: answer directly in a few sentences.
- Recommendations: give a curated shortlist with brief reasons.
- Itineraries: provide useful day-by-day plans without unnecessary detail.
- Detailed planning requests: provide enough information to act on, but keep it easy to scan.

CONVERSATION:
- Answer the exact question first.
- Suggest a useful next step when appropriate.
- End naturally. Don't force a follow-up question into every response.

Your goal: Make every interaction feel like a conversation with a travel companion who knows where to go, what is worth experiencing and how to make a journey better.
`,
        },
        ...previousMessages,
        {
          role: "user",
          content: question.trim(),
        },
      ],
      temperature: 0.7,
    });

    const answer = completion.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error("Groq returned an empty response.");
    }

    await pool.query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'assistant', $2)`,
      [conversationId, answer.trim()]
    );

    await pool.query(
      `UPDATE conversations
       SET updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [conversationId, req.user.id]
    );

    return res.json({
      success: true,
      conversationId,
      answer: answer.trim(),
    });
  } catch (err) {
    console.error("TRAVELMINT AI ERROR:", {
      message: err.message,
      status: err.status,
      code: err.code,
      type: err.type,
    });

    return res.status(500).json({
      message: "TravelMint AI couldn't answer right now. Please try again.",
    });
  }
};
