import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyDocuments } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getMyDocuments(user.email, '')
      if (res.success) setDocs(res.documents || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const filtered = docs.filter(d => {
    const matchSearch = !search ||
      d.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      d.class?.toLowerCase().includes(search.toLowerCase()) ||
      d.createdByName?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const s = { fontFamily: "'Sarabun',sans-serif" }
  const statuses = ['all', 'wait_dept_head', 'wait_asst_dir', 'wait_dept', 'completed', 'returned']
  const statusLabel = { all: 'ทั้งหมด', wait_dept_head: 'รอหัวหน้า', wait_asst_dir: 'รอผู้ช่วย ผอ.', wait_dept: 'รอฝ่าย', completed: 'สมบูรณ์', returned: 'ส่งคืน' }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px', ...s }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>ประวัติ</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>ประวัติเอกสารทั้งหมด</h1>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  ค้นหาชื่อนักเรียน, ชั้น, ครู..."
          style={{ flex: 1, minWidth: '200px', border: '1px solid var(--border)', borderRadius: '10px', padding: '9px 14px', fontSize: '13px', outline: 'none', background: 'var(--bg)', color: 'var(--text)', ...s }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {statuses.map(s2 => (
            <button key={s2} onClick={() => setStatusFilter(s2)} style={{
              padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border)',
              fontSize: '12px', fontWeight: '500', cursor: 'pointer',
              background: statusFilter === s2 ? 'var(--primary)' : 'var(--bg)',
              color: statusFilter === s2 ? '#fff' : 'var(--text-muted)',
              ...s,
            }}>{statusLabel[s2]}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>รายการทั้งหมด</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '100px', padding: '2px 12px' }}>{filtered.length} รายการ</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>⏳ กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>ไม่พบเอกสาร</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['#', 'นักเรียน', 'ชั้น / เลขที่', 'ครูที่ปรึกษา', 'วันที่', 'สถานะ', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => (
                <tr key={doc.docId} style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigate(`/document/${doc.docId}`)}>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{i + 1}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{doc.studentName}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{doc.class} · {doc.no}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{doc.createdByName}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {doc.createdAt ? format(new Date(doc.createdAt), 'd MMM yyyy', { locale: th }) : '-'}
                  </td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={doc.status} /></td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>→</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
