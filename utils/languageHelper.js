// Helper function to get value with fallback priority
const getValueWithFallback = (obj, field, language, fallbackOrder = ['en', 'az', 'ru']) => {
  // Try requested language first
  const requestedValue = obj[`${field}_${language}`];
  const englishValue = obj[`${field}_en`];
  
  // If requested language value exists and is different from English, use it
  if (requestedValue !== undefined && requestedValue !== null && requestedValue !== '') {
    // If English value exists and requested value is same as English, try fallback
    if (englishValue && requestedValue === englishValue && language !== 'en') {
      // Requested language field exists but has same value as English (translation failed)
      // Try other languages as fallback
      const preferredFallback = ['en', 'az', 'ru'].filter(lang => lang !== language);
      for (const lang of preferredFallback) {
        const value = obj[`${field}_${lang}`];
        if (value !== undefined && value !== null && value !== '' && value !== englishValue) {
          return value; // Return if different from English
        }
      }
      // If all are same as English, return English
      return englishValue;
    }
    return requestedValue;
  }
  
  // Fallback priority: Always try English first, then others
  // This ensures English is preferred as fallback
  const preferredFallback = ['en', 'az', 'ru'].filter(lang => lang !== language);
  
  for (const lang of preferredFallback) {
    const value = obj[`${field}_${lang}`];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  
  // If nothing found, return empty string
  return '';
};

// Helper function to transform database objects to language-specific format
const transformToLanguage = (obj, lang = 'en') => {
  if (!obj) return obj;
  
  const transformed = obj.toObject ? obj.toObject() : { ...obj };
  const language = ['en', 'az', 'ru'].includes(lang) ? lang : 'en';
  
  // Check if new format exists (title_en, title_az, etc.)
  const hasNewFormat = transformed.title_en !== undefined || transformed.title_az !== undefined || transformed.title_ru !== undefined;
  
  // Transform title fields
  if (hasNewFormat) {
    // New format: use language-specific fields with smart fallback
    transformed.title = getValueWithFallback(transformed, 'title', language);
    // Remove language-specific fields from response
    delete transformed.title_en;
    delete transformed.title_az;
    delete transformed.title_ru;
  }
  // If old format exists, it will remain as is (backward compatibility)
  
  // Check if new format exists for description
  const hasNewDescriptionFormat = transformed.description_en !== undefined || transformed.description_az !== undefined || transformed.description_ru !== undefined;
  
  // Transform description fields
  if (hasNewDescriptionFormat) {
    // New format: use language-specific fields with smart fallback
    transformed.description = getValueWithFallback(transformed, 'description', language);
    // Remove language-specific fields from response
    delete transformed.description_en;
    delete transformed.description_az;
    delete transformed.description_ru;
  }
  // If old format exists, it will remain as is (backward compatibility)
  
  // Check if new format exists for paragraph
  const hasNewParagraphFormat = transformed.paragraph_en !== undefined || transformed.paragraph_az !== undefined || transformed.paragraph_ru !== undefined;
  
  // Transform paragraph fields
  if (hasNewParagraphFormat) {
    // New format: use language-specific fields with smart fallback
    transformed.paragraph = getValueWithFallback(transformed, 'paragraph', language);
    // Remove language-specific fields from response
    delete transformed.paragraph_en;
    delete transformed.paragraph_az;
    delete transformed.paragraph_ru;
  }
  // If old format exists, it will remain as is (backward compatibility)
  
  // Check if new format exists for question
  const hasNewQuestionFormat = transformed.question_en !== undefined || transformed.question_az !== undefined || transformed.question_ru !== undefined;
  
  // Transform question fields
  if (hasNewQuestionFormat) {
    // New format: use language-specific fields with smart fallback
    transformed.question = getValueWithFallback(transformed, 'question', language);
    // Remove language-specific fields from response
    delete transformed.question_en;
    delete transformed.question_az;
    delete transformed.question_ru;
  }
  // If old format exists, it will remain as is (backward compatibility)
  
  // Check if new format exists for answer
  const hasNewAnswerFormat = transformed.answer_en !== undefined || transformed.answer_az !== undefined || transformed.answer_ru !== undefined;
  
  // Transform answer fields
  if (hasNewAnswerFormat) {
    // New format: use language-specific fields with smart fallback
    transformed.answer = getValueWithFallback(transformed, 'answer', language);
    // Remove language-specific fields from response
    delete transformed.answer_en;
    delete transformed.answer_az;
    delete transformed.answer_ru;
  }
  // If old format exists, it will remain as is (backward compatibility)
  
  return transformed;
};

// Transform array of objects
const transformArrayToLanguage = (array, lang = 'en') => {
  if (!Array.isArray(array)) return array;
  return array.map(item => transformToLanguage(item, lang));
};

module.exports = {
  transformToLanguage,
  transformArrayToLanguage
};

