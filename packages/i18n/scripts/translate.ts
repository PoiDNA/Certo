import * as fs from 'fs';
import * as path from 'path';
import * as deepl from 'deepl-node';
import * as dotenv from 'dotenv';
import { locales, defaultLocale, fallbackLocale } from '../config';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.DEEPL_API_KEY;

if (!API_KEY) {
  console.error("ERROR: DEEPL_API_KEY environment variable is not set. Translation pipeline aborted.");
  process.exit(1);
}

const translator = new deepl.Translator(API_KEY);
const MESSAGES_DIR = path.resolve(__dirname, '../messages');
const IGNORED_NAMESPACES = ['Common'];
const TARGET_LOCALES = locales.filter(lang => lang !== defaultLocale && lang !== fallbackLocale);

async function translateObject(obj: any, targetLang: deepl.TargetLanguageCode): Promise<any> {
  const result: any = {};
  
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    
    if (key === '_meta') continue;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value.do_not_translate === true) {
        result[key] = value.value || value;
        continue;
      }
      result[key] = await translateObject(value, targetLang);
    } else if (typeof value === 'string') {
      try {
        const translationResult = await translator.translateText(value, 'pl', targetLang);
        result[key] = translationResult.text;
      } catch (error) {
        console.error(`Translation error for key "${key}" to ${targetLang}:`, error);
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function runTranslation() {
  console.log('--- Starting DeepL Translation Pipeline ---');
  
  const sourceFilePath = path.join(MESSAGES_DIR, `${defaultLocale}.json`);
  if (!fs.existsSync(sourceFilePath)) {
    console.error(`Source file not found: ${sourceFilePath}`);
    process.exit(1);
  }

  const sourceData = JSON.parse(fs.readFileSync(sourceFilePath, 'utf-8'));
  
  for (const lang of TARGET_LOCALES) {
    console.log(`[${lang}] Processing...`);
    const translatedData: any = {
      _meta: {
        status: "machine_translated",
        source: "deepl",
        reviewed: false,
        generated_at: new Date().toISOString(),
        source_language: defaultLocale
      }
    };

    let targetDeepLLang = lang.toUpperCase() as deepl.TargetLanguageCode;
    if (lang === 'en') targetDeepLLang = 'EN-US';
    if (lang === 'pt') targetDeepLLang = 'PT-PT';

    for (const namespace of Object.keys(sourceData)) {
      if (IGNORED_NAMESPACES.includes(namespace)) {
        translatedData[namespace] = sourceData[namespace];
        continue;
      }
      
      if (namespace === '_meta') continue;

      translatedData[namespace] = await translateObject(sourceData[namespace], targetDeepLLang);
    }

    const outputFilePath = path.join(MESSAGES_DIR, `${lang}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(translatedData, null, 2), 'utf-8');
    console.log(`[${lang}] Saved successfully.`);
  }

  console.log('--- Translation Pipeline Finished ---');
}

runTranslation().catch(err => {
  console.error('Critical error in translation pipeline:', err);
  process.exit(1);
});