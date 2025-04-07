import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import iconPath from './assets/icon.png'

const link = document.createElement('link')
link.rel = 'icon'
link.href = iconPath
document.head.appendChild(link)

document.title = 'Virtual Garden'

// Does not need to be modified
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
