import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

function getGenAIClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Life Coach & Personal CEO Chat
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { message, promptCategory, context } = req.body;
    const ai = getGenAIClient();

    const systemInstruction = `You are the user's personal AI CEO, Financial Advisor, and Executive Accountability Coach inside "LifeOS - Build Your Future Daily".
Your tone is decisive, strategic, empathetic yet uncompromising on high standards—like a mix of a Fortune 500 CEO, a wealth architect, and an elite performance coach.
Always ground your advice in the user's actual data provided in the context:
- Reference their specific Dreams & Goals (e.g. Ruchitva Kitchen expansion, Dream House, Debt reduction, Investment growth).
- Reference their completed and pending Missions, Money Impact, and Dream Impact.
- Reference their Financial metrics (Income, Expenses, Loans, Investments, Savings, Net Worth) using ₹ (INR) formatting.
- Reference their Focus vs. Entertainment/Social Media time.
Keep responses structured, scannable, and action-oriented (120 to 250 words) with clear numbered executive directives.`;

    const prompt = `User Query (${promptCategory || 'General Coaching'}): "${message}"

Current User Operating Context:
${JSON.stringify(context || {}, null, 2)}

Provide an executive coaching response tailored specifically to this user's situation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    res.json({
      reply: response.text || 'Focus on your highest-impact revenue mission first today. Every focused 25-minute block compounds your future.',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Coach error:', msg);
    res.status(500).json({ error: msg });
  }
});

// 2. AI Mission Suggestion & Prioritization
app.post('/api/ai/mission-suggestion', async (req, res) => {
  try {
    const { title, category, connectedDream, estimatedMinutes, context } = req.body;
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Analyze this mission and provide a concise 1-2 sentence tactical execution tip to maximize ROI and speed:
Mission Title: "${title}"
Category: ${category}
Connected Dream: "${connectedDream}"
Estimated Time: ${estimatedMinutes} minutes
User Context: ${JSON.stringify(context || {})}`,
      config: {
        systemInstruction: 'You are an executive productivity architect. Give a sharp, specific 1-2 sentence execution strategy (under 240 characters). No fluff.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    res.json({
      suggestion: (response.text || 'Break this into a 25-minute sprint, eliminate phone notifications, and define a measurable deliverable before starting.').slice(0, 550),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Mission suggestion error:', msg);
    res.status(500).json({ error: msg });
  }
});

// 3. AI Context-Aware Motivational System
app.post('/api/ai/motivation', async (req, res) => {
  try {
    const { situation, context } = req.body;
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Generate a context-specific motivational quote and a 1-sentence CEO directive based on the user's current primary challenge: "${situation}".
User data snapshot: ${JSON.stringify(context || {})}`,
      config: {
        systemInstruction: 'Never return generic or random quotes. Connect the quote directly to the user’s current financial, business, debt, or focus situation.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING, description: 'Powerful quote tailored to the exact situation' },
            authorOrPrinciple: { type: Type.STRING, description: 'Attribution or core wealth/execution principle' },
            directive: { type: Type.STRING, description: 'One concrete action directive connected to their numbers' },
            challengeTag: { type: Type.STRING, description: 'Short label for the current situation addressed' },
          },
          required: ['quote', 'authorOrPrinciple', 'directive', 'challengeTag'],
        },
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    res.json(parsed);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Motivation error:', msg);
    res.status(500).json({ error: msg });
  }
});

// 4. AI Financial Advisor Analysis
app.post('/api/ai/financial-analysis', async (req, res) => {
  try {
    const { financeSummary, goals } = req.body;
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Analyze this user's personal & business financial position (in INR ₹) and their life goals:
Financial Summary: ${JSON.stringify(financeSummary || {})}
Dream Goals: ${JSON.stringify(goals || [])}`,
      config: {
        systemInstruction: 'You are an elite CFO and personal wealth advisor. Provide 3 specific numerical recommendations to accelerate debt freedom, increase business cashflow, and compound investments.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Primary financial diagnosis in 1 sentence with specific ₹ numbers' },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  action: { type: Type.STRING },
                },
                required: ['title', 'impact', 'action'],
              },
            },
            wealthProjectionNote: { type: Type.STRING },
          },
          required: ['headline', 'recommendations', 'wealthProjectionNote'],
        },
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    res.json(parsed);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Financial Analysis error:', msg);
    res.status(500).json({ error: msg });
  }
});

// 5. AI Nightly Daily Review Pattern Analyzer
app.post('/api/ai/daily-review', async (req, res) => {
  try {
    const { reviewData, recentReviews } = req.body;
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Analyze tonight's Daily Review and historical patterns:
Tonight's Report: ${JSON.stringify(reviewData || {})}
Previous Reviews: ${JSON.stringify(recentReviews || [])}`,
      config: {
        systemInstruction: 'You are an executive evening accountability coach. Diagnose why missions were missed (No time, Low energy, Distraction, Unexpected work), detect behavioral patterns, and prescribe a 3-point morning protocol for tomorrow (max 900 characters).',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    res.json({
      aiSummary: (response.text || 'Solid execution today. Protect your first 90 minutes tomorrow morning before checking social feeds to convert missed tasks into completed wins.').slice(0, 1400),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Daily Review error:', msg);
    res.status(500).json({ error: msg });
  }
});

// 6. Weekly AI Life Performance Report
app.post('/api/ai/weekly-report', async (req, res) => {
  try {
    const { context } = req.body;
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Generate a comprehensive Weekly AI Life Performance Report based on the user's current LifeOS state:
${JSON.stringify(context || {})}`,
      config: {
        systemInstruction: 'You are the user’s AI CEO generating their Weekly Life Performance Report. Be specific, cite their missions, business goals, finances, and habits.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
            moneyProgress: { type: Type.STRING },
            businessProgress: { type: Type.STRING },
            healthProgress: { type: Type.STRING },
            mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextWeekStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
            ceoVerdict: { type: Type.STRING },
          },
          required: [
            'achievements',
            'moneyProgress',
            'businessProgress',
            'healthProgress',
            'mistakes',
            'nextWeekStrategy',
            'ceoVerdict',
          ],
        },
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    res.json(parsed);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Weekly Report error:', msg);
    res.status(500).json({ error: msg });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
