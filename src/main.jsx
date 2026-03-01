import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { PreferencesProvider } from './context/PreferencesContext'
import { LocationProvider } from './context/LocationContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes before data is considered stale
      gcTime: 1000 * 60 * 30,     // keep unused data in cache for 30 min
      retry: 1,                    // retry failed requests once
      refetchOnWindowFocus: false, // prevent refetch on tab switch (saves bandwidth on mobile)
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <LocationProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </LocationProvider>
    </PreferencesProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ignore registration failures
    })
  })
}
