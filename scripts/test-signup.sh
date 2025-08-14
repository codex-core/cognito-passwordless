#!/bin/bash

# Quick test script for sign-up functionality
# This script runs focused tests on the sign-up feature

set -e

echo "🧪 Testing Sign-Up Functionality..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}🔹 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Test 1: TypeScript compilation for sign-up related files
print_step "Checking TypeScript compilation for sign-up files..."
npx tsc --noEmit client/sign-up.ts
npx tsc --noEmit client/react/hooks.tsx
print_success "Sign-up TypeScript compilation successful"

# Test 2: Verify sign-up exports
print_step "Verifying sign-up exports..."
node -e "
const { Passwordless } = require('./dist/client/index.js');
const signUpFunctions = ['signUpUser', 'confirmSignUpAndRequestMagicLink', 'completeSignUpFlow'];

signUpFunctions.forEach(funcName => {
  if (typeof Passwordless[funcName] !== 'function') {
    console.error(\`❌ \${funcName} is not exported as a function\`);
    process.exit(1);
  }
});

console.log('✅ All sign-up functions properly exported');
"
print_success "Sign-up exports verified"

# Test 3: Test React hooks
print_step "Testing React hooks sign-up integration..."
node -e "
const { usePasswordless } = require('./dist/client/react/hooks.js');
console.log('✅ React hooks with sign-up functions imported successfully');
"
print_success "React hooks integration verified"

# Test 4: Mock functionality test
print_step "Running mock functionality test..."
node -e "
const { Passwordless } = require('./dist/client/index.js');

// Configure with mock
Passwordless.configure({
  cognitoIdpEndpoint: 'us-east-1',
  clientId: 'test-client-id',
  fetch: async () => ({ 
    ok: true, 
    status: 200, 
    json: async () => ({ UserSub: 'test-user-sub' }),
    text: async () => 'OK'
  })
});

async function testSignUpFlow() {
  try {
    // Test basic sign-up
    const result1 = await Passwordless.signUpUser({
      username: 'testuser',
      email: 'test@example.com',
      userAttributes: [
        { name: 'given_name', value: 'Test' },
        { name: 'family_name', value: 'User' }
      ]
    });
    console.log('✅ signUpUser test passed');

    // Test confirmation
    const result2 = await Passwordless.confirmSignUpAndRequestMagicLink({
      username: 'testuser',
      confirmationCode: '123456',
      requestMagicLink: true
    });
    console.log('✅ confirmSignUpAndRequestMagicLink test passed');

    // Test complete flow
    const result3 = await Passwordless.completeSignUpFlow({
      username: 'testuser2',
      email: 'test2@example.com'
    });
    console.log('✅ completeSignUpFlow test passed');

    console.log('🎉 All sign-up functionality tests passed!');
  } catch (error) {
    console.error('❌ Sign-up functionality test failed:', error.message);
    process.exit(1);
  }
}

testSignUpFlow();
"
print_success "Mock functionality test completed"

echo ""
print_success "🎉 All sign-up functionality tests passed!"
