# 🚀 Zanara Testing - Quick Start Guide

## **Prerequisites**
- Both backend and frontend servers running
- MongoDB connected
- All dependencies installed

## **🔥 Core Tests (100% Passing)**

### **Run All Critical Tests**
```bash
# Navigate to frontend directory
cd frontend

# Run smoke tests (5 seconds)
npm run test:smoke

# Run error handling tests (< 1 second)
npm run test:error-handling

# Run full regression suite
npm run test:regression
```

## **📱 Device-Specific Testing**
```bash
# Mobile testing
npm run test:mobile

# Tablet testing  
npm run test:tablet

# Desktop testing
npm run test:desktop
```

## **🌐 Browser-Specific Testing**
```bash
# Chrome browser
npm run test:chrome

# Firefox browser
npm run test:firefox

# Edge browser
npm run test:edge
```

## **🔧 Advanced Testing (Framework Ready)**
```bash
# Performance testing
npm run test:performance

# Real-time/WebSocket testing
npm run test:realtime

# Responsive/mobile testing
npm run test:responsive

# Security testing
npm run test:security

# Accessibility testing
npm run test:accessibility
```

## **📊 Test Reports & Cleanup**
```bash
# Generate detailed reports
npm run test:report

# Clean up test artifacts
npm run test:clean

# Record tests to Cypress Dashboard
npm run test:record
```

## **🎯 Quick Health Check**
```bash
# Verify everything is working
npm run test:smoke
```
**Expected:** 14/14 tests passing in ~5 seconds

## **🛠 Development Workflow**

### **Before Committing Code**
```bash
npm run test:smoke && npm run test:error-handling
```

### **Before Deploying**
```bash
npm run test:regression
```

### **For Feature Development**
```bash
# Test specific areas
npm run test:auth        # Authentication features
npm run test:profiles    # Profile management
npm run test:content     # Content creation
npm run test:networking  # Connection features
npm run test:messaging   # Messaging system
```

## **📈 Success Metrics**
- ✅ **Smoke Tests**: Must be 14/14 passing
- ✅ **Error Handling**: Must be 8/8 passing  
- ✅ **Performance**: Page loads < 2 seconds
- ✅ **Zero Critical Failures** in regression suite

## **🔍 Debugging Failed Tests**
1. Check `cypress/videos/` for test recordings
2. Check `cypress/screenshots/` for failure screenshots
3. Review console output for specific error messages
4. Verify backend/frontend are running on correct ports

## **🚨 Emergency Commands**
```bash
# Kill all processes and restart
pkill -f "node server.js" && pkill -f "react-scripts"

# Start backend
cd backend && npm start &

# Start frontend  
cd frontend && BROWSER=none npm start &

# Wait and test
sleep 10 && npm run test:smoke
```

---

**Need Help?** Check `TESTING-ROADMAP.md` for comprehensive documentation or `TESTING-SUMMARY-REPORT.md` for detailed status. 