import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { QueryProvider } from './app/providers/QueryProvider';
import './styles/global.css';

if (typeof window !== 'undefined') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>,
);
