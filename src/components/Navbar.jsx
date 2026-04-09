import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { ROLE_LABELS } from '../utils/roles'

const ROLE_BADGE_COLORS = {
  admin: 'bg-red-100 text-red-700',
  dept_head: 'bg-orange-100 text-orange-700',
  asst_director: 'bg-pink-100 text-pink-700',
  guidance: 'bg-purple-100 text-purple-700',
  discipline: 'bg-blue-100 text-blue-700',
  academic: 'bg-teal-100 text-teal-700',
  teacher: 'bg-gray-100 text-gray-600',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { profile, isAdmin } = useUser()
  const navigate = useNavigate()
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    apiFetch('getSettings', {}).then(res => {
      if (res.success && res.logoUrl) setLogoUrl(res.logoUrl)
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="โลโก้" className="w-9 h-9 object-contain rounded-lg" />
          ) : (
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">ด</div>
          )}
          <div>
            <div className="font-semibold text-gray-800 text-sm leading-tight">ระบบ 4 ประสาน 3 สายใย</div>
            <div className="text-xs text-gray-500">โรงเรียนดาราวิทยาลัย</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            หน้าหลัก
          </Link>
          <Link to="/history" className="text-sm text-gray-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            ประวัติ
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              ตั้งค่า
            </Link>
          )}
          <div className="flex items-center gap-2 ml-1 pl-3 border-l border-gray-200">
            <img src={user?.photoURL} alt="" className="w-8 h-8 rounded-full flex-shrink-0" referrerPolicy="no-referrer" />
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-gray-700 leading-tight">{profile?.name || user?.displayName}</div>
              <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full mt-0.5 ${ROLE_BADGE_COLORS[profile?.role] || 'bg-gray-100 text-gray-600'}`}>
                {ROLE_LABELS[profile?.role] || 'ครูที่ปรึกษา'}
              </span>
            </div>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-600 ml-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
              ออก
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
