import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthenticationProvider } from './authentication-context/AuthenticationContext.jsx'
import { MessagesContextProvider } from './application-context/MessagesContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MessagesContextProvider>
      <AuthenticationProvider>
        <App />
      </AuthenticationProvider>
    </MessagesContextProvider>
  </StrictMode>,
)
