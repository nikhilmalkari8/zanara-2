describe('Professional Profile Creation Flow', () => {
  beforeEach(() => {
    // Register a new user before each test
    cy.visit('/register');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('select[name="userType"]').select('professional');
    cy.get('button[type="submit"]').click();
    
    // Wait for registration to complete
    cy.url().should('include', '/onboarding');
  });

  const baseProfileData = {
    fullName: 'Test User',
    headline: 'Professional Test',
    bio: 'This is a test bio that is longer than 20 characters',
    location: 'Test Location',
    phone: '1234567890',
    email: 'test@example.com',
    website: 'https://test.com',
    yearsExperience: '3-5',
    socialMedia: {
      instagram: 'test_instagram',
      linkedin: 'test_linkedin'
    }
  };

  it('should create photographer profile and redirect to dashboard', () => {
    // Select photographer as professional type
    cy.get('[data-testid="professional-type-selector"]').select('photographer');
    cy.get('button[type="submit"]').click();

    // Fill in photographer specific details
    cy.get('input[name="photographyTypes"]').type('Portrait, Wedding');
    cy.get('input[name="styles"]').type('Natural, Dramatic');
    cy.get('input[name="clientTypes"]').type('Individuals, Wedding Clients');
    cy.get('input[name="cameraEquipment"]').type('Canon EOS R5');
    cy.get('input[name="lensCollection"]').type('24-70mm f/2.8');
    cy.get('input[name="lightingEquipment"]').type('Ring Lights, Softboxes');
    cy.get('input[name="editingSoftware"]').type('Lightroom, Photoshop');
    
    // Fill in rates
    cy.get('input[name="rates.hourly"]').type('100');
    cy.get('input[name="rates.halfDay"]').type('400');
    cy.get('input[name="rates.fullDay"]').type('800');
    
    // Submit profile
    cy.get('button[type="submit"]').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard/photographer');
    cy.get('[data-testid="dashboard-header"]').should('contain', 'Photographer Dashboard');
  });

  it('should create makeup artist profile and redirect to dashboard', () => {
    cy.get('[data-testid="professional-type-selector"]').select('makeup-artist');
    cy.get('button[type="submit"]').click();

    // Fill in makeup artist specific details
    cy.get('input[name="makeupTypes"]').type('Bridal, Editorial');
    cy.get('input[name="techniques"]').type('Airbrush, Traditional');
    cy.get('input[name="clientTypes"]').type('Bridal, Commercial');
    cy.get('input[name="specialSkills"]').type('Special Effects, Character Makeup');
    cy.get('select[name="serviceModel"]').select('freelance-mua');
    
    // Fill in rates
    cy.get('input[name="rates.bridal"]').type('200');
    cy.get('input[name="rates.photoshoot"]').type('150');
    cy.get('input[name="rates.special_event"]').type('180');
    
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard/makeup-artist');
    cy.get('[data-testid="dashboard-header"]').should('contain', 'Makeup Artist Dashboard');
  });

  it('should create model profile and redirect to dashboard', () => {
    cy.get('[data-testid="professional-type-selector"]').select('model');
    cy.get('button[type="submit"]').click();

    // Fill in model specific details
    cy.get('input[name="dateOfBirth"]').type('1990-01-01');
    cy.get('select[name="gender"]').select('female');
    cy.get('input[name="nationality"]').type('US');
    cy.get('input[name="languages"]').type('English, Spanish');
    cy.get('input[name="height"]').type('5\'9"');
    cy.get('input[name="weight"]').type('130');
    cy.get('select[name="modelType"]').select('fashion');
    cy.get('select[name="experienceLevel"]').select('intermediate');
    
    // Fill in rates
    cy.get('input[name="rates.hourly"]').type('100');
    cy.get('input[name="rates.halfDay"]').type('400');
    cy.get('input[name="rates.fullDay"]').type('800');
    
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard/model');
    cy.get('[data-testid="dashboard-header"]').should('contain', 'Model Dashboard');
  });

  it('should create fashion designer profile and redirect to dashboard', () => {
    cy.get('[data-testid="professional-type-selector"]').select('fashion-designer');
    cy.get('button[type="submit"]').click();

    // Fill in fashion designer specific details
    cy.get('input[name="designCategories"]').type('Womenswear, Menswear');
    cy.get('input[name="productTypes"]').type('Dresses, Suits');
    cy.get('input[name="designStyles"]').type('Minimalist, Avant-Garde');
    cy.get('select[name="businessModel"]').select('independent-designer');
    
    // Fill in rates
    cy.get('input[name="rates.consultationHourly"]').type('150');
    cy.get('input[name="rates.customDesignStarting"]').type('500');
    
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard/fashion-designer');
    cy.get('[data-testid="dashboard-header"]').should('contain', 'Fashion Designer Dashboard');
  });

  it('should create stylist profile and redirect to dashboard', () => {
    cy.get('[data-testid="professional-type-selector"]').select('stylist');
    cy.get('button[type="submit"]').click();

    // Fill in stylist specific details
    cy.get('input[name="stylingTypes"]').type('Personal Styling, Editorial');
    cy.get('input[name="clientTypes"]').type('Individuals, Celebrities');
    cy.get('input[name="fashionCategories"]').type('Contemporary, Luxury');
    cy.get('input[name="styleAesthetics"]').type('Minimalist, Bohemian');
    cy.get('select[name="serviceModel"]').select('personal-stylist');
    
    // Fill in rates
    cy.get('input[name="rates.consultation"]').type('100');
    cy.get('input[name="rates.personalStyling"]').type('200');
    
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard/stylist');
    cy.get('[data-testid="dashboard-header"]').should('contain', 'Stylist Dashboard');
  });

  it('should handle validation errors', () => {
    cy.get('[data-testid="professional-type-selector"]').select('photographer');
    cy.get('button[type="submit"]').click();

    // Try to submit without required fields
    cy.get('button[type="submit"]').click();

    // Verify error messages
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.url().should('include', '/onboarding');
  });

  it('should handle file uploads', () => {
    cy.get('[data-testid="professional-type-selector"]').select('photographer');
    cy.get('button[type="submit"]').click();

    // Upload profile picture
    cy.get('input[type="file"]').attachFile('profile-picture.jpg');
    cy.get('[data-testid="upload-success"]').should('be.visible');

    // Upload portfolio photos
    cy.get('input[type="file"]').attachFile(['photo1.jpg', 'photo2.jpg']);
    cy.get('[data-testid="upload-success"]').should('be.visible');
  });
}); 