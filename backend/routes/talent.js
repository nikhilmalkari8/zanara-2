const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ModelProfile = require('../models/ModelProfile');
const DesignerProfile = require('../models/DesignerProfile');
const PhotographerProfile = require('../models/PhotographerProfile');
const StylistProfile = require('../models/StylistProfile');

// Search talent with filters
router.post('/search', auth, async (req, res) => {
  try {
    const {
      query,
      professionalTypes,
      location,
      experienceLevel,
      skills
    } = req.body;

    // Build search query
    const searchQuery = {};

    // Text search across multiple fields
    if (query) {
      searchQuery.$or = [
        { fullName: { $regex: query, $options: 'i' } },
        { headline: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { skills: { $regex: query, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    // Experience level filter
    if (experienceLevel) {
      searchQuery.experienceLevel = experienceLevel;
    }

    // Skills filter
    if (skills && skills.length > 0) {
      searchQuery.skills = { $in: skills };
    }

    // Search across different profile types
    const results = [];
    
    if (!professionalTypes || professionalTypes.includes('model')) {
      const modelResults = await ModelProfile.find(searchQuery)
        .select('fullName headline location skills profilePicture')
        .limit(20);
      results.push(...modelResults.map(profile => ({
        ...profile.toObject(),
        professionalType: 'model'
      })));
    }

    if (!professionalTypes || professionalTypes.includes('designer')) {
      const designerResults = await DesignerProfile.find(searchQuery)
        .select('fullName headline location skills profilePicture')
        .limit(20);
      results.push(...designerResults.map(profile => ({
        ...profile.toObject(),
        professionalType: 'designer'
      })));
    }

    if (!professionalTypes || professionalTypes.includes('photographer')) {
      const photographerResults = await PhotographerProfile.find(searchQuery)
        .select('fullName headline location skills profilePicture')
        .limit(20);
      results.push(...photographerResults.map(profile => ({
        ...profile.toObject(),
        professionalType: 'photographer'
      })));
    }

    if (!professionalTypes || professionalTypes.includes('stylist')) {
      const stylistResults = await StylistProfile.find(searchQuery)
        .select('fullName headline location skills profilePicture')
        .limit(20);
      results.push(...stylistResults.map(profile => ({
        ...profile.toObject(),
        professionalType: 'stylist'
      })));
    }

    // Sort results by relevance (you can implement more sophisticated sorting)
    results.sort((a, b) => {
      // Prioritize exact matches in name
      const aNameMatch = a.fullName.toLowerCase().includes(query?.toLowerCase() || '');
      const bNameMatch = b.fullName.toLowerCase().includes(query?.toLowerCase() || '');
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return 0;
    });

    res.json(results);
  } catch (error) {
    console.error('Talent search error:', error);
    res.status(500).json({ message: 'Error searching for talent' });
  }
});

// Get talent profile details
router.get('/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    let profile;

    switch (type) {
      case 'model':
        profile = await ModelProfile.findById(id);
        break;
      case 'designer':
        profile = await DesignerProfile.findById(id);
        break;
      case 'photographer':
        profile = await PhotographerProfile.findById(id);
        break;
      case 'stylist':
        profile = await StylistProfile.findById(id);
        break;
      default:
        return res.status(400).json({ message: 'Invalid professional type' });
    }

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching talent profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router; 