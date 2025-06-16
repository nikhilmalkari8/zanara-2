const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const PhotographerProfile = require('../models/PhotographerProfile');
const MakeupArtistProfile = require('../models/MakeupArtistProfile');
const ModelProfile = require('../models/ModelProfile');
const FashionDesignerProfile = require('../models/FashionDesignerProfile');
const StylistProfile = require('../models/StylistProfile');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await PhotographerProfile.deleteMany({});
  await MakeupArtistProfile.deleteMany({});
  await ModelProfile.deleteMany({});
  await FashionDesignerProfile.deleteMany({});
  await StylistProfile.deleteMany({});
});

describe('Profile Models Tests', () => {
  // Test data
  const baseProfileData = {
    userId: new mongoose.Types.ObjectId(),
    fullName: 'Test User',
    headline: 'Professional Test',
    bio: 'This is a test bio that is longer than 20 characters',
    location: 'Test Location',
    phone: '1234567890',
    email: 'test@example.com',
    website: 'https://test.com',
    profilePicture: 'test.jpg',
    coverPhoto: 'cover.jpg',
    yearsExperience: '3-5',
    photos: ['photo1.jpg', 'photo2.jpg'],
    socialMedia: {
      instagram: 'test_instagram',
      linkedin: 'test_linkedin'
    },
    isVerified: true
  };

  describe('PhotographerProfile Tests', () => {
    it('should create a valid photographer profile', async () => {
      const profileData = {
        ...baseProfileData,
        photographyTypes: ['Portrait', 'Wedding'],
        styles: ['Natural', 'Dramatic'],
        clientTypes: ['Individuals', 'Wedding Clients'],
        cameraEquipment: ['Canon EOS R5'],
        lensCollection: ['24-70mm f/2.8'],
        lightingEquipment: ['Ring Lights', 'Softboxes'],
        editingSoftware: ['Lightroom', 'Photoshop'],
        rates: {
          hourly: '100',
          halfDay: '400',
          fullDay: '800',
          currency: 'USD'
        }
      };

      const profile = new PhotographerProfile(profileData);
      const savedProfile = await profile.save();

      expect(savedProfile.fullName).toBe(profileData.fullName);
      expect(savedProfile.photographyTypes).toContain('Portrait');
      expect(savedProfile.completionPercentage).toBeGreaterThan(0);
      expect(savedProfile.calculateProfileScore()).toBeGreaterThan(0);
    });

    it('should handle flexible enum values', async () => {
      const profileData = {
        ...baseProfileData,
        photographyTypes: ['Custom Type 1', 'Custom Type 2'],
        styles: ['Custom Style 1', 'Custom Style 2'],
        clientTypes: ['Custom Client 1', 'Custom Client 2']
      };

      const profile = new PhotographerProfile(profileData);
      const savedProfile = await profile.save();

      expect(savedProfile.photographyTypes).toContain('Custom Type 1');
      expect(savedProfile.styles).toContain('Custom Style 1');
      expect(savedProfile.clientTypes).toContain('Custom Client 1');
    });
  });

  describe('MakeupArtistProfile Tests', () => {
    it('should create a valid makeup artist profile', async () => {
      const profileData = {
        ...baseProfileData,
        makeupTypes: ['Bridal', 'Editorial'],
        techniques: ['Airbrush', 'Traditional'],
        clientTypes: ['Bridal', 'Commercial'],
        specialSkills: ['Special Effects', 'Character Makeup'],
        serviceModel: 'freelance-mua',
        rates: {
          bridal: '200',
          photoshoot: '150',
          special_event: '180',
          currency: 'USD'
        }
      };

      const profile = new MakeupArtistProfile(profileData);
      const savedProfile = await profile.save();

      expect(savedProfile.fullName).toBe(profileData.fullName);
      expect(savedProfile.makeupTypes).toContain('Bridal');
      expect(savedProfile.completionPercentage).toBeGreaterThan(0);
      expect(savedProfile.calculateProfileScore()).toBeGreaterThan(0);
    });
  });

  describe('ModelProfile Tests', () => {
    it('should create a valid model profile', async () => {
      const profileData = {
        ...baseProfileData,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female',
        nationality: 'US',
        languages: ['English', 'Spanish'],
        height: '5\'9"',
        weight: '130',
        modelType: 'fashion',
        experienceLevel: 'intermediate',
        rates: {
          hourly: '100',
          halfDay: '400',
          fullDay: '800',
          currency: 'USD'
        }
      };

      const profile = new ModelProfile(profileData);
      const savedProfile = await profile.save();

      expect(savedProfile.fullName).toBe(profileData.fullName);
      expect(savedProfile.modelType).toBe('fashion');
      expect(savedProfile.completionPercentage).toBeGreaterThan(0);
      expect(savedProfile.calculateProfileScore()).toBeGreaterThan(0);
    });
  });

  describe('FashionDesignerProfile Tests', () => {
    it('should create a valid fashion designer profile', async () => {
      const profileData = {
        ...baseProfileData,
        designCategories: ['Womenswear', 'Menswear'],
        productTypes: ['Dresses', 'Suits'],
        designStyles: ['Minimalist', 'Avant-Garde'],
        businessModel: 'independent-designer',
        rates: {
          consultationHourly: '150',
          customDesignStarting: '500',
          currency: 'USD'
        }
      };

      const profile = new FashionDesignerProfile(profileData);
      const savedProfile = await profile.save();

      expect(savedProfile.fullName).toBe(profileData.fullName);
      expect(savedProfile.designCategories).toContain('Womenswear');
      expect(savedProfile.completionPercentage).toBeGreaterThan(0);
      expect(savedProfile.calculateProfileScore()).toBeGreaterThan(0);
    });
  });

  describe('StylistProfile Tests', () => {
    it('should create a valid stylist profile', async () => {
      const profileData = {
        ...baseProfileData,
        stylingTypes: ['Personal Styling', 'Editorial'],
        clientTypes: ['Individuals', 'Celebrities'],
        fashionCategories: ['Contemporary', 'Luxury'],
        styleAesthetics: ['Minimalist', 'Bohemian'],
        serviceModel: 'personal-stylist',
        rates: {
          consultation: '100',
          personalStyling: '200',
          currency: 'USD'
        }
      };

      const profile = new StylistProfile(profileData);
      const savedProfile = await profile.save();

      expect(savedProfile.fullName).toBe(profileData.fullName);
      expect(savedProfile.stylingTypes).toContain('Personal Styling');
      expect(savedProfile.completionPercentage).toBeGreaterThan(0);
      expect(savedProfile.calculateProfileScore()).toBeGreaterThan(0);
    });
  });

  describe('Common Profile Features Tests', () => {
    it('should calculate completion percentage correctly', async () => {
      const minimalData = {
        userId: new mongoose.Types.ObjectId(),
        fullName: 'Test User',
        location: 'Test Location',
        yearsExperience: '3-5'
      };

      const profile = new PhotographerProfile(minimalData);
      const savedProfile = await profile.save();

      expect(savedProfile.completionPercentage).toBeLessThan(100);
      expect(savedProfile.isComplete).toBe(false);
    });

    it('should calculate profile score correctly', async () => {
      const completeData = {
        ...baseProfileData,
        photographyTypes: ['Portrait'],
        styles: ['Natural'],
        clientTypes: ['Individuals'],
        rates: {
          hourly: '100',
          currency: 'USD'
        }
      };

      const profile = new PhotographerProfile(completeData);
      const savedProfile = await profile.save();

      expect(savedProfile.calculateProfileScore()).toBeGreaterThan(0);
      expect(savedProfile.calculateProfileScore()).toBeLessThanOrEqual(100);
    });

    it('should handle legacy field mapping', async () => {
      const profileData = {
        ...baseProfileData,
        servicesOffered: ['Service 1'],
        designerKnowledge: ['Knowledge 1'],
        stylingTypes: ['Type 1'],
        clientTypes: ['Client 1'],
        portfolioWebsite: 'https://test.com'
      };

      const profile = new StylistProfile(profileData);
      const savedProfile = await profile.save();

      expect(savedProfile.skills).toContain('Service 1');
      expect(savedProfile.skills).toContain('Knowledge 1');
      expect(savedProfile.specializations).toContain('Type 1');
      expect(savedProfile.preferredTypes).toContain('Client 1');
      expect(savedProfile.website).toBe('https://test.com');
    });
  });
}); 