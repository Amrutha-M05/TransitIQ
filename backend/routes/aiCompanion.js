const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { auth } = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const DelayReport = require('../models/DelayReport');

// Initialize OpenAI with org + project keys
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

// In-memory conversation store (per user session)
// In production, use Redis or DB
const conversations = {};

/**
 * POST /api/ai-companion/chat
 * AI Commute Companion - personalized transit assistant
 * Uses full user history (feedback + delays) as context
 */
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userId = req.user.id;
    const key = `${userId}-${sessionId || 'default'}`;

    // Initialize conversation if new
    if (!conversations[key]) {
      conversations[key] = [];
    }

    // Fetch user's full history in parallel
    const [myFeedback, myDelays] = await Promise.all([
      Feedback.find({ userId })
        .populate('routeId', 'routeCode routeName')
        .populate('stopId', 'stopName')
        .populate('busId', 'busNumber')
        .sort({ createdAt: -1 })
        .limit(30),
      DelayReport.find({ userId })
        .populate('routeId', 'routeCode routeName')
        .populate('stopId', 'stopName')
        .sort({ createdAt: -1 })
        .limit(30),
    ]);

    // Build rich context summary for the AI
    const feedbackSummary = myFeedback.map(f => ({
      route: f.routeId?.routeCode || 'Unknown',
      stop: f.stopId?.stopName || 'Unknown',
      bus: f.busId?.busNumber || 'Unknown',
      category: f.category,
      rating: f.rating,
      comment: f.comment || '',
      date: f.createdAt?.toISOString().split('T')[0],
    }));

    const delaySummary = myDelays.map(d => ({
      route: d.routeId?.routeCode || 'Unknown',
      stop: d.stopId?.stopName || 'Unknown',
      delayMinutes: d.delayMinutes || 0,
      crowdLevel: d.crowdLevel,
      status: d.status,
      date: d.createdAt?.toISOString().split('T')[0],
    }));

    // Compute analytics
    const avgRating = myFeedback.length
      ? (myFeedback.reduce((a, f) => a + f.rating, 0) / myFeedback.length).toFixed(1)
      : null;

    const routeFrequency = {};
    [...myFeedback, ...myDelays].forEach(item => {
      const code = item.routeId?.routeCode;
      if (code) routeFrequency[code] = (routeFrequency[code] || 0) + 1;
    });
    const mostUsedRoutes = Object.entries(routeFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([route]) => route);

    const worstCategories = {};
    myFeedback.filter(f => f.rating <= 2).forEach(f => {
      worstCategories[f.category] = (worstCategories[f.category] || 0) + 1;
    });

    const avgDelay = myDelays.length
      ? (myDelays.reduce((a, d) => a + (d.delayMinutes || 0), 0) / myDelays.length).toFixed(1)
      : null;

    const systemPrompt = `You are the AI Commute Companion for TransitIQ, a public transport feedback portal. You are a highly intelligent, empathetic, and proactive transit assistant.

You have FULL ACCESS to this passenger's personal commute history. Use it to give hyper-personalized, actionable, data-driven advice.

=== PASSENGER COMMUTE PROFILE ===
Total Feedback Submitted: ${myFeedback.length}
Total Delay Reports Filed: ${myDelays.length}
Average Rating They Give: ${avgRating || 'No data yet'} / 5
Average Delay They Experience: ${avgDelay || 'No data yet'} minutes
Most Used Routes: ${mostUsedRoutes.join(', ') || 'No data yet'}
Most Complained About: ${Object.keys(worstCategories).join(', ') || 'Nothing specific yet'}

=== RECENT FEEDBACK (last 30) ===
${JSON.stringify(feedbackSummary, null, 2)}

=== RECENT DELAY REPORTS (last 30) ===
${JSON.stringify(delaySummary, null, 2)}
=================================

YOUR CAPABILITIES:
1. **Pattern Analysis** - Identify recurring issues (e.g., "Route 15 is always delayed on weekdays")
2. **Personalized Alerts** - Warn about routes the user historically finds problematic
3. **Smart Travel Suggestions** - Based on their delay history, suggest better departure windows
4. **Feedback Coaching** - Help them write more impactful feedback reports
5. **Crowd Prediction** - Based on their reported crowd levels, predict busy periods
6. **Trend Reporting** - Tell them if their commute is getting better or worse over time
7. **Route Comparison** - Compare performance across routes they've used

PERSONALITY: Be warm, concise, and proactive. Lead with insights the user didn't ask for but will find valuable. Use emojis sparingly but effectively. Always ground responses in their actual data.

If the user has no data yet, be encouraging and explain what insights you'll be able to offer as they use the app more.`;

    // Append user message to history
    conversations[key].push({ role: 'user', content: message });

    // Keep last 10 messages to avoid token overflow
    const recentHistory = conversations[key].slice(-10);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;

    // Store assistant reply
    conversations[key].push({ role: 'assistant', content: reply });

    // Trim conversation to last 20 messages
    if (conversations[key].length > 20) {
      conversations[key] = conversations[key].slice(-20);
    }

    res.json({
      reply,
      usage: {
        feedbackCount: myFeedback.length,
        delayCount: myDelays.length,
        topRoutes: mostUsedRoutes,
      },
    });
  } catch (err) {
    console.error('AI Companion error:', err);
    if (err.status === 401) {
      return res.status(500).json({ message: 'OpenAI API key is invalid. Please check your .env configuration.' });
    }
    res.status(500).json({ message: err.message || 'AI service error' });
  }
});

/**
 * POST /api/ai-companion/clear
 * Clear conversation history for a session
 */
router.post('/clear', auth, (req, res) => {
  const { sessionId } = req.body;
  const key = `${req.user.id}-${sessionId || 'default'}`;
  delete conversations[key];
  res.json({ message: 'Conversation cleared' });
});

/**
 * GET /api/ai-companion/insights
 * Get AI-generated weekly commute insights (no chat, just analysis)
 */
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [myFeedback, myDelays] = await Promise.all([
      Feedback.find({ userId })
        .populate('routeId', 'routeCode routeName')
        .populate('stopId', 'stopName')
        .sort({ createdAt: -1 })
        .limit(20),
      DelayReport.find({ userId })
        .populate('routeId', 'routeCode routeName')
        .populate('stopId', 'stopName')
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    if (myFeedback.length === 0 && myDelays.length === 0) {
      return res.json({
        insights: [
          { type: 'welcome', title: 'Welcome aboard! 👋', body: 'Submit feedback and delay reports to unlock your personal commute insights.' },
        ],
      });
    }

    const dataContext = JSON.stringify({
      feedback: myFeedback.map(f => ({
        route: f.routeId?.routeCode, stop: f.stopId?.stopName,
        category: f.category, rating: f.rating, date: f.createdAt?.toISOString().split('T')[0],
      })),
      delays: myDelays.map(d => ({
        route: d.routeId?.routeCode, stop: d.stopId?.stopName,
        minutes: d.delayMinutes, crowd: d.crowdLevel, date: d.createdAt?.toISOString().split('T')[0],
      })),
    });

    const insightResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a transit data analyst. Analyze this passenger's commute data and return EXACTLY a JSON array of 3-4 insight objects. Each object must have: type (string: "pattern"|"warning"|"tip"|"positive"), title (short, max 8 words), body (1-2 sentences, specific and data-driven). Return ONLY the JSON array, no markdown, no explanation.`,
        },
        { role: 'user', content: `Analyze this commute data: ${dataContext}` },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    let insights;
    try {
      insights = JSON.parse(insightResponse.choices[0].message.content);
    } catch {
      insights = [{ type: 'tip', title: 'Keep tracking your commute', body: 'More data will unlock better personalized insights.' }];
    }

    res.json({ insights });
  } catch (err) {
    console.error('Insights error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
