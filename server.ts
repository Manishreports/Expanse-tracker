import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Server-side Gemini Financial Assistant Endpoint
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { prompt, financialContext, conversationHistory = [] } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.',
          isFallback: true
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are a smart Personal Financial Assistant for an Indian personal expense tracking application. All currency is in INR (₹).
You are analyzing the user's REAL financial records, budgets, daily check-ins, and expenses.

CURRENT USER CONTEXT:
${JSON.stringify(financialContext || {}, null, 2)}

Strict Guidelines:
1. Ground every answer in the provided user context. DO NOT give vague or generic financial advice when actual numbers, categories, or trends are available.
2. Structure your advice using:
   - What happened (specific spending data/category/day)
   - Why it matters (impact on remaining budget or savings goal)
   - Practical steps to take
   - Expected savings/impact in ₹
   - Feasible alternative options
3. If the user asks "Can I afford X?", calculate based on Remaining Budget, Remaining Days, Daily Allowance, and upcoming fixed bills.
4. If the user asks for a grocery/meal plan or what-if scenario, provide concrete calculations.
5. If data is insufficient for a specific query, politely state what is missing and ask a focused follow-up question.
6. Keep formatting clean with clear markdown bullet points and bold numbers.`;

      // Build contents for multi-turn or single turn
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(conversationHistory)) {
        for (const msg of conversationHistory) {
          if (msg.role === 'user' || msg.role === 'model') {
            contents.push({
              role: msg.role,
              parts: [{ text: msg.text || '' }]
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const reply = response.text || 'I analyzed your finances, but could not generate a response. Please try again.';
      return res.json({ reply });
    } catch (err: any) {
      console.error('Gemini API error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate financial assistant response',
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
