import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { createDocument, getUsers } from '../utils/api'
import { ROLE_LABELS, ROLE_POSITION, DEPT_HEAD_ROLES } from '../utils/roles'
import SignaturePad from '../components/SignaturePad'
import { showToast, updateToast } from '../components/Toast'

const ss = { fontFamily:"'Sarabun',sans-serif" }
const inp = { width:'100%', border:'1px solid var(--border)', borderRadius:'10px',
  padding:'10px 12px', fontSize:'13px', outline:'none',
  background:'var(--bg)', color:'var(--text)', boxSizing:'border-box', ...ss }
const lbl = { display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'4px', fontWeight:'600', ...ss }
const card = { background:'var(--surface)', borderRadius:'18px', border:'1px solid var(--border)', padding:'22px', marginBottom:'14px' }

export default function CreateDocument() {
  const { user } = useAuth()
  const { profile } = useUser()
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSign, setShowSign] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [users, setUsers] = useState([])
  const [sig, setSig] = useState(null)

  const [form, setForm] = useState({
    studentName:'', studentClass:'', studentNo:'', studentId:'',
    address:'', phone:'', parentName:'', parentPhone:'',
    advisorName: profile?.name || user?.displayName || '',
    advisorPosition: ROLE_POSITION[profile?.role] || 'ครูที่ปรึกษา',
    records: Array(3).fill(null).map((_, i) => ({ session:i+1, date:'', issue:'', approach:'' })),
    referralDate: new Date().toISOString().slice(0,10),
    deptHeadEmail:'', deptHeadName:'',
    attachment:'',
    problems: ['','',''],
    helpDone: ['','',''],
    remaining: ['','',''],
    suggestions: ['','',''],
  })

  useEffect(() => {
    getUsers().then(r => { if (r.success) setUsers(r.users || []) }).catch(() => {})
  }, [])

  const deptHeads = users.filter(u => DEPT_HEAD_ROLES.includes(u.role))
  const selectedHead = users.find(u => u.email === form.deptHeadEmail)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setRec = (i, k, v) => { const r = [...form.records]; r[i] = { ...r[i], [k]: v }; setForm(f => ({ ...f, records: r })) }
  const setList = (k, i, v) => { const a = [...form[k]]; a[i] = v; setForm(f => ({ ...f, [k]: a })) }

  const v1 = () => {
    const e = {}
    if (!form.studentName.trim()) e.studentName = 'กรุณากรอกชื่อนักเรียน'
    if (!form.studentClass.trim()) e.studentClass = 'กรุณากรอกชั้น'
    if (!sig) e.sig = 'กรุณาเซ็นชื่อก่อน'
    setErrors(e); return !Object.keys(e).length
  }
  const v2 = () => {
    const e = {}
    if (!form.deptHeadEmail) e.deptHead = 'กรุณาเลือกหัวหน้าแผนก'
    if (!form.problems[0].trim()) e.problem = 'กรุณาระบุปัญหาอย่างน้อย 1 ข้อ'
    setErrors(e); return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    setSaving(true); setShowConfirm(false)
    const tid = showToast('กำลังส่งเอกสาร...', 'loading')
    try {
      const res = await createDocument({
        ...form, teacherSig: sig,
        createdByEmail: user.email,
        createdByName: profile?.name || user.displayName,
        createdByPhoto: user.photoURL,
        creatorRole: profile?.role || 'teacher',
      })
      if (res.success) { updateToast(tid, 'ส่งเอกสารสำเร็จ ✓', 'success'); nav(`/document/${res.docId}`) }
      else { updateToast(tid, 'เกิดข้อผิดพลาด: ' + res.error, 'error') }
    } catch { updateToast(tid, 'เกิดข้อผิดพลาด กรุณาลองใหม่', 'error') }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth:'780px', margin:'0 auto', padding:'28px 24px', ...ss }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'22px' }}>
        <button onClick={() => step === 1 ? nav('/dashboard') : setStep(1)}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'20px', color:'var(--text-muted)', padding:'4px' }}>←</button>
        <div>
          <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'2px', ...ss }}>ขั้นตอนที่ {step}/2</div>
          <h1 style={{ fontSize:'20px', fontWeight:'700', color:'var(--text)', margin:0, ...ss }}>
            {step === 1 ? 'แบบบันทึกการดูแลช่วยเหลือนักเรียน' : 'แบบส่งต่อภายใน'}
          </h1>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'22px' }}>
        {[1,2].map(n => (
          <div key={n} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:'12px', fontWeight:'700',
              background: step >= n ? '#1d4ed8' : 'var(--border)',
              color: step >= n ? '#fff' : 'var(--text-muted)' }}>{n}</div>
            <span style={{ fontSize:'12px', color: step === n ? '#1d4ed8' : 'var(--text-muted)',
              fontWeight: step === n ? '600' : '400', ...ss }}>
              {n === 1 ? 'บันทึกการดูแล' : 'ส่งต่อภายใน'}
            </span>
            {n < 2 && <div style={{ width:'32px', height:'1px', background:'var(--border)' }}/>}
          </div>
        ))}
      </div>

      {/* ─── Step 1 ─── */}
      {step === 1 && <>
        <div style={card}>
          <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', marginBottom:'14px', ...ss }}>ข้อมูลนักเรียน</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbl}>ชื่อ - สกุล นักเรียน <span style={{ color:'#ef4444' }}>*</span></label>
              <input value={form.studentName} onChange={e => set('studentName', e.target.value)}
                placeholder="นาย / นางสาว..."
                style={{ ...inp, borderColor: errors.studentName ? '#ef4444' : 'var(--border)' }}/>
              {errors.studentName && <div style={{ color:'#ef4444', fontSize:'11px', marginTop:'3px', ...ss }}>{errors.studentName}</div>}
            </div>
            <div>
              <label style={lbl}>ชั้น <span style={{ color:'#ef4444' }}>*</span></label>
              <input value={form.studentClass} onChange={e => set('studentClass', e.target.value)}
                placeholder="เช่น ม.3/2"
                style={{ ...inp, borderColor: errors.studentClass ? '#ef4444' : 'var(--border)' }}/>
            </div>
            <div>
              <label style={lbl}>เลขที่</label>
              <input value={form.studentNo} onChange={e => set('studentNo', e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>เลขประจำตัว</label>
              <input value={form.studentId} onChange={e => set('studentId', e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>โทรศัพท์นักเรียน</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" style={inp}/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbl}>ที่อยู่</label>
              <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2}
                style={{ ...inp, resize:'none' }}/>
            </div>
            <div>
              <label style={lbl}>ชื่อ - สกุล ผู้ปกครอง</label>
              <input value={form.parentName} onChange={e => set('parentName', e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>เบอร์โทรผู้ปกครอง</label>
              <input value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} type="tel" style={inp}/>
            </div>
            <div>
              <label style={lbl}>ครูผู้ให้คำปรึกษา</label>
              <input value={form.advisorName} onChange={e => set('advisorName', e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>ตำแหน่ง</label>
              <input value={form.advisorPosition} onChange={e => set('advisorPosition', e.target.value)} style={inp}/>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', marginBottom:'14px', ...ss }}>บันทึกการดูแลช่วยเหลือ</div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
              <thead>
                <tr style={{ background:'#eff6ff' }}>
                  {['ครั้งที่','วัน/เดือน/ปี','เรื่องที่พบ','แนวทางการช่วยเหลือ'].map(h => (
                    <th key={h} style={{ border:'1px solid var(--border)', padding:'7px 10px',
                      textAlign:'left', color:'var(--text)', fontWeight:'600', whiteSpace:'nowrap', ...ss }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.records.map((r, i) => (
                  <tr key={i}>
                    <td style={{ border:'1px solid var(--border)', padding:'4px 8px', textAlign:'center', color:'var(--text-muted)', ...ss }}>{r.session}</td>
                    <td style={{ border:'1px solid var(--border)', padding:'3px' }}>
                      <input type="date" value={r.date} onChange={e => setRec(i,'date',e.target.value)}
                        style={{ width:'100%', border:'none', background:'transparent', color:'var(--text)', fontSize:'12px', padding:'4px', outline:'none', ...ss }}/>
                    </td>
                    <td style={{ border:'1px solid var(--border)', padding:'3px' }}>
                      <textarea value={r.issue} onChange={e => setRec(i,'issue',e.target.value)} rows={2}
                        style={{ width:'100%', border:'none', background:'transparent', color:'var(--text)', fontSize:'12px', padding:'4px', outline:'none', resize:'none', ...ss }}/>
                    </td>
                    <td style={{ border:'1px solid var(--border)', padding:'3px' }}>
                      <textarea value={r.approach} onChange={e => setRec(i,'approach',e.target.value)} rows={2}
                        style={{ width:'100%', border:'none', background:'transparent', color:'var(--text)', fontSize:'12px', padding:'4px', outline:'none', resize:'none', ...ss }}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setForm(f => ({ ...f, records:[...f.records,{session:f.records.length+1,date:'',issue:'',approach:''}]}))}
            style={{ marginTop:'8px', background:'none', border:'none', color:'#1d4ed8', fontSize:'13px', cursor:'pointer', ...ss }}>
            + เพิ่มแถว
          </button>
        </div>

        <div style={card}>
          <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', marginBottom:'14px', ...ss }}>
            ลายเซ็นครูผู้กรอกเอกสาร <span style={{ color:'#ef4444' }}>*</span>
          </div>
          {sig ? (
            <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
              <div style={{ border:'1px solid var(--border)', borderRadius:'12px', padding:'8px', background:'var(--bg)' }}>
                <img src={sig} style={{ height:'60px', maxWidth:'200px' }}/>
              </div>
              <div>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#22c55e', marginBottom:'4px', ...ss }}>✓ เซ็นชื่อแล้ว</div>
                <div style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px', ...ss }}>
                  {form.advisorName} · {form.advisorPosition}
                </div>
                <button onClick={() => setSig(null)} style={{ background:'none', border:'1px solid var(--border)',
                  borderRadius:'8px', padding:'5px 12px', fontSize:'12px', color:'var(--text-muted)', cursor:'pointer', ...ss }}>
                  เซ็นใหม่
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button onClick={() => setShowSign(true)} style={{
                background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff',
                border:'none', borderRadius:'10px', padding:'10px 20px',
                fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>
                ✍️ เซ็นชื่อ
              </button>
              {errors.sig && <div style={{ color:'#ef4444', fontSize:'11px', marginTop:'6px', ...ss }}>{errors.sig}</div>}
            </div>
          )}
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button onClick={() => { if(v1()) setStep(2) }} style={{
            background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff',
            border:'none', borderRadius:'12px', padding:'12px 24px',
            fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>
            ถัดไป: แบบส่งต่อ →
          </button>
        </div>
      </>}

      {/* ─── Step 2 ─── */}
      {step === 2 && <>
        <div style={card}>
          <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text)', marginBottom:'14px', ...ss }}>แบบส่งต่อภายใน</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
            <div>
              <label style={lbl}>วันที่</label>
              <input type="date" value={form.referralDate} onChange={e => set('referralDate', e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>เรียน (หัวหน้าแผนก) <span style={{ color:'#ef4444' }}>*</span></label>
              <select value={form.deptHeadEmail} onChange={e => {
                const u = users.find(x => x.email === e.target.value)
                set('deptHeadEmail', e.target.value)
                set('deptHeadName', u?.name || '')
              }} style={{ ...inp, borderColor: errors.deptHead ? '#ef4444' : 'var(--border)' }}>
                <option value="">— เลือกหัวหน้าแผนก —</option>
                {deptHeads.map(u => (
                  <option key={u.email} value={u.email}>{u.name} ({ROLE_LABELS[u.role]})</option>
                ))}
                {deptHeads.length === 0 && <option disabled>ยังไม่มีหัวหน้าแผนกในระบบ</option>}
              </select>
              {errors.deptHead && <div style={{ color:'#ef4444', fontSize:'11px', marginTop:'3px', ...ss }}>{errors.deptHead}</div>}
              {selectedHead && (
                <div style={{ marginTop:'5px', fontSize:'12px', color:'#1d4ed8', background:'#eff6ff', padding:'4px 10px', borderRadius:'8px', ...ss }}>
                  📧 {selectedHead.email}
                </div>
              )}
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbl}>สิ่งที่ส่งมาด้วย</label>
              <input value={form.attachment} onChange={e => set('attachment', e.target.value)}
                placeholder="เช่น แบบบันทึกการดูแลนักเรียน" style={inp}/>
            </div>
          </div>

          {[
            { key:'problems', label:'ปัญหาที่พบสรุปได้ดังนี้', req:true },
            { key:'helpDone', label:'ดำเนินการช่วยเหลือเบื้องต้นแล้วดังนี้' },
            { key:'remaining', label:'แต่ยังคงมีปัญหาดังนี้' },
            { key:'suggestions', label:'ข้อเสนอแนะอื่น ๆ' },
          ].map(sec => (
            <div key={sec.key} style={{ marginBottom:'14px' }}>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--text)', marginBottom:'7px', ...ss }}>
                {sec.label} {sec.req && <span style={{ color:'#ef4444' }}>*</span>}
              </div>
              {[0,1,2].map(i => (
                <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'5px' }}>
                  <span style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'10px', width:'16px', flexShrink:0, ...ss }}>{i+1}.</span>
                  <input value={form[sec.key][i]} onChange={e => setList(sec.key, i, e.target.value)}
                    style={{ ...inp, flex:1, borderColor: sec.req && i===0 && errors.problem ? '#ef4444' : 'var(--border)' }}/>
                </div>
              ))}
              {sec.req && errors.problem && <div style={{ color:'#ef4444', fontSize:'11px', ...ss }}>{errors.problem}</div>}
            </div>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', gap:'10px' }}>
          <button onClick={() => setStep(1)} style={{
            border:'1px solid var(--border)', color:'var(--text-muted)',
            background:'var(--surface)', borderRadius:'12px', padding:'12px 20px',
            fontSize:'14px', cursor:'pointer', ...ss }}>
            ← กลับ
          </button>
          <button onClick={() => { if(v2()) setShowConfirm(true) }} disabled={saving} style={{
            background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff',
            border:'none', borderRadius:'12px', padding:'12px 24px',
            fontSize:'14px', fontWeight:'600', cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1, ...ss }}>
            ตรวจสอบและส่ง →
          </button>
        </div>
      </>}

      {showSign && <SignaturePad onSave={s => { setSig(s); setShowSign(false) }} onCancel={() => setShowSign(false)}/>}

      {showConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'var(--surface)', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'480px', ...ss }}>
            <h2 style={{ fontSize:'18px', fontWeight:'700', color:'var(--text)', margin:'0 0 20px', ...ss }}>📋 ตรวจสอบก่อนส่ง</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px' }}>
              {[
                { label:'นักเรียน', value:`${form.studentName} ชั้น ${form.studentClass} เลขที่ ${form.studentNo}` },
                { label:'ครูผู้กรอก', value:`${form.advisorName} (${form.advisorPosition})` },
                { label:'ส่งถึง', value:selectedHead ? `${selectedHead.name} (${ROLE_LABELS[selectedHead.role]})` : '-', hi:true },
                { label:'ปัญหาหลัก', value:form.problems[0] || '-' },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', gap:'12px', padding:'10px 14px',
                  background: row.hi ? '#eff6ff' : 'var(--bg)', borderRadius:'10px',
                  border:`1px solid ${row.hi ? '#bfdbfe' : 'var(--border)'}` }}>
                  <div style={{ fontSize:'12px', color:'var(--text-muted)', width:'80px', flexShrink:0, fontWeight:'600', ...ss }}>{row.label}</div>
                  <div style={{ fontSize:'13px', color: row.hi ? '#1d4ed8' : 'var(--text)', fontWeight: row.hi ? '600' : '400', ...ss }}>{row.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px',
              padding:'10px 14px', marginBottom:'20px', fontSize:'12px', color:'#166534', ...ss }}>
              ✓ ลายเซ็นครูเรียบร้อย · ระบบจะแจ้ง{selectedHead?.name || 'หัวหน้าแผนก'}ทางอีเมลอัตโนมัติ
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', gap:'10px' }}>
              <button onClick={() => setShowConfirm(false)} style={{
                border:'1px solid var(--border)', color:'var(--text-muted)',
                background:'var(--bg)', borderRadius:'10px', padding:'10px 20px',
                fontSize:'14px', cursor:'pointer', ...ss }}>แก้ไข</button>
              <button onClick={handleSubmit} style={{
                background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff',
                border:'none', borderRadius:'10px', padding:'10px 24px',
                fontSize:'14px', fontWeight:'600', cursor:'pointer', ...ss }}>
                ✓ ยืนยันส่งเอกสาร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
