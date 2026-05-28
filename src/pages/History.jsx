import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyDocuments } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const fmtD = (d) => { try { return d ? format(new Date(d),'d MMM yyyy',{locale:th}) : '-' } catch { return '-' } }

export default function History() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sf, setSf] = useState('all')
  const ss = { fontFamily:"'Sarabun',sans-serif" }

  useEffect(() => { if(user) load() }, [user])
  const load = async () => {
    setLoading(true)
    try { const r = await getMyDocuments(user.email); if(r.success) setDocs(r.documents||[]) } catch {}
    setLoading(false)
  }

  const list = docs.filter(d => {
    const s = !search || d.studentName?.includes(search) || d.studentClass?.includes(search)
    const f = sf==='all' || d.status===sf
    return s && f
  })

  const filters = [['all','ทั้งหมด'],['wait_dept_head','รอหัวหน้า'],['wait_asst_dir','รอผู้ช่วย ผอ.'],
    ['wait_chief','รอหัวหน้างาน'],['in_progress','ดำเนินการ'],['completed','สมบูรณ์'],['returned','ส่งคืน']]

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1100px', ...ss }}>
      <div style={{ marginBottom:'22px' }}>
        <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px', ...ss }}>ประวัติ</div>
        <h1 style={{ fontSize:'24px', fontWeight:'700', color:'var(--text)', margin:0, ...ss }}>ประวัติเอกสารทั้งหมด</h1>
      </div>

      <div style={{ background:'var(--surface)', borderRadius:'16px', border:'1px solid var(--border)',
        padding:'16px 20px', marginBottom:'18px', display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ค้นหา..."
          style={{ flex:1, minWidth:'200px', border:'1px solid var(--border)', borderRadius:'10px',
            padding:'8px 12px', fontSize:'13px', outline:'none',
            background:'var(--bg)', color:'var(--text)', ...ss }}/>
        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
          {filters.map(([v,l]) => (
            <button key={v} onClick={() => setSf(v)} style={{
              padding:'6px 12px', borderRadius:'8px', border:'1px solid var(--border)',
              fontSize:'11px', fontWeight:'500', cursor:'pointer',
              background: sf===v ? '#1d4ed8' : 'var(--bg)',
              color: sf===v ? '#fff' : 'var(--text-muted)', ...ss }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ background:'var(--surface)', borderRadius:'20px', border:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', ...ss }}>รายการทั้งหมด</span>
          <span style={{ fontSize:'12px', color:'var(--text-muted)', background:'var(--bg)',
            border:'1px solid var(--border)', borderRadius:'100px', padding:'2px 12px', ...ss }}>
            {list.length} รายการ
          </span>
        </div>
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)', ...ss }}>⏳ กำลังโหลด...</div>
        ) : list.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)', ...ss }}>ไม่พบเอกสาร</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--bg)' }}>
                {['#','นักเรียน','ชั้น/เลขที่','ผู้สร้าง','วันที่','สถานะ',''].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left',
                    fontSize:'11px', color:'var(--text-muted)', fontWeight:'600', ...ss }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((doc, i) => (
                <tr key={doc.docId} style={{ borderTop:'1px solid var(--border)', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => nav(`/document/${doc.docId}`)}>
                  <td style={{ padding:'12px 16px', fontSize:'11px', color:'var(--text-muted)', ...ss }}>{i+1}</td>
                  <td style={{ padding:'12px 16px', fontWeight:'600', fontSize:'14px', color:'var(--text)', ...ss }}>{doc.studentName}</td>
                  <td style={{ padding:'12px 16px', fontSize:'13px', color:'var(--text-muted)', ...ss }}>{doc.studentClass} · {doc.studentNo}</td>
                  <td style={{ padding:'12px 16px', fontSize:'13px', color:'var(--text-muted)', ...ss }}>{doc.createdByName}</td>
                  <td style={{ padding:'12px 16px', fontSize:'12px', color:'var(--text-muted)', whiteSpace:'nowrap', ...ss }}>{fmtD(doc.createdAt)}</td>
                  <td style={{ padding:'12px 16px' }}><StatusBadge status={doc.status}/></td>
                  <td style={{ padding:'12px 16px', fontSize:'14px', color:'var(--text-muted)' }}>→</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
