/**
 * Example: Using the Sign-Up Flow with Passwordless Authentication
 * 
 * This example demonstrates how to use the new sign-up functionality
 * in both plain JavaScript and React applications.
 */

// =============================================================================
// Plain JavaScript Usage
// =============================================================================

import { Passwordless } from "amazon-cognito-passwordless-auth";

// Configure the library
Passwordless.configure({
  cognitoIdpEndpoint: "us-east-1",
  clientId: "your-cognito-client-id",
  storage: localStorage,
});

// Example 1: Basic sign-up with manual confirmation
async function basicSignUp() {
  try {
    // Step 1: Sign up the user
    const signUpResult = Passwordless.signUpUser({
      username: "john_doe",
      email: "john@example.com",
      userAttributes: [
        { name: "given_name", value: "John" },
        { name: "family_name", value: "Doe" },
      ],
      statusCb: (status) => console.log("Sign-up status:", status),
    });

    await signUpResult.signUpCompleted;
    console.log("Sign-up completed! Check your email for confirmation code.");

    // Step 2: Confirm sign-up (this would typically happen after user enters code)
    const confirmationCode = "123456"; // From user input
    const confirmResult = Passwordless.confirmSignUpAndRequestMagicLink({
      username: "john_doe",
      confirmationCode,
      requestMagicLink: true, // Automatically send magic link after confirmation
      statusCb: (status) => console.log("Confirmation status:", status),
    });

    const result = await confirmResult.confirmationCompleted;
    console.log("Account confirmed! Magic link sent to email.");
  } catch (error) {
    console.error("Sign-up failed:", error);
  }
}

// Example 2: Complete sign-up flow with built-in confirmation handler
async function completeSignUpFlow() {
  try {
    const signUpFlow = Passwordless.completeSignUpFlow({
      username: "jane_doe",
      email: "jane@example.com",
      userAttributes: [
        { name: "given_name", value: "Jane" },
        { name: "family_name", value: "Doe" },
      ],
      statusCb: (status) => console.log("Status:", status),
    });

    // Wait for initial sign-up
    await signUpFlow.signUpCompleted;
    console.log("Sign-up completed!");

    // Now confirm with code (typically from user input)
    const confirmationCode = "654321";
    const confirmResult = signUpFlow.confirmSignUp({
      confirmationCode,
      requestMagicLink: true,
    });

    await confirmResult.confirmationCompleted;
    console.log("Account confirmed and magic link sent!");
  } catch (error) {
    console.error("Sign-up flow failed:", error);
  }
}

// =============================================================================
// React Usage
// =============================================================================

import React, { useState } from 'react';
import { 
  usePasswordless, 
  PasswordlessContextProvider 
} from 'amazon-cognito-passwordless-auth/react';

function SignUpForm() {
  const [step, setStep] = useState<'signup' | 'confirm' | 'complete'>('signup');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    confirmationCode: '',
  });
  
  const { 
    signUpUser, 
    confirmSignUpAndRequestMagicLink, 
    completeSignUpFlow,
    signingInStatus,
    lastError 
  } = usePasswordless();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const signUpResult = signUpUser({
        username: formData.username,
        email: formData.email,
        userAttributes: [
          { name: 'given_name', value: formData.firstName },
          { name: 'family_name', value: formData.lastName },
        ],
      });

      await signUpResult.signUpCompleted;
      setStep('confirm');
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const confirmResult = confirmSignUpAndRequestMagicLink({
        username: formData.username,
        confirmationCode: formData.confirmationCode,
        requestMagicLink: true,
      });

      await confirmResult.confirmationCompleted;
      setStep('complete');
    } catch (error) {
      console.error('Confirmation failed:', error);
    }
  };

  if (step === 'complete') {
    return (
      <div className="success-message">
        <h2>Welcome!</h2>
        <p>Your account has been created successfully.</p>
        <p>Check your email for a magic link to sign in without a password!</p>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <form onSubmit={handleConfirm}>
        <h2>Confirm Your Account</h2>
        <p>Please enter the confirmation code sent to {formData.email}</p>
        
        <input
          type="text"
          placeholder="Confirmation Code"
          value={formData.confirmationCode}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            confirmationCode: e.target.value 
          }))}
          required
        />
        
        <button type="submit" disabled={signingInStatus === 'CONFIRMING_SIGNUP'}>
          {signingInStatus === 'CONFIRMING_SIGNUP' ? 'Confirming...' : 'Confirm Account'}
        </button>
        
        {lastError && (
          <div className="error">Error: {lastError.message}</div>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSignUp}>
      <h2>Create Account</h2>
      
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          username: e.target.value 
        }))}
        required
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          email: e.target.value 
        }))}
        required
      />
      
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          firstName: e.target.value 
        }))}
        required
      />
      
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          lastName: e.target.value 
        }))}
        required
      />
      
      <button type="submit" disabled={signingInStatus === 'SIGNING_UP'}>
        {signingInStatus === 'SIGNING_UP' ? 'Creating Account...' : 'Create Account'}
      </button>
      
      {lastError && (
        <div className="error">Error: {lastError.message}</div>
      )}
      
      <p>
        After creating your account, you'll receive a magic link to sign in 
        without a password!
      </p>
    </form>
  );
}

// Main App Component
function App() {
  return (
    <PasswordlessContextProvider>
      <div className="app">
        <SignUpForm />
      </div>
    </PasswordlessContextProvider>
  );
}

export default App;
