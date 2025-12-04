const TeamMember = require('../models/TeamMember');
const { transformToLanguage, transformArrayToLanguage } = require('../utils/languageHelper');
const { translateTitleDescription } = require('../utils/translationHelper');

// Get all team members
exports.getAllTeamMembers = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const members = await TeamMember.find().sort({ createdAt: -1 });
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawMembers = members.map(item => item.toObject ? item.toObject() : { ...item });
      return res.status(200).json({
        success: true,
        count: rawMembers.length,
        data: rawMembers
      });
    }
    
    const transformedMembers = transformArrayToLanguage(members, lang);
    res.status(200).json({
      success: true,
      count: transformedMembers.length,
      data: transformedMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching team members'
    });
  }
};

// Get Single Team Member
exports.getTeamMember = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const raw = req.query.raw === 'true';
    
    const member = await TeamMember.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    // If raw=true, return data without transformation (for admin panel)
    if (raw) {
      const rawMember = member.toObject ? member.toObject() : { ...member };
      return res.status(200).json({
        success: true,
        data: rawMember
      });
    }
    
    const transformedMember = transformToLanguage(member, lang);
    
    res.status(200).json({
      success: true,
      data: transformedMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching team member'
    });
  }
};

// Create team member
exports.createTeamMember = async (req, res) => {
  try {
    const { 
      title_en, title_az, title_ru, 
      description_en, description_az, description_ru,
      title, description,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    // Support both old and new formats
    const finalTitleEn = title_en || title || '';
    const finalDescriptionEn = description_en || description || '';

    if (!finalTitleEn || !image) {
      return res.status(400).json({
        success: false,
        message: 'title (or title_en) and image are required'
      });
    }

    const sourceLang = sourceLanguage || 'en';
    let memberData = { image };

    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        let sourceTitle = '';
        let sourceDescription = '';
        
        if (sourceLang === 'en') {
          sourceTitle = finalTitleEn;
          sourceDescription = finalDescriptionEn;
        } else if (sourceLang === 'az') {
          sourceTitle = title_az || finalTitleEn;
          sourceDescription = description_az || finalDescriptionEn;
        } else if (sourceLang === 'ru') {
          sourceTitle = title_ru || finalTitleEn;
          sourceDescription = description_ru || finalDescriptionEn;
        }

        const translations = await translateTitleDescription(sourceTitle, sourceDescription, sourceLang);
        memberData = { ...memberData, ...translations };
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
        memberData = {
          ...memberData,
          title_en: finalTitleEn,
          title_az: title_az || '',
          title_ru: title_ru || '',
          description_en: finalDescriptionEn,
          description_az: description_az || '',
          description_ru: description_ru || ''
        };
      }
    } else {
      memberData = {
        ...memberData,
      title_en: finalTitleEn,
      title_az: title_az || '',
      title_ru: title_ru || '',
        description_en: finalDescriptionEn,
      description_az: description_az || '',
        description_ru: description_ru || ''
      };
    }

    const member = await TeamMember.create(memberData);

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating team member'
    });
  }
};

// Update team member
exports.updateTeamMember = async (req, res) => {
  try {
    const { 
      title_en, title_az, title_ru, 
      description_en, description_az, description_ru,
      title, description,  // Old format support
      autoTranslate,  // Auto-translate flag
      sourceLanguage  // Source language for translation
    } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // If auto-translate is enabled, translate the content
    if (autoTranslate === 'true' || autoTranslate === true) {
      try {
        const sourceLang = sourceLanguage || 'en';
        let sourceTitle = '';
        let sourceDescription = '';
        
        if (sourceLang === 'en') {
          sourceTitle = title_en || title || member.title_en || '';
          sourceDescription = description_en || description || member.description_en || '';
        } else if (sourceLang === 'az') {
          sourceTitle = title_az || member.title_az || '';
          sourceDescription = description_az || member.description_az || '';
        } else if (sourceLang === 'ru') {
          sourceTitle = title_ru || member.title_ru || '';
          sourceDescription = description_ru || member.description_ru || '';
        }

        if (sourceTitle && sourceDescription) {
          const translations = await translateTitleDescription(sourceTitle, sourceDescription, sourceLang);
          member.title_en = translations.title_en || member.title_en;
          member.title_az = translations.title_az || member.title_az;
          member.title_ru = translations.title_ru || member.title_ru;
          member.description_en = translations.description_en || member.description_en;
          member.description_az = translations.description_az || member.description_az;
          member.description_ru = translations.description_ru || member.description_ru;
        }
      } catch (translationError) {
        console.error('Auto-translation error:', translationError);
      }
    }

    // Manual update (only if auto-translate is not enabled)
    if (!autoTranslate || autoTranslate === 'false' || autoTranslate === false) {
    if (title !== undefined && !title_en) {
      member.title_en = title;
    } else if (title_en !== undefined) {
      member.title_en = title_en;
    }
    
    if (description !== undefined && !description_en) {
      member.description_en = description;
    } else if (description_en !== undefined) {
      member.description_en = description_en;
    }

    // Update other language fields
    if (title_az !== undefined) member.title_az = title_az;
    if (title_ru !== undefined) member.title_ru = title_ru;
    if (description_az !== undefined) member.description_az = description_az;
    if (description_ru !== undefined) member.description_ru = description_ru;
    }
    
    if (image !== undefined) member.image = image;

    await member.save();

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating team member'
    });
  }
};

// Delete team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting team member'
    });
  }
};

