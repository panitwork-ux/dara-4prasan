import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserProvider, useUser } from './context/UserContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateDocument from './pages/CreateDocument'
import DocumentView from './pages/DocumentView'
import History from './pages/History'
import AdminSettings from './pages/AdminSettings'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  const { isAdmin, loadingProfile } = useUser()
  if (!user) return <Navigate to="/login" replace />
  if (loadingProfile) return <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
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
        <Route path="/admin" element={
          <AdminRoute><Layout><AdminSettings /></Layout></AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </AuthProvider>
  )
}
