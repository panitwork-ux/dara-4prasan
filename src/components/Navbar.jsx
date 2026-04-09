import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { ROLE_LABELS } from '../utils/roles'

const ROLE_COLORS = {
  admin:         { bg:'#fee2e2', text:'#991b1b', dot:'#ef4444' },
  dept_head:     { bg:'#fff7ed', text:'#9a3412', dot:'#f97316' },
  asst_director: { bg:'#fdf4ff', text:'#7e22ce', dot:'#a855f7' },
  guidance:      { bg:'#f0fdf4', text:'#166534', dot:'#22c55e' },
  discipline:    { bg:'#eff6ff', text:'#1e40af', dot:'#3b82f6' },
  academic:      { bg:'#f0fdfa', text:'#134e4a', dot:'#14b8a6' },
  teacher:       { bg:'#f8fafc', text:'#475569', dot:'#94a3b8' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { profile, isAdmin } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [logoUrl, setLogoUrl] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    apiFetch('getSettings', {}).then(res => {
      if (res.success && res.logoUrl) setLogoUrl(res.logoUrl)
    }).catch(() => {})
  }, [])

  const handleLogout = async () => { await logout(); navigate('/login') }
  const isActive = (path) => location.pathname === path

  const roleColor = ROLE_COLORS[profile?.role] || ROLE_COLORS.teacher

  return (
    <nav style={{
      background:'#fff', borderBottom:'1px solid #e2e8f0',
      boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
      position:'sticky', top:0, zIndex:100,
      fontFamily:"'Sarabun',sans-serif",
    }}>
      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'0 20px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'60px'}}>
        {/* Logo + Title */}
        <Link to="/dashboard" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          {logoUrl ? (
            <img src={logoUrl} alt="logo" style={{width:'36px',height:'36px',objectFit:'contain',borderRadius:'10px'}}/>
          ) : (
            <div style={{width:'36px',height:'36px',background:'linear-gradient(135deg,#1d4ed8,#6366f1)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'800',fontSize:'16px',flexShrink:0}}>ด</div>
          )}
          <div>
            <div style={{fontWeight:'700',fontSize:'14px',color:'#0f172a',lineHeight:'1.2'}}>ระบบ 4 ประสาน 3 สายใย</div>
            <div style={{fontSize:'11px',color:'#94a3b8',lineHeight:'1'}}>DARA ACADEMY</div>
          </div>
        </Link>

        {/* Nav Links */}
        <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
          {[
            { to:'/dashboard', label:'หน้าหลัก' },
            { to:'/history', label:'ประวัติ' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              padding:'6px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:'500',
              textDecoration:'none', transition:'all 0.15s',
              background: isActive(link.to) ? '#eff6ff' : 'transparent',
              color: isActive(link.to) ? '#1d4ed8' : '#64748b',
              fontFamily:"'Sarabun',sans-serif",
            }}>{link.label}</Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{
              padding:'6px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:'500',
              textDecoration:'none', transition:'all 0.15s',
              background: isActive('/admin') ? '#fef2f2' : 'transparent',
              color: isActive('/admin') ? '#dc2626' : '#ef4444',
              fontFamily:"'Sarabun',sans-serif",
            }}>⚙ ตั้งค่า</Link>
          )}
        </div>

        {/* User */}
        <div style={{display:'flex',alignItems:'center',gap:'10px',paddingLeft:'12px',borderLeft:'1px solid #e2e8f0'}}>
          <img src={user?.photoURL} alt="" style={{width:'34px',height:'34px',borderRadius:'50%',flexShrink:0,border:'2px solid #e2e8f0'}} referrerPolicy="no-referrer"/>
          <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
            <div style={{fontSize:'13px',fontWeight:'600',color:'#1e293b',lineHeight:'1',whiteSpace:'nowrap',maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis'}}>
              {profile?.name || user?.displayName}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',background:roleColor.dot,flexShrink:0}}/>
              <span style={{fontSize:'11px',color:roleColor.text,background:roleColor.bg,padding:'1px 7px',borderRadius:'100px',whiteSpace:'nowrap'}}>
                {ROLE_LABELS[profile?.role] || 'ครูที่ปรึกษา'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            fontSize:'12px',color:'#94a3b8',background:'none',border:'1px solid #e2e8f0',
            borderRadius:'8px',padding:'5px 10px',cursor:'pointer',whiteSpace:'nowrap',
            fontFamily:"'Sarabun',sans-serif",
          }}>ออก</button>
        </div>
      </div>
    </nav>
  )
}
