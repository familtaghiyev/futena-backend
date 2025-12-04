const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const News = require('../models/News');
const Product = require('../models/Product');
const Slider = require('../models/Slider');
const TeamMember = require('../models/TeamMember');
const UsageArea = require('../models/UsageArea');
const FAQ = require('../models/FAQ');

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frutena';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Helper function to copy data between language fields
const copyLanguageData = (item, field) => {
  let updated = false;
  
  // Get all language variants
  const enValue = item[`${field}_en`];
  const azValue = item[`${field}_az`];
  const ruValue = item[`${field}_ru`];
  
  // Strategy: Copy first available language to all empty fields
  // Priority: en > az > ru
  
  let sourceValue = null;
  let sourceLang = null;
  
  // Find first available value
  if (enValue && enValue !== '' && enValue !== null) {
    sourceValue = enValue;
    sourceLang = 'en';
  } else if (azValue && azValue !== '' && azValue !== null) {
    sourceValue = azValue;
    sourceLang = 'az';
  } else if (ruValue && ruValue !== '' && ruValue !== null) {
    sourceValue = ruValue;
    sourceLang = 'ru';
  }
  
  // If we found a source value, copy it to empty fields
  if (sourceValue) {
    if ((!enValue || enValue === '') && sourceLang !== 'en') {
      item[`${field}_en`] = sourceValue;
      updated = true;
    }
    if ((!azValue || azValue === '') && sourceLang !== 'az') {
      item[`${field}_az`] = sourceValue;
      updated = true;
    }
    if ((!ruValue || ruValue === '') && sourceLang !== 'ru') {
      item[`${field}_ru`] = sourceValue;
      updated = true;
    }
  }
  
  return updated;
};

// Migrate News
const migrateNews = async () => {
  try {
    console.log('\n📰 Migrating News...');
    const newsItems = await News.find({});
    let updatedCount = 0;
    
    for (const news of newsItems) {
      let itemUpdated = false;
      
      // Copy title data
      if (copyLanguageData(news, 'title')) {
        itemUpdated = true;
      }
      
      // Copy description data
      if (copyLanguageData(news, 'description')) {
        itemUpdated = true;
      }
      
      if (itemUpdated) {
        await news.save();
        updatedCount++;
        console.log(`  ✓ Updated news: ${news._id}`);
      }
    }
    
    console.log(`✅ News migration complete: ${updatedCount}/${newsItems.length} items updated`);
  } catch (error) {
    console.error('❌ Error migrating News:', error);
  }
};

// Migrate Products
const migrateProducts = async () => {
  try {
    console.log('\n📦 Migrating Products...');
    const products = await Product.find({});
    let updatedCount = 0;
    
    for (const product of products) {
      let itemUpdated = false;
      
      if (copyLanguageData(product, 'title')) {
        itemUpdated = true;
      }
      
      if (copyLanguageData(product, 'description')) {
        itemUpdated = true;
      }
      
      if (itemUpdated) {
        await product.save();
        updatedCount++;
        console.log(`  ✓ Updated product: ${product._id}`);
      }
    }
    
    console.log(`✅ Products migration complete: ${updatedCount}/${products.length} items updated`);
  } catch (error) {
    console.error('❌ Error migrating Products:', error);
  }
};

// Migrate Sliders
const migrateSliders = async () => {
  try {
    console.log('\n🖼️  Migrating Sliders...');
    const sliders = await Slider.find({});
    let updatedCount = 0;
    
    for (const slider of sliders) {
      let itemUpdated = false;
      
      if (copyLanguageData(slider, 'title')) {
        itemUpdated = true;
      }
      
      if (copyLanguageData(slider, 'paragraph')) {
        itemUpdated = true;
      }
      
      if (itemUpdated) {
        await slider.save();
        updatedCount++;
        console.log(`  ✓ Updated slider: ${slider._id}`);
      }
    }
    
    console.log(`✅ Sliders migration complete: ${updatedCount}/${sliders.length} items updated`);
  } catch (error) {
    console.error('❌ Error migrating Sliders:', error);
  }
};

// Migrate Team Members
const migrateTeamMembers = async () => {
  try {
    console.log('\n👥 Migrating Team Members...');
    const teamMembers = await TeamMember.find({});
    let updatedCount = 0;
    
    for (const member of teamMembers) {
      let itemUpdated = false;
      
      if (copyLanguageData(member, 'title')) {
        itemUpdated = true;
      }
      
      if (copyLanguageData(member, 'description')) {
        itemUpdated = true;
      }
      
      if (itemUpdated) {
        await member.save();
        updatedCount++;
        console.log(`  ✓ Updated team member: ${member._id}`);
      }
    }
    
    console.log(`✅ Team Members migration complete: ${updatedCount}/${teamMembers.length} items updated`);
  } catch (error) {
    console.error('❌ Error migrating Team Members:', error);
  }
};

// Migrate Usage Areas
const migrateUsageAreas = async () => {
  try {
    console.log('\n📍 Migrating Usage Areas...');
    const usageAreas = await UsageArea.find({});
    let updatedCount = 0;
    
    for (const area of usageAreas) {
      let itemUpdated = false;
      
      if (copyLanguageData(area, 'title')) {
        itemUpdated = true;
      }
      
      if (copyLanguageData(area, 'paragraph')) {
        itemUpdated = true;
      }
      
      if (itemUpdated) {
        await area.save();
        updatedCount++;
        console.log(`  ✓ Updated usage area: ${area._id}`);
      }
    }
    
    console.log(`✅ Usage Areas migration complete: ${updatedCount}/${usageAreas.length} items updated`);
  } catch (error) {
    console.error('❌ Error migrating Usage Areas:', error);
  }
};

// Migrate FAQs
const migrateFAQs = async () => {
  try {
    console.log('\n❓ Migrating FAQs...');
    const faqs = await FAQ.find({});
    let updatedCount = 0;
    
    for (const faq of faqs) {
      let itemUpdated = false;
      
      if (copyLanguageData(faq, 'question')) {
        itemUpdated = true;
      }
      
      if (copyLanguageData(faq, 'answer')) {
        itemUpdated = true;
      }
      
      if (itemUpdated) {
        await faq.save();
        updatedCount++;
        console.log(`  ✓ Updated FAQ: ${faq._id}`);
      }
    }
    
    console.log(`✅ FAQs migration complete: ${updatedCount}/${faqs.length} items updated`);
  } catch (error) {
    console.error('❌ Error migrating FAQs:', error);
  }
};

// Main migration function
const runMigration = async () => {
  try {
    console.log('🚀 Starting Language Data Migration...\n');
    
    await connectDB();
    
    // Run migrations for all models
    await migrateNews();
    await migrateProducts();
    await migrateSliders();
    await migrateTeamMembers();
    await migrateUsageAreas();
    await migrateFAQs();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - All existing data has been copied to all language fields');
    console.log('   - Priority: English > Azerbaijani > Russian');
    console.log('   - If a field had data in one language, it was copied to empty fields');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
runMigration();

