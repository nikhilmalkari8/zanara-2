# 🧪 Zanara Platform - Comprehensive Testing Suite

## Overview

This testing suite provides complete automated testing coverage for the Zanara fashion platform, ensuring every feature works perfectly across all user types and scenarios.

## 🚀 Quick Start

### Prerequisites
1. **Services Running**: Both backend (port 8001) and frontend (port 3000) must be running
2. **Dependencies Installed**: Run `npm install` in the frontend directory

### Run Tests

```bash
# Quick smoke test (5-10 minutes)
node test-runner.js smoke

# Interactive test runner
node test-runner.js

# Specific test suite
node test-runner.js auth

# Full regression suite (60-90 minutes)
node test-runner.js all
```

## 📋 Test Categories

### 1. 🔥 Smoke Tests (01-smoke-tests)
**Duration**: 5-10 minutes  
**Purpose**: Critical path validation
- Application loading
- Basic authentication
- Core navigation
- API health checks

### 2. 🔐 Authentication Tests (02-authentication)
**Duration**: 10-15 minutes  
**Purpose**: Complete auth flow testing
- User registration (all types)
- Login/logout flows
- Password reset
- Session management

### 3. 👤 Profile Management Tests (03-profiles)
**Duration**: 15-20 minutes  
**Purpose**: Profile system validation
- Model profile creation
- Photographer profiles
- Designer profiles
- Brand profiles
- Profile editing and updates

### 4. 📝 Content & Activity Tests (04-content)
**Duration**: 20-25 minutes  
**Purpose**: Content creation and engagement
- Post creation (text, images, videos)
- Activity feed display
- Reactions and comments
- Content sharing
- Hashtag functionality

### 5. 🤝 Networking & Connections Tests (05-networking)
**Duration**: 15-20 minutes  
**Purpose**: Professional networking features
- Connection requests
- Connection management
- Skill endorsements
- Professional recommendations
- Networking suggestions

### 6. 💬 Messaging Tests (06-messaging)
**Duration**: 10-15 minutes  
**Purpose**: Communication features
- Direct messaging
- Group conversations
- File sharing
- Message notifications

### 7. 🧠 Advanced Features Tests (07-advanced)
**Duration**: 15-20 minutes  
**Purpose**: Smart features and analytics
- Smart feed algorithm
- Notifications system
- Search and discovery
- Analytics and insights

## 🛠️ Test Runner Commands

### Interactive Mode
```bash
node test-runner.js
```
Launches an interactive menu where you can select test suites.

### Direct Commands
```bash
# Smoke tests
node test-runner.js smoke

# Authentication tests
node test-runner.js auth

# Profile tests
node test-runner.js profiles

# Content tests
node test-runner.js content

# Networking tests
node test-runner.js networking

# Messaging tests
node test-runner.js messaging

# Advanced features
node test-runner.js advanced

# Full regression
node test-runner.js all
```

### Utility Commands
```bash
# Clean test artifacts
node test-runner.js clean

# Generate test report
node test-runner.js report

# Show help
node test-runner.js help
```

## 📊 NPM Scripts (Frontend Directory)

### Basic Test Execution
```bash
npm run test:smoke          # Quick smoke tests
npm run test:auth           # Authentication tests
npm run test:profiles       # Profile management tests
npm run test:content        # Content and activity tests
npm run test:networking     # Networking features
npm run test:messaging      # Messaging features
npm run test:advanced       # Advanced features
npm run test:regression     # Full test suite
```

### Device Testing
```bash
npm run test:mobile         # Mobile viewport (375x667)
npm run test:tablet         # Tablet viewport (768x1024)
npm run test:desktop        # Desktop viewport (1280x720)
```

### Browser Testing
```bash
npm run test:chrome         # Chrome browser
npm run test:firefox        # Firefox browser
npm run test:edge           # Edge browser
```

### Development Testing
```bash
npm run cypress:open        # Interactive test runner
npm run test:e2e:watch      # Watch mode with server
```

## 🎯 Test Data Management

### Automatic Test Data
- Tests automatically generate unique test users
- Test data is cleaned up after each run
- Realistic test scenarios with proper data

### Custom Test Data
Test data is defined in `frontend/cypress/fixtures/testData.json`:
- User types (model, photographer, designer, brand)
- Content templates
- Test scenarios
- API endpoints

### Data Retention
Set `testDataRetention: true` in cypress config to keep test data for debugging.

## 🔧 Configuration

### Environment Variables
Set in `frontend/cypress.config.js`:
```javascript
env: {
  apiUrl: 'http://localhost:8001',
  frontendUrl: 'http://localhost:3000',
  testUserPassword: 'TestPassword123!',
  testDataRetention: false,
  enableVisualTesting: false,
  enablePerformanceTesting: false,
  enableAccessibilityTesting: false
}
```

### Test Features
- **Visual Testing**: Set `enableVisualTesting: true`
- **Performance Testing**: Set `enablePerformanceTesting: true`
- **Accessibility Testing**: Set `enableAccessibilityTesting: true`

## 📈 Test Reports

### Generating Reports
```bash
# Generate HTML report
node test-runner.js report

# Or via npm
npm run test:report
```

Reports are generated in `test-reports/` directory with:
- Test execution summary
- Pass/fail status for each test
- Screenshots of failures
- Video recordings of test runs

### Viewing Reports
Open `test-reports/index.html` in your browser for detailed test results.

## 🚨 Troubleshooting

### Common Issues

**Services Not Running**
```bash
# Check if services are running
curl http://localhost:8001/api/health
curl http://localhost:3000
```

**Test Data Issues**
```bash
# Clean test data
node test-runner.js clean
```

**Token Issues**
Visit `http://localhost:3000/clear-tokens.html` to clear stored tokens.

**Dependencies Issues**
```bash
cd frontend
npm install
```

### Debug Mode
Set `testDataRetention: true` in config to keep test data for debugging.

## 🎨 Custom Commands

The test suite includes custom Cypress commands for common actions:

### Authentication
```javascript
cy.registerUser('model')        // Register test user
cy.loginUser(email, password)   // Login via API
cy.loginViaUI(email, password)  // Login via UI
cy.logout()                     // Logout and clean session
```

### Profile Management
```javascript
cy.completeProfile(profileData) // Complete profile setup
cy.updateProfile(updateData)    // Update profile
```

### Content & Activity
```javascript
cy.createPost(postData)         // Create new post
cy.reactToPost(postId, type)    // React to post
```

### Navigation
```javascript
cy.navigateToProfile()          // Go to profile page
cy.navigateToDashboard()        // Go to dashboard
cy.navigateToActivityFeed()     // Go to activity feed
```

### Utilities
```javascript
cy.waitForPageLoad()            // Wait for page to fully load
cy.uploadFile(selector, file)   // Upload file
cy.apiRequest(method, endpoint) // Make API request
```

## 🔄 Continuous Integration

### GitHub Actions (Future)
```yaml
# .github/workflows/test.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: node test-runner.js all
```

### Test Scheduling
- **Daily**: Smoke tests
- **Weekly**: Full regression
- **On Deploy**: Smoke + critical path tests

## 📝 Writing New Tests

### Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.setupTestEnvironment();
  });

  it('should do something', () => {
    cy.registerUser('model');
    // Test implementation
  });
});
```

### Best Practices
1. Use data-cy attributes for selectors
2. Clean up test data after tests
3. Use realistic test data
4. Test both API and UI layers
5. Include error scenarios
6. Make tests independent

## 🎯 Coverage Goals

### Target Coverage
- **Authentication**: 100%
- **Profile Management**: 100%
- **Content Creation**: 95%
- **Networking**: 95%
- **Messaging**: 90%
- **Advanced Features**: 85%

### Success Metrics
- All smoke tests pass (100%)
- Regression suite >95% pass rate
- Tests complete within time limits
- No false positives/negatives

## 🚀 Next Steps

### Phase 2: Core Features (Week 2)
- Complete authentication test suite
- Profile management for all user types
- Basic content creation tests

### Phase 3: Advanced Features (Week 3)
- Activity feed and engagement
- Connection and networking
- Messaging system

### Phase 4: Integration & Polish (Week 4)
- Cross-browser testing
- Performance testing
- Visual regression testing

---

**🎉 Happy Testing!** This comprehensive suite ensures your Zanara platform works perfectly for every user, every time. 