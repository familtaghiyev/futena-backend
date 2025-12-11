// Translation helper with smart fallback system
// Priority 1: Google Translate API (if GOOGLE_TRANSLATE_API_KEY is set in .env)
// Priority 2: MyMemory Translation API (FREE - 10,000 words/day, no API key required)
//
// To use Google Translate:
// 1. Get API key from Google Cloud Console
// 2. Add to .env file: GOOGLE_TRANSLATE_API_KEY=your_api_key_here
// 3. Restart server
// System will automatically use Google Translate if API key is available

const isDevelopment = process.env.NODE_ENV === 'development';

// Use node's built-in https module or install node-fetch
// For Node.js 18+, fetch is available globally
let fetch;
try {
  // Try to use global fetch (Node.js 18+)
  if (typeof globalThis.fetch !== 'undefined') {
    fetch = globalThis.fetch;
  } else {
    // Fallback to node-fetch if available
    fetch = require('node-fetch');
  }
} catch (e) {
  // If node-fetch is not available, use https module
  const https = require('https');
  fetch = (url, options) => {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            json: async () => JSON.parse(data),
            text: async () => data
          });
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  };
}

const translateText = async (text, targetLanguage, sourceLanguage = 'en') => {
  if (!text || text.trim() === '') {
    return '';
  }

  // If source and target are same, return original text
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  try {
    // Language codes mapping
    const languageMap = {
      'en': 'en',
      'az': 'az',
      'ru': 'ru'
    };

    const targetLang = languageMap[targetLanguage] || targetLanguage;
    const sourceLang = languageMap[sourceLanguage] || sourceLanguage;

    // Priority 1: Google Translate API (if API key is provided in .env)
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (googleApiKey) {
      try {
        if (isDevelopment) {
          console.log(`🌐 Using Google Translate: ${sourceLang} -> ${targetLang} | Text: "${text.substring(0, 50)}..."`);
        }
        const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;
        
        const response = await fetch(googleUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.translations && data.data.translations.length > 0) {
            const translatedText = data.data.translations[0].translatedText;
            if (isDevelopment) {
              console.log(`✅ Google Translate success: "${text.substring(0, 30)}..." -> "${translatedText.substring(0, 30)}..."`);
            }
            return translatedText;
          }
        } else {
          if (isDevelopment) {
            const errorText = await response.text();
            console.log(`⚠️ Google Translate error (${response.status}):`, errorText.substring(0, 200));
            console.log('🔄 Falling back to MyMemory Translation...');
          }
        }
      } catch (googleError) {
        console.error('❌ Google Translate failed:', googleError.message);
        if (isDevelopment) {
          console.log('🔄 Falling back to MyMemory Translation...');
        }
      }
    }

    // Priority 2: MyMemory Translation API (FREE - 10,000 words/day, no API key required)
    try {
      if (isDevelopment) {
        console.log(`🌐 Trying MyMemory Translation: ${sourceLang} -> ${targetLang}`);
      }
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
      
      const response = await fetch(myMemoryUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
          const translatedText = data.responseData.translatedText.trim();
          // Check if translation is actually different from source (not just same text)
          if (translatedText && translatedText.toLowerCase() !== text.toLowerCase()) {
            if (isDevelopment) {
              console.log(`✅ MyMemory success: "${translatedText}"`);
            }
            return translatedText;
          } else {
            if (isDevelopment) {
              console.log(`⚠️ MyMemory returned same text (translation failed): "${translatedText}"`);
            }
            // If translation is same as source, return empty string so fallback can be used
            return '';
          }
        }
      } else {
        if (isDevelopment) {
          console.log(`⚠️ MyMemory error (${response.status})`);
        }
      }
    } catch (myMemoryError) {
      console.error('❌ MyMemory failed:', myMemoryError.message);
    }

    // If both fail, return empty string
    if (isDevelopment) {
      console.warn('⚠️ Translation failed. No API key or LibreTranslate unavailable.');
    }
    return '';
  } catch (error) {
    console.error('Translation error:', error);
    // Return empty string on error - user can manually fill
    return '';
  }
};

// Translate text to multiple languages
const translateToAllLanguages = async (text, sourceLanguage = 'en') => {
  const languages = ['en', 'az', 'ru'];
  const translations = {};

  // Don't translate if source language is already in the list
  const targetLanguages = languages.filter(lang => lang !== sourceLanguage);

  // Add source language text
  translations[`title_${sourceLanguage}`] = text;
  translations[`description_${sourceLanguage}`] = text;

  // Translate to other languages
  for (const lang of targetLanguages) {
    try {
      const translated = await translateText(text, lang, sourceLanguage);
      translations[`title_${lang}`] = translated;
      translations[`description_${lang}`] = translated;
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
      translations[`title_${lang}`] = '';
      translations[`description_${lang}`] = '';
    }
  }

  return translations;
};

// Translate title and description separately
const translateNewsContent = async (title, description, sourceLanguage = 'en') => {
  const languages = ['en', 'az', 'ru'];
  const result = {
    title_en: '',
    title_az: '',
    title_ru: '',
    description_en: '',
    description_az: '',
    description_ru: ''
  };

  // Set source language values
  result[`title_${sourceLanguage}`] = title || '';
  result[`description_${sourceLanguage}`] = description || '';

  // Translate to other languages
  const targetLanguages = languages.filter(lang => lang !== sourceLanguage);

  for (const lang of targetLanguages) {
    try {
      if (title) {
        result[`title_${lang}`] = await translateText(title, lang, sourceLanguage);
      }
      if (description) {
        result[`description_${lang}`] = await translateText(description, lang, sourceLanguage);
      }
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
      result[`title_${lang}`] = '';
      result[`description_${lang}`] = '';
    }
  }

  return result;
};

// Generic translation function for title/description fields (Products, Team, etc.)
const translateTitleDescription = async (title, description, sourceLanguage = 'en') => {
  const languages = ['en', 'az', 'ru'];
  const result = {
    title_en: '',
    title_az: '',
    title_ru: '',
    description_en: '',
    description_az: '',
    description_ru: ''
  };

  result[`title_${sourceLanguage}`] = title || '';
  result[`description_${sourceLanguage}`] = description || '';

  const targetLanguages = languages.filter(lang => lang !== sourceLanguage);

  for (const lang of targetLanguages) {
    try {
      if (title) {
        result[`title_${lang}`] = await translateText(title, lang, sourceLanguage);
      }
      if (description) {
        result[`description_${lang}`] = await translateText(description, lang, sourceLanguage);
      }
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
      result[`title_${lang}`] = '';
      result[`description_${lang}`] = '';
    }
  }

  return result;
};

// Generic translation function for question/answer fields (FAQs)
const translateQuestionAnswer = async (question, answer, sourceLanguage = 'en') => {
  const languages = ['en', 'az', 'ru'];
  const result = {
    question_en: '',
    question_az: '',
    question_ru: '',
    answer_en: '',
    answer_az: '',
    answer_ru: ''
  };

  result[`question_${sourceLanguage}`] = question || '';
  result[`answer_${sourceLanguage}`] = answer || '';

  const targetLanguages = languages.filter(lang => lang !== sourceLanguage);

  for (const lang of targetLanguages) {
    try {
      if (question) {
        result[`question_${lang}`] = await translateText(question, lang, sourceLanguage);
      }
      if (answer) {
        result[`answer_${lang}`] = await translateText(answer, lang, sourceLanguage);
      }
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
      result[`question_${lang}`] = '';
      result[`answer_${lang}`] = '';
    }
  }

  return result;
};

// Generic translation function for title/paragraph fields (UsageArea)
const translateTitleParagraph = async (title, paragraph, sourceLanguage = 'en') => {
  const languages = ['en', 'az', 'ru'];
  const result = {
    title_en: '',
    title_az: '',
    title_ru: '',
    paragraph_en: '',
    paragraph_az: '',
    paragraph_ru: ''
  };

  result[`title_${sourceLanguage}`] = title || '';
  result[`paragraph_${sourceLanguage}`] = paragraph || '';

  const targetLanguages = languages.filter(lang => lang !== sourceLanguage);

  for (const lang of targetLanguages) {
    try {
      if (title) {
        result[`title_${lang}`] = await translateText(title, lang, sourceLanguage);
      }
      if (paragraph) {
        result[`paragraph_${lang}`] = await translateText(paragraph, lang, sourceLanguage);
      }
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
      result[`title_${lang}`] = '';
      result[`paragraph_${lang}`] = '';
    }
  }

  return result;
};

// Generic translation function for name field (Certificates)
const translateName = async (name, sourceLanguage = 'en') => {
  const languages = ['en', 'az', 'ru'];
  const result = {
    name_en: '',
    name_az: '',
    name_ru: ''
  };

  result[`name_${sourceLanguage}`] = name || '';

  const targetLanguages = languages.filter(lang => lang !== sourceLanguage);

  for (const lang of targetLanguages) {
    try {
      if (name) {
        result[`name_${lang}`] = await translateText(name, lang, sourceLanguage);
      }
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
      result[`name_${lang}`] = '';
    }
  }

  return result;
};

module.exports = {
  translateText,
  translateToAllLanguages,
  translateNewsContent,
  translateTitleDescription,
  translateQuestionAnswer,
  translateTitleParagraph,
  translateName
};

