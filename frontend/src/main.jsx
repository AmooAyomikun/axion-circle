import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (measurementId) {
  ReactGA.initialize(measurementId);
} else if (import.meta.env.DEV) {
  console.warn('VITE_GA_MEASUREMENT_ID is missing. ReactGA will not be initialized.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
