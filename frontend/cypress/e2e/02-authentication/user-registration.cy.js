describe('🔐 User Registration - All Professional Types', () => {
  beforeEach(() => {
    cy.setupTestEnvironment();
  });

  context('Model Registration', () => {
    it('Should register a new model successfully', () => {
      cy.fixture('testData').then((data) => {
        const modelData = data.userTypes.model;
        cy.task('generateTestUser', 'Model').then((userData) => {
          const registrationData = { ...userData, ...modelData };
          
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/auth/register`,
            body: registrationData
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token');
            expect(response.body.user.professionalType).to.eq('model');
            expect(response.body.user.userType).to.eq('talent');
            
            cy.wrap(response.body.token).as('authToken');
            cy.wrap(response.body.user).as('registeredUser');
          });
        });
      });
    });

    it('Should register model via UI flow', () => {
      cy.visit('/register');
      cy.waitForPageLoad();
      
      cy.fixture('testData').then((data) => {
        const modelData = data.userTypes.model;
        cy.task('generateTestUser', 'Model').then((userData) => {
          // Fill registration form
          cy.get('[data-cy=first-name-input]').type(userData.firstName);
          cy.get('[data-cy=last-name-input]').type(userData.lastName);
          cy.get('[data-cy=email-input]').type(userData.email);
          cy.get('[data-cy=phone-input]').type(userData.phoneNumber);
          cy.get('[data-cy=password-input]').type(userData.password);
          cy.get('[data-cy=confirm-password-input]').type(userData.password);
          
          // Select user type
          cy.get('[data-cy=user-type-select]').select('talent');
          cy.get('[data-cy=professional-type-select]').select('model');
          cy.get('[data-cy=work-status-select]').select('freelancer');
          
          // Submit form
          cy.get('[data-cy=register-button]').click();
          
          // Verify success
          cy.url().should('not.include', '/register');
          cy.shouldBeLoggedIn();
        });
      });
    });

    it('Should validate required fields for model registration', () => {
      cy.visit('/register');
      
      // Try to submit empty form
      cy.get('[data-cy=register-button]').click();
      
      // Check for validation errors
      cy.get('[data-cy=first-name-error]').should('be.visible');
      cy.get('[data-cy=last-name-error]').should('be.visible');
      cy.get('[data-cy=email-error]').should('be.visible');
      cy.get('[data-cy=password-error]').should('be.visible');
    });
  });

  context('Photographer Registration', () => {
    it('Should register a new photographer successfully', () => {
      cy.fixture('testData').then((data) => {
        const photographerData = data.userTypes.photographer;
        cy.task('generateTestUser', 'Photographer').then((userData) => {
          const registrationData = { ...userData, ...photographerData };
          
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/auth/register`,
            body: registrationData
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token');
            expect(response.body.user.professionalType).to.eq('photographer');
            expect(response.body.user.userType).to.eq('talent');
          });
        });
      });
    });

    it('Should register photographer with specializations', () => {
      cy.visit('/register');
      cy.waitForPageLoad();
      
      cy.fixture('testData').then((data) => {
        const photographerData = data.userTypes.photographer;
        cy.task('generateTestUser', 'Photographer').then((userData) => {
          // Fill basic info
          cy.get('[data-cy=first-name-input]').type(userData.firstName);
          cy.get('[data-cy=last-name-input]').type(userData.lastName);
          cy.get('[data-cy=email-input]').type(userData.email);
          cy.get('[data-cy=phone-input]').type(userData.phoneNumber);
          cy.get('[data-cy=password-input]').type(userData.password);
          cy.get('[data-cy=confirm-password-input]').type(userData.password);
          
          // Select photographer type
          cy.get('[data-cy=user-type-select]').select('talent');
          cy.get('[data-cy=professional-type-select]').select('photographer');
          cy.get('[data-cy=work-status-select]').select('freelancer');
          
          cy.get('[data-cy=register-button]').click();
          cy.shouldBeLoggedIn();
        });
      });
    });
  });

  context('Designer Registration', () => {
    it('Should register a new designer successfully', () => {
      cy.fixture('testData').then((data) => {
        const designerData = data.userTypes.designer;
        cy.task('generateTestUser', 'Designer').then((userData) => {
          const registrationData = { ...userData, ...designerData };
          
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/auth/register`,
            body: registrationData
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token');
            expect(response.body.user.professionalType).to.eq('designer');
            expect(response.body.user.userType).to.eq('talent');
          });
        });
      });
    });

    it('Should handle employed designer registration', () => {
      cy.fixture('testData').then((data) => {
        const designerData = { ...data.userTypes.designer, workStatus: 'employed' };
        cy.task('generateTestUser', 'Designer').then((userData) => {
          const registrationData = { ...userData, ...designerData };
          
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/auth/register`,
            body: registrationData
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.user.workStatus).to.eq('employed');
          });
        });
      });
    });
  });

  context('Brand Registration', () => {
    it('Should register a new brand successfully', () => {
      cy.fixture('testData').then((data) => {
        const brandData = data.userTypes.brand;
        cy.task('generateTestUser', 'Brand').then((userData) => {
          const registrationData = { ...userData, ...brandData };
          
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/auth/register`,
            body: registrationData
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token');
            expect(response.body.user.professionalType).to.eq('brand');
            expect(response.body.user.userType).to.eq('brand');
          });
        });
      });
    });

    it('Should register brand with company information', () => {
      cy.visit('/register');
      cy.waitForPageLoad();
      
      cy.fixture('testData').then((data) => {
        const brandData = data.userTypes.brand;
        cy.task('generateTestUser', 'Brand').then((userData) => {
          // Fill brand registration form
          cy.get('[data-cy=first-name-input]').type(userData.firstName);
          cy.get('[data-cy=last-name-input]').type(userData.lastName);
          cy.get('[data-cy=email-input]').type(userData.email);
          cy.get('[data-cy=phone-input]').type(userData.phoneNumber);
          cy.get('[data-cy=password-input]').type(userData.password);
          cy.get('[data-cy=confirm-password-input]').type(userData.password);
          
          // Select brand type
          cy.get('[data-cy=user-type-select]').select('brand');
          cy.get('[data-cy=professional-type-select]').select('brand');
          cy.get('[data-cy=work-status-select]').select('company');
          
          cy.get('[data-cy=register-button]').click();
          cy.shouldBeLoggedIn();
        });
      });
    });
  });

  context('Registration Validation', () => {
    it('Should prevent duplicate email registration', () => {
      // Register first user
      cy.registerUser('model').then((userData) => {
        // Try to register with same email
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/api/auth/register`,
          body: userData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.include('email');
        });
      });
    });

    it('Should validate email format', () => {
      cy.task('generateTestUser', 'Model').then((userData) => {
        const invalidData = { ...userData, email: 'invalid-email' };
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/api/auth/register`,
          body: invalidData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
    });

    it('Should validate password strength', () => {
      cy.task('generateTestUser', 'Model').then((userData) => {
        const weakPasswordData = { ...userData, password: '123' };
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/api/auth/register`,
          body: weakPasswordData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
    });

    it('Should validate phone number format', () => {
      cy.task('generateTestUser', 'Model').then((userData) => {
        const invalidPhoneData = { ...userData, phoneNumber: '123' };
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/api/auth/register`,
          body: invalidPhoneData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
    });
  });

  context('Registration Flow Completion', () => {
    it('Should complete full registration flow for all user types', () => {
      const userTypes = ['model', 'photographer', 'designer', 'brand'];
      
      userTypes.forEach((userType) => {
        cy.fixture('testData').then((data) => {
          const userData = data.userTypes[userType];
          cy.task('generateTestUser', userType).then((testUser) => {
            const registrationData = { ...testUser, ...userData };
            
            cy.request({
              method: 'POST',
              url: `${Cypress.env('apiUrl')}/api/auth/register`,
              body: registrationData
            }).then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.have.property('token');
              expect(response.body.user.professionalType).to.eq(userType === 'brand' ? 'brand' : userType);
              
              // Verify user can access protected endpoints
              cy.request({
                method: 'GET',
                url: `${Cypress.env('apiUrl')}/api/profile/me`,
                headers: { Authorization: `Bearer ${response.body.token}` }
              }).then((profileResponse) => {
                expect(profileResponse.status).to.eq(200);
              });
            });
          });
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