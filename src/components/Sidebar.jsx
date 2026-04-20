import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { ROLE_LABELS } from '../utils/roles'
import { apiFetch } from '../utils/api'

const NAV = [
  { to: '/dashboard', icon: '⊞', label: 'หน้าหลัก' },
  { to: '/document/new', icon: '＋', label: 'สร้างเอกสาร' },
  { to: '/history', icon: '☰', label: 'ประวัติเอกสาร' },
]

const ROLE_DOT = {
  admin:             '#ef4444',
  head_kindergarten: '#eab308',
  head_primary_low:  '#f97316',
  head_primary_high: '#f59e0b',
  head_junior:       '#3b82f6',
  head_senior:       '#a855f7',
  asst_director:     '#8b5cf6',
  guidance:          '#22c55e',
  discipline:        '#3b82f6',
  religious:         '#14b8a6',
  teacher:           '#94a3b8',
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { profile, isAdmin } = useUser()
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    apiFetch('getSettings', {}).then(res => {
      if (res.success && res.logoUrl) setLogoUrl(res.logoUrl)
    }).catch(() => {})
  }, [])

  const isActive = (path) => location.pathname === path

  const s = {
    sidebar: {
      width: collapsed ? '64px' : '240px',
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
      overflow: 'hidden',
    },
  }

  return (
    <div style={s.sidebar}>
      {/* Header */}
      <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', minHeight: '64px' }}>
        {logoUrl
          ? <img src={logoUrl} style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'contain', flexShrink: 0 }} />
          : <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#1d4ed8,#6366f1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px', flexShrink: 0 }}>ด</div>
        }
        {!collapsed && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text)', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>4 ประสาน 3 สายใย</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DARA ACADEMY</div>
          </div>
        )}
        <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', padding: '4px', borderRadius: '6px', flexShrink: 0 }}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV.map(item => (
          <Link key={item.to} to={item.to} title={item.label} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: collapsed ? '10px 14px' : '10px 12px',
            borderRadius: '10px', textDecoration: 'none',
            background: isActive(item.to) ? 'var(--primary-light)' : 'transparent',
            color: isActive(item.to) ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: isActive(item.to) ? '600' : '400',
            fontSize: '14px', transition: 'all 0.15s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
          </Link>
        ))}

        {isAdmin && (
          <Link to="/admin" title="ตั้งค่าระบบ" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: collapsed ? '10px 14px' : '10px 12px',
            borderRadius: '10px', textDecoration: 'none',
            background: isActive('/admin') ? '#fef2f2' : 'transparent',
            color: isActive('/admin') ? '#dc2626' : 'var(--text-muted)',
            fontWeight: isActive('/admin') ? '600' : '400',
            fontSize: '14px', transition: 'all 0.15s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚙</span>
            {!collapsed && <span>ตั้งค่าระบบ</span>}
          </Link>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        {/* Dark mode toggle */}
        <button onClick={toggle} title={dark ? 'Light mode' : 'Dark mode'} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: collapsed ? '10px 14px' : '10px 12px',
          borderRadius: '10px', background: 'none', border: 'none',
          color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer',
          justifyContent: collapsed ? 'center' : 'flex-start',
          marginBottom: '4px',
        }}>
          <span style={{ fontSize: '16px' }}>{dark ? '☀' : '☾'}</span>
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 10px', borderRadius: '10px',
          background: 'var(--bg)',
        }}>
          <img src={user?.photoURL} referrerPolicy="no-referrer" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, border: '2px solid var(--border)' }} />
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.name || user?.displayName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ROLE_DOT[profile?.role] || '#94a3b8', flexShrink: 0 }} />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ROLE_LABELS[profile?.role] || 'ครูที่ปรึกษา'}
                </span>
              </div>
            </div>
          )}
          {!collapsed && (
            <button onClick={async () => { await logout(); navigate('/login') }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#ef4444', fontSize: '16px', padding: '2px', flexShrink: 0,
            }} title="ออกจากระบบ">⏻</button>
          )}
        </div>
      </div>
    </div>
  )
}
