import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const planTripWithAI = async (req, res) => {
  try {
    const { days, preferences, travelStyle } = req.body;

    const prompt = `
Create 3 travel trip options for:
Days: ${days}
Travel Style: ${travelStyle}
Preferences: ${preferences}

Return ONLY valid JSON:

{
  "options": [
    {
      "title": "",
      "destination": "",
      "vibe": "",
      "budget": number,
      "dailyBudget": number,
      "highlights": [],
      "breakdown": {
        "stay": number,
        "food": number,
        "transport": number,
        "activities": number
      }
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You are a professional travel planner." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8
    });

    const text = completion.choices[0].message.content;

    const cleaned = text.substring(
      text.indexOf("{"),
      text.lastIndexOf("}") + 1
    );

    const parsed = JSON.parse(cleaned);

    res.json({
      aiGenerated: true,
      options: parsed.options
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ message: "AI planning failed" });
  }
};