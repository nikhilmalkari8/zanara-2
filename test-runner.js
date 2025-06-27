#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class ZanaraTestRunner {
  constructor() {
    this.testSuites = {
      smoke: {
        name: 'Smoke Tests',
        spec: 'cypress/e2e/01-smoke-tests/**/*.cy.js',
        description: 'Quick validation of critical functionality',
        estimatedTime: '5-10 minutes'
      },
      auth: {
        name: 'Authentication Tests',
        spec: 'cypress/e2e/02-authentication/**/*.cy.js',
        description: 'Complete authentication flow testing',
        estimatedTime: '10-15 minutes'
      },
      profiles: {
        name: 'Profile Management Tests',
        spec: 'cypress/e2e/03-profiles/**/*.cy.js',
        description: 'Profile creation and management for all user types',
        estimatedTime: '15-20 minutes'
      },
      content: {
        name: 'Content & Activity Tests',
        spec: 'cypress/e2e/04-content/**/*.cy.js',
        description: 'Content creation, activity feed, and engagement',
        estimatedTime: '20-25 minutes'
      },
      networking: {
        name: 'Networking & Connections Tests',
        spec: 'cypress/e2e/05-networking/**/*.cy.js',
        description: 'Professional networking and connection features',
        estimatedTime: '15-20 minutes'
      },
      messaging: {
        name: 'Messaging Tests',
        spec: 'cypress/e2e/06-messaging/**/*.cy.js',
        description: 'Direct messaging and communication features',
        estimatedTime: '10-15 minutes'
      },
      advanced: {
        name: 'Advanced Features Tests',
        spec: 'cypress/e2e/07-advanced/**/*.cy.js',
        description: 'Smart feed, notifications, and advanced features',
        estimatedTime: '15-20 minutes'
      },
      regression: {
        name: 'Full Regression Suite',
        spec: 'cypress/e2e/**/*.cy.js',
        description: 'Complete test suite covering all functionality',
        estimatedTime: '60-90 minutes'
      }
    };
  }

  async checkServices() {
    console.log('🔍 Checking required services...\n');
    
    const services = [
      { name: 'Backend', url: 'http://localhost:8001/api/health' },
      { name: 'Frontend', url: 'http://localhost:3000' }
    ];

    for (const service of services) {
      try {
        const response = await fetch(service.url);
        if (response.ok) {
          console.log(`✅ ${service.name}: Running`);
        } else {
          console.log(`❌ ${service.name}: Not responding correctly`);
          return false;
        }
      } catch (error) {
        console.log(`❌ ${service.name}: Not running`);
        console.log(`   Please start the ${service.name.toLowerCase()} server first`);
        return false;
      }
    }
    
    console.log('');
    return true;
  }

  displayMenu() {
    console.log('🧪 Zanara Platform Test Runner\n');
    console.log('Available Test Suites:\n');
    
    Object.entries(this.testSuites).forEach(([key, suite], index) => {
      console.log(`${index + 1}. ${suite.name}`);
      console.log(`   📝 ${suite.description}`);
      console.log(`   ⏱️  Estimated time: ${suite.estimatedTime}\n`);
    });
    
    console.log('Special Options:');
    console.log('🔥 smoke   - Quick smoke tests only');
    console.log('🚀 all     - Run complete regression suite');
    console.log('📊 report  - Generate test report');
    console.log('🧹 clean   - Clean test data and artifacts');
    console.log('');
  }

  async runTests(suiteKey, options = {}) {
    const suite = this.testSuites[suiteKey];
    if (!suite) {
      console.log(`❌ Unknown test suite: ${suiteKey}`);
      return false;
    }

    console.log(`🧪 Running ${suite.name}...`);
    console.log(`📝 ${suite.description}`);
    console.log(`⏱️  Estimated time: ${suite.estimatedTime}\n`);

    const cypressArgs = [
      'run',
      '--spec', suite.spec,
      '--browser', options.browser || 'chrome',
      '--headless'
    ];

    if (options.record) {
      cypressArgs.push('--record');
    }

    if (options.parallel) {
      cypressArgs.push('--parallel');
    }

    if (options.env) {
      cypressArgs.push('--env', options.env);
    }

    return new Promise((resolve) => {
      const cypress = spawn('npx', ['cypress', ...cypressArgs], {
        cwd: path.join(__dirname, 'frontend'),
        stdio: 'inherit'
      });

      cypress.on('close', (code) => {
        if (code === 0) {
          console.log(`\n✅ ${suite.name} completed successfully!`);
          resolve(true);
        } else {
          console.log(`\n❌ ${suite.name} failed with exit code ${code}`);
          resolve(false);
        }
      });
    });
  }

  async generateReport() {
    console.log('📊 Generating test report...\n');
    
    const reportDir = path.join(__dirname, 'test-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Generate HTML report
    const mochawesome = spawn('npx', [
      'mochawesome-merge',
      'frontend/cypress/reports/mocha/*.json'
    ], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    return new Promise((resolve) => {
      mochawesome.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Test report generated successfully!');
          console.log('📄 Report location: test-reports/index.html');
        } else {
          console.log('❌ Failed to generate test report');
        }
        resolve(code === 0);
      });
    });
  }

  async cleanArtifacts() {
    console.log('🧹 Cleaning test artifacts...\n');
    
    const dirsToClean = [
      'frontend/cypress/videos',
      'frontend/cypress/screenshots',
      'frontend/cypress/reports',
      'test-reports'
    ];

    dirsToClean.forEach(dir => {
      const fullPath = path.join(__dirname, dir);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🗑️  Cleaned: ${dir}`);
      }
    });

    console.log('\n✅ Cleanup completed!');
  }

  async runInteractiveMode() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    while (true) {
      this.displayMenu();
      const choice = await question('Enter your choice (number, name, or command): ');
      
      if (choice.toLowerCase() === 'exit' || choice.toLowerCase() === 'quit') {
        break;
      }

      if (choice.toLowerCase() === 'clean') {
        await this.cleanArtifacts();
        continue;
      }

      if (choice.toLowerCase() === 'report') {
        await this.generateReport();
        continue;
      }

      let suiteKey;
      if (choice.toLowerCase() === 'smoke') {
        suiteKey = 'smoke';
      } else if (choice.toLowerCase() === 'all') {
        suiteKey = 'regression';
      } else if (!isNaN(choice)) {
        const index = parseInt(choice) - 1;
        const keys = Object.keys(this.testSuites);
        suiteKey = keys[index];
      } else {
        suiteKey = choice.toLowerCase();
      }

      if (suiteKey && this.testSuites[suiteKey]) {
        const servicesOk = await this.checkServices();
        if (servicesOk) {
          await this.runTests(suiteKey);
        }
      } else {
        console.log('❌ Invalid choice. Please try again.\n');
      }
    }

    rl.close();
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const runner = new ZanaraTestRunner();

  if (args.length === 0) {
    // Interactive mode
    await runner.runInteractiveMode();
  } else {
    const command = args[0];
    
    switch (command) {
      case 'smoke':
        if (await runner.checkServices()) {
          await runner.runTests('smoke');
        }
        break;
        
      case 'all':
      case 'regression':
        if (await runner.checkServices()) {
          await runner.runTests('regression');
        }
        break;
        
      case 'clean':
        await runner.cleanArtifacts();
        break;
        
      case 'report':
        await runner.generateReport();
        break;
        
      case 'help':
        runner.displayMenu();
        break;
        
      default:
        if (runner.testSuites[command]) {
          if (await runner.checkServices()) {
            await runner.runTests(command);
          }
        } else {
          console.log(`❌ Unknown command: ${command}`);
          runner.displayMenu();
        }
    }
  }
}

// Add colors support
const colors = {
  cyan: { bold: '\x1b[1m\x1b[36m%s\x1b[0m' },
  green: { bold: '\x1b[1m\x1b[32m%s\x1b[0m' },
  red: { bold: '\x1b[1m\x1b[31m%s\x1b[0m' }
};

String.prototype.cyan = { bold: function() { return this; } };
String.prototype.green = { bold: function() { return this; } };
String.prototype.red = { bold: function() { return this; } };

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ZanaraTestRunner; 