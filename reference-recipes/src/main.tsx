import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Router from './Router';
import { TransitionProvider } from './contexts/TransitionContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TransitionProvider>
      <Router />
    </TransitionProvider>
  </StrictMode>
);