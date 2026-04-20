import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserProvider, useUser } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateDocument from './pages/CreateDocument'
import DocumentView from './pages/DocumentView'
import History from './pages/History'
import AdminSettings from './pages/AdminSettings'
import { useState, useEffect } from 'react'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(240)

  // sync with sidebar collapse
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('[data-sidebar]')
      if (sidebar) setSidebarWidth(sidebar.offsetWidth)
    })
    const sidebar = document.querySelector('[data-sidebar]')
    if (sidebar) observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '240px',
        minHeight: '100vh',
        transition: 'margin-left 0.2s',
        background: 'var(--bg)',
      }}>
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  return (
    <BrowserRouter basename="/dara-4prasan">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
        } />
        <Route path="/document/new" element={
          <PrivateRoute><Layout><CreateDocument /></Layout></PrivateRoute>
        } />
        <Route path="/document/:id" element={
          <PrivateRoute><Layout><DocumentView /></Layout></PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute><Layout><History /></Layout></PrivateRoute>
        } />
        <Route path="/admin" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
