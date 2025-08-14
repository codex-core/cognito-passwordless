# Sign-Up Integration Guide

The amazon-cognito-passwordless-auth library now includes built-in sign-up functionality that seamlessly integrates with the passwordless authentication flow.

## Features

- **Email-based sign-up** with automatic confirmation code sending
- **Automatic magic link integration** - users receive a magic link immediately after confirmation
- **React hooks integration** for easy use in React applications
- **TypeScript support** with full type safety
- **Status tracking** for UI state management
- **Error handling** with detailed error information

## Quick Start

### 1. Plain JavaScript

```javascript
import { Passwordless } from "amazon-cognito-passwordless-auth";

// Configure the library
Passwordless.configure({
  cognitoIdpEndpoint: "us-east-1",
  clientId: "your-cognito-client-id",
});

// Complete sign-up flow
const signUpFlow = Passwordless.completeSignUpFlow({
  username: "john_doe",
  email: "john@example.com",
  userAttributes: [
    { name: "given_name", value: "John" },
    { name: "family_name", value: "Doe" },
  ],
});

// Wait for sign-up completion
await signUpFlow.signUpCompleted;

// Confirm with verification code
const confirmResult = signUpFlow.confirmSignUp({
  confirmationCode: "123456", // From user input
  requestMagicLink: true, // Automatically send magic link
});

await confirmResult.confirmationCompleted;
console.log("Account created and magic link sent!");
```

### 2. React

```tsx
import React, { useState } from 'react';
import { usePasswordless } from 'amazon-cognito-passwordless-auth/react';

function SignUpForm() {
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    confirmationCode: '',
  });
  
  const { completeSignUpFlow, signingInStatus, lastError } = usePasswordless();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const signUpFlow = completeSignUpFlow({
      username: formData.username,
      email: formData.email,
    });

    try {
      await signUpFlow.signUpCompleted;
      setStep('confirm');
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  // ... rest of component
}
```

## API Reference

### signUpUser(props)

Signs up a new user with email verification.

**Parameters:**
- `username: string` - The username for the new account
- `email: string` - The email address (will receive confirmation code)
- `password?: string` - Optional password (defaults to temporary password for passwordless flow)
- `userAttributes?: Array<{name: string, value: string}>` - Additional user attributes
- `clientMetadata?: Record<string, string>` - Additional metadata
- `statusCb?: (status: BusyState | IdleState) => void` - Status callback function

**Returns:**
```typescript
{
  signUpCompleted: Promise<SignUpResponse>;
  abort: () => void;
}
```

### confirmSignUpAndRequestMagicLink(props)

Confirms sign-up with verification code and optionally requests a magic link.

**Parameters:**
- `username: string` - The username to confirm
- `confirmationCode: string` - The verification code from email
- `requestMagicLink?: boolean` - Whether to automatically send magic link (default: true)
- `redirectUri?: string` - Redirect URI for magic link
- `clientMetadata?: Record<string, string>` - Additional metadata
- `statusCb?: (status: BusyState | IdleState) => void` - Status callback function

**Returns:**
```typescript
{
  confirmationCompleted: Promise<ConfirmationResponse>;
  abort: () => void;
}
```

### completeSignUpFlow(props)

Complete sign-up flow with built-in confirmation handler.

**Parameters:** Same as `signUpUser`

**Returns:**
```typescript
{
  signUpCompleted: Promise<SignUpResponse>;
  confirmSignUp: (props: ConfirmationProps) => ConfirmationResult;
  abort: () => void;
}
```

## Status Values

The sign-up process introduces new status values:

**Busy States:**
- `SIGNING_UP` - User sign-up in progress
- `CONFIRMING_SIGNUP` - Email confirmation in progress

**Idle States:**
- `SIGNUP_COMPLETED` - Sign-up completed, awaiting confirmation
- `SIGNUP_FAILED` - Sign-up failed
- `SIGNUP_CONFIRMED` - Email confirmation successful
- `SIGNUP_CONFIRMATION_FAILED` - Email confirmation failed

## Integration with Existing Components

The sign-up functionality integrates seamlessly with existing passwordless components:

```tsx
import { 
  PasswordlessContextProvider, 
  Passwordless as PasswordlessComponent 
} from 'amazon-cognito-passwordless-auth/react';
import { SignUpForm } from './SignUpForm';

function App() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <PasswordlessContextProvider>
      <PasswordlessComponent>
        <div>Your main app content</div>
      </PasswordlessComponent>
      
      {showSignUp && <SignUpForm onClose={() => setShowSignUp(false)} />}
    </PasswordlessContextProvider>
  );
}
```

## Error Handling

All sign-up functions properly handle and propagate errors:

```javascript
try {
  const result = await Passwordless.signUpUser({
    username: "john_doe",
    email: "john@example.com",
  });
  
  await result.signUpCompleted;
} catch (error) {
  if (error.name === 'UsernameExistsException') {
    console.log('Username already exists');
  } else if (error.name === 'InvalidParameterException') {
    console.log('Invalid email format');
  } else {
    console.log('Sign-up failed:', error.message);
  }
}
```

## Complete Example

See [SIGNUP-EXAMPLES.md](./SIGNUP-EXAMPLES.md) for complete working examples in both JavaScript and React.
