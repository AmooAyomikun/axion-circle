import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

// Defer GA initialization until after page is fully interactive
const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (measurementId) {
    import('react-ga4').then(({ default: ReactGA }) => {
      ReactGA.initialize(measurementId);
    });
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Initialize GA after page load — non-blocking
if (document.readyState === 'complete') {
  setTimeout(initGA, 3000);
} else {
  window.addEventListener('load', () => setTimeout(initGA, 3000), { once: true });
}
