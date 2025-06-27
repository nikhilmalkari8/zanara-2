describe('👤 Model Profile Management', () => {
  let testUser;
  let authToken;

  beforeEach(() => {
    cy.setupTestEnvironment();
    
    // Create test user
    const userData = {
      firstName: 'Jane',
      lastName: 'Model',
      email: `model.${Date.now()}@test.com`,
      phoneNumber: '+1234567890',
      password: 'TestPassword123!',
      professionalType: 'model',
      userType: 'talent',
      workStatus: 'freelancer'
    };

    cy.apiRequest('POST', '/auth/register', userData)
      .then((response) => {
        testUser = response.body.user;
        authToken = response.body.token;
      });
  });

  context('Model Profile Creation', () => {
    it('Should create complete model profile via API', () => {
      const profileData = {
        fullName: `${testUser.firstName} ${testUser.lastName}`,
        bio: 'Professional fashion model with experience in runway and editorial work.',
        location: 'New York, NY',
        height: '5\'8"',
        weight: '120 lbs',
        gender: 'female',
        dateOfBirth: '1995-01-01',
        nationality: 'American',
        experienceLevel: 'intermediate',
        modelType: 'fashion',
        yearsExperience: '3-5',
        availability: 'project-based',
        travelWillingness: 'national'
      };

      cy.apiRequest('POST', '/professional-profile/complete', profileData, {
        'Authorization': `Bearer ${authToken}`
      })
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('profile');
          expect(response.body.profile.fullName).to.eq(profileData.fullName);
          expect(response.body.profile.modelType).to.eq(profileData.modelType);
        });
    });

    it('Should create model profile via UI', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginViaUI(userData.email, userData.password);
        
        // Navigate to profile completion
        cy.visit('/profile/complete');
        cy.waitForPageLoad();
        
        cy.fixture('testData').then((data) => {
          const profileData = data.userTypes.model.profile;
          
          // Fill model-specific fields
          cy.get('[data-cy=experience-level-select]').select(profileData.experienceLevel);
          cy.get('[data-cy=model-type-select]').select(profileData.modelType);
          cy.get('[data-cy=years-experience-select]').select(profileData.yearsExperience);
          cy.get('[data-cy=height-input]').type(profileData.height);
          cy.get('[data-cy=weight-input]').type(profileData.weight);
          cy.get('[data-cy=gender-select]').select(profileData.gender);
          cy.get('[data-cy=nationality-input]').type(profileData.nationality);
          cy.get('[data-cy=date-of-birth-input]').type(profileData.dateOfBirth);
          cy.get('[data-cy=bio-textarea]').type(profileData.bio);
          cy.get('[data-cy=location-input]').type(profileData.location);
          
          // Add skills
          profileData.skills.forEach((skill) => {
            cy.get('[data-cy=skills-input]').type(`${skill}{enter}`);
          });
          
          // Submit profile
          cy.get('[data-cy=save-profile-button]').click();
          
          // Verify success
          cy.url().should('include', '/profile');
          cy.get('[data-cy=profile-completion-success]').should('be.visible');
        });
      });
    });

    it('Should validate required model profile fields', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginViaUI(userData.email, userData.password);
        cy.visit('/profile/complete');
        
        // Try to submit without required fields
        cy.get('[data-cy=save-profile-button]').click();
        
        // Check for validation errors
        cy.get('[data-cy=experience-level-error]').should('be.visible');
        cy.get('[data-cy=model-type-error]').should('be.visible');
        cy.get('[data-cy=bio-error]').should('be.visible');
        cy.get('[data-cy=location-error]').should('be.visible');
      });
    });

    it('Should handle model measurements validation', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginViaUI(userData.email, userData.password);
        cy.visit('/profile/complete');
        
        // Enter invalid measurements
        cy.get('[data-cy=height-input]').type('invalid');
        cy.get('[data-cy=weight-input]').type('invalid');
        cy.get('[data-cy=save-profile-button]').click();
        
        cy.get('[data-cy=height-error]').should('be.visible');
        cy.get('[data-cy=weight-error]').should('be.visible');
      });
    });
  });

  context('Model Profile Editing', () => {
    it('Should edit existing model profile', () => {
      cy.registerUser('model');
      cy.fixture('testData').then((data) => {
        cy.completeProfile(data.userTypes.model.profile);
        
        // Update profile data
        const updatedData = {
          bio: 'Updated bio: Experienced fashion model with international runway experience.',
          location: 'Los Angeles, CA',
          experienceLevel: 'expert',
          yearsExperience: '5-10'
        };
        
        cy.updateProfile(updatedData);
        
        // Verify updates via API
        cy.apiRequest('GET', '/api/profile/me').then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.bio).to.eq(updatedData.bio);
          expect(response.body.location).to.eq(updatedData.location);
          expect(response.body.experienceLevel).to.eq(updatedData.experienceLevel);
        });
      });
    });

    it('Should edit model profile via UI', () => {
      cy.registerUser('model');
      cy.fixture('testData').then((data) => {
        cy.completeProfile(data.userTypes.model.profile);
        
        cy.get('@testUser').then((userData) => {
          cy.loginViaUI(userData.email, userData.password);
          
          // Navigate to profile edit
          cy.visit('/profile/edit');
          cy.waitForPageLoad();
          
          // Update fields
          cy.get('[data-cy=bio-textarea]').clear().type('Updated bio via UI testing');
          cy.get('[data-cy=location-input]').clear().type('Miami, FL');
          cy.get('[data-cy=experience-level-select]').select('expert');
          
          // Save changes
          cy.get('[data-cy=save-profile-button]').click();
          
          // Verify success message
          cy.get('[data-cy=profile-update-success]').should('be.visible');
          
          // Verify changes are displayed
          cy.visit('/profile');
          cy.get('[data-cy=profile-bio]').should('contain', 'Updated bio via UI testing');
          cy.get('[data-cy=profile-location]').should('contain', 'Miami, FL');
        });
      });
    });

    it('Should add and remove skills', () => {
      cy.registerUser('model');
      cy.fixture('testData').then((data) => {
        cy.completeProfile(data.userTypes.model.profile);
        
        cy.get('@testUser').then((userData) => {
          cy.loginViaUI(userData.email, userData.password);
          cy.visit('/profile/edit');
          
          // Add new skill
          cy.get('[data-cy=skills-input]').type('Editorial Modeling{enter}');
          cy.get('[data-cy=skills-input]').type('Commercial Modeling{enter}');
          
          // Remove existing skill
          cy.get('[data-cy=skill-tag]').contains('Photography').find('[data-cy=remove-skill]').click();
          
          cy.get('[data-cy=save-profile-button]').click();
          
          // Verify skill changes
          cy.visit('/profile');
          cy.get('[data-cy=skills-list]').should('contain', 'Editorial Modeling');
          cy.get('[data-cy=skills-list]').should('contain', 'Commercial Modeling');
          cy.get('[data-cy=skills-list]').should('not.contain', 'Photography');
        });
      });
    });
  });

  context('Model Portfolio Management', () => {
    it('Should upload portfolio images', () => {
      cy.registerUser('model');
      cy.fixture('testData').then((data) => {
        cy.completeProfile(data.userTypes.model.profile);
        
        cy.get('@testUser').then((userData) => {
          cy.loginViaUI(userData.email, userData.password);
          cy.visit('/profile/portfolio');
          
          // Upload portfolio images
          cy.get('[data-cy=portfolio-upload]').should('be.visible');
          cy.uploadFile('[data-cy=portfolio-upload]', 'sample-image.jpg');
          
          // Verify upload success
          cy.get('[data-cy=upload-success]').should('be.visible');
          cy.get('[data-cy=portfolio-image]').should('be.visible');
        });
      });
    });

    it('Should organize portfolio into categories', () => {
      cy.registerUser('model');
      cy.fixture('testData').then((data) => {
        cy.completeProfile(data.userTypes.model.profile);
        
        cy.get('@testUser').then((userData) => {
          cy.loginViaUI(userData.email, userData.password);
          cy.visit('/profile/portfolio');
          
          // Create portfolio categories
          cy.get('[data-cy=add-category-button]').click();
          cy.get('[data-cy=category-name-input]').type('Fashion Runway');
          cy.get('[data-cy=save-category-button]').click();
          
          cy.get('[data-cy=add-category-button]').click();
          cy.get('[data-cy=category-name-input]').type('Editorial Shoots');
          cy.get('[data-cy=save-category-button]').click();
          
          // Verify categories created
          cy.get('[data-cy=portfolio-category]').should('contain', 'Fashion Runway');
          cy.get('[data-cy=portfolio-category]').should('contain', 'Editorial Shoots');
        });
      });
    });

    it('Should set profile picture', () => {
      cy.registerUser('model');
      cy.fixture('testData').then((data) => {
        cy.completeProfile(data.userTypes.model.profile);
        
        cy.get('@testUser').then((userData) => {
          cy.loginViaUI(userData.email, userData.password);
          cy.visit('/profile/edit');
          
          // Upload profile picture
          cy.uploadFile('[data-cy=profile-picture-upload]', 'profile-image.jpg');
          
          // Crop and save
          cy.get('[data-cy=crop-save-button]').click();
          
          // Verify profile picture updated
          cy.get('[data-cy=profile-picture]').should('be.visible');
          cy.get('[data-cy=profile-update-success]').should('be.visible');
        });
      });
    });
  });

  context('Model Profile Visibility', () => {
    it('Should control profile visibility settings', () => {
      cy.registerUser('model');
      cy.fixture('testData').then((data) => {
        cy.completeProfile(data.userTypes.model.profile);
        
        cy.get('@testUser').then((userData) => {
          cy.loginViaUI(userData.email, userData.password);
          cy.visit('/profile/settings');
          
          // Set profile to private
          cy.get('[data-cy=profile-visibility-select]').select('private');
          cy.get('[data-cy=save-settings-button]').click();
          
          // Verify setting saved
          cy.get('[data-cy=settings-success]').should('be.visible');
          
          // Test visibility by logging out and trying to view profile
          cy.logout();
          cy.visit(`/profile/${userData.email.split('@')[0]}`);
          cy.get('[data-cy=private-profile-message]').should('be.visible');
        });
      });
    });

    it('Should show public profile correctly', () => {
      cy.registerUser('model');
      cy.fixture('testData').then((data) => {
        const profileData = data.userTypes.model.profile;
        cy.completeProfile(profileData);
        
        cy.get('@testUser').then((userData) => {
          // View public profile without login
          cy.visit(`/profile/${userData.email.split('@')[0]}`);
          
          // Verify public information is displayed
          cy.get('[data-cy=profile-name]').should('contain', userData.firstName);
          cy.get('[data-cy=profile-bio]').should('contain', profileData.bio);
          cy.get('[data-cy=profile-location]').should('contain', profileData.location);
          cy.get('[data-cy=profile-skills]').should('be.visible');
          
          // Verify private information is not displayed
          cy.get('[data-cy=profile-email]').should('not.exist');
          cy.get('[data-cy=profile-phone]').should('not.exist');
        });
      });
    });
  });

  context('Model Profile Validation', () => {
    it('Should validate model type selection', () => {
      cy.registerUser('model');
      
      const invalidProfileData = {
        experienceLevel: 'intermediate',
        modelType: 'invalid-type',
        yearsExperience: '3-5',
        bio: 'Test bio',
        location: 'Test location'
      };
      
      cy.get('@authToken').then((token) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/api/profile/complete`,
          headers: { Authorization: `Bearer ${token}` },
          body: invalidProfileData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.include('modelType');
        });
      });
    });

    it('Should validate experience level', () => {
      cy.registerUser('model');
      
      const invalidProfileData = {
        experienceLevel: 'invalid-level',
        modelType: 'fashion',
        yearsExperience: '3-5',
        bio: 'Test bio',
        location: 'Test location'
      };
      
      cy.get('@authToken').then((token) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/api/profile/complete`,
          headers: { Authorization: `Bearer ${token}` },
          body: invalidProfileData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.include('experienceLevel');
        });
      });
    });

    it('Should validate bio length', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginViaUI(userData.email, userData.password);
        cy.visit('/profile/complete');
        
        // Enter bio that's too long
        const longBio = 'a'.repeat(1001); // Assuming 1000 char limit
        cy.get('[data-cy=bio-textarea]').type(longBio);
        cy.get('[data-cy=save-profile-button]').click();
        
        cy.get('[data-cy=bio-error]').should('be.visible');
        cy.get('[data-cy=bio-error]').should('contain', 'too long');
      });
    });
  });

  context('Model Profile Completion Flow', () => {
    it('Should guide user through complete profile setup', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginViaUI(userData.email, userData.password);
        
        // Should redirect to profile completion
        cy.url().should('include', '/profile/complete');
        
        // Show progress indicator
        cy.get('[data-cy=profile-progress]').should('be.visible');
        cy.get('[data-cy=profile-progress]').should('contain', '0%');
        
        cy.fixture('testData').then((data) => {
          const profileData = data.userTypes.model.profile;
          
          // Fill required fields step by step
          cy.get('[data-cy=experience-level-select]').select(profileData.experienceLevel);
          cy.get('[data-cy=profile-progress]').should('contain', '20%');
          
          cy.get('[data-cy=model-type-select]').select(profileData.modelType);
          cy.get('[data-cy=profile-progress]').should('contain', '40%');
          
          cy.get('[data-cy=bio-textarea]').type(profileData.bio);
          cy.get('[data-cy=profile-progress]').should('contain', '60%');
          
          cy.get('[data-cy=location-input]').type(profileData.location);
          cy.get('[data-cy=profile-progress]').should('contain', '80%');
          
          // Complete profile
          cy.get('[data-cy=save-profile-button]').click();
          cy.get('[data-cy=profile-progress]').should('contain', '100%');
          
          // Verify completion
          cy.url().should('include', '/dashboard');
          cy.get('[data-cy=profile-complete-banner]').should('be.visible');
        });
      });
    });
  });

  after(() => {
    if (!Cypress.env('testDataRetention')) {
      cy.clearTestData();
    }
  });
}); 