const mongoose = require('mongoose');
require('dotenv').config();

// Import models and translation helper
const UsageArea = require('../models/UsageArea');
const { translateTitleParagraph } = require('../utils/translationHelper');

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frutena';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Find source language (which language has content)
const findSourceLanguage = (area) => {
  // Check which language has content for title
  if (area.title_en && area.title_en.trim() !== '' && area.title_en.toLowerCase() !== area.title_az?.toLowerCase() && area.title_en.toLowerCase() !== area.title_ru?.toLowerCase()) {
    return 'en';
  }
  if (area.title_az && area.title_az.trim() !== '' && area.title_az.toLowerCase() !== area.title_en?.toLowerCase() && area.title_az.toLowerCase() !== area.title_ru?.toLowerCase()) {
    return 'az';
  }
  if (area.title_ru && area.title_ru.trim() !== '' && area.title_ru.toLowerCase() !== area.title_en?.toLowerCase() && area.title_ru.toLowerCase() !== area.title_az?.toLowerCase()) {
    return 'ru';
  }
  
  // Fallback: find any language with content
  if (area.title_en && area.title_en.trim() !== '') return 'en';
  if (area.title_az && area.title_az.trim() !== '') return 'az';
  if (area.title_ru && area.title_ru.trim() !== '') return 'ru';
  
  return null;
};

// Translate Usage Areas
const translateUsageAreas = async () => {
  try {
    console.log('\n🔄 Translating Usage Areas...\n');
    const usageAreas = await UsageArea.find({});
    let translatedCount = 0;
    let skippedCount = 0;
    
    for (const area of usageAreas) {
      try {
        // Find source language
        const sourceLang = findSourceLanguage(area);
        
        if (!sourceLang) {
          console.log(`⏭️  Skipping ${area._id}: No content found in any language`);
          skippedCount++;
          continue;
        }
        
        // Get source text
        const sourceTitle = area[`title_${sourceLang}`] || '';
        const sourceParagraph = area[`paragraph_${sourceLang}`] || area[`description_${sourceLang}`] || '';
        
        if (!sourceTitle || sourceTitle.trim() === '') {
          console.log(`⏭️  Skipping ${area._id}: No title found`);
          skippedCount++;
          continue;
        }
        
        console.log(`\n📝 Processing Usage Area: ${area._id}`);
        console.log(`   Source Language: ${sourceLang}`);
        console.log(`   Title: ${sourceTitle.substring(0, 50)}...`);
        
        // Check if translation is needed
        const needsTranslation = ['en', 'az', 'ru'].some(lang => {
          if (lang === sourceLang) return false;
          const title = area[`title_${lang}`];
          const paragraph = area[`paragraph_${lang}`];
          // Need translation if field is empty or same as source
          return !title || title.trim() === '' || title.toLowerCase() === sourceTitle.toLowerCase();
        });
        
        if (!needsTranslation) {
          console.log(`   ✅ Already translated in all languages`);
          skippedCount++;
          continue;
        }
        
        // Translate
        console.log(`   🌐 Translating to other languages...`);
        const translations = await translateTitleParagraph(sourceTitle, sourceParagraph, sourceLang);
        
        // Update only if translation is different from source
        let updated = false;
        let hasNewTranslation = false;
        
        for (const lang of ['en', 'az', 'ru']) {
          if (lang === sourceLang) continue;
          
          const translatedTitle = translations[`title_${lang}`];
          const translatedParagraph = translations[`paragraph_${lang}`];
          
          // Check if we got a valid translation (different from source)
          if (translatedTitle && translatedTitle.trim() !== '' && translatedTitle.toLowerCase() !== sourceTitle.toLowerCase()) {
            area[`title_${lang}`] = translatedTitle;
            updated = true;
            hasNewTranslation = true;
            console.log(`   ✅ ${lang.toUpperCase()} Title: ${translatedTitle.substring(0, 50)}...`);
          } else {
            // If translation failed, check current value
            const currentTitle = area[`title_${lang}`];
            if (!currentTitle || currentTitle.trim() === '' || currentTitle.toLowerCase() === sourceTitle.toLowerCase()) {
              // Field is empty or same as source, use source as fallback
              area[`title_${lang}`] = sourceTitle;
              updated = true;
              console.log(`   ⚠️  ${lang.toUpperCase()} Title: Translation failed, using source as fallback`);
            } else {
              console.log(`   ℹ️  ${lang.toUpperCase()} Title: Already has different content, keeping existing`);
            }
          }
          
          // Same for paragraph
          if (translatedParagraph && translatedParagraph.trim() !== '' && translatedParagraph.toLowerCase() !== sourceParagraph.toLowerCase()) {
            area[`paragraph_${lang}`] = translatedParagraph;
            updated = true;
            hasNewTranslation = true;
            console.log(`   ✅ ${lang.toUpperCase()} Paragraph: ${translatedParagraph.substring(0, 50)}...`);
          } else {
            const currentParagraph = area[`paragraph_${lang}`];
            if (!currentParagraph || currentParagraph.trim() === '' || currentParagraph.toLowerCase() === sourceParagraph.toLowerCase()) {
              area[`paragraph_${lang}`] = sourceParagraph;
              updated = true;
              console.log(`   ⚠️  ${lang.toUpperCase()} Paragraph: Translation failed, using source as fallback`);
            }
          }
        }
        
        if (updated) {
          await area.save();
          if (hasNewTranslation) {
            translatedCount++;
            console.log(`   ✅ Saved with new translations`);
          } else {
            skippedCount++;
            console.log(`   ⚠️  Saved with fallback (no new translations generated)`);
          }
        } else {
          console.log(`   ⏭️  No updates needed`);
          skippedCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`   ❌ Error processing ${area._id}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n✅ Translation complete!`);
    console.log(`   📊 Translated: ${translatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📦 Total: ${usageAreas.length}`);
    
  } catch (error) {
    console.error('❌ Error translating Usage Areas:', error);
  }
};

// Main function
const runTranslation = async () => {
  try {
    console.log('🚀 Starting Usage Area Translation...\n');
    
    await connectDB();
    await translateUsageAreas();
    
    console.log('\n✅ All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Translation failed:', error);
    process.exit(1);
  }
};

// Run translation
runTranslation();

