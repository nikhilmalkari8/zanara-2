const { defineConfig } = require('cypress')
const fs = require('fs')
const path = require('path')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:8001',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Task for database cleanup
      on('task', {
        cleanupTestData() {
          // This will be implemented to clean test data
          return null;
        },
        
        log(message) {
          console.log(message);
          return null;
        },
        
        // Task to check if file exists
        fileExists(filePath) {
          const fullPath = path.join(__dirname, filePath);
          return fs.existsSync(fullPath);
        },
        
        // Task for generating test data
        generateTestUser(userType) {
          const timestamp = Date.now();
          return {
            firstName: `Test${userType}`,
            lastName: `User${timestamp}`,
            email: `test${userType.toLowerCase()}${timestamp}@zanara.com`,
            phoneNumber: `+1234567${timestamp.toString().slice(-3)}`,
            password: 'TestPassword123!',
            userType: 'talent',
            professionalType: userType.toLowerCase(),
            workStatus: 'freelancer'
          };
        }
      });
    },
    retries: {
      runMode: 2,
      openMode: 0
    },
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    experimentalStudio: true,
    experimentalWebKitSupport: true
  },
  
  // Component testing configuration
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
  
  // Global settings
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true,
  videosFolder: 'cypress/videos',
  screenshotOnRunFailure: true,
  screenshotsFolder: 'cypress/screenshots',
  
  // Environment variables
  env: {
    apiUrl: 'http://localhost:8001',
    frontendUrl: 'http://localhost:3000',
    testUserPassword: 'TestPassword123!',
    
    // Test data configuration
    testDataRetention: false, // Set to true to keep test data for debugging
    
    // Feature flags for testing
    enableVisualTesting: false,
    enablePerformanceTesting: false,
    enableAccessibilityTesting: false
  }
}) 