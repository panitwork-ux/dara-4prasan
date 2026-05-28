import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateDocument from './pages/CreateDocument'
import DocumentView from './pages/DocumentView'
import History from './pages/History'
import AdminSettings from './pages/AdminSettings'

function Guard({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:'240px', minHeight:'100vh', background:'var(--bg)' }}>
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
        <Route path="/admin" element={<AdminSettings />} />
        <Route path="/dashboard" element={<Guard><Layout><Dashboard /></Layout></Guard>} />
        <Route path="/document/new" element={<Guard><Layout><CreateDocument /></Layout></Guard>} />
        <Route path="/document/:id" element={<Guard><Layout><DocumentView /></Layout></Guard>} />
        <Route path="/history" element={<Guard><Layout><History /></Layout></Guard>} />
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
