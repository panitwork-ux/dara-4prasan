import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import {
  getDocument, getForm3, getAuditLog,
  signDocument, returnDocument, resubmitDocument,
  assignChief, createForm3, updateForm3, deleteDocument
} from '../utils/api'
import { ROLE_LABELS, ROLE_POSITION, DEPT_HEAD_ROLES, DEPT_CHIEF_ROLES } from '../utils/roles'
import StatusBadge from '../components/StatusBadge'
import SignaturePad from '../components/SignaturePad'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const ss = { fontFamily:"'Sarabun',sans-serif" }
const card = { background:'var(--surface)', borderRadius:'18px', border:'1px solid var(--border)', padding:'22px', marginBottom:'14px' }
const fmtD = (d) => { try { return d ? format(new Date(d),'d MMMM yyyy',{locale:th}) : '-' } catch { return '-' } }
const fmtDs = (d) => { try { return d ? format(new Date(d),'d/M/yyyy',{locale:th}) : '..../..../..........' } catch { return '-' } }

const infoRow = (label, value) => value ? (
  <div style={{ display:'flex', gap:'8px', marginBottom:'6px', fontSize:'13px' }}>
    <span style={{ color:'var(--text-muted)', width:'150px', flexShrink:0, ...ss }}>{label}:</span>
    <span style={{ color:'var(--text)', fontWeight:'500', ...ss }}>{value}</span>
  </div>
) : null

export default function DocumentView() {
  const { id } = useParams()
  const { user } = useAuth()
  const { profile, role, isAdmin, isAsstDir, isDeptHead, isDeptChief } = useUser()
  const nav = useNavigate()

  const [doc, setDoc] = useState(null)
  const [form3, setForm3] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('doc')
  const [testMode, setTestMode] = useState(false)

  // Modals
  const [showSign, setShowSign] = useState(false)
  const [showReturn, setShowReturn] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [showAssign, setShowAssign] = useState(false)
  const [assignData, setAssignData] = useState({ dept:'', note:'' })
  const [showF3, setShowF3] = useState(false)
  const [f3Data, setF3Data] = useState({ note:'', records:[{session:1,date:'',issue:'',approach:''}] })

  useEffect(() => { loadAll() }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [r1, r3, rl] = await Promise.all([getDocument(id), getForm3(id), getAuditLog(id)])
      if (r1.success) setDoc(r1.document)
      if (r3.success) setForm3(r3.form3)
      if (rl.success) setLogs(rl.logs || [])
    } catch {}
    setLoading(false)
  }

  if (loading) return <div style={{ padding:'60px', textAlign:'center', color:'var(--text-muted)', ...ss }}>⏳ กำลังโหลด...</div>
  if (!doc) return <div style={{ padding:'60px', textAlign:'center', color:'var(--text-muted)', ...ss }}>ไม่พบเอกสาร</div>

  // ── Permissions ──
  const canSign    = () => testMode ? ['wait_dept_head','wait_asst_dir'].includes(doc.status)
    : doc.status==='wait_dept_head' ? (isDeptHead||isAdmin)
    : doc.status==='wait_asst_dir' ? (isAsstDir||isAdmin) : false

  const canReturn  = () => canSign()

  const canAssign  = () => testMode ? doc.status==='wait_asst_dir'
    : (isAsstDir||isAdmin) && doc.status==='wait_asst_dir' && !!doc.asstDirSig

  const canF3      = () => testMode ? doc.status==='wait_chief'
    : (isDeptChief||isAdmin) && doc.status==='wait_chief'

  const canEdit    = () => doc.status==='returned' && (doc.createdByEmail===user.email||isAdmin)

  // ── Actions ──
  const doSign = async (sig) => {
    setSaving(true); setShowSign(false)
    const res = await signDocument({ docId:id, signature:sig, signerEmail:user.email,
      signerName:profile?.name||user.displayName, signerRole:role })
    if (res.success) loadAll()
    else alert('Error: ' + res.error)
    setSaving(false)
  }

  const doReturn = async () => {
    if (!returnReason.trim()) { alert('กรุณาระบุเหตุผล'); return }
    setSaving(true); setShowReturn(false)
    await returnDocument({ docId:id, reason:returnReason, byEmail:user.email, byName:profile?.name||user.displayName })
    setReturnReason(''); loadAll(); setSaving(false)
  }

  const doResubmit = async () => {
    setSaving(true); setShowEdit(false)
    const res = await resubmitDocument({ docId:id, byEmail:user.email, byName:profile?.name||user.displayName, updates:editForm })
    if (res.success) { setEditForm({}); loadAll() } else alert('Error: ' + res.error)
    setSaving(false)
  }

  const doAssign = async () => {
    if (!assignData.dept) { alert('กรุณาเลือกฝ่าย'); return }
    setSaving(true); setShowAssign(false)
    await assignChief({ docId:id, targetDept:assignData.dept, note:assignData.note,
      byEmail:user.email, byName:profile?.name||user.displayName })
    loadAll(); setSaving(false)
  }

  const doCreateF3 = async () => {
    setSaving(true); setShowF3(false)
    await createForm3({ docId:id, ...f3Data, createdByEmail:user.email,
      createdByName:profile?.name||user.displayName, creatorRole:role,
      assignedTeacherPosition:ROLE_POSITION[role]||'' })
    loadAll(); setSaving(false)
  }

  const doMarkComplete = async () => {
    if (!confirm('ยืนยันว่าดำเนินการครบถ้วนแล้ว?')) return
    setSaving(true)
    await updateForm3({ docId:id, markCompleted:true, byEmail:user.email, byName:profile?.name||user.displayName })
    loadAll(); setSaving(false)
  }

  const doDelete = async () => {
    if (!confirm('ลบเอกสารนี้ถาวรเลยใช่ไหม?')) return
    setSaving(true)
    const res = await deleteDocument(id, user.email, profile?.name||user.displayName)
    if (res.success) { alert('ลบแล้ว'); nav('/dashboard') }
    setSaving(false)
  }

  const doPrint = async () => {
    const { getSettings } = await import('../utils/api')
    let logoUrl = null
    try { const r = await getSettings(); if (r.success && r.logoUrl) logoUrl = r.logoUrl } catch {}
    const { buildPrintHTML } = await import('../utils/printForm')
    const html = buildPrintHTML({ ...doc, form3 }, logoUrl)
    const w = window.open('', '_blank', 'width=900,height=700')
    w.document.write(html); w.document.close()
    w.onload = () => setTimeout(() => { w.focus(); w.print() }, 500)
  }

  const DEPT_OPTIONS = [
    {value:'chief_guidance',   label:'ฝ่ายแนะแนว'},
    {value:'chief_discipline', label:'ฝ่ายพัฒนาวินัย'},
    {value:'chief_nurse',      label:'ฝ่ายพยาบาล'},
    {value:'chief_religious',  label:'ฝ่ายศาสนกิจ'},
  ]

  const safeStr = (v) => (!v || Array.isArray(v) || (typeof v==='string' && v.startsWith('['))) ? '' : String(v)
  const STEPS = [
    {label:'สร้างเอกสาร', done:true, name:safeStr(doc.createdByName), date:doc.createdAt},
    {label:'หัวหน้าแผนกเซ็น', done:!!doc.deptHeadSig, name:safeStr(doc.deptHeadName), date:doc.deptHeadSignedAt},
    {label:'ผู้ช่วย ผอ. เซ็น', done:!!doc.asstDirSig, name:safeStr(doc.asstDirName), date:doc.asstDirSignedAt},
    {label:'มอบหมายฝ่าย', done:!!doc.targetDept, name:safeStr(ROLE_LABELS[doc.targetDept]||doc.targetDept), date:null},
    {label:'ดำเนินการ/สมบูรณ์', done:doc.status==='completed', name:null, date:null},
  ]

  return (
    <div style={{ maxWidth:'900px', margin:'0 auto', padding:'28px 24px', ...ss }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'18px', gap:'12px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
          <button onClick={() => nav('/dashboard')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'20px', marginTop:'4px' }}>←</button>
          <div>
            <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'3px', ...ss }}>หน้าหลัก › เอกสาร</div>
            <h1 style={{ fontSize:'20px', fontWeight:'700', color:'var(--text)', margin:'0 0 5px', display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', ...ss }}>
              {doc.studentName} <StatusBadge status={doc.status}/>
            </h1>
            <div style={{ fontSize:'13px', color:'var(--text-muted)', ...ss }}>{fmtD(doc.createdAt)} · {doc.createdByName}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
          <button onClick={() => setTestMode(t => !t)} style={{
            padding:'7px 14px', borderRadius:'10px', cursor:'pointer', fontSize:'12px', fontWeight:'600',
            background: testMode ? '#fef3c7' : 'var(--surface)',
            border: testMode ? '2px solid #f59e0b' : '1px solid var(--border)',
            color: testMode ? '#92400e' : 'var(--text-muted)',
            boxShadow: testMode ? '0 0 0 3px #fde68a55' : 'none', ...ss }}>
            🧪 {testMode ? 'Test ON' : 'Test'}
          </button>
          <button onClick={doPrint} style={{ padding:'7px 14px', borderRadius:'10px',
            border:'1px solid var(--border)', background:'var(--surface)',
            color:'var(--text-muted)', fontSize:'13px', cursor:'pointer', ...ss }}>🖨 พิมพ์</button>
          {doc.pdfUrl && (
            <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" style={{
              padding:'7px 14px', borderRadius:'10px', border:'1px solid #bbf7d0',
              background:'#f0fdf4', color:'#166534', fontSize:'13px', textDecoration:'none', ...ss }}>
              📁 Drive
            </a>
          )}
          {isAdmin && (
            <button onClick={doDelete} disabled={saving} style={{ padding:'7px 14px', borderRadius:'10px',
              border:'1px solid #fecaca', background:'#fef2f2',
              color:'#dc2626', fontSize:'13px', cursor:'pointer', fontWeight:'600', ...ss }}>🗑 ลบ</button>
          )}
        </div>
      </div>

      {/* Banners */}
      {testMode && (
        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'12px',
          padding:'12px 16px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'10px',
          fontSize:'13px', color:'#92400e', ...ss }}>
          <span style={{ fontSize:'20px' }}>🧪</span>
          <div><strong>Test Mode</strong> — เซ็นและส่งต่อแทนทุก Role ได้เพื่อทดสอบ</div>
        </div>
      )}
      {doc.status === 'returned' && doc.returnReason && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px',
          padding:'12px 16px', marginBottom:'14px', fontSize:'13px', color:'#991b1b', ...ss }}>
          <strong>↩ เหตุผลการส่งคืน:</strong> {doc.returnReason}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'18px' }}>
        {canSign() && (
          <button onClick={() => setShowSign(true)} disabled={saving} style={{
            background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff',
            border:'none', borderRadius:'10px', padding:'10px 20px',
            fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>
            ✍️ เซ็นชื่อ{testMode && <span style={{ fontSize:'11px', opacity:0.8 }}> (Test)</span>}
          </button>
        )}
        {canAssign() && (
          <button onClick={() => setShowAssign(true)} disabled={saving} style={{
            background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff',
            border:'none', borderRadius:'10px', padding:'10px 20px',
            fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>
            📋 มอบหมายให้หัวหน้างาน
          </button>
        )}
        {canF3() && (
          <button onClick={() => setShowF3(true)} disabled={saving} style={{
            background:'linear-gradient(135deg,#0891b2,#0e7490)', color:'#fff',
            border:'none', borderRadius:'10px', padding:'10px 20px',
            fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>
            📄 สร้างเอกสาร 3
          </button>
        )}
        {doc.status === 'in_progress' && (isDeptChief||isAdmin||testMode) && (
          <button onClick={doMarkComplete} disabled={saving} style={{
            background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff',
            border:'none', borderRadius:'10px', padding:'10px 20px',
            fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>
            ✓ ดำเนินการเสร็จสิ้น
          </button>
        )}
        {canReturn() && (
          <button onClick={() => setShowReturn(true)} disabled={saving} style={{
            background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626',
            borderRadius:'10px', padding:'10px 20px', fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>
            ↩️ ส่งคืนแก้ไข
          </button>
        )}
        {canEdit() && (
          <button onClick={() => {
            setEditForm({ studentName:doc.studentName, studentClass:doc.studentClass,
              studentNo:doc.studentNo, problems:doc.problems||['','',''], note:'' })
            setShowEdit(true)
          }} style={{ background:'#fffbeb', border:'1px solid #fde68a', color:'#92400e',
            borderRadius:'10px', padding:'10px 20px', fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>
            ✏️ แก้ไขและส่งใหม่
          </button>
        )}
        {!canSign()&&!canReturn()&&!canAssign()&&!canF3()&&!canEdit()&&doc.status!=='completed'&&doc.status!=='in_progress'&&!testMode && (
          <div style={{ fontSize:'13px', color:'var(--text-muted)', padding:'10px 0', ...ss }}>
            💡 กด <strong>🧪 Test</strong> เพื่อทดสอบ Workflow
          </div>
        )}
      </div>

      {/* Timeline */}
      <div style={{ ...card, marginBottom:'18px' }}>
        <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', marginBottom:'16px', ...ss }}>เส้นทางเอกสาร</div>
        <div style={{ display:'flex', gap:'0', flexWrap:'wrap' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', flex:1, minWidth:'120px' }}>
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', margin:'0 auto 6px',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px',
                  background: s.done ? '#22c55e' : 'var(--border)',
                  color: s.done ? '#fff' : 'var(--text-muted)', fontWeight:'700' }}>
                  {s.done ? '✓' : i+1}
                </div>
                <div style={{ fontSize:'10px', fontWeight:'600', lineHeight:'1.3',
                  color: s.done ? 'var(--text)' : 'var(--text-muted)', ...ss }}>{s.label}</div>
                {s.done && s.name && (
                  <div style={{ fontSize:'10px', color:'var(--text-muted)', marginTop:'2px', ...ss }}>{s.name}</div>
                )}
              </div>
              {i < 4 && <div style={{ width:'20px', height:'2px', background: s.done ? '#22c55e' : 'var(--border)', flexShrink:0 }}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'18px', background:'var(--bg)',
        borderRadius:'14px', padding:'4px', border:'1px solid var(--border)' }}>
        {[['doc','เอกสาร 1+2'],['form3','เอกสาร 3'],['sig','ลายเซ็น'],['log','ประวัติ']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex:1, padding:'8px', borderRadius:'10px', border:'none', cursor:'pointer',
            fontSize:'13px', fontWeight:'600', transition:'all 0.15s',
            background: tab===k ? 'var(--surface)' : 'transparent',
            color: tab===k ? '#1d4ed8' : 'var(--text-muted)',
            boxShadow: tab===k ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', ...ss }}>{l}</button>
        ))}
      </div>

      {/* Tab: เอกสาร 1+2 */}
      {tab === 'doc' && <>
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
            <span style={{ background:'#eff6ff', color:'#1d4ed8', fontSize:'11px', padding:'2px 10px', borderRadius:'100px', fontWeight:'600', ...ss }}>เอกสาร 1</span>
            <span style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', ...ss }}>แบบบันทึกการดูแลช่วยเหลือนักเรียน</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 16px' }}>
            {infoRow('ชื่อ-สกุลนักเรียน', doc.studentName)}
            {infoRow('ชั้น', `${doc.studentClass} เลขที่ ${doc.studentNo}`)}
            {infoRow('เลขประจำตัว', doc.studentId)}
            {infoRow('โทรศัพท์', doc.phone)}
            {infoRow('ที่อยู่', doc.address)}
            {infoRow('ผู้ปกครอง', doc.parentName)}
            {infoRow('เบอร์ผู้ปกครอง', doc.parentPhone)}
            {infoRow('ครูผู้ให้คำปรึกษา', doc.advisorName)}
            {infoRow('ตำแหน่ง', doc.advisorPosition)}
          </div>
          {doc.records?.filter(r => r.issue||r.approach).length > 0 && (
            <div style={{ marginTop:'14px', overflowX:'auto' }}>
              <div style={{ fontWeight:'600', fontSize:'13px', color:'var(--text)', marginBottom:'8px', ...ss }}>บันทึกการดูแล</div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                <thead><tr style={{ background:'#eff6ff' }}>
                  {['ครั้งที่','วัน/เดือน/ปี','เรื่องที่พบ','แนวทาง'].map(h => (
                    <th key={h} style={{ border:'1px solid var(--border)', padding:'6px 10px', textAlign:'left', ...ss }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{doc.records.map((r,i) => (
                  <tr key={i}>
                    <td style={{ border:'1px solid var(--border)', padding:'6px 10px', textAlign:'center', ...ss }}>{r.session||i+1}</td>
                    <td style={{ border:'1px solid var(--border)', padding:'6px 10px', ...ss }}>{r.date}</td>
                    <td style={{ border:'1px solid var(--border)', padding:'6px 10px', ...ss }}>{r.issue}</td>
                    <td style={{ border:'1px solid var(--border)', padding:'6px 10px', ...ss }}>{r.approach}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
            <span style={{ background:'#f0fdf4', color:'#166534', fontSize:'11px', padding:'2px 10px', borderRadius:'100px', fontWeight:'600', ...ss }}>เอกสาร 2</span>
            <span style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', ...ss }}>แบบส่งต่อภายใน</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 16px' }}>
            {infoRow('วันที่', fmtD(doc.referralDate && !doc.referralDate.includes('T') ? doc.referralDate : doc.createdAt))}
            {infoRow('เรียน', safeStr(doc.deptHeadName))}
            {infoRow('สิ่งที่ส่งมาด้วย', doc.attachment)}
          </div>
          {[['ปัญหาที่พบ', doc.problems],['การช่วยเหลือเบื้องต้น', doc.helpDone],
            ['ปัญหาที่ยังคงมีอยู่', doc.remaining],['ข้อเสนอแนะ', doc.suggestions]].map(([lbl, arr]) => {
            const items = (arr||[]).filter(Boolean)
            if (!items.length) return null
            return (
              <div key={lbl} style={{ marginTop:'10px' }}>
                <div style={{ fontWeight:'600', fontSize:'13px', color:'var(--text)', marginBottom:'5px', ...ss }}>{lbl}</div>
                {items.map((v,i) => <div key={i} style={{ fontSize:'13px', color:'var(--text)', paddingLeft:'12px', marginBottom:'3px', ...ss }}>{i+1}. {v}</div>)}
              </div>
            )
          })}
        </div>
      </>}

      {/* Tab: เอกสาร 3 */}
      {tab === 'form3' && (
        <div style={card}>
          <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', marginBottom:'14px', ...ss }}>บันทึกการติดตามข้อมูลนักเรียน</div>
          {!form3 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'var(--text-muted)', ...ss }}>
              <div style={{ fontSize:'32px', marginBottom:'10px' }}>📋</div>
              <div>ยังไม่มีเอกสาร 3 {doc.status==='wait_chief' ? '— รอหัวหน้างานสร้าง' : ''}</div>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 16px', marginBottom:'14px' }}>
                {infoRow('ฝ่ายรับผิดชอบ', ROLE_LABELS[form3.assignedDept]||form3.assignedDept)}
                {infoRow('ครูรับผิดชอบ', form3.assignedTeacherName)}
                {infoRow('วันที่สร้าง', fmtD(form3.createdAt))}
                {infoRow('สถานะ', form3.status==='completed' ? '✓ เสร็จสิ้น' : 'กำลังดำเนินการ')}
              </div>
              {form3.note && (
                <div style={{ background:'var(--bg)', borderRadius:'10px', padding:'12px', marginBottom:'14px', fontSize:'13px', color:'var(--text)', ...ss }}>{form3.note}</div>
              )}
              {(form3.records||[]).filter(r => r.issue||r.approach).length > 0 && (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                    <thead><tr style={{ background:'#eff6ff' }}>
                      {['ครั้งที่','วัน/เดือน/ปี','เรื่องที่พบ','แนวทาง'].map(h => (
                        <th key={h} style={{ border:'1px solid var(--border)', padding:'6px 10px', textAlign:'left', ...ss }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>{form3.records.map((r,i) => (
                      <tr key={i}>
                        <td style={{ border:'1px solid var(--border)', padding:'6px 10px', textAlign:'center', ...ss }}>{r.session||i+1}</td>
                        <td style={{ border:'1px solid var(--border)', padding:'6px 10px', ...ss }}>{r.date}</td>
                        <td style={{ border:'1px solid var(--border)', padding:'6px 10px', ...ss }}>{r.issue}</td>
                        <td style={{ border:'1px solid var(--border)', padding:'6px 10px', ...ss }}>{r.approach}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab: ลายเซ็น */}
      {tab === 'sig' && (
        <div style={card}>
          <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', marginBottom:'16px', ...ss }}>ลายเซ็นทั้งหมด</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {[
              { label:'ครูผู้กรอก', pos:doc.advisorPosition||ROLE_POSITION[doc.creatorRole], name:doc.advisorName||doc.createdByName, sig:doc.teacherSig, date:doc.createdAt },
              { label:'หัวหน้าแผนก', pos:ROLE_LABELS[doc.deptHeadRole]||'หัวหน้าแผนก', name:doc.deptHeadName, sig:doc.deptHeadSig, date:doc.deptHeadSignedAt },
              { label:'ผู้ช่วย ผอ.', pos:'ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน', name:doc.asstDirName, sig:doc.asstDirSig, date:doc.asstDirSignedAt },
            ].map(({ label, pos, name, sig, date }) => (
              <div key={label} style={{ border:'1px solid var(--border)', borderRadius:'14px', padding:'14px', textAlign:'center' }}>
                <div style={{ fontWeight:'600', fontSize:'13px', color:'var(--text)', marginBottom:'2px', ...ss }}>{label}</div>
                <div style={{ fontSize:'10px', color:'var(--text-muted)', marginBottom:'10px', ...ss }}>{pos}</div>
                <div style={{ height:'72px', border:'1px dashed var(--border)', borderRadius:'10px',
                  background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'8px' }}>
                  {sig
                    ? <img src={sig} style={{ maxHeight:'68px', maxWidth:'100%' }}/>
                    : <span style={{ color:'var(--text-muted)', fontSize:'12px', ...ss }}>ยังไม่ได้เซ็น</span>
                  }
                </div>
                <div style={{ fontSize:'12px', color:'var(--text)', ...ss }}>({name||'............................'})</div>
                {date && <div style={{ fontSize:'11px', color:'var(--text-muted)', ...ss }}>{fmtDs(date)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: ประวัติ */}
      {tab === 'log' && (
        <div style={card}>
          <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', marginBottom:'14px', ...ss }}>ประวัติการดำเนินการ</div>
          {logs.length === 0
            ? <div style={{ color:'var(--text-muted)', textAlign:'center', padding:'24px', ...ss }}>ยังไม่มีประวัติ</div>
            : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#3b82f6', marginTop:'5px', flexShrink:0 }}/>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--text)', ...ss }}>{log.note||log.action}</div>
                      <div style={{ fontSize:'12px', color:'var(--text-muted)', ...ss }}>
                        {log.byName} · {log.at ? (() => { try { return format(new Date(log.at),'d MMM yyyy HH:mm',{locale:th}) } catch { return '' } })() : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* ─── Modals ─── */}
      {showSign && <SignaturePad onSave={doSign} onCancel={() => setShowSign(false)}/>}

      {showReturn && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'var(--surface)', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'440px', ...ss }}>
            <h2 style={{ fontSize:'18px', fontWeight:'700', color:'var(--text)', margin:'0 0 16px', ...ss }}>↩️ ส่งคืนแก้ไข</h2>
            <label style={{ display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'5px', fontWeight:'600', ...ss }}>เหตุผล <span style={{ color:'#ef4444' }}>*</span></label>
            <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} rows={4}
              placeholder="ระบุเหตุผลที่ส่งคืน..."
              style={{ width:'100%', boxSizing:'border-box', border:'1px solid var(--border)', borderRadius:'10px',
                padding:'10px 12px', fontSize:'13px', outline:'none', background:'var(--bg)', color:'var(--text)', resize:'none', ...ss }}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'16px', gap:'10px' }}>
              <button onClick={() => setShowReturn(false)} style={{ border:'1px solid var(--border)', color:'var(--text-muted)',
                background:'var(--bg)', borderRadius:'10px', padding:'10px 20px', fontSize:'14px', cursor:'pointer', ...ss }}>ยกเลิก</button>
              <button onClick={doReturn} disabled={saving} style={{ background:'#dc2626', color:'#fff', border:'none',
                borderRadius:'10px', padding:'10px 24px', fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>ยืนยันส่งคืน</button>
            </div>
          </div>
        </div>
      )}

      {showAssign && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'var(--surface)', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'460px', ...ss }}>
            <h2 style={{ fontSize:'18px', fontWeight:'700', color:'var(--text)', margin:'0 0 16px', ...ss }}>📋 มอบหมายให้หัวหน้างาน</h2>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'5px', fontWeight:'600', ...ss }}>ฝ่ายที่รับผิดชอบ <span style={{ color:'#ef4444' }}>*</span></label>
              <select value={assignData.dept} onChange={e => setAssignData(a => ({ ...a, dept:e.target.value }))}
                style={{ width:'100%', border:'1px solid var(--border)', borderRadius:'10px', padding:'10px 12px',
                  fontSize:'13px', outline:'none', background:'var(--bg)', color:'var(--text)', ...ss }}>
                <option value="">— เลือกฝ่าย —</option>
                {DEPT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'5px', fontWeight:'600', ...ss }}>บันทึก / สรุปผลการประชุม</label>
              <textarea value={assignData.note} onChange={e => setAssignData(a => ({ ...a, note:e.target.value }))} rows={3}
                placeholder="แนวทางที่กำหนดจากการประชุม..."
                style={{ width:'100%', boxSizing:'border-box', border:'1px solid var(--border)', borderRadius:'10px',
                  padding:'10px 12px', fontSize:'13px', outline:'none', background:'var(--bg)', color:'var(--text)', resize:'none', ...ss }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', gap:'10px' }}>
              <button onClick={() => setShowAssign(false)} style={{ border:'1px solid var(--border)', color:'var(--text-muted)',
                background:'var(--bg)', borderRadius:'10px', padding:'10px 20px', fontSize:'14px', cursor:'pointer', ...ss }}>ยกเลิก</button>
              <button onClick={doAssign} disabled={saving} style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff',
                border:'none', borderRadius:'10px', padding:'10px 24px', fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>✓ มอบหมาย</button>
            </div>
          </div>
        </div>
      )}

      {showF3 && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'var(--surface)', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'560px', maxHeight:'80vh', overflowY:'auto', ...ss }}>
            <h2 style={{ fontSize:'18px', fontWeight:'700', color:'var(--text)', margin:'0 0 16px', ...ss }}>📄 สร้างเอกสาร 3</h2>
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#1e40af', ...ss }}>
              สร้างโดย: {profile?.name} · {ROLE_LABELS[role]}
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'5px', fontWeight:'600', ...ss }}>บันทึก / แนวทางดูแล</label>
              <textarea value={f3Data.note} onChange={e => setF3Data(f => ({ ...f, note:e.target.value }))} rows={3}
                style={{ width:'100%', boxSizing:'border-box', border:'1px solid var(--border)', borderRadius:'10px',
                  padding:'10px 12px', fontSize:'13px', outline:'none', background:'var(--bg)', color:'var(--text)', resize:'none', ...ss }}/>
            </div>
            <div style={{ fontWeight:'600', fontSize:'13px', color:'var(--text)', marginBottom:'10px', ...ss }}>ตารางบันทึกการติดตาม</div>
            <div style={{ overflowX:'auto', marginBottom:'10px' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                <thead><tr style={{ background:'#eff6ff' }}>
                  {['ครั้งที่','วัน/เดือน/ปี','เรื่องที่พบ','แนวทาง'].map(h => (
                    <th key={h} style={{ border:'1px solid var(--border)', padding:'6px 10px', textAlign:'left', ...ss }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{f3Data.records.map((r,i) => (
                  <tr key={i}>
                    <td style={{ border:'1px solid var(--border)', padding:'4px 8px', textAlign:'center', ...ss }}>{r.session}</td>
                    <td style={{ border:'1px solid var(--border)', padding:'3px' }}>
                      <input type="date" value={r.date} onChange={e => { const rs=[...f3Data.records]; rs[i]={...rs[i],date:e.target.value}; setF3Data(f=>({...f,records:rs})) }}
                        style={{ width:'100%', border:'none', background:'transparent', color:'var(--text)', fontSize:'12px', padding:'4px', outline:'none', ...ss }}/>
                    </td>
                    <td style={{ border:'1px solid var(--border)', padding:'3px' }}>
                      <textarea value={r.issue} onChange={e => { const rs=[...f3Data.records]; rs[i]={...rs[i],issue:e.target.value}; setF3Data(f=>({...f,records:rs})) }} rows={2}
                        style={{ width:'100%', border:'none', background:'transparent', color:'var(--text)', fontSize:'12px', padding:'4px', outline:'none', resize:'none', ...ss }}/>
                    </td>
                    <td style={{ border:'1px solid var(--border)', padding:'3px' }}>
                      <textarea value={r.approach} onChange={e => { const rs=[...f3Data.records]; rs[i]={...rs[i],approach:e.target.value}; setF3Data(f=>({...f,records:rs})) }} rows={2}
                        style={{ width:'100%', border:'none', background:'transparent', color:'var(--text)', fontSize:'12px', padding:'4px', outline:'none', resize:'none', ...ss }}/>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <button onClick={() => setF3Data(f => ({ ...f, records:[...f.records,{session:f.records.length+1,date:'',issue:'',approach:''}]}))}
              style={{ background:'none', border:'none', color:'#1d4ed8', fontSize:'13px', cursor:'pointer', marginBottom:'14px', ...ss }}>+ เพิ่มแถว</button>
            <div style={{ display:'flex', justifyContent:'space-between', gap:'10px' }}>
              <button onClick={() => setShowF3(false)} style={{ border:'1px solid var(--border)', color:'var(--text-muted)',
                background:'var(--bg)', borderRadius:'10px', padding:'10px 20px', fontSize:'14px', cursor:'pointer', ...ss }}>ยกเลิก</button>
              <button onClick={doCreateF3} disabled={saving} style={{ background:'linear-gradient(135deg,#0891b2,#0e7490)', color:'#fff',
                border:'none', borderRadius:'10px', padding:'10px 24px', fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>✓ บันทึกเอกสาร 3</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'var(--surface)', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'500px', ...ss }}>
            <h2 style={{ fontSize:'18px', fontWeight:'700', color:'var(--text)', margin:'0 0 8px', ...ss }}>✏️ แก้ไขและส่งใหม่</h2>
            <div style={{ fontSize:'13px', color:'#f59e0b', background:'#fffbeb', border:'1px solid #fde68a',
              borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', ...ss }}>
              เหตุผลที่ส่งคืน: <strong>{doc.returnReason}</strong>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[{k:'studentName',l:'ชื่อ-สกุลนักเรียน'},{k:'studentClass',l:'ชั้น'},{k:'studentNo',l:'เลขที่'}].map(({k,l}) => (
                <div key={k}>
                  <label style={{ display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'4px', fontWeight:'600', ...ss }}>{l}</label>
                  <input value={editForm[k]||''} onChange={e => setEditForm(f => ({ ...f, [k]:e.target.value }))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1px solid var(--border)', borderRadius:'10px',
                      padding:'10px 12px', fontSize:'13px', outline:'none', background:'var(--bg)', color:'var(--text)', ...ss }}/>
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'4px', fontWeight:'600', ...ss }}>ปัญหาที่พบ (ข้อ 1)</label>
                <input value={editForm.problems?.[0]||''} onChange={e => { const p=[...(editForm.problems||['','',''])]; p[0]=e.target.value; setEditForm(f=>({...f,problems:p})) }}
                  style={{ width:'100%', boxSizing:'border-box', border:'1px solid var(--border)', borderRadius:'10px',
                    padding:'10px 12px', fontSize:'13px', outline:'none', background:'var(--bg)', color:'var(--text)', ...ss }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'4px', fontWeight:'600', ...ss }}>บันทึกการแก้ไข</label>
                <textarea value={editForm.note||''} onChange={e => setEditForm(f => ({ ...f, note:e.target.value }))} rows={3}
                  placeholder="อธิบายว่าแก้ไขอะไร..."
                  style={{ width:'100%', boxSizing:'border-box', border:'1px solid var(--border)', borderRadius:'10px',
                    padding:'10px 12px', fontSize:'13px', outline:'none', background:'var(--bg)', color:'var(--text)', resize:'none', ...ss }}/>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'18px', gap:'10px' }}>
              <button onClick={() => setShowEdit(false)} style={{ border:'1px solid var(--border)', color:'var(--text-muted)',
                background:'var(--bg)', borderRadius:'10px', padding:'10px 20px', fontSize:'14px', cursor:'pointer', ...ss }}>ยกเลิก</button>
              <button onClick={doResubmit} disabled={saving} style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff',
                border:'none', borderRadius:'10px', padding:'10px 24px', fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>✓ แก้ไขและส่งใหม่</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
