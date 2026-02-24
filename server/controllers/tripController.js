import pool from "../db.js";

/* =========================
   GET ALL TRIPS
========================= */
export const getTrips = async (req, res) => {
  const { id: userId } = req.user;

  const result = await pool.query(
    `
    SELECT 
      t.*,
      COALESCE(SUM(e.amount), 0) AS total_spent,
      COUNT(e.id) AS expense_count
    FROM trips t
    LEFT JOIN expenses e ON t.id = e.trip_id
    WHERE t.user_id = $1
    GROUP BY t.id
    ORDER BY t.id DESC
    `,
    [userId]
  );

  res.json(result.rows);
};

/* =========================
   CREATE TRIP (MANUAL / AI)
========================= */
export const createTrip = async (req, res) => {
  const { title, budget, start_date, end_date } = req.body;
  const { id: userId } = req.user;

  const result = await pool.query(
    `
    INSERT INTO trips (title, budget, start_date, end_date, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [title, budget, start_date, end_date, userId]
  );

  res.json(result.rows[0]);
};
//groq 
/* =========================
   DELETE TRIP
========================= */
export const deleteTrip = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const result = await pool.query(
    `DELETE FROM trips WHERE id=$1 AND user_id=$2 RETURNING *`,
    [tripId, userId]
  );

  if (result.rowCount === 0) {
    return res.status(403).json({ message: "Not allowed" });
  }

  res.json({ message: "Trip deleted" });
};

/* =========================
   TRIP SUMMARY
========================= */
export const getTripSummary = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const trip = await pool.query(
    `
    SELECT title, start_date, end_date, budget 
    FROM trips 
    WHERE id=$1 AND user_id=$2
    `,
    [tripId, userId]
  );

  if (trip.rows.length === 0) {
    return res.status(404).json({ message: "Trip not found" });
  }

  const expenses = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE trip_id=$1`,
    [tripId]
  );

  const budget = Number(trip.rows[0].budget);
  const totalSpent = Number(expenses.rows[0].total);

  res.json({
    ...trip.rows[0],
    totalSpent,
    remaining: budget - totalSpent,
    overBudget: totalSpent > budget,
  });
};

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* 
  REAL AI TRIP PLANNER (Groq)
 */
export const planTripWithAI = async (req, res) => {
  try {
    const { days, preferences, travelStyle } = req.body;

    const prompt = `
You are a smart travel planner.

Create 3 different travel trip options based on:

Days: ${days}
Travel Style: ${travelStyle}
Preferences: ${preferences}

Return ONLY valid JSON in this exact format:

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

Rules:
- Budgets must be in INR
- No explanations
- No markdown
- Only JSON
`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You are a professional travel AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const aiText = completion.choices[0].message.content;

    // 🔥 Safely parse JSON
    const parsed = JSON.parse(aiText);

    res.json({
      aiGenerated: true,
      options: parsed.options,
    });

  } catch (err) {
    console.error("Groq AI Error:", err);
    res.status(500).json({ message: "AI planning failed" });
  }
};