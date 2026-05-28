import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { getMyDocuments } from '../utils/api'
import { STATUS_LABELS, STATUS_COLOR } from '../utils/roles'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const KPI = [
  { key:'all',            label:'ทั้งหมด',              icon:'☰',  bg:'linear-gradient(135deg,#3b82f6,#6366f1)' },
  { key:'wait_dept_head', label:'รอหัวหน้าแผนกเซ็น',    icon:'⏳', bg:'linear-gradient(135deg,#f59e0b,#f97316)' },
  { key:'wait_asst_dir',  label:'รอผู้ช่วย ผอ. เซ็น',   icon:'✍',  bg:'linear-gradient(135deg,#8b5cf6,#a855f7)' },
  { key:'wait_chief',     label:'รอหัวหน้างานมอบหมาย',  icon:'📋', bg:'linear-gradient(135deg,#06b6d4,#0ea5e9)' },
  { key:'wait_staff',     label:'รอครูดำเนินการ',        icon:'👤', bg:'linear-gradient(135deg,#f97316,#ea580c)' },
  { key:'in_progress',    label:'กำลังดำเนินการ',        icon:'🔄', bg:'linear-gradient(135deg,#3b82f6,#2563eb)' },
  { key:'completed',      label:'สมบูรณ์',               icon:'✓',  bg:'linear-gradient(135deg,#22c55e,#16a34a)' },
  { key:'returned',       label:'ส่งคืนแก้ไข',           icon:'↩',  bg:'linear-gradient(135deg,#ef4444,#dc2626)' },
]

const fmtDate = (d) => {
  try { return d ? format(new Date(d), 'd MMM yy', { locale: th }) : '-' } catch { return '-' }
}

const ss = { fontFamily:"'Sarabun',sans-serif" }

export default function Dashboard() {
  const { user } = useAuth()
  const { profile, role, isAsstDir, isDeptHead, isDeptChief } = useUser()
  const nav = useNavigate()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const r = await getMyDocuments(user.email)
      if (r.success) setDocs(r.documents || [])
    } catch {}
    setLoading(false)
  }

  const counts = KPI.reduce((a, k) => {
    a[k.key] = k.key === 'all' ? docs.length : docs.filter(d => d.status === k.key).length
    return a
  }, {})

  const filtered = docs.filter(d => {
    const fStatus = filter === 'all' || d.status === filter
    const fSearch = !search || d.studentName?.includes(search) || d.studentClass?.includes(search)
    return fStatus && fSearch
  })

  // pending banner
  const pending = docs.filter(d => {
    if (isDeptHead)  return d.status === 'wait_dept_head'
    if (isAsstDir)   return d.status === 'wait_asst_dir'
    if (isDeptChief) return d.status === 'wait_chief'
    return d.status === 'wait_staff' && d.assignedStaffEmail === user?.email
  })
  const pendingStatus = isDeptHead ? 'wait_dept_head'
    : isAsstDir  ? 'wait_asst_dir'
    : isDeptChief ? 'wait_chief'
    : 'wait_staff'

  const greeting = isDeptHead  ? 'เอกสารรอเซ็น & ติดตามผล'
    : isAsstDir   ? 'ภาพรวมเอกสารทั้งหมด'
    : isDeptChief ? 'เอกสารที่ได้รับมอบหมาย'
    : 'เอกสารของฉัน'

  return (
    <div style={{ padding:'32px 36px', maxWidth:'1200px', ...ss }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        marginBottom:'28px', gap:'16px', flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'5px', letterSpacing:'0.03em' }}>หน้าหลัก</div>
          <h1 style={{ fontSize:'26px', fontWeight:'800', color:'var(--text)', margin:'0 0 5px', ...ss }}>
            สวัสดีครับ คุณ{(profile?.name||user?.displayName||'').split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize:'15px', color:'var(--text-muted)', margin:0, ...ss }}>{greeting}</p>
        </div>
        <button onClick={() => nav('/document/new')} style={{
          background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff',
          border:'none', borderRadius:'14px', padding:'13px 22px',
          fontSize:'15px', fontWeight:'700', cursor:'pointer',
          display:'flex', alignItems:'center', gap:'8px',
          boxShadow:'0 4px 14px rgba(29,78,216,0.35)', ...ss,
        }}>
          <span style={{ fontSize:'20px' }}>+</span> สร้างเอกสารใหม่
        </button>
      </div>

      {/* Pending banner */}
      {pending.length > 0 && (
        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'16px',
          padding:'16px 20px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ fontSize:'26px' }}>🔔</span>
          <div>
            <div style={{ fontWeight:'700', fontSize:'16px', color:'#92400e', ...ss }}>
              มีเอกสารรอดำเนินการ {pending.length} รายการ
            </div>
            <div style={{ fontSize:'13px', color:'#92400e', marginTop:'3px', ...ss }}>กรุณาดำเนินการโดยเร็ว</div>
          </div>
          <button onClick={() => setFilter(pendingStatus)} style={{
            marginLeft:'auto', background:'#f59e0b', color:'#fff',
            border:'none', borderRadius:'10px', padding:'8px 18px', fontSize:'13px', fontWeight:'600', cursor:'pointer', ...ss,
          }}>ดูทั้งหมด →</button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:'10px', marginBottom:'28px' }}>
        {KPI.map(k => (
          <button key={k.key} onClick={() => setFilter(k.key)} style={{
            background: filter === k.key ? k.bg : 'var(--surface)',
            border: `1px solid ${filter === k.key ? 'transparent' : 'var(--border)'}`,
            borderRadius:'16px', padding:'16px 8px', cursor:'pointer',
            transition:'all 0.15s', textAlign:'left',
            boxShadow: filter === k.key ? '0 4px 16px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)', ...ss,
          }}>
            <div style={{ fontSize:'20px', marginBottom:'10px',
              background: filter === k.key ? 'rgba(255,255,255,0.2)' : 'var(--bg)',
              width:'34px', height:'34px', borderRadius:'10px',
              display:'flex', alignItems:'center', justifyContent:'center' }}>{k.icon}</div>
            <div style={{ fontSize:'28px', fontWeight:'800', lineHeight:'1',
              color: filter === k.key ? '#fff' : 'var(--text)', marginBottom:'6px' }}>{counts[k.key]}</div>
            <div style={{ fontSize:'11px', fontWeight:'600', lineHeight:'1.4',
              color: filter === k.key ? 'rgba(255,255,255,0.88)' : 'var(--text-muted)' }}>{k.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:'18px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาชื่อนักเรียน, ชั้น..."
          style={{ border:'1px solid var(--border)', borderRadius:'12px', padding:'12px 18px',
            fontSize:'15px', outline:'none', background:'var(--surface)',
            color:'var(--text)', maxWidth:'420px', width:'100%', ...ss }} />
      </div>

      {/* Table */}
      <div style={{ background:'var(--surface)', borderRadius:'20px', border:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontWeight:'700', fontSize:'16px', color:'var(--text)', ...ss }}>รายการเอกสาร</div>
          <span style={{ fontSize:'13px', color:'var(--text-muted)', background:'var(--bg)',
            border:'1px solid var(--border)', borderRadius:'100px', padding:'3px 14px', ...ss }}>
            {filtered.length} รายการ
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)', fontSize:'16px', ...ss }}>⏳ กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px' }}>
            <div style={{ fontSize:'48px', marginBottom:'14px' }}>📄</div>
            <div style={{ fontSize:'16px', color:'var(--text-muted)', marginBottom:'18px', ...ss }}>ยังไม่มีเอกสาร</div>
            <button onClick={() => nav('/document/new')} style={{
              background:'var(--primary-light)', color:'var(--primary)',
              border:'none', borderRadius:'12px', padding:'12px 22px',
              fontSize:'15px', fontWeight:'600', cursor:'pointer', ...ss }}>
              + สร้างเอกสารใหม่
            </button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--bg)' }}>
                {['นักเรียน','ชั้น/เลขที่','ผู้สร้าง','วันที่','สถานะ',''].map(h => (
                  <th key={h} style={{ padding:'12px 18px', textAlign:'left',
                    fontSize:'13px', color:'var(--text-muted)', fontWeight:'700', letterSpacing:'0.02em', ...ss }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.docId} style={{ borderTop:'1px solid var(--border)', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => nav(`/document/${doc.docId}`)}>
                  <td style={{ padding:'16px 18px', fontWeight:'700', fontSize:'15px', color:'var(--text)', ...ss }}>{doc.studentName}</td>
                  <td style={{ padding:'16px 18px', fontSize:'14px', color:'var(--text-muted)', ...ss }}>
                    {doc.studentClass || doc.class} · {doc.studentNo || doc.no}
                  </td>
                  <td style={{ padding:'16px 18px', fontSize:'14px', color:'var(--text-muted)', ...ss }}>{doc.createdByName}</td>
                  <td style={{ padding:'16px 18px', fontSize:'13px', color:'var(--text-muted)', whiteSpace:'nowrap', ...ss }}>
                    {fmtDate(doc.createdAt)}
                  </td>
                  <td style={{ padding:'16px 18px' }}><StatusBadge status={doc.status} /></td>
                  <td style={{ padding:'16px 18px', fontSize:'16px', color:'var(--text-muted)' }}>→</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
