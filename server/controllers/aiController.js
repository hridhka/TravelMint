
import Groq from "groq-sdk";

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
      model: "llama-3.3-70b-versatile",
      messages: [
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
