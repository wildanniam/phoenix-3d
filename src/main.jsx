import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/unbounded/latin-500.css'
import '@fontsource/unbounded/latin-700.css'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-600.css'
import './styles.css'
import Experience from './Experience.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Experience />
  </React.StrictMode>,
)
