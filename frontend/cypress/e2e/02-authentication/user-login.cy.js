describe('🔑 User Login & Authentication', () => {
  beforeEach(() => {
    cy.setupTestEnvironment();
  });

  context('Successful Login Flows', () => {
    it('Should login model via API', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginUser(userData.email, userData.password).then((loginResponse) => {
          expect(loginResponse.user.professionalType).to.eq('model');
          expect(loginResponse.user.userType).to.eq('talent');
          cy.get('@authToken').should('exist');
          cy.get('@currentUser').should('exist');
        });
      });
    });

    it('Should login photographer via API', () => {
      cy.registerUser('photographer').then((userData) => {
        cy.loginUser(userData.email, userData.password).then((loginResponse) => {
          expect(loginResponse.user.professionalType).to.eq('photographer');
          expect(loginResponse.user.userType).to.eq('talent');
        });
      });
    });

    it('Should login designer via API', () => {
      cy.registerUser('designer').then((userData) => {
        cy.loginUser(userData.email, userData.password).then((loginResponse) => {
          expect(loginResponse.user.professionalType).to.eq('designer');
          expect(loginResponse.user.userType).to.eq('talent');
        });
      });
    });

    it('Should login brand via API', () => {
      cy.registerUser('brand').then((userData) => {
        cy.loginUser(userData.email, userData.password).then((loginResponse) => {
          expect(loginResponse.user.professionalType).to.eq('brand');
          expect(loginResponse.user.userType).to.eq('brand');
        });
      });
    });
  });

  context('UI Login Flows', () => {
    it('Should login model via UI', () => {
      cy.registerUser('model').then((userData) => {
        cy.visit('/login');
        cy.waitForPageLoad();
        
        cy.get('[data-cy=email-input]').type(userData.email);
        cy.get('[data-cy=password-input]').type(userData.password);
        cy.get('[data-cy=login-button]').click();
        
        cy.url().should('not.include', '/login');
        cy.shouldBeLoggedIn();
        
        // Verify user info is displayed
        cy.get('[data-cy=user-menu]').should('contain', userData.firstName);
      });
    });

    it('Should redirect to dashboard after login', () => {
      cy.registerUser('model').then((userData) => {
        cy.visit('/login');
        
        cy.get('[data-cy=email-input]').type(userData.email);
        cy.get('[data-cy=password-input]').type(userData.password);
        cy.get('[data-cy=login-button]').click();
        
        cy.url().should('include', '/dashboard');
        cy.get('[data-cy=dashboard-content]').should('be.visible');
      });
    });

    it('Should remember user session', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginViaUI(userData.email, userData.password);
        
        // Refresh page
        cy.reload();
        cy.waitForPageLoad();
        
        // Should still be logged in
        cy.shouldBeLoggedIn();
        cy.url().should('not.include', '/login');
      });
    });

    it('Should handle "Remember Me" functionality', () => {
      cy.registerUser('model').then((userData) => {
        cy.visit('/login');
        
        cy.get('[data-cy=email-input]').type(userData.email);
        cy.get('[data-cy=password-input]').type(userData.password);
        cy.get('[data-cy=remember-me-checkbox]').check();
        cy.get('[data-cy=login-button]').click();
        
        cy.shouldBeLoggedIn();
        
        // Verify longer session duration
        cy.window().its('localStorage.token').should('exist');
      });
    });
  });

  context('Login Validation & Error Handling', () => {
    it('Should reject invalid email format', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('invalid-email');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=login-button]').click();
      
      cy.get('[data-cy=email-error]').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('Should reject empty credentials', () => {
      cy.visit('/login');
      cy.get('[data-cy=login-button]').click();
      
      cy.get('[data-cy=email-error]').should('be.visible');
      cy.get('[data-cy=password-error]').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('Should handle invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('nonexistent@email.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-button]').click();
      
      cy.get('[data-cy=login-error]').should('be.visible');
      cy.get('[data-cy=login-error]').should('contain', 'Invalid credentials');
      cy.url().should('include', '/login');
    });

    it('Should handle wrong password for existing user', () => {
      cy.registerUser('model').then((userData) => {
        cy.visit('/login');
        
        cy.get('[data-cy=email-input]').type(userData.email);
        cy.get('[data-cy=password-input]').type('wrongpassword');
        cy.get('[data-cy=login-button]').click();
        
        cy.get('[data-cy=login-error]').should('be.visible');
        cy.url().should('include', '/login');
      });
    });

    it('Should handle API login errors gracefully', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/auth/login`,
        body: {
          email: 'nonexistent@email.com',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('message');
      });
    });
  });

  context('Session Management', () => {
    it('Should maintain session across page navigations', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginViaUI(userData.email, userData.password);
        
        // Navigate to different pages
        cy.visit('/profile');
        cy.shouldBeLoggedIn();
        
        cy.visit('/dashboard');
        cy.shouldBeLoggedIn();
        
        cy.visit('/feed');
        cy.shouldBeLoggedIn();
      });
    });

    it('Should handle token expiration gracefully', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginUser(userData.email, userData.password);
        
        // Simulate expired token
        cy.window().then((win) => {
          win.localStorage.setItem('token', 'expired.token.here');
        });
        
        // Try to access protected resource
        cy.apiRequest('GET', '/api/profile/me').then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });

    it('Should redirect to login when accessing protected routes', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
      
      cy.visit('/profile');
      cy.url().should('include', '/login');
      
      cy.visit('/feed');
      cy.url().should('include', '/login');
    });
  });

  context('Logout Functionality', () => {
    it('Should logout via UI', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginViaUI(userData.email, userData.password);
        
        cy.get('[data-cy=user-menu]').click();
        cy.get('[data-cy=logout-button]').click();
        
        cy.shouldBeLoggedOut();
        cy.url().should('include', '/login');
      });
    });

    it('Should logout via API', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginUser(userData.email, userData.password);
        
        cy.get('@authToken').then((token) => {
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/auth/logout`,
            headers: { Authorization: `Bearer ${token}` }
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
    });

    it('Should clear session data on logout', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginViaUI(userData.email, userData.password);
        
        // Verify session exists
        cy.window().its('localStorage.token').should('exist');
        cy.window().its('localStorage.user').should('exist');
        
        // Logout
        cy.get('[data-cy=user-menu]').click();
        cy.get('[data-cy=logout-button]').click();
        
        // Verify session cleared
        cy.window().its('localStorage.token').should('not.exist');
        cy.window().its('localStorage.user').should('not.exist');
      });
    });
  });

  context('Multi-User Login Scenarios', () => {
    it('Should handle multiple user types logging in sequence', () => {
      const userTypes = ['model', 'photographer', 'designer', 'brand'];
      
      userTypes.forEach((userType) => {
        cy.registerUser(userType).then((userData) => {
          cy.loginUser(userData.email, userData.password).then((loginResponse) => {
            expect(loginResponse.user.professionalType).to.eq(userType === 'brand' ? 'brand' : userType);
            
            // Logout before next iteration
            cy.logout();
          });
        });
      });
    });

    it('Should handle concurrent login sessions', () => {
      cy.registerUser('model').then((userData1) => {
        cy.registerUser('photographer').then((userData2) => {
          // Login user 1
          cy.loginUser(userData1.email, userData1.password);
          cy.get('@authToken').as('token1');
          
          // Login user 2 (should not affect user 1's session)
          cy.loginUser(userData2.email, userData2.password);
          cy.get('@authToken').as('token2');
          
          // Both tokens should be valid
          cy.get('@token1').then((token1) => {
            cy.request({
              method: 'GET',
              url: `${Cypress.env('apiUrl')}/api/profile/me`,
              headers: { Authorization: `Bearer ${token1}` }
            }).then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body.professionalType).to.eq('model');
            });
          });
          
          cy.get('@token2').then((token2) => {
            cy.request({
              method: 'GET',
              url: `${Cypress.env('apiUrl')}/api/profile/me`,
              headers: { Authorization: `Bearer ${token2}` }
            }).then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body.professionalType).to.eq('photographer');
            });
          });
        });
      });
    });
  });

  context('Security Features', () => {
    it('Should rate limit login attempts', () => {
      const invalidCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/api/auth/login`,
          body: invalidCredentials,
          failOnStatusCode: false
        });
      }
      
      // Next attempt should be rate limited
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/auth/login`,
        body: invalidCredentials,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([429, 401]); // Rate limited or unauthorized
      });
    });

    it('Should validate JWT token structure', () => {
      cy.registerUser('model').then((userData) => {
        cy.loginUser(userData.email, userData.password);
        
        cy.get('@authToken').then((token) => {
          // JWT should have 3 parts separated by dots
          const parts = token.split('.');
          expect(parts).to.have.length(3);
          
          // Each part should be base64 encoded
          parts.forEach((part) => {
            expect(part).to.match(/^[A-Za-z0-9_-]+$/);
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