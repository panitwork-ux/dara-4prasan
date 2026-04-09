import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { apiFetch } from '../utils/api'

const UserContext = createContext()

export function UserProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    if (user) fetchProfile()
    else setProfile(null)
  }, [user])

  const fetchProfile = async () => {
    setLoadingProfile(true)
    try {
      const res = await apiFetch('getUserProfile', { email: user.email })
      if (res.success && res.user) {
        setProfile(res.user)
      } else {
        // ถ้าไม่เจอใน Sheet ให้ default เป็น teacher
        setProfile({
          email: user.email,
          name: user.displayName,
          role: 'teacher',
          lineUserId: '',
        })
      }
    } catch (e) {
      setProfile({ email: user.email, name: user.displayName, role: 'teacher', lineUserId: '' })
    }
    setLoadingProfile(false)
  }

  const isAdmin = profile?.role === 'admin'
  const isDeptHead = profile?.role === 'dept_head'
  const isAsstDir = profile?.role === 'asst_director'
  const isTeacher = profile?.role === 'teacher'
  const isDept = ['guidance', 'discipline', 'academic'].includes(profile?.role)

  return (
    <UserContext.Provider value={{ profile, loadingProfile, isAdmin, isDeptHead, isAsstDir, isTeacher, isDept, refetchProfile: fetchProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
