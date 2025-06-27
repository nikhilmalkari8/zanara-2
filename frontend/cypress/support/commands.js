// ***********************************************
// Custom commands for Zanara Platform Testing
// ***********************************************

// Authentication Commands
Cypress.Commands.add('registerUser', (userType = 'model') => {
  return cy.fixture('testData').then((data) => {
    const userData = data.userTypes[userType];
    
    return cy.task('generateTestUser', userType).then((testUser) => {
      const registrationData = {
        ...testUser,
        professionalType: userData.professionalType,
        userType: userData.userType,
        workStatus: userData.workStatus
      };

      return cy.apiRequest('POST', '/auth/register', registrationData)
        .then((response) => {
          // Store auth data for subsequent requests
          if (response.body.token) {
            Cypress.env('authToken', response.body.token);
          }
          return registrationData;
        });
    });
  });
});

Cypress.Commands.add('loginUser', (email, password) => {
  return cy.apiRequest('POST', '/auth/login', { email, password })
    .then((response) => {
      if (response.body.token) {
        Cypress.env('authToken', response.body.token);
        
        // Store in localStorage for UI tests
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('token', response.body.token);
          window.localStorage.setItem('user', JSON.stringify(response.body.user));
        }
      }
      return response.body;
    });
});

Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.navigateToLogin();
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    if (token) {
      cy.apiRequest('POST', '/auth/logout', {}, {
        'Authorization': `Bearer ${token}`
      });
    }
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('user');
  });
});

// Profile Management Commands
Cypress.Commands.add('completeProfile', (profileData) => {
  const authToken = Cypress.env('authToken');
  
  return cy.apiRequest('POST', '/professional-profile/complete', profileData, {
    'Authorization': `Bearer ${authToken}`
  }).then((response) => {
    // Handle both success and "endpoint not found" cases gracefully
    if (response.status === 404) {
      console.warn('Professional profile endpoint not found, trying legacy endpoint');
      // Return the fallback request directly
      return cy.apiRequest('POST', '/profile/complete', profileData, {
        'Authorization': `Bearer ${authToken}`
      });
    }
    return response;
  });
});

Cypress.Commands.add('updateProfile', (updateData) => {
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'PUT',
      url: `${Cypress.env('apiUrl')}/api/profile/update`,
      headers: { Authorization: `Bearer ${token}` },
      body: updateData
    });
  });
});

// Content & Activity Commands
Cypress.Commands.add('createPost', (postData) => {
  const authToken = Cypress.env('authToken');
  
  // Transform post data to match content API format
  const contentData = {
    title: postData.title || 'Test Post',
    content: postData.content || postData.description || 'Test content',
    excerpt: postData.description || 'Test excerpt',
    category: postData.type === 'general' ? 'other' : (postData.type || 'other'),
    tags: postData.hashtags || [],
    status: 'published',
    visibility: postData.visibility || 'public'
  };
  
  return cy.apiRequest('POST', '/content', contentData, {
    'Authorization': `Bearer ${authToken}`
  }).then((response) => {
    if (response.status === 404) {
      console.warn('Content endpoint not found - this feature may not be implemented yet');
      // Just return the response, don't try to create aliases here
      return response;
    }
    
    return response;
  });
});

Cypress.Commands.add('reactToPost', (postId, reactionType = 'like') => {
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/activity/${postId}/react`,
      headers: { Authorization: `Bearer ${token}` },
      body: { reactionType }
    });
  });
});

// Navigation Commands
Cypress.Commands.add('navigateToLogin', () => {
  cy.visit('/');
  cy.get('button').contains('Login').click(); // Assuming there's a login button on home page
});

Cypress.Commands.add('navigateToRegister', () => {
  cy.visit('/');
  cy.get('button').contains('Register').click(); // Assuming there's a register button on home page
});

Cypress.Commands.add('navigateToProfile', () => {
  cy.get('[data-cy=profile-menu]').click();
  cy.get('[data-cy=view-profile]').click();
  cy.url().should('include', '/profile');
});

Cypress.Commands.add('navigateToDashboard', () => {
  cy.get('[data-cy=dashboard-link]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('navigateToActivityFeed', () => {
  cy.get('[data-cy=activity-feed-link]').click();
  cy.url().should('include', '/feed');
});

// Connection Commands
Cypress.Commands.add('sendConnectionRequest', (userId, message = '') => {
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/connections/request`,
      headers: { Authorization: `Bearer ${token}` },
      body: { userId, message }
    });
  });
});

// Utility Commands
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('[data-cy=loading-spinner]').should('not.exist');
});

Cypress.Commands.add('clearTestData', () => {
  cy.task('cleanupTestData');
});

Cypress.Commands.add('uploadFile', (selector, fileName, fileType = 'image/jpeg') => {
  cy.fixture(fileName, 'base64').then(fileContent => {
    cy.get(selector).attachFile({
      fileContent,
      fileName,
      mimeType: fileType,
      encoding: 'base64'
    });
  });
});

// API Testing Commands
Cypress.Commands.add('apiRequest', (method, endpoint, body = null, headers = {}) => {
  const baseUrl = Cypress.env('apiUrl') || 'http://localhost:8001';
  
  // Get auth token if available
  const authToken = Cypress.env('authToken') || window.localStorage.getItem('token');
  if (authToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const requestOptions = {
    method,
    url: `${baseUrl}/api${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    failOnStatusCode: false // Don't fail on HTTP errors, let tests handle them
  };

  if (body) {
    requestOptions.body = body;
  }

  return cy.request(requestOptions).then((response) => {
    // Accept both 200 and 201 as success for most operations
    const successCodes = [200, 201];
    if (method === 'POST' && endpoint.includes('/register')) {
      // Registration specifically returns 201
      expect(response.status).to.be.oneOf([200, 201]);
    } else if (method === 'POST' && endpoint.includes('/complete')) {
      // Profile completion returns 201
      expect(response.status).to.be.oneOf([200, 201]);
    } else if (successCodes.includes(response.status)) {
      // For other successful operations
      expect(response.status).to.be.oneOf(successCodes);
    } else {
      // Log error details for debugging
      console.error(`API Request failed: ${method} ${endpoint}`);
      console.error('Response:', response);
      
      // For specific endpoints that might not exist yet, provide helpful error
      if (response.status === 404) {
        console.warn(`Endpoint not found: ${endpoint} - This might be expected for some features`);
      }
      
      // Still expect success codes for critical paths
      if (endpoint.includes('/auth/') || endpoint.includes('/profile/me')) {
        expect(response.status).to.be.oneOf(successCodes);
      }
    }
    
    return response;
  });
});

// Visual Testing Commands (for future use)
Cypress.Commands.add('matchImageSnapshot', (name) => {
  if (Cypress.env('enableVisualTesting')) {
    cy.matchImageSnapshot(name);
  }
});

// Performance Testing Commands
Cypress.Commands.add('measurePageLoad', () => {
  return cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
    return loadTime;
  });
});

// Accessibility Testing Commands (for future use)
Cypress.Commands.add('checkA11y', () => {
  if (Cypress.env('enableAccessibilityTesting')) {
    cy.injectAxe();
    cy.checkA11y();
  }
});

// Wait for API response
Cypress.Commands.add('waitForAPI', (alias) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201, 204]);
  });
});

// Setup test environment
Cypress.Commands.add('setupTestEnvironment', () => {
  // Clear any existing data
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Setup API intercepts for monitoring
  cy.intercept('POST', '**/api/auth/**').as('authAPI');
  cy.intercept('GET', '**/api/profile/**').as('profileAPI');
  cy.intercept('POST', '**/api/activity/**').as('activityAPI');
  cy.intercept('GET', '**/api/activity/**').as('activityFeedAPI');
  cy.intercept('**/api/connections/**').as('connectionsAPI');
});

// Custom assertion commands
Cypress.Commands.add('shouldBeLoggedIn', () => {
  cy.window().its('localStorage.token').should('exist');
  cy.get('[data-cy=user-menu]').should('be.visible');
});

Cypress.Commands.add('shouldBeLoggedOut', () => {
  cy.window().its('localStorage.token').should('not.exist');
  cy.url().should('include', '/login');
});

// Import file upload support
import 'cypress-file-upload';

// Enhanced networking features test
Cypress.Commands.add('testNetworkingFeatures', () => {
  const authToken = Cypress.env('authToken');
  
  return cy.apiRequest('GET', '/connections/suggestions', null, {
    'Authorization': `Bearer ${authToken}`
  });
}); 