import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">ด</div>
          <div>
            <div className="font-semibold text-gray-800 text-sm leading-tight">ระบบ 4 ประสาน 3 สายใย</div>
            <div className="text-xs text-gray-500">โรงเรียนดาราวิทยาลัย</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            หน้าหลัก
          </Link>
          <Link to="/history" className="text-sm text-gray-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            ประวัติ
          </Link>
          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
            <img src={user?.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-gray-700">{user?.displayName}</div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 ml-2 px-2 py-1 rounded hover:bg-red-50 transition-colors">
              ออก
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
