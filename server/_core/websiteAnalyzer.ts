/**
 * Website Analyzer Service
 * 
 * خدمة تحليل المواقع الذكية باستخدام AI
 * تقوم بتحليل شامل للمواقع الإلكترونية واستخراج المعلومات المهمة
 */

import { invokeLLM } from "./llm";
import { JSDOM } from "jsdom";

// ============================================
// Types & Interfaces
// ============================================

export interface WebsiteAnalysisResult {
  // Basic Info
  title: string;
  description: string;
  industry: string;
  language: string;

  // SEO Analysis
  seoScore: number;
  seoIssues: string[];
  metaTags: {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };

  // Performance Analysis
  performanceScore: number;
  loadTime: number;
  pageSize: number;

  // UX Analysis
  uxScore: number;
  mobileOptimized: boolean;
  hasContactInfo: boolean;
  hasWhatsapp: boolean;

  // Content Analysis
  contentQuality: number;
  wordCount: number;
  imageCount: number;
  videoCount: number;

  // Overall Score
  overallScore: number;
}

export interface ExtractedProduct {
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  productUrl?: string;
  category?: string;
  tags?: string[];
  inStock: boolean;
  confidence: number;
}

export interface WebsiteInsight {
  category: 'seo' | 'performance' | 'ux' | 'content' | 'marketing' | 'security';
  type: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  impact?: string;
  confidence: number;
}

// ============================================
// Core Functions
// ============================================

/**
 * استخراج محتوى الموقع
 */
export async function scrapeWebsite(url: string): Promise<{
  html: string;
  dom: JSDOM;
  text: string;
}> {
  try {
    // Fetch the website
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract text content
    const text = document.body.textContent || '';

    return { html, dom, text };
  } catch (error) {
    console.error('[WebsiteAnalyzer] Error scraping website:', error);
    throw error;
  }
}

/**
 * تحليل SEO للموقع
 */
export function analyzeSEO(dom: JSDOM): {
  score: number;
  issues: string[];
  metaTags: any;
} {
  const document = dom.window.document;
  const issues: string[] = [];
  let score = 100;

  // Extract meta tags
  const metaTags: any = {};
  
  const titleTag = document.querySelector('title');
  metaTags.title = titleTag?.textContent || '';
  if (!metaTags.title || metaTags.title.length < 10) {
    issues.push('عنوان الصفحة قصير جداً أو غير موجود');
    score -= 15;
  }

  const descriptionTag = document.querySelector('meta[name="description"]');
  metaTags.description = descriptionTag?.getAttribute('content') || '';
  if (!metaTags.description || metaTags.description.length < 50) {
    issues.push('وصف الصفحة قصير جداً أو غير موجود');
    score -= 15;
  }

  const keywordsTag = document.querySelector('meta[name="keywords"]');
  metaTags.keywords = keywordsTag?.getAttribute('content') || '';

  // Open Graph tags
  metaTags.ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
  metaTags.ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
  metaTags.ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

  if (!metaTags.ogTitle) {
    issues.push('عنوان Open Graph غير موجود');
    score -= 10;
  }

  if (!metaTags.ogImage) {
    issues.push('صورة Open Graph غير موجودة');
    score -= 10;
  }

  // Check for heading structure
  const h1Tags = document.querySelectorAll('h1');
  if (h1Tags.length === 0) {
    issues.push('لا يوجد عنوان رئيسي (H1) في الصفحة');
    score -= 10;
  } else if (h1Tags.length > 1) {
    issues.push('يوجد أكثر من عنوان رئيسي (H1) في الصفحة');
    score -= 5;
  }

  // Check for alt text on images
  const images = document.querySelectorAll('img');
  let imagesWithoutAlt = 0;
  images.forEach(img => {
    if (!img.getAttribute('alt')) {
      imagesWithoutAlt++;
    }
  });
  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} صورة بدون نص بديل (alt text)`);
    score -= Math.min(10, imagesWithoutAlt * 2);
  }

  return {
    score: Math.max(0, score),
    issues,
    metaTags
  };
}

/**
 * تحليل الأداء
 */
export function analyzePerformance(html: string, dom: JSDOM): {
  score: number;
  loadTime: number;
  pageSize: number;
} {
  const document = dom.window.document;
  let score = 100;

  // Calculate page size
  const pageSize = Buffer.byteLength(html, 'utf8');
  
  // Estimate load time based on page size (rough estimation)
  const loadTime = Math.round((pageSize / 1024) * 0.1); // milliseconds per KB

  // Penalize large pages
  if (pageSize > 5 * 1024 * 1024) { // > 5MB
    score -= 30;
  } else if (pageSize > 2 * 1024 * 1024) { // > 2MB
    score -= 15;
  }

  // Check for optimization issues
  const images = document.querySelectorAll('img');
  const scripts = document.querySelectorAll('script');
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

  if (images.length > 50) {
    score -= 10;
  }

  if (scripts.length > 20) {
    score -= 10;
  }

  if (stylesheets.length > 10) {
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    loadTime,
    pageSize
  };
}

/**
 * تحليل تجربة المستخدم (UX)
 */
export function analyzeUX(dom: JSDOM, text: string): {
  score: number;
  mobileOptimized: boolean;
  hasContactInfo: boolean;
  hasWhatsapp: boolean;
} {
  const document = dom.window.document;
  let score = 100;

  // Check for viewport meta tag (mobile optimization)
  const viewportTag = document.querySelector('meta[name="viewport"]');
  const mobileOptimized = !!viewportTag;
  if (!mobileOptimized) {
    score -= 20;
  }

  // Check for contact information
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const hasPhone = phoneRegex.test(text);
  const hasEmail = emailRegex.test(text);
  const hasContactInfo = hasPhone || hasEmail;
  
  if (!hasContactInfo) {
    score -= 15;
  }

  // Check for WhatsApp
  const whatsappRegex = /whatsapp|واتساب|واتس اب/gi;
  const hasWhatsapp = whatsappRegex.test(text) || 
                      !!document.querySelector('a[href*="wa.me"]') ||
                      !!document.querySelector('a[href*="whatsapp"]');

  if (!hasWhatsapp) {
    score -= 10;
  }

  // Check for navigation
  const nav = document.querySelector('nav');
  if (!nav) {
    score -= 10;
  }

  // Check for footer
  const footer = document.querySelector('footer');
  if (!footer) {
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    mobileOptimized,
    hasContactInfo,
    hasWhatsapp
  };
}

/**
 * تحليل المحتوى
 */
export function analyzeContent(dom: JSDOM, text: string): {
  score: number;
  wordCount: number;
  imageCount: number;
  videoCount: number;
} {
  const document = dom.window.document;
  let score = 100;

  // Count words
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;

  if (wordCount < 300) {
    score -= 20;
  } else if (wordCount < 500) {
    score -= 10;
  }

  // Count images
  const imageCount = document.querySelectorAll('img').length;
  if (imageCount === 0) {
    score -= 15;
  }

  // Count videos
  const videoCount = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length;

  return {
    score: Math.max(0, score),
    wordCount,
    imageCount,
    videoCount
  };
}

/**
 * تحليل شامل للموقع
 */
export async function analyzeWebsite(url: string): Promise<WebsiteAnalysisResult> {
  try {
    console.log('[WebsiteAnalyzer] Analyzing website:', url);

    // Scrape website
    const { html, dom, text } = await scrapeWebsite(url);
    const document = dom.window.document;

    // Basic info
    const title = document.querySelector('title')?.textContent || '';
    const descriptionTag = document.querySelector('meta[name="description"]');
    const description = descriptionTag?.getAttribute('content') || '';

    // Run all analyses
    const seoAnalysis = analyzeSEO(dom);
    const performanceAnalysis = analyzePerformance(html, dom);
    const uxAnalysis = analyzeUX(dom, text);
    const contentAnalysis = analyzeContent(dom, text);

    // Detect language
    const htmlLang = document.documentElement.lang || '';
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const language = isArabic ? 'ar' : (htmlLang || 'en');

    // Calculate overall score
    const overallScore = Math.round(
      (seoAnalysis.score * 0.3) +
      (performanceAnalysis.score * 0.25) +
      (uxAnalysis.score * 0.25) +
      (contentAnalysis.score * 0.2)
    );

    // Detect industry using AI
    const industry = await detectIndustry(title, description, text);

    return {
      title,
      description,
      industry,
      language,
      seoScore: seoAnalysis.score,
      seoIssues: seoAnalysis.issues,
      metaTags: seoAnalysis.metaTags,
      performanceScore: performanceAnalysis.score,
      loadTime: performanceAnalysis.loadTime,
      pageSize: performanceAnalysis.pageSize,
      uxScore: uxAnalysis.score,
      mobileOptimized: uxAnalysis.mobileOptimized,
      hasContactInfo: uxAnalysis.hasContactInfo,
      hasWhatsapp: uxAnalysis.hasWhatsapp,
      contentQuality: contentAnalysis.score,
      wordCount: contentAnalysis.wordCount,
      imageCount: contentAnalysis.imageCount,
      videoCount: contentAnalysis.videoCount,
      overallScore
    };
  } catch (error) {
    console.error('[WebsiteAnalyzer] Error analyzing website:', error);
    throw error;
  }
}

/**
 * استخراج المنتجات من الموقع باستخدام AI
 */
export async function extractProducts(url: string, html: string, text: string): Promise<ExtractedProduct[]> {
  try {
    console.log('[WebsiteAnalyzer] Extracting products from:', url);

    // Use AI to extract products
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `أنت خبير في استخراج معلومات المنتجات من المواقع الإلكترونية. قم بتحليل المحتوى واستخراج قائمة المنتجات أو الخدمات المتاحة.

يجب أن تكون الإجابة بصيغة JSON فقط، بدون أي نص إضافي.`
        },
        {
          role: 'user',
          content: `قم بتحليل هذا الموقع واستخراج جميع المنتجات أو الخدمات:

النص: ${text.substring(0, 8000)}

استخرج المنتجات بالتنسيق التالي (JSON فقط):
{
  "products": [
    {
      "name": "اسم المنتج",
      "description": "وصف المنتج",
      "price": 100.00,
      "currency": "SAR",
      "category": "الفئة",
      "tags": ["تاج1", "تاج2"],
      "inStock": true,
      "confidence": 85
    }
  ]
}`
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'product_extraction',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    currency: { type: 'string' },
                    category: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    inStock: { type: 'boolean' },
                    confidence: { type: 'number' }
                  },
                  required: ['name', 'description', 'price', 'currency', 'inStock', 'confidence'],
                  additionalProperties: false
                }
              }
            },
            required: ['products'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return [];
    }

    const result = JSON.parse(content);
    return result.products || [];
  } catch (error) {
    console.error('[WebsiteAnalyzer] Error extracting products:', error);
    return [];
  }
}

/**
 * توليد رؤى ذكية باستخدام AI
 */
export async function generateInsights(analysis: WebsiteAnalysisResult): Promise<WebsiteInsight[]> {
  try {
    console.log('[WebsiteAnalyzer] Generating insights');

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `أنت خبير في تحليل المواقع الإلكترونية وتقديم رؤى استراتيجية. قم بتحليل نتائج التحليل وتقديم رؤى قيمة وتوصيات عملية.

يجب أن تكون الإجابة بصيغة JSON فقط، بدون أي نص إضافي.`
        },
        {
          role: 'user',
          content: `بناءً على نتائج التحليل التالية، قدم رؤى ذكية وتوصيات:

نتائج التحليل:
- العنوان: ${analysis.title}
- الوصف: ${analysis.description}
- الصناعة: ${analysis.industry}
- نقاط SEO: ${analysis.seoScore}/100
- مشاكل SEO: ${analysis.seoIssues.join(', ')}
- نقاط الأداء: ${analysis.performanceScore}/100
- نقاط UX: ${analysis.uxScore}/100
- محسّن للجوال: ${analysis.mobileOptimized ? 'نعم' : 'لا'}
- يحتوي على واتساب: ${analysis.hasWhatsapp ? 'نعم' : 'لا'}
- جودة المحتوى: ${analysis.contentQuality}/100
- عدد الكلمات: ${analysis.wordCount}

قدم رؤى بالتنسيق التالي (JSON فقط):
{
  "insights": [
    {
      "category": "seo",
      "type": "weakness",
      "priority": "high",
      "title": "عنوان الرؤية",
      "description": "وصف تفصيلي",
      "recommendation": "التوصية",
      "impact": "التأثير المتوقع",
      "confidence": 90
    }
  ]
}`
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'insights_generation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              insights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    category: { 
                      type: 'string',
                      enum: ['seo', 'performance', 'ux', 'content', 'marketing', 'security']
                    },
                    type: { 
                      type: 'string',
                      enum: ['strength', 'weakness', 'opportunity', 'threat', 'recommendation']
                    },
                    priority: { 
                      type: 'string',
                      enum: ['low', 'medium', 'high', 'critical']
                    },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    recommendation: { type: 'string' },
                    impact: { type: 'string' },
                    confidence: { type: 'number' }
                  },
                  required: ['category', 'type', 'priority', 'title', 'description', 'confidence'],
                  additionalProperties: false
                }
              }
            },
            required: ['insights'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return [];
    }

    const result = JSON.parse(content);
    return result.insights || [];
  } catch (error) {
    console.error('[WebsiteAnalyzer] Error generating insights:', error);
    return [];
  }
}

/**
 * اكتشاف الصناعة باستخدام AI
 */
async function detectIndustry(title: string, description: string, text: string): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'أنت خبير في تصنيف المواقع الإلكترونية حسب الصناعة. قم بتحليل المحتوى وتحديد الصناعة بكلمة أو كلمتين فقط.'
        },
        {
          role: 'user',
          content: `حدد الصناعة لهذا الموقع:

العنوان: ${title}
الوصف: ${description}
المحتوى: ${text.substring(0, 1000)}

أجب بكلمة أو كلمتين فقط تصف الصناعة (مثل: تجارة إلكترونية، خدمات مالية، مطاعم، تعليم، إلخ)`
        }
      ]
    });

    return response.choices[0].message.content?.trim() || 'غير محدد';
  } catch (error) {
    console.error('[WebsiteAnalyzer] Error detecting industry:', error);
    return 'غير محدد';
  }
}

/**
 * مقارنة مع المنافسين
 */
export async function compareWithCompetitors(
  merchantAnalysis: WebsiteAnalysisResult,
  competitorAnalyses: WebsiteAnalysisResult[]
): Promise<{
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}> {
  try {
    console.log('[WebsiteAnalyzer] Comparing with competitors');

    const competitorsData = competitorAnalyses.map(comp => ({
      title: comp.title,
      overallScore: comp.overallScore,
      seoScore: comp.seoScore,
      performanceScore: comp.performanceScore,
      uxScore: comp.uxScore
    }));

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `أنت خبير في التحليل التنافسي. قم بمقارنة الموقع مع المنافسين وتحديد نقاط القوة والضعف والفرص.

يجب أن تكون الإجابة بصيغة JSON فقط، بدون أي نص إضافي.`
        },
        {
          role: 'user',
          content: `قارن هذا الموقع مع المنافسين:

موقع التاجر:
- العنوان: ${merchantAnalysis.title}
- النقاط الإجمالية: ${merchantAnalysis.overallScore}/100
- SEO: ${merchantAnalysis.seoScore}/100
- الأداء: ${merchantAnalysis.performanceScore}/100
- UX: ${merchantAnalysis.uxScore}/100

المنافسون:
${competitorsData.map((c, i) => `
${i + 1}. ${c.title}
   - النقاط: ${c.overallScore}/100
   - SEO: ${c.seoScore}/100
   - الأداء: ${c.performanceScore}/100
   - UX: ${c.uxScore}/100
`).join('\n')}

قدم التحليل بالتنسيق التالي (JSON فقط):
{
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"],
  "opportunities": ["فرصة 1", "فرصة 2"]
}`
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'competitor_comparison',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              strengths: { type: 'array', items: { type: 'string' } },
              weaknesses: { type: 'array', items: { type: 'string' } },
              opportunities: { type: 'array', items: { type: 'string' } }
            },
            required: ['strengths', 'weaknesses', 'opportunities'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { strengths: [], weaknesses: [], opportunities: [] };
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('[WebsiteAnalyzer] Error comparing with competitors:', error);
    return { strengths: [], weaknesses: [], opportunities: [] };
  }
}
