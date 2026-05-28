import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { getUserProfile } from '../utils/api'
import { DEPT_HEAD_ROLES, DEPT_CHIEF_ROLES, DEPT_STAFF_ROLES } from '../utils/roles'

const Ctx = createContext()

export function UserProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) load()
    else setProfile(null)
  }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getUserProfile(user.email)
      setProfile(res.success && res.user
        ? res.user
        : { email: user.email, name: user.displayName, role: 'teacher' })
    } catch {
      setProfile({ email: user.email, name: user.displayName, role: 'teacher' })
    }
    setLoading(false)
  }

  const role = profile?.role || 'teacher'
  return (
    <Ctx.Provider value={{
      profile, loading, refetch: load, role,
      isAdmin:     role === 'admin',
      isAsstDir:   role === 'asst_director',
      isDeptHead:  DEPT_HEAD_ROLES.includes(role),
      isDeptChief: DEPT_CHIEF_ROLES.includes(role),
      isDeptStaff: DEPT_STAFF_ROLES.includes(role),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useUser = () => useContext(Ctx)
