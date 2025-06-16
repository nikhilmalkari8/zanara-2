const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const PhotographerProfile = require('../../models/PhotographerProfile');
const MakeupArtistProfile = require('../../models/MakeupArtistProfile');
const ModelProfile = require('../../models/ModelProfile');
const FashionDesignerProfile = require('../../models/FashionDesignerProfile');
const StylistProfile = require('../../models/StylistProfile');

let mongoServer;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a test user and get auth token
  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      userType: 'professional'
    });

  authToken = userResponse.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await PhotographerProfile.deleteMany({});
  await MakeupArtistProfile.deleteMany({});
  await ModelProfile.deleteMany({});
  await FashionDesignerProfile.deleteMany({});
  await StylistProfile.deleteMany({});
});

describe('Professional Profile Creation E2E Tests', () => {
  const baseProfileData = {
    fullName: 'Test User',
    headline: 'Professional Test',
    bio: 'This is a test bio that is longer than 20 characters',
    location: 'Test Location',
    phone: '1234567890',
    email: 'test@example.com',
    website: 'https://test.com',
    yearsExperience: '3-5',
    photos: ['photo1.jpg', 'photo2.jpg'],
    socialMedia: {
      instagram: 'test_instagram',
      linkedin: 'test_linkedin'
    }
  };

  describe('Photographer Profile Flow', () => {
    it('should create photographer profile and redirect to dashboard', async () => {
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

      // Create profile
      const createResponse = await request(app)
        .post('/api/profiles/photographer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.profile).toBeDefined();

      // Verify profile in database
      const savedProfile = await PhotographerProfile.findOne({ userId: createResponse.body.profile.userId });
      expect(savedProfile).toBeDefined();
      expect(savedProfile.fullName).toBe(profileData.fullName);
      expect(savedProfile.photographyTypes).toContain('Portrait');

      // Check dashboard access
      const dashboardResponse = await request(app)
        .get('/api/dashboard/photographer')
        .set('Authorization', `Bearer ${authToken}`);

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body.profile).toBeDefined();
    });
  });

  describe('Makeup Artist Profile Flow', () => {
    it('should create makeup artist profile and redirect to dashboard', async () => {
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

      const createResponse = await request(app)
        .post('/api/profiles/makeup-artist')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);

      const savedProfile = await MakeupArtistProfile.findOne({ userId: createResponse.body.profile.userId });
      expect(savedProfile).toBeDefined();
      expect(savedProfile.makeupTypes).toContain('Bridal');

      const dashboardResponse = await request(app)
        .get('/api/dashboard/makeup-artist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(dashboardResponse.status).toBe(200);
    });
  });

  describe('Model Profile Flow', () => {
    it('should create model profile and redirect to dashboard', async () => {
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

      const createResponse = await request(app)
        .post('/api/profiles/model')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);

      const savedProfile = await ModelProfile.findOne({ userId: createResponse.body.profile.userId });
      expect(savedProfile).toBeDefined();
      expect(savedProfile.modelType).toBe('fashion');

      const dashboardResponse = await request(app)
        .get('/api/dashboard/model')
        .set('Authorization', `Bearer ${authToken}`);

      expect(dashboardResponse.status).toBe(200);
    });
  });

  describe('Fashion Designer Profile Flow', () => {
    it('should create fashion designer profile and redirect to dashboard', async () => {
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

      const createResponse = await request(app)
        .post('/api/profiles/fashion-designer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);

      const savedProfile = await FashionDesignerProfile.findOne({ userId: createResponse.body.profile.userId });
      expect(savedProfile).toBeDefined();
      expect(savedProfile.designCategories).toContain('Womenswear');

      const dashboardResponse = await request(app)
        .get('/api/dashboard/fashion-designer')
        .set('Authorization', `Bearer ${authToken}`);

      expect(dashboardResponse.status).toBe(200);
    });
  });

  describe('Stylist Profile Flow', () => {
    it('should create stylist profile and redirect to dashboard', async () => {
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

      const createResponse = await request(app)
        .post('/api/profiles/stylist')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);

      const savedProfile = await StylistProfile.findOne({ userId: createResponse.body.profile.userId });
      expect(savedProfile).toBeDefined();
      expect(savedProfile.stylingTypes).toContain('Personal Styling');

      const dashboardResponse = await request(app)
        .get('/api/dashboard/stylist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(dashboardResponse.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid profile data', async () => {
      const invalidData = {
        fullName: 'Test User',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/profiles/photographer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .post('/api/profiles/photographer')
        .send(baseProfileData);

      expect(response.status).toBe(401);
    });
  });
}); 