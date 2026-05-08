import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../global_menu_v8'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
