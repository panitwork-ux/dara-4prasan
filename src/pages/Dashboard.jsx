import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { getMyDocuments } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const STATUS_CONFIG = {
  all:            { label:'ทั้งหมด',         bg:'#f1f5f9', text:'#475569', border:'#e2e8f0', accent:'#64748b' },
  wait_dept_head: { label:'รอหัวหน้าแผนก',    bg:'#fffbeb', text:'#92400e', border:'#fde68a', accent:'#f59e0b' },
  wait_asst_dir:  { label:'รอผู้ช่วย ผอ.',    bg:'#eff6ff', text:'#1e40af', border:'#bfdbfe', accent:'#3b82f6' },
  wait_dept:      { label:'รอฝ่าย',           bg:'#fdf4ff', text:'#6b21a8', border:'#e9d5ff', accent:'#a855f7' },
  completed:      { label:'สมบูรณ์',           bg:'#f0fdf4', text:'#166534', border:'#bbf7d0', accent:'#22c55e' },
  returned:       { label:'ส่งคืน',            bg:'#fef2f2', text:'#991b1b', border:'#fecaca', accent:'#ef4444' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { profile } = useUser()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { if (user) loadDocs() }, [user])

  const loadDocs = async () => {
    setLoading(true)
    try {
      const res = await getMyDocuments(user.email, '')
      if (res.success) setDocs(res.documents || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter)
  const counts = Object.keys(STATUS_CONFIG).reduce((acc, k) => {
    acc[k] = k === 'all' ? docs.length : docs.filter(d => d.status === k).length
    return acc
  }, {})

  const getStatusIcon = (status) => {
    const icons = { wait_dept_head:'⏳', wait_asst_dir:'✍️', wait_dept:'📤', completed:'✅', returned:'↩️' }
    return icons[status] || '📄'
  }

  return (
    <div style={{maxWidth:'1000px',margin:'0 auto',padding:'28px 20px',fontFamily:"'Sarabun',sans-serif"}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'28px'}}>
        <div>
          <h1 style={{fontSize:'24px',fontWeight:'700',color:'#0f172a',margin:'0 0 4px'}}>หน้าหลัก</h1>
          <p style={{fontSize:'14px',color:'#64748b',margin:0}}>
            สวัสดี, <span style={{color:'#1d4ed8',fontWeight:'600'}}>{profile?.name || user?.displayName}</span>
          </p>
        </div>
        <button onClick={() => navigate('/document/new')} style={{
          background:'linear-gradient(135deg,#1d4ed8,#4f46e5)',
          color:'#fff', border:'none', borderRadius:'12px',
          padding:'11px 20px', fontSize:'14px', fontWeight:'600',
          cursor:'pointer', display:'flex', alignItems:'center', gap:'8px',
          boxShadow:'0 4px 12px rgba(29,78,216,0.3)',
          fontFamily:"'Sarabun',sans-serif",
        }}>
          <span style={{fontSize:'18px',lineHeight:'1'}}>+</span> สร้างเอกสารใหม่
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:'10px',marginBottom:'24px'}}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            background: filter === key ? cfg.accent : cfg.bg,
            border: `2px solid ${filter === key ? cfg.accent : cfg.border}`,
            borderRadius:'14px', padding:'14px 8px', textAlign:'center',
            cursor:'pointer', transition:'all 0.15s',
            boxShadow: filter === key ? `0 4px 12px ${cfg.accent}33` : 'none',
            fontFamily:"'Sarabun',sans-serif",
          }}>
            <div style={{
              fontSize:'26px', fontWeight:'800', lineHeight:'1', marginBottom:'4px',
              color: filter === key ? '#fff' : cfg.text,
            }}>{counts[key]}</div>
            <div style={{
              fontSize:'11px', fontWeight:'500', lineHeight:'1.3',
              color: filter === key ? 'rgba(255,255,255,0.85)' : cfg.text,
            }}>{cfg.label}</div>
          </button>
        ))}
      </div>

      {/* Document List */}
      {loading ? (
        <div style={{textAlign:'center',padding:'60px 0',color:'#94a3b8'}}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>⏳</div>
          <div>กำลังโหลด...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 0'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>📄</div>
          <div style={{fontSize:'16px',color:'#64748b',marginBottom:'16px'}}>ยังไม่มีเอกสาร</div>
          <button onClick={() => navigate('/document/new')} style={{
            color:'#1d4ed8', background:'#eff6ff', border:'none',
            borderRadius:'10px', padding:'10px 20px', fontSize:'14px',
            fontWeight:'600', cursor:'pointer', fontFamily:"'Sarabun',sans-serif",
          }}>สร้างเอกสารใหม่</button>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {filtered.map(doc => (
            <div key={doc.docId} onClick={() => navigate(`/document/${doc.docId}`)} style={{
              background:'#fff', borderRadius:'16px',
              border:'1px solid #e2e8f0', padding:'16px 20px',
              cursor:'pointer', transition:'all 0.15s',
              display:'flex', alignItems:'center', gap:'16px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#bfdbfe'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='none' }}>
              {/* Icon */}
              <div style={{
                width:'44px', height:'44px', borderRadius:'12px', flexShrink:0,
                background: STATUS_CONFIG[doc.status]?.bg || '#f8fafc',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px',
              }}>{getStatusIcon(doc.status)}</div>

              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'15px',fontWeight:'700',color:'#0f172a',marginBottom:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {doc.studentName}
                </div>
                <div style={{fontSize:'13px',color:'#64748b'}}>
                  ชั้น {doc.class} เลขที่ {doc.no}
                  <span style={{margin:'0 8px',color:'#cbd5e1'}}>•</span>
                  {doc.createdByName}
                </div>
              </div>

              {/* Right */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px',flexShrink:0}}>
                <StatusBadge status={doc.status} />
                <div style={{fontSize:'12px',color:'#94a3b8'}}>
                  {doc.createdAt ? format(new Date(doc.createdAt), 'd MMM yyyy', { locale: th }) : ''}
                </div>
                {doc.status === 'returned' && (
                  <div style={{fontSize:'11px',color:'#ef4444',fontWeight:'600'}}>⚠ ต้องแก้ไข</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
