/**
 * Sentiment Analysis System
 * Analyzes customer emotions and adjusts responses accordingly
 */

import { callGPT4 } from './openai';

export type SentimentType = 'positive' | 'negative' | 'neutral' | 'angry' | 'happy' | 'sad' | 'frustrated';

export interface SentimentResult {
  sentiment: SentimentType;
  confidence: number; // 0-100
  keywords: string[];
  reasoning: string;
  suggestedTone?: string;
}

/**
 * Analyze sentiment of customer message
 */
export async function analyzeSentiment(message: string): Promise<SentimentResult> {
  try {
    const prompt = `حلل المشاعر في هذه الرسالة من العميل:

"${message}"

أعطني النتيجة بصيغة JSON:
{
  "sentiment": "positive|negative|neutral|angry|happy|sad|frustrated",
  "confidence": 85,
  "keywords": ["كلمة1", "كلمة2"],
  "reasoning": "سبب التصنيف",
  "suggestedTone": "النبرة المناسبة للرد (friendly/empathetic/professional)"
}

قواعد التصنيف:
- positive: رسائل إيجابية، شكر، مدح
- negative: شكاوى، استياء عام
- neutral: أسئلة عادية، استفسارات
- angry: غضب واضح، تهديد، ألفاظ قوية
- happy: سعادة، حماس، رضا
- sad: حزن، خيبة أمل
- frustrated: إحباط، تكرار مشكلة

أمثلة:
"شكراً جزيلاً، الخدمة ممتازة!" → positive, happy
"المنتج ما وصل وأنا زعلان" → negative, sad
"عندك جوالات؟" → neutral
"هذا ثالث مرة أشتكي وما في فايدة!" → negative, frustrated, angry`;

    const response = await callGPT4([
      { role: 'system', content: 'أنت خبير في تحليل المشاعر والعواطف في النصوص العربية. أجب بصيغة JSON فقط.' },
      { role: 'user', content: prompt },
    ], {
      temperature: 0.3,
      maxTokens: 300,
    });

    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(cleaned);

    return {
      sentiment: result.sentiment || 'neutral',
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      keywords: Array.isArray(result.keywords) ? result.keywords : [],
      reasoning: result.reasoning || 'تحليل تلقائي',
      suggestedTone: result.suggestedTone || 'friendly',
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    
    // Fallback: simple keyword-based analysis
    return fallbackSentimentAnalysis(message);
  }
}

/**
 * Fallback sentiment analysis using keywords
 */
function fallbackSentimentAnalysis(message: string): SentimentResult {
  const lowerMessage = message.toLowerCase();

  // Angry keywords
  const angryKeywords = ['غاضب', 'زعلان', 'مستاء', 'غلط', 'فاشل', 'سيء', 'ما يصلح', 'احتيال'];
  if (angryKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      sentiment: 'angry',
      confidence: 70,
      keywords: angryKeywords.filter(kw => lowerMessage.includes(kw)),
      reasoning: 'كلمات تدل على الغضب',
      suggestedTone: 'empathetic',
    };
  }

  // Frustrated keywords
  const frustratedKeywords = ['مرة ثانية', 'مرة تالتة', 'كل مرة', 'دايماً', 'ما في فايدة', 'تعبت'];
  if (frustratedKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      sentiment: 'frustrated',
      confidence: 75,
      keywords: frustratedKeywords.filter(kw => lowerMessage.includes(kw)),
      reasoning: 'تكرار المشاكل والإحباط',
      suggestedTone: 'empathetic',
    };
  }

  // Happy keywords
  const happyKeywords = ['شكراً', 'ممتاز', 'رائع', 'جميل', 'حلو', 'تمام', 'مبسوط', 'سعيد'];
  if (happyKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      sentiment: 'happy',
      confidence: 80,
      keywords: happyKeywords.filter(kw => lowerMessage.includes(kw)),
      reasoning: 'كلمات إيجابية وسعيدة',
      suggestedTone: 'friendly',
    };
  }

  // Sad keywords
  const sadKeywords = ['حزين', 'زعلان', 'خيبة', 'مكسور', 'متضايق'];
  if (sadKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      sentiment: 'sad',
      confidence: 75,
      keywords: sadKeywords.filter(kw => lowerMessage.includes(kw)),
      reasoning: 'كلمات تدل على الحزن',
      suggestedTone: 'empathetic',
    };
  }

  // Positive keywords
  const positiveKeywords = ['جيد', 'ممتاز', 'أحسن', 'أفضل', 'يعجبني'];
  if (positiveKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      sentiment: 'positive',
      confidence: 70,
      keywords: positiveKeywords.filter(kw => lowerMessage.includes(kw)),
      reasoning: 'كلمات إيجابية',
      suggestedTone: 'friendly',
    };
  }

  // Negative keywords
  const negativeKeywords = ['مشكلة', 'خطأ', 'عطل', 'ما يشتغل', 'سيء'];
  if (negativeKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      sentiment: 'negative',
      confidence: 65,
      keywords: negativeKeywords.filter(kw => lowerMessage.includes(kw)),
      reasoning: 'كلمات سلبية',
      suggestedTone: 'professional',
    };
  }

  // Default: neutral
  return {
    sentiment: 'neutral',
    confidence: 60,
    keywords: [],
    reasoning: 'رسالة عادية بدون مشاعر واضحة',
    suggestedTone: 'friendly',
  };
}

/**
 * Adjust response tone based on sentiment
 */
export function adjustResponseForSentiment(
  baseResponse: string,
  sentiment: SentimentResult
): string {
  // If customer is angry or frustrated, add empathy
  if (sentiment.sentiment === 'angry' || sentiment.sentiment === 'frustrated') {
    const empathyPhrases = [
      'أعتذر منك بشدة على هذا الإزعاج 🙏',
      'أتفهم تماماً شعورك وأعتذر عن المشكلة',
      'آسف جداً على التجربة السيئة',
    ];
    const randomPhrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    return `${randomPhrase}\n\n${baseResponse}`;
  }

  // If customer is sad, be more supportive
  if (sentiment.sentiment === 'sad') {
    const supportPhrases = [
      'أتفهم شعورك، وأنا هنا لمساعدتك',
      'آسف على خيبة الأمل، خلني أساعدك',
    ];
    const randomPhrase = supportPhrases[Math.floor(Math.random() * supportPhrases.length)];
    return `${randomPhrase}\n\n${baseResponse}`;
  }

  // If customer is happy, match their energy
  if (sentiment.sentiment === 'happy') {
    return `${baseResponse} 😊`;
  }

  // Default: return as is
  return baseResponse;
}

/**
 * Get sentiment statistics for a conversation
 */
export interface SentimentStats {
  totalMessages: number;
  positive: number;
  negative: number;
  neutral: number;
  angry: number;
  happy: number;
  sad: number;
  frustrated: number;
  averageConfidence: number;
  overallSentiment: SentimentType;
}

export function calculateSentimentStats(sentiments: SentimentResult[]): SentimentStats {
  if (sentiments.length === 0) {
    return {
      totalMessages: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      angry: 0,
      happy: 0,
      sad: 0,
      frustrated: 0,
      averageConfidence: 0,
      overallSentiment: 'neutral',
    };
  }

  const stats: SentimentStats = {
    totalMessages: sentiments.length,
    positive: 0,
    negative: 0,
    neutral: 0,
    angry: 0,
    happy: 0,
    sad: 0,
    frustrated: 0,
    averageConfidence: 0,
    overallSentiment: 'neutral',
  };

  let totalConfidence = 0;

  sentiments.forEach(s => {
    stats[s.sentiment]++;
    totalConfidence += s.confidence;
  });

  stats.averageConfidence = Math.round(totalConfidence / sentiments.length);

  // Determine overall sentiment
  const sentimentCounts = [
    { type: 'positive' as SentimentType, count: stats.positive },
    { type: 'negative' as SentimentType, count: stats.negative },
    { type: 'neutral' as SentimentType, count: stats.neutral },
    { type: 'angry' as SentimentType, count: stats.angry },
    { type: 'happy' as SentimentType, count: stats.happy },
    { type: 'sad' as SentimentType, count: stats.sad },
    { type: 'frustrated' as SentimentType, count: stats.frustrated },
  ];

  sentimentCounts.sort((a, b) => b.count - a.count);
  stats.overallSentiment = sentimentCounts[0].type;

  return stats;
}

/**
 * Get emoji for sentiment
 */
export function getSentimentEmoji(sentiment: SentimentType): string {
  const emojiMap: Record<SentimentType, string> = {
    positive: '😊',
    negative: '😕',
    neutral: '😐',
    angry: '😠',
    happy: '😄',
    sad: '😢',
    frustrated: '😤',
  };

  return emojiMap[sentiment] || '😐';
}

/**
 * Get color for sentiment (for UI)
 */
export function getSentimentColor(sentiment: SentimentType): string {
  const colorMap: Record<SentimentType, string> = {
    positive: 'green',
    negative: 'red',
    neutral: 'gray',
    angry: 'red',
    happy: 'green',
    sad: 'blue',
    frustrated: 'orange',
  };

  return colorMap[sentiment] || 'gray';
}
