import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    if (user) navigate('/dashboard')
    // ดึงโลโก้จาก Apps Script
    apiFetch('getSettings', {}).then(res => {
      if (res.success && res.logoUrl) setLogoUrl(res.logoUrl)
    }).catch(() => {})
  }, [user])

  const handleLogin = async () => {
    try {
      await login()
    } catch (e) {
      alert('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 text-center">
        {logoUrl ? (
          <img src={logoUrl} alt="โลโก้" className="w-20 h-20 object-contain mx-auto mb-4 rounded-2xl" />
        ) : (
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">ด</div>
        )}
        <h1 className="text-xl font-bold text-gray-800 mb-1">ระบบ 4 ประสาน 3 สายใย</h1>
        <p className="text-sm text-gray-500 mb-2">โรงเรียนดาราวิทยาลัย เชียงใหม่</p>
        <p className="text-xs text-gray-400 mb-8">ระบบดูแลช่วยเหลือนักเรียนออนไลน์</p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-4 py-3 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          เข้าสู่ระบบด้วย Google
        </button>

        <p className="text-xs text-gray-400 mt-6">สำหรับบุคลากรโรงเรียนดาราวิทยาลัยเท่านั้น</p>
      </div>
    </div>
  )
}
