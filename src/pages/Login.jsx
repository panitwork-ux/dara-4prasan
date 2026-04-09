import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [logoUrl, setLogoUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/dashboard')
    apiFetch('getSettings', {}).then(res => {
      if (res.success && res.logoUrl) setLogoUrl(res.logoUrl)
    }).catch(() => {})
  }, [user])

  const handleLogin = async () => {
    setLoading(true)
    try { await login() } catch (e) { alert('เข้าสู่ระบบไม่สำเร็จ') }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'1rem', fontFamily:"'Sarabun',sans-serif", position:'relative', overflow:'hidden',
    }}>
      <div style={{position:'absolute',top:'-20%',right:'-10%',width:'600px',height:'600px',background:'radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-20%',left:'-10%',width:'500px',height:'500px',background:'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',backgroundSize:'48px 48px'}}/>

      <div style={{width:'100%',maxWidth:'400px',background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'24px',padding:'40px 36px',textAlign:'center',boxShadow:'0 25px 60px rgba(0,0,0,0.4)'}}>
        <div style={{marginBottom:'28px'}}>
          {logoUrl ? (
            <img src={logoUrl} alt="โลโก้" style={{width:'72px',height:'72px',objectFit:'contain',borderRadius:'16px',margin:'0 auto 16px',background:'rgba(255,255,255,0.1)',padding:'8px'}}/>
          ) : (
            <div style={{width:'72px',height:'72px',background:'linear-gradient(135deg,#3b82f6,#6366f1)',borderRadius:'20px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:'28px',fontWeight:'800',color:'#fff',boxShadow:'0 8px 24px rgba(59,130,246,0.4)'}}>ด</div>
          )}
          <div style={{display:'inline-block',background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'100px',padding:'3px 12px',fontSize:'11px',color:'#93c5fd',letterSpacing:'0.1em',marginBottom:'12px'}}>DARA ACADEMY</div>
          <h1 style={{fontSize:'22px',fontWeight:'700',color:'#f1f5f9',margin:'0 0 6px',lineHeight:'1.3'}}>ระบบ 4 ประสาน 3 สายใย</h1>
          <p style={{fontSize:'13px',color:'#94a3b8',margin:'0'}}>ระบบดูแลช่วยเหลือนักเรียนออนไลน์</p>
        </div>

        <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',margin:'24px 0'}}/>

        <button onClick={handleLogin} disabled={loading}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'14px',padding:'14px 20px',color:'#e2e8f0',fontSize:'15px',fontWeight:'600',cursor:loading?'not-allowed':'pointer',fontFamily:"'Sarabun',sans-serif"}}>
          {!loading && (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
        </button>
        <p style={{fontSize:'11px',color:'#475569',marginTop:'20px'}}>สำหรับบุคลากรโรงเรียนดาราวิทยาลัยเท่านั้น</p>
        <button onClick={() => navigate('/admin')} style={{
          marginTop:'16px', background:'none', border:'none',
          color:'rgba(255,255,255,0.2)', fontSize:'11px', cursor:'pointer',
          fontFamily:"'Sarabun',sans-serif", letterSpacing:'0.05em',
        }}>⚙ Admin</button>
      </div>
    </div>
  )
}
