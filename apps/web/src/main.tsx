import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@workspace/ui/globals.css';
import { App } from './App';

// Entry point for the web application. It renders the App component inside a StrictMode wrapper for highlighting potential problems in the application. The root element is selected by its ID 'root'.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
