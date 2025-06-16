// Custom command for login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Custom command for registration
Cypress.Commands.add('register', (email, password, fullName, userType) => {
  cy.visit('/register')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('input[name="fullName"]').type(fullName)
  cy.get('select[name="userType"]').select(userType)
  cy.get('button[type="submit"]').click()
})

// Custom command for file upload
Cypress.Commands.add('uploadFile', (selector, filePath) => {
  cy.get(selector).attachFile(filePath)
}) 