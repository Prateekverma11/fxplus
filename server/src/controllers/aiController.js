import axios from 'axios';
import { IntelligenceEngine } from '../analytics/intelligenceEngine.js';
import prisma from '../utils/prisma.js';

/**
 * AI Currency Intelligence Controller
 */
export async function chatWithAi(req, res, next) {
  try {
    const { message, history = [], currency = 'USD' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt message is required'
      });
    }

    const baseCode = (currency || 'USD').toUpperCase();
    const quoteCode = 'INR';

    // 1. Fetch live analytics & metrics for context
    let pairData = null;
    try {
      pairData = await IntelligenceEngine.getPairAnalytics(baseCode, quoteCode);
    } catch (e) {
      console.warn('Could not fetch pair analytics for AI context:', e.message);
    }

    // 2. Fetch top movers for broader market context
    let topMovers = [];
    try {
      const moversRes = await IntelligenceEngine.getTopMovers('USD');
      topMovers = (moversRes?.allTracked || []).slice(0, 5);
    } catch (e) {
      // ignore
    }

    const currentRate = pairData?.currentRate ? (pairData.rate > 10 ? pairData.rate.toFixed(2) : pairData.rate.toFixed(4)) : 'N/A';
    const change24h = pairData?.changes?.['24H'] !== undefined ? `${pairData.changes['24H'] > 0 ? '+' : ''}${pairData.changes['24H']}%` : '0.00%';
    const change7d = pairData?.changes?.['7D'] !== undefined ? `${pairData.changes['7D'] > 0 ? '+' : ''}${pairData.changes['7D']}%` : '0.00%';
    const change30d = pairData?.changes?.['30D'] !== undefined ? `${pairData.changes['30D'] > 0 ? '+' : ''}${pairData.changes['30D']}%` : '0.00%';
    const trend = pairData?.technical?.trend || 'Stable';
    const volatility = pairData?.volatility?.dailyStdDevPct !== undefined ? `${pairData.volatility.dailyStdDevPct}% (${pairData.volatility.category})` : 'Normal';

    const systemPrompt = `You are FXPulse AI, an expert quantitative foreign exchange (FX) and macroeconomic intelligence analyst for FXPulse platform.
You provide precise, data-driven, and clear answers to users regarding currency movements, foreign exchange rates, macroeconomic news, and financial market drivers.

CURRENT MARKET CONTEXT (LIVE DATA FROM FXPULSE DATABASE):
- Active Pair: ${baseCode}/INR
- Current Rate: ₹${currentRate} per 1 ${baseCode}
- 24-Hour Return: ${change24h}
- 7-Day Return: ${change7d}
- 30-Day Return: ${change30d}
- Moving Average Trend: ${trend}
- Volatility (Standard Deviation): ${volatility}
- Top Tracked Pairs against INR: ${topMovers.map(m => `${m.quote}: ${m.rate} (${m.change24h > 0 ? '+' : ''}${m.change24h}%)`).join(', ')}

GUIDELINES FOR YOUR RESPONSE:
1. Ground your explanation in real financial and macroeconomic drivers:
   - Central Bank Policy: US Federal Reserve (FOMC) interest rates, speeches by Jerome Powell, and Reserve Bank of India (RBI) repo rate & market interventions.
   - Economic Data Releases: US CPI/PPI Inflation, Non-Farm Payrolls (jobs report), US GDP growth, India GDP and trade balance.
   - Capital & Commodity Flows: Foreign Institutional Investor (FII/FPI) equity inflows/outflows in Indian stock markets, and global Brent Crude oil price fluctuations (as India imports ~85% of crude).
   - Dollar Index (DXY) and US Treasury yields.
2. If asked why a currency is rising or falling, reference both the actual live return percentage from the context and the macroeconomic/news factors behind it.
3. Keep the tone professional, concise, and structured with bullet points or numbered insights.
4. Disclaimer: Remind users that FXPulse provides quantitative intelligence and observation, not direct financial or speculative trading advice.`;

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is configured, attempt call to Gemini API with search grounding
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const contents = [];

        // Add previous conversation turns
        if (Array.isArray(history)) {
          history.slice(-6).forEach(h => {
            contents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }]
            });
          });
        }

        // Add current prompt
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const payload = {
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          tools: [{ googleSearch: {} }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024
          }
        };

        const response = await axios.post(geminiEndpoint, payload, { timeout: 15000 });
        const candidate = response.data?.candidates?.[0];
        const aiText = candidate?.content?.parts?.map(p => p.text).join('\n') || '';

        // Extract grounding sources if available
        const sources = [];
        const metadata = candidate?.groundingMetadata;
        if (metadata && metadata.groundingChunks) {
          metadata.groundingChunks.forEach(chunk => {
            if (chunk.web?.uri) {
              sources.push({
                title: chunk.web.title || 'News Source',
                url: chunk.web.uri
              });
            }
          });
        }

        if (aiText) {
          return res.json({
            success: true,
            reply: aiText,
            sources: sources.slice(0, 4),
            pair: `${baseCode}/INR`,
            metrics: {
              currentRate,
              change24h,
              change7d,
              trend,
              volatility
            }
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to quantitative reasoning engine:', geminiError.message);
      }
    }

    // Fallback: Built-in FX Intelligence & Macroeconomic Reasoning Engine
    const generatedReply = generateMacroAnalysisResponse(message, {
      baseCode,
      quoteCode,
      currentRate,
      change24h,
      change7d,
      change30d,
      trend,
      volatility,
      pairData
    });

    return res.json({
      success: true,
      reply: generatedReply.text,
      sources: generatedReply.sources,
      pair: `${baseCode}/INR`,
      metrics: {
        currentRate,
        change24h,
        change7d,
        trend,
        volatility
      }
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    next(error);
  }
}

/**
 * Built-in quantitative and macroeconomic reasoning engine
 */
function generateMacroAnalysisResponse(prompt, context) {
  const { baseCode, currentRate, change24h, change7d, change30d, trend, volatility } = context;
  const q = (prompt || '').toLowerCase();

  const isWhyMoving = q.includes('why') || q.includes('weak') || q.includes('drop') || q.includes('fall') || q.includes('rise') || q.includes('gain') || q.includes('strong') || q.includes('news') || q.includes('action');
  const isComparison = q.includes('compare') || q.includes('versus') || q.includes('vs') || q.includes('best');
  const isConvert = q.includes('convert') || q.includes('send') || q.includes('buy') || q.includes('transfer') || q.includes('good time');

  const num24h = parseFloat(change24h) || 0;
  const direction = num24h > 0 ? 'strengthened' : num24h < 0 ? 'weakened' : 'remained steady';

  if (isWhyMoving) {
    const isWeakening = num24h < 0 || q.includes('weak') || q.includes('fall') || q.includes('drop');

    return {
      text: `### 📊 Market Analysis: ${baseCode}/INR Movement & Macro Drivers

Currently, **1 ${baseCode} = ₹${currentRate}**, showing a **24H change of ${change24h}** and a **7-day return of ${change7d}** with a **${trend}** trend.

Here are the primary macroeconomic drivers and market actions influencing this movement:

1. **🏛️ Central Bank Monetary Policy & Interest Rate Differentials**
   * ${isWeakening 
     ? `**US Federal Reserve (Fed)** interest rate expectations: Moderating US economic data or dovish Fed commentary reduces the yield advantage of the US Dollar, shifting global liquidity toward emerging markets.`
     : `**Interest Rate Yield Spread**: Firm US Federal Reserve commentary or higher Treasury bond yields continue to attract global capital into Dollar-denominated assets.`}
   * **Reserve Bank of India (RBI)** market management: The RBI routinely conducts foreign exchange market operations (buying/selling USD in spot & forward markets) to maintain Rupee stability and curb excessive volatility.

2. **📈 Macroeconomic Data Releases (CPI Inflation & Jobs)**
   * Recent US Consumer Price Index (CPI) and Non-Farm Payrolls reports dictate Dollar strength. ${isWeakening ? 'Cooling inflation prints have reduced aggressive rate hike expectations, softening Dollar demand.' : 'Persistent core inflation prints support Dollar resilience.'}
   * India's domestic GDP growth figures and foreign trade metrics provide baseline resilience for the Rupee.

3. **🛢️ Crude Oil Prices & India's Import Bill**
   * India imports approximately **85% of its crude oil requirements**. 
   * When Brent Crude prices soften, India's Dollar outgoings decrease, reducing downward pressure on the Indian Rupee.

4. **💼 Foreign Institutional Inflows (FII / FPI Flows)**
   * Capital flows in Indian equity and debt markets directly affect demand. ${isWeakening ? 'Sustained net foreign institutional buying in Indian equities enhances domestic currency support.' : 'FII net selling creates higher spot dollar bidding.'}

---
*💡 **Quantitative Summary**: The pair is currently exhibiting **${volatility}** with a 30-day performance of **${change30d}**.*`,
      sources: [
        { title: 'Federal Reserve Monetary Policy Reports', url: 'https://www.federalreserve.gov' },
        { title: 'Reserve Bank of India (RBI) Bulletins', url: 'https://rbi.org.in' },
        { title: 'FXPulse Quantitative Engine', url: '#' }
      ]
    };
  }

  if (isConvert) {
    return {
      text: `### 💱 Currency Conversion & Timing Analysis: ${baseCode}/INR

* **Spot Rate**: **₹${currentRate} per 1 ${baseCode}**
* **24-Hour Movement**: **${change24h}**
* **30-Day Change**: **${change30d}**
* **Trend Assessment**: **${trend}** (${volatility})

**Key Takeaways for Transfers & Conversion:**
1. **Historical Positioning**: The pair is currently in a **${trend.toLowerCase()}** trajectory compared to its 30-day baseline.
2. **Volatility Risk**: Daily volatility is currently categorized as **${volatility}**, meaning day-to-day rate swings are within controlled statistical bounds.
3. **Execution Strategy**: If you need to convert funds:
   - For recurring payments, dollar-cost averaging (staggering transfers) minimizes timing risk.
   - Keep a close eye on upcoming US FOMC rate announcements and RBI monetary policy reviews.`,
      sources: [
        { title: 'FXPulse Historical Analytics', url: '#' }
      ]
    };
  }

  return {
    text: `### 🌐 FX Intelligence Briefing for ${baseCode}/INR

* **Current Reference Rate**: **₹${currentRate}**
* **24-Hour Return**: **${change24h}**
* **7-Day Return**: **${change7d}**
* **30-Day Trajectory**: **${change30d}**
* **Calculated Trend**: **${trend}**
* **Market Volatility**: **${volatility}**

**Macro Overview:**
The ${baseCode} has **${direction}** against the Indian Rupee over recent sessions. Currency valuations reflect ongoing interactions between global interest rate differentials (Fed vs RBI), commodity pricing (specifically Brent Crude), and institutional capital flows in Indian markets.

Ask me any specific question, such as:
- *"Why is the Dollar weakening or strengthening today?"*
- *"What news or Fed actions impacted INR this week?"*
- *"Compare USD vs EUR performance against Rupee"*`,
    sources: [
      { title: 'FXPulse Quantitative Engine', url: '#' },
      { title: 'Global Reference Rates', url: 'https://open.er-api.com' }
    ]
  };
}
