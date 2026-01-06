import fs from 'fs';
import { invokeLLM } from './server/_core/llm.ts';

const arData = JSON.parse(fs.readFileSync('./client/src/locales/ar.json', 'utf-8'));

const languages = {
  fr: 'French',
  tr: 'Turkish',
  es: 'Spanish',
  it: 'Italian'
};

async function translateSection(section, targetLang) {
  const prompt = `Translate the following JSON object from Arabic to ${targetLang}. 
Keep the keys the same, only translate the values. 
Maintain the same JSON structure.
For currency symbol, use appropriate symbol for ${targetLang} speaking countries.
Return ONLY the translated JSON without any explanation.

JSON to translate:
${JSON.stringify(section, null, 2)}`;

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: 'You are a professional translator. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ]
  });

  const content = response.choices[0].message.content;
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
}

async function translateFile(langCode, langName) {
  console.log(`\nTranslating to ${langName}...`);
  const translated = {};
  
  const sections = Object.keys(arData);
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    console.log(`  Translating section ${i + 1}/${sections.length}: ${section}`);
    try {
      translated[section] = await translateSection(arData[section], langName);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  Error translating ${section}:`, error.message);
      translated[section] = arData[section]; // Fallback to original
    }
  }
  
  const outputPath = `./client/src/locales/${langCode}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf-8');
  console.log(`  ✓ Saved to ${outputPath}`);
}

async function main() {
  for (const [code, name] of Object.entries(languages)) {
    await translateFile(code, name);
  }
  console.log('\n✓ All translations completed!');
}

main().catch(console.error);
