import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css' // Keep our custom CSS for chat bubbles etc.
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css'; // Import Mantine styles
import { GlobalWorkerOptions } from 'pdfjs-dist'; // Import GlobalWorkerOptions

// Configure pdf.js worker source globally
GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="auto"> {/* Respects OS preference */}
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
