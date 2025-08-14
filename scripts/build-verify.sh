#!/bin/bash

# Build verification script for amazon-cognito-passwordless-auth
# This script runs all the necessary checks to ensure the library is ready for commit/deployment

set -e  # Exit on any error

echo "🚀 Starting build verification..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Clean previous builds
print_step "Cleaning previous builds..."
npm run clear-d-ts 2>/dev/null || true
rm -rf dist/ 2>/dev/null || true
print_success "Cleaned previous builds"

# Step 2: TypeScript compilation check
print_step "Checking TypeScript compilation..."
npx tsc --noEmit --project client/tsconfig.json
npx tsc --noEmit --project cdk/lib/tsconfig.json  
npx tsc --noEmit --project cdk/custom-auth/tsconfig.json
print_success "TypeScript compilation successful"

# Step 3: ESLint check
print_step "Running ESLint..."
if command -v eslint &> /dev/null; then
    npx eslint client/ cdk/ --ext .ts,.tsx || {
        print_error "ESLint check failed"
        exit 1
    }
    print_success "ESLint check passed"
else
    print_warning "ESLint not found, skipping..."
fi

# Step 4: Prettier check
print_step "Checking code formatting with Prettier..."
if command -v prettier &> /dev/null; then
    npx prettier --check client/ cdk/ || {
        print_error "Code formatting check failed. Run 'npm run format' to fix."
        exit 1
    }
    print_success "Code formatting check passed"
else
    print_warning "Prettier not found, skipping..."
fi

# Step 5: Build the library
print_step "Building the library..."
npm run dist
print_success "Library built successfully"

# Step 6: Verify exports
print_step "Verifying exports..."
node -e "
const { Passwordless } = require('./dist/client/index.js');
const requiredFunctions = ['signUpUser', 'confirmSignUpAndRequestMagicLink', 'completeSignUpFlow'];
let allExported = true;

requiredFunctions.forEach(funcName => {
  if (typeof Passwordless[funcName] !== 'function') {
    console.error(\`❌ \${funcName} is not exported as a function\`);
    allExported = false;
  }
});

if (allExported) {
  console.log('✅ All sign-up functions are properly exported');
} else {
  process.exit(1);
}

// Test React exports
try {
  const { usePasswordless } = require('./dist/client/react/hooks.js');
  console.log('✅ React hooks exported successfully');
} catch (error) {
  console.error('❌ React hooks export failed:', error.message);
  process.exit(1);
}
"
print_success "Export verification completed"

# Step 7: Run basic functionality test
print_step "Running basic functionality test..."
node -e "
const { Passwordless } = require('./dist/client/index.js');

// Configure with mock
Passwordless.configure({
  cognitoIdpEndpoint: 'us-east-1',
  clientId: 'test-client-id',
  fetch: async () => ({ ok: true, status: 200, json: async () => ({ UserSub: 'test' }) })
});

// Test that functions can be called
Promise.all([
  Passwordless.signUpUser({ username: 'test', email: 'test@example.com' }),
  Passwordless.confirmSignUpAndRequestMagicLink({ username: 'test', confirmationCode: '123456' }),
  Passwordless.completeSignUpFlow({ username: 'test', email: 'test@example.com' })
]).then(() => {
  console.log('✅ Basic functionality test passed');
}).catch((error) => {
  console.error('❌ Basic functionality test failed:', error.message);
  process.exit(1);
});
"
print_success "Basic functionality test completed"

# Step 8: Check package.json integrity
print_step "Checking package.json integrity..."
node -e "
const pkg = require('./package.json');
const requiredFields = ['name', 'version', 'main', 'exports'];
let valid = true;

requiredFields.forEach(field => {
  if (!pkg[field]) {
    console.error(\`❌ Missing required field: \${field}\`);
    valid = false;
  }
});

if (pkg.main !== 'dist/client/index.js') {
  console.error('❌ Invalid main field in package.json');
  valid = false;
}

if (!pkg.exports['.']) {
  console.error('❌ Missing main export in package.json');
  valid = false;
}

if (valid) {
  console.log('✅ package.json integrity check passed');
} else {
  process.exit(1);
}
"
print_success "Package.json integrity verified"

print_success "🎉 All build verification checks passed!"
echo ""
echo "✨ The library is ready for commit/deployment"
