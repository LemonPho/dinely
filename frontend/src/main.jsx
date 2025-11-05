import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthenticationProvider } from './application-context/AuthenticationContext.jsx'
import { MessagesContextProvider } from './application-context/MessagesContext.jsx'
import { UserContextProvider } from './application-context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MessagesContextProvider>
      <AuthenticationProvider>
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </AuthenticationProvider>
    </MessagesContextProvider>
  </StrictMode>,
)
