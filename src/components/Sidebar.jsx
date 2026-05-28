import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { ROLE_LABELS } from '../utils/roles'
import { getSettings } from '../utils/api'

const DOT_COLOR = {
  admin:'#ef4444', asst_director:'#a855f7',
  head_kindergarten:'#f97316', head_primary_low:'#f97316',
  head_primary_high:'#f59e0b', head_junior:'#3b82f6', head_senior:'#8b5cf6',
  chief_guidance:'#22c55e', chief_discipline:'#3b82f6',
  chief_nurse:'#ec4899', chief_religious:'#14b8a6',
  guidance:'#86efac', discipline:'#93c5fd', nurse:'#f9a8d4', religious:'#5eead4',
  teacher:'#94a3b8',
}

const SIDEBAR_W     = '260px'
const SIDEBAR_W_COL = '68px'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { profile, isAdmin } = useUser()
  const { dark, toggle } = useTheme()
  const loc = useLocation()
  const nav = useNavigate()
  const [col, setCol] = useState(false)
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    getSettings().then(r => { if (r.success && r.logoUrl) setLogo(r.logoUrl) }).catch(() => {})
  }, [])

  const active = (p) => loc.pathname === p
  const ss = { fontFamily:"'Sarabun',sans-serif" }

  const navLink = (to, icon, label, danger) => (
    <Link to={to} title={label} style={{
      display:'flex', alignItems:'center', gap:'12px',
      padding: col ? '11px 0' : '11px 14px',
      borderRadius:'12px', textDecoration:'none',
      justifyContent: col ? 'center' : 'flex-start',
      background: active(to) ? (danger ? '#fef2f2' : 'var(--primary-light)') : 'transparent',
      color: active(to) ? (danger ? '#dc2626' : 'var(--primary)') : (danger ? '#ef4444' : 'var(--text-muted)'),
      fontWeight: active(to) ? '700' : '500',
      fontSize:'15px', transition:'all 0.15s', ...ss,
    }}>
      <span style={{ fontSize:'18px', flexShrink:0, width:'22px', textAlign:'center' }}>{icon}</span>
      {!col && <span style={{ whiteSpace:'nowrap' }}>{label}</span>}
    </Link>
  )

  return (
    <div style={{
      width: col ? SIDEBAR_W_COL : SIDEBAR_W,
      minHeight:'100vh',
      background:'var(--surface)',
      borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column',
      transition:'width 0.2s', position:'fixed',
      top:0, left:0, bottom:0, zIndex:50, overflow:'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding:'16px 14px', display:'flex', alignItems:'center', gap:'12px',
        borderBottom:'1px solid var(--border)', minHeight:'70px' }}>
        {logo
          ? <img src={logo} style={{ width:'38px', height:'38px', borderRadius:'10px', objectFit:'contain', flexShrink:0 }}
              onError={e => e.target.style.display = 'none'} />
          : <div style={{ width:'38px', height:'38px', background:'linear-gradient(135deg,#1d4ed8,#6366f1)',
              borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontWeight:'800', fontSize:'18px', flexShrink:0 }}>ด</div>
        }
        {!col && (
          <div style={{ flex:1, overflow:'hidden' }}>
            <div style={{ fontWeight:'800', fontSize:'14px', color:'var(--text)', lineHeight:'1.3',
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', ...ss }}>4 ประสาน 3 สายใย</div>
            <div style={{ fontSize:'11px', color:'var(--text-muted)', letterSpacing:'0.08em', marginTop:'1px', ...ss }}>DARA ACADEMY</div>
          </div>
        )}
        <button onClick={() => setCol(c => !c)} style={{ background:'none', border:'none', cursor:'pointer',
          color:'var(--text-muted)', fontSize:'20px', padding:'2px', flexShrink:0, lineHeight:1 }}>
          {col ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:'3px' }}>
        {navLink('/dashboard',    '⊞', 'หน้าหลัก')}
        {navLink('/document/new', '＋', 'สร้างเอกสาร')}
        {navLink('/history',      '☰', 'ประวัติเอกสาร')}
        {isAdmin && navLink('/admin', '⚙', 'ตั้งค่าระบบ', true)}
      </nav>

      {/* Bottom */}
      <div style={{ padding:'10px 8px', borderTop:'1px solid var(--border)' }}>
        <button onClick={toggle} style={{
          width:'100%', display:'flex', alignItems:'center', gap:'12px',
          padding: col ? '10px 0' : '10px 14px',
          borderRadius:'12px', background:'none', border:'none',
          color:'var(--text-muted)', fontSize:'14px', cursor:'pointer',
          justifyContent: col ? 'center' : 'flex-start', marginBottom:'6px', ...ss,
        }}>
          <span style={{ fontSize:'17px', width:'22px', textAlign:'center' }}>{dark ? '☀' : '☾'}</span>
          {!col && <span style={{ fontWeight:'500' }}>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
          borderRadius:'12px', background:'var(--bg)' }}>
          <img src={user?.photoURL} referrerPolicy="no-referrer"
            style={{ width:'36px', height:'36px', borderRadius:'50%', flexShrink:0, border:'2px solid var(--border)' }} />
          {!col && (
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'14px', fontWeight:'700', color:'var(--text)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', ...ss }}>
                {profile?.name || user?.displayName}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'5px', marginTop:'2px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%',
                  background: DOT_COLOR[profile?.role] || '#94a3b8', flexShrink:0 }}/>
                <span style={{ fontSize:'11px', color:'var(--text-muted)',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', ...ss }}>
                  {ROLE_LABELS[profile?.role] || 'ครูที่ปรึกษา'}
                </span>
              </div>
            </div>
          )}
          {!col && (
            <button onClick={async () => { await logout(); nav('/login') }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:'18px', padding:'2px', flexShrink:0 }}
              title="ออกจากระบบ">⏻</button>
          )}
        </div>
      </div>
    </div>
  )
}
