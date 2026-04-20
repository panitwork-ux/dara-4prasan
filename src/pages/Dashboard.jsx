import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { getMyDocuments } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const KPI = [
  { key: 'all',            label: 'ทั้งหมด',          icon: '☰',  color: '#3b82f6', bg: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  { key: 'wait_dept_head', label: 'รอหัวหน้าแผนก',    icon: '⏳', color: '#f59e0b', bg: 'linear-gradient(135deg,#f59e0b,#f97316)' },
  { key: 'wait_asst_dir',  label: 'รอผู้ช่วย ผอ.',    icon: '✍', color: '#8b5cf6', bg: 'linear-gradient(135deg,#8b5cf6,#a855f7)' },
  { key: 'wait_dept',      label: 'รอฝ่าย',           icon: '📤', color: '#06b6d4', bg: 'linear-gradient(135deg,#06b6d4,#0ea5e9)' },
  { key: 'completed',      label: 'สมบูรณ์',           icon: '✓',  color: '#22c55e', bg: 'linear-gradient(135deg,#22c55e,#16a34a)' },
  { key: 'returned',       label: 'ส่งคืน',            icon: '↩',  color: '#ef4444', bg: 'linear-gradient(135deg,#ef4444,#dc2626)' },
]

const STATUS_ICON = { wait_dept_head:'⏳', wait_asst_dir:'✍', wait_dept:'📤', completed:'✓', returned:'↩' }

export default function Dashboard() {
  const { user } = useAuth()
  const { profile } = useUser()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getMyDocuments(user.email, '')
      if (res.success) setDocs(res.documents || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const counts = KPI.reduce((a, k) => {
    a[k.key] = k.key === 'all' ? docs.length : docs.filter(d => d.status === k.key).length
    return a
  }, {})

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter)

  const s = { fontFamily: "'Sarabun',sans-serif" }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px', ...s }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>
            หน้าหลัก
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', margin: '0 0 4px' }}>
            สวัสดีครับ คุณ {profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            ภาพรวมระบบดูแลช่วยเหลือนักเรียน · ข้อมูลของคุณ
          </p>
        </div>
        <button onClick={() => navigate('/document/new')} style={{
          background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
          color: '#fff', border: 'none', borderRadius: '12px',
          padding: '12px 20px', fontSize: '14px', fontWeight: '600',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 14px rgba(29,78,216,0.35)', ...s,
        }}>
          <span style={{ fontSize: '18px' }}>+</span> สร้างเอกสารใหม่
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px', marginBottom: '28px' }}>
        {KPI.map(k => (
          <button key={k.key} onClick={() => setFilter(k.key)} style={{
            background: filter === k.key ? k.bg : 'var(--surface)',
            border: `1px solid ${filter === k.key ? 'transparent' : 'var(--border)'}`,
            borderRadius: '16px', padding: '16px 12px',
            cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            boxShadow: filter === k.key ? `0 4px 16px ${k.color}44` : '0 1px 3px rgba(0,0,0,0.04)',
            ...s,
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: filter === k.key ? 'rgba(255,255,255,0.2)' : k.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', marginBottom: '10px', color: '#fff',
            }}>{k.icon}</div>
            <div style={{
              fontSize: '26px', fontWeight: '800', lineHeight: '1',
              color: filter === k.key ? '#fff' : 'var(--text)', marginBottom: '4px',
            }}>{counts[k.key]}</div>
            <div style={{
              fontSize: '11px', fontWeight: '500',
              color: filter === k.key ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)',
              lineHeight: '1.3',
            }}>{k.label}</div>
          </button>
        ))}
      </div>

      {/* Document List */}
      <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)' }}>
            รายการเอกสาร
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '100px', padding: '2px 12px' }}>
            {filtered.length} รายการ
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>⏳ กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
            <div style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '12px' }}>ยังไม่มีเอกสาร</div>
            <button onClick={() => navigate('/document/new')} style={{
              background: 'var(--primary-light)', color: 'var(--primary)',
              border: 'none', borderRadius: '10px', padding: '10px 20px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer', ...s,
            }}>+ สร้างเอกสารใหม่</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['เลขเอกสาร', 'นักเรียน', 'ชั้น / เลขที่', 'ครูที่ปรึกษา', 'วันที่', 'สถานะ', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => (
                <tr key={doc.docId} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px' }}>
                      #{String(i + 1).padStart(4, '0')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{doc.studentName}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {doc.class} · {doc.no}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {doc.createdByName}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {doc.createdAt ? format(new Date(doc.createdAt), 'd MMM yy', { locale: th }) : '-'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => navigate(`/document/${doc.docId}`)} style={{
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: '8px', padding: '6px 12px',
                      fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', ...s,
                    }}>ดู →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
