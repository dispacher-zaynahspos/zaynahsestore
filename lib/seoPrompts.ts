interface AISettings {
  brand_name: string;
  store_type: string;
  target_market: string;
  tone: string;
  language: string;
  custom_instructions: string;
}

/**
 * Builds the system prompt for the SEO Copywriter AI agent based on store settings
 */
export function buildSystemPrompt(settings: AISettings): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaynahs.pk';
  return `You are an expert SEO copywriter and marketing specialist for the brand "${settings.brand_name || 'Zaynahs E-Store'}".
Store Type: ${settings.store_type || 'General'} clothing & fashion store.
Target Market: ${settings.target_market || 'Pakistan'}.
Tone of Voice: ${settings.tone || 'Professional'}.
Target Language: Write content in ${settings.language || 'English'}.
${settings.custom_instructions ? `Special Brand Instructions: ${settings.custom_instructions}` : ''}

STRICT SEO & COPYWRITING INSTRUCTIONS:
1. The Primary Focus Keyword MUST appear in the first sentence of the meta description and long description.
2. The long description MUST be at least 1000 words, written in rich, informative, engaging markdown-like HTML (using <h2>, <p>, <ul>, <li> tags). Do not include <html>, <head>, or <body> tags.
3. Incorporate the store website URL (${siteUrl}) naturally 2-3 times as contextual internal links.
4. FAQ Schema MUST contain 3-5 relevant questions and answers providing structured information about sizing, materials, delivery, and exchange.
5. You must output ONLY a valid, parseable JSON object fitting the requested schema. Do not output any thinking tags, markdown wrapper blocks (like \`\`\`json), or conversational text. Return only raw JSON.`;
}

/**
 * Builds the user prompt detailing the entity data and requested JSON schema
 */
export function buildSEOPrompt(type: 'product' | 'category' | 'page', data: any): string {
  const basePrompt = `Generate complete, premium SEO and copywriting metadata for this ${type}.`;

  let contextInfo = '';
  if (type === 'product') {
    contextInfo = `
Product Details:
- Name: ${data.name}
- Original Description: ${data.description || 'Not provided'}
- Price: PKR ${data.price}
- Category: ${data.category || 'General'}
- Status: ${data.stock > 0 ? 'In Stock' : 'Out of Stock'}
`;
  } else if (type === 'category') {
    contextInfo = `
Category Details:
- Name: ${data.name}
- Original Description: ${data.description || 'Not provided'}
`;
  } else {
    contextInfo = `
Page Details:
- Title: ${data.title}
- Original Content: ${data.description || 'Not provided'}
`;
  }

  return `${basePrompt}
${contextInfo}

Return ONLY a JSON object formatted exactly as below (no comments, no wrapper formatting):
{
  "seo_title": "Max 60 characters. Place primary keyword at the beginning, followed by brand suffix.",
  "meta_description": "Exactly 150-160 characters. Must contain the primary keyword and end with a compelling call-to-action (CTA).",
  "focus_keyword": "The single primary keyword phrase chosen for this item.",
  "secondary_keywords": "5 relevant secondary keywords, comma-separated.",
  "lsi_tags": "12 comma-separated LSI (Latent Semantic Indexing) keyword tags.",
  "og_title": "Open Graph title optimized for Facebook and Instagram shares (under 60 chars).",
  "og_description": "Open Graph description (150-200 chars) for social cards.",
  "twitter_title": "Twitter card title (under 60 chars).",
  "twitter_description": "Twitter card description (under 160 chars).",
  "image_alt": "Highly descriptive image ALT text incorporating the focus keyword.",
  "long_description": "A 1000+ words detailed HTML copywriting copy. Break into logical sections with <h2> headers, bullet lists (<ul>, <li>), and paragraphs (<p>).",
  "faq_schema": [
    {
      "q": "Question related to materials, delivery, or sizing?",
      "a": "Detailed answers matching brand guidelines."
    }
  ],
  "pinterest_description": "Rich Pin description including sizing tags and keywords."
}`;
}
