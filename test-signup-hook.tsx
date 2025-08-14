import React, { useState } from 'react';
import { 
  usePasswordless, 
  PasswordlessContextProvider 
} from 'amazon-cognito-passwordless-auth/react';

// Test component to verify sign-up functions are available
function TestSignUpComponent() {
  const { 
    signUpUser, 
    confirmSignUpAndRequestMagicLink, 
    completeSignUpFlow,
    signingInStatus,
    lastError 
  } = usePasswordless();

  const [testResult, setTestResult] = useState<string>('');

  const testSignUpFunctions = () => {
    const results = [];
    
    // Check if functions exist
    if (typeof signUpUser === 'function') {
      results.push('✅ signUpUser function available');
    } else {
      results.push('❌ signUpUser function missing');
    }
    
    if (typeof confirmSignUpAndRequestMagicLink === 'function') {
      results.push('✅ confirmSignUpAndRequestMagicLink function available');
    } else {
      results.push('❌ confirmSignUpAndRequestMagicLink function missing');
    }
    
    if (typeof completeSignUpFlow === 'function') {
      results.push('✅ completeSignUpFlow function available');
    } else {
      results.push('❌ completeSignUpFlow function missing');
    }

    setTestResult(results.join('\n'));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Sign-Up Functions Test</h2>
      <button onClick={testSignUpFunctions}>
        Test Sign-Up Functions Availability
      </button>
      
      {testResult && (
        <pre style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          {testResult}
        </pre>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <p><strong>Current Status:</strong> {signingInStatus}</p>
        {lastError && (
          <p style={{ color: 'red' }}>
            <strong>Last Error:</strong> {lastError.message}
          </p>
        )}
      </div>
    </div>
  );
}

// Example usage component
function SignUpExample() {
  const [step, setStep] = useState<'signup' | 'confirm' | 'complete'>('signup');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    confirmationCode: '',
  });
  
  const { 
    completeSignUpFlow,
    signingInStatus,
    lastError 
  } = usePasswordless();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const signUpFlow = completeSignUpFlow({
        username: formData.username,
        email: formData.email,
      });

      await signUpFlow.signUpCompleted;
      setStep('confirm');
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const signUpFlow = completeSignUpFlow({
        username: formData.username,
        email: formData.email,
      });

      const confirmResult = signUpFlow.confirmSignUp({
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
      <div style={{ padding: '20px' }}>
        <h2>Success!</h2>
        <p>Account created and magic link sent to your email!</p>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <form onSubmit={handleConfirm} style={{ padding: '20px' }}>
        <h2>Confirm Your Account</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Confirmation Code"
            value={formData.confirmationCode}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              confirmationCode: e.target.value 
            }))}
            style={{ padding: '8px', width: '200px' }}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={signingInStatus === 'CONFIRMING_SIGNUP'}
          style={{ padding: '8px 16px' }}
        >
          {signingInStatus === 'CONFIRMING_SIGNUP' ? 'Confirming...' : 'Confirm'}
        </button>
        {lastError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {lastError.message}
          </div>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSignUp} style={{ padding: '20px' }}>
      <h2>Sign Up</h2>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            username: e.target.value 
          }))}
          style={{ padding: '8px', width: '200px', display: 'block', marginBottom: '10px' }}
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
          style={{ padding: '8px', width: '200px', display: 'block' }}
          required
        />
      </div>
      <button 
        type="submit" 
        disabled={signingInStatus === 'SIGNING_UP'}
        style={{ padding: '8px 16px' }}
      >
        {signingInStatus === 'SIGNING_UP' ? 'Signing Up...' : 'Sign Up'}
      </button>
      {lastError && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {lastError.message}
        </div>
      )}
    </form>
  );
}

// Main app with context provider
function App() {
  const [showTest, setShowTest] = useState(true);

  return (
    <PasswordlessContextProvider>
      <div>
        <button 
          onClick={() => setShowTest(!showTest)}
          style={{ margin: '10px', padding: '8px 16px' }}
        >
          {showTest ? 'Show Sign-Up Example' : 'Show Function Test'}
        </button>
        
        {showTest ? <TestSignUpComponent /> : <SignUpExample />}
      </div>
    </PasswordlessContextProvider>
  );
}

export default App;
