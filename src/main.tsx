import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { initializePWA } from './pwa'
import { hideSplashScreen } from './components/AppLoadingScreen'

// Enhanced global error handler for keyboard events and other errors
// This prevents third-party script errors (like browser extensions) from breaking the app
window.addEventListener('error', (event) => {
  // Handle Convex Auth stale token errors gracefully
  // Only suppress errors that occur during initial page load, not during sign-in attempts
  // Check if this is during an active sign-in attempt by looking at the stack trace
  const isDuringSignIn = event.error?.stack?.includes('signIn') || 
                         event.error?.stack?.includes('signInAction') ||
                         event.filename?.includes('useConvexAuth') ||
                         event.filename?.includes('LandingPage');
  
  const isAuthError = event.message?.includes('No auth provider found') || 
                     event.message?.includes('no providers configured') ||
                     event.message?.includes('Failed to authenticate');
  
  // Only suppress if it's NOT during a sign-in attempt
  if (isAuthError && !isDuringSignIn) {
    // This is a stale token error during page load - silently handle it
    if (import.meta.env.DEV) {
      console.debug('Stale auth token detected during page load');
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  
  // If it's during sign-in, let the error propagate so it can be caught and displayed
  
  // Catch errors in handleKeyDown that access .length on undefined
  // This is often from browser extensions injecting page-events.js
  const isPageEventsError = event.filename?.includes('page-events.js') || 
                           event.filename?.includes('chunk-') ||
                           event.filename?.includes('extension://') ||
                           event.filename?.includes('chrome-extension://');
  
  const isLengthError = event.message?.includes('Cannot read properties of undefined (reading \'length\')') ||
                       event.message?.includes('Cannot read property \'length\' of undefined') ||
                       event.message?.includes("Cannot read properties of null (reading 'length')");
  
  if (isLengthError && isPageEventsError) {
    // Suppress the error to prevent it from breaking the app
    // Only log in development to reduce console noise
    if (import.meta.env.DEV) {
      console.debug('Suppressed third-party script error (browser extension):', {
        message: event.message,
        filename: event.filename
      });
    }
    
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, true); // Use capture phase to catch errors early

// Also catch unhandled promise rejections that might block navigation
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || String(reason || '');
  const stack = reason?.stack || '';
  
  // Handle Convex Auth stale token errors gracefully
  // Only suppress errors that occur during initial page load, not during sign-in attempts
  const isDuringSignIn = stack?.includes('signIn') || 
                        stack?.includes('signInAction') ||
                        stack?.includes('useConvexAuth') ||
                        stack?.includes('LandingPage');
  
  const isAuthError = message?.includes('No auth provider found') || 
                     message?.includes('no providers configured') ||
                     message?.includes('Failed to authenticate');
  
  // Only suppress if it's NOT during a sign-in attempt
  if (isAuthError && !isDuringSignIn) {
    // This is a stale token error during page load - silently handle it
    if (import.meta.env.DEV) {
      console.debug('Stale auth token detected in promise rejection during page load');
    }
    event.preventDefault();
    return false;
  }
  
  // If it's during sign-in, let the error propagate so it can be caught and displayed
  
  // Check if it's a known harmless error from third-party scripts
  const isThirdPartyError = stack?.includes('page-events.js') ||
                           stack?.includes('extension://') ||
                           stack?.includes('chrome-extension://');
  
  const isLengthError = message.includes('Cannot read properties of undefined') ||
                       message.includes('Cannot read property') ||
                       message.includes('length');
  
  if (isLengthError && isThirdPartyError) {
    // Suppress the error to prevent it from breaking the app
    // Only log in development to reduce console noise
    if (import.meta.env.DEV) {
      console.debug('Suppressed unhandled promise rejection from third-party script:', {
        reason: message
      });
    }
    event.preventDefault();
    return false;
  }
});

// Initialize PWA functionality
initializePWA();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Hide the HTML splash screen once React has mounted
// Small delay to ensure smooth transition
requestAnimationFrame(() => {
  hideSplashScreen()
})
