import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'

const ADMIN_PIN = '100625'

const ROLE_OPTIONS = [
  { value: 'teacher',           label: 'ครูที่ปรึกษา / ครูที่พบปัญหา',              color:'#64748b', bg:'#f8fafc' },
  { value: 'head_kindergarten', label: 'หัวหน้าแผนกอนุบาล',                      color:'#854d0e', bg:'#fefce8' },
  { value: 'head_primary_low',  label: 'หัวหน้าแผนกประถมศึกษาตอนต้น',             color:'#9a3412', bg:'#fff7ed' },
  { value: 'head_primary_high', label: 'หัวหน้าแผนกประถมศึกษาตอนปลาย',            color:'#7c2d12', bg:'#fef3c7' },
  { value: 'head_junior',       label: 'หัวหน้าแผนกมัธยมศึกษาตอนต้น',             color:'#1e40af', bg:'#dbeafe' },
  { value: 'head_senior',       label: 'หัวหน้าแผนกมัธยมศึกษาตอนปลาย',            color:'#6b21a8', bg:'#fdf4ff' },
  { value: 'asst_director',     label: 'ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน',      color:'#7e22ce', bg:'#fdf4ff' },
  { value: 'guidance',      label: 'ฝ่ายแนะแนว',                   color:'#166534', bg:'#f0fdf4' },
  { value: 'discipline',        label: 'ฝ่ายพัฒนาวินัย',                           color:'#1e40af', bg:'#eff6ff' },
  { value: 'religious',         label: 'ฝ่ายศาสนกิจ',                              color:'#134e4a', bg:'#f0fdfa' },
  { value: 'admin',         label: 'Admin',                        color:'#991b1b', bg:'#fef2f2' },
]

export default function AdminSettings() {
  const { user } = useAuth()

  // PIN gate
  const [pinUnlocked, setPinUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [lineToken, setLineToken] = useState('')
  const [savingLine, setSavingLine] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'teacher', lineUserId: '' })
  const [tab, setTab] = useState('users')
  const fileRef = useRef()
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePin = () => {
    if (pinInput === ADMIN_PIN) {
      setPinUnlocked(true)
      loadSettings()
    } else {
      setPinError(true)
      setPinInput('')
      setTimeout(() => setPinError(false), 1500)
    }
  }

  useEffect(() => {
    if (pinUnlocked) loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const [usersRes, settingsRes] = await Promise.all([
        apiFetch('getUsers', {}),
        apiFetch('getSettings', {}),
      ])
      if (usersRes.success) setUsers(usersRes.users || [])
      if (settingsRes.success) {
        setLogoPreview(settingsRes.logoUrl || null)
        setLineToken(settingsRes.lineToken || '')
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('กรุณาเลือกไฟล์รูปภาพ', 'error'); return }
    if (file.size > 2 * 1024 * 1024) { showToast('ไฟล์ต้องไม่เกิน 2MB', 'error'); return }
    setLogoUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result
      setLogoPreview(base64)
      try {
        const res = await apiFetch('uploadLogo', { base64, fileName: file.name, mimeType: file.type })
        if (res.success) showToast('อัปโหลดโลโก้สำเร็จ')
        else showToast('อัปโหลดไม่สำเร็จ: ' + res.error, 'error')
      } catch { showToast('เกิดข้อผิดพลาด', 'error') }
      setLogoUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleAddUser = async () => {
    if (!newUser.email.trim() || !newUser.name.trim()) { showToast('กรุณากรอกอีเมลและชื่อ', 'error'); return }
    setSaving(true)
    try {
      const res = await apiFetch('upsertUser', newUser)
      if (res.success) {
        await loadSettings()
        setNewUser({ email: '', name: '', role: 'teacher', lineUserId: '' })
        showToast('เพิ่มผู้ใช้สำเร็จ')
      } else showToast('เกิดข้อผิดพลาด: ' + res.error, 'error')
    } catch { showToast('เกิดข้อผิดพลาด', 'error') }
    setSaving(false)
  }

  const handleRoleChange = async (email, role) => {
    try {
      await apiFetch('upsertUser', { email, role })
      setUsers(u => u.map(x => x.email === email ? { ...x, role } : x))
      showToast('อัปเดต role แล้ว')
    } catch { showToast('เกิดข้อผิดพลาด', 'error') }
  }

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`ลบผู้ใช้ ${email}?`)) return
    try {
      await apiFetch('deleteUser', { email })
      setUsers(u => u.filter(x => x.email !== email))
      showToast('ลบผู้ใช้แล้ว')
    } catch { showToast('เกิดข้อผิดพลาด', 'error') }
  }

  const handleSaveLine = async () => {
    setSavingLine(true)
    try {
      const res = await apiFetch('saveSettings', { lineToken })
      if (res.success) showToast('บันทึก Line Token สำเร็จ')
      else showToast('เกิดข้อผิดพลาด', 'error')
    } catch { showToast('เกิดข้อผิดพลาด', 'error') }
    setSavingLine(false)
  }

  const handleTestLine = async () => {
    try {
      const res = await apiFetch('testLineNotify', { lineToken })
      if (res.success) showToast('ส่งทดสอบสำเร็จ! ตรวจสอบ Line ของคุณ')
      else showToast('ส่งไม่สำเร็จ: ' + res.error, 'error')
    } catch { showToast('เกิดข้อผิดพลาด', 'error') }
  }

  const s = { fontFamily:"'Sarabun',sans-serif" }

  // ─── PIN Screen ───
  if (!pinUnlocked) {
    return (
      <div style={{minHeight:'calc(100vh - 60px)',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8fafc',...s}}>
        <div style={{background:'#fff',borderRadius:'24px',padding:'40px 36px',textAlign:'center',boxShadow:'0 8px 32px rgba(0,0,0,0.08)',border:'1px solid #e2e8f0',width:'100%',maxWidth:'360px'}}>
          <div style={{width:'56px',height:'56px',background:'linear-gradient(135deg,#dc2626,#9f1239)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',margin:'0 auto 20px'}}>🔐</div>
          <h2 style={{fontSize:'20px',fontWeight:'700',color:'#0f172a',margin:'0 0 6px'}}>Admin Access</h2>
          <p style={{fontSize:'13px',color:'#94a3b8',margin:'0 0 28px'}}>กรอกรหัส PIN เพื่อเข้าสู่หน้าตั้งค่า</p>

          <input
            type="password" maxLength={6}
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePin()}
            placeholder="••••••"
            style={{
              width:'100%', boxSizing:'border-box',
              border: pinError ? '2px solid #ef4444' : '2px solid #e2e8f0',
              borderRadius:'12px', padding:'14px', fontSize:'20px',
              letterSpacing:'0.3em', textAlign:'center', outline:'none',
              marginBottom:'12px', fontFamily:'monospace',
              background: pinError ? '#fef2f2' : '#f8fafc',
              transition:'all 0.2s',
            }}
          />
          {pinError && <div style={{color:'#ef4444',fontSize:'13px',marginBottom:'12px'}}>รหัส PIN ไม่ถูกต้อง</div>}
          <button onClick={handlePin} style={{
            width:'100%', background:'linear-gradient(135deg,#1d4ed8,#4f46e5)',
            color:'#fff', border:'none', borderRadius:'12px',
            padding:'14px', fontSize:'15px', fontWeight:'600', cursor:'pointer',...s,
          }}>เข้าสู่ระบบ</button>
        </div>
      </div>
    )
  }

  // ─── Main Admin ───
  const TABS = [
    { key:'users',  label:'👥 ผู้ใช้งาน' },
    { key:'logo',   label:'🏫 โลโก้' },
    { key:'notify', label:'🔔 แจ้งเตือน' },
  ]

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'28px 20px',...s}}>
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:'80px', right:'20px', zIndex:999,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: toast.type === 'error' ? '#991b1b' : '#166534',
          borderRadius:'12px', padding:'12px 20px', fontSize:'14px',
          fontWeight:'600', boxShadow:'0 4px 12px rgba(0,0,0,0.1)',...s,
        }}>{toast.type === 'error' ? '❌' : '✅'} {toast.msg}</div>
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'28px'}}>
        <div>
          <h1 style={{fontSize:'24px',fontWeight:'700',color:'#0f172a',margin:'0 0 4px'}}>ตั้งค่าระบบ</h1>
          <p style={{fontSize:'13px',color:'#94a3b8',margin:0}}>จัดการผู้ใช้ บทบาท และการแจ้งเตือน</p>
        </div>
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'10px',padding:'6px 14px',fontSize:'12px',color:'#dc2626',fontWeight:'600'}}>
          🔐 Admin Mode
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'4px',marginBottom:'24px',background:'#f1f5f9',borderRadius:'14px',padding:'4px',width:'fit-content'}}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'8px 18px', borderRadius:'10px', border:'none',
            fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s',
            background: tab === t.key ? '#fff' : 'transparent',
            color: tab === t.key ? '#1d4ed8' : '#64748b',
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',...s,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ─── Users Tab ─── */}
      {tab === 'users' && (
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          {/* Add User */}
          <div style={{background:'#fff',borderRadius:'20px',border:'1px solid #e2e8f0',padding:'24px'}}>
            <h2 style={{fontSize:'16px',fontWeight:'700',color:'#0f172a',margin:'0 0 16px',display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{background:'#eff6ff',color:'#1d4ed8',width:'28px',height:'28px',borderRadius:'8px',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>+</span>
              เพิ่มผู้ใช้ใหม่
            </h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
              {[
                { key:'email', placeholder:'teacher@gmail.com', label:'อีเมล Google' },
                { key:'name', placeholder:'ครูสมชาย ใจดี', label:'ชื่อ-สกุล' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{display:'block',fontSize:'12px',color:'#64748b',marginBottom:'5px',fontWeight:'600'}}>{f.label}</label>
                  <input value={newUser[f.key]} onChange={e => setNewUser(u => ({ ...u, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} style={{width:'100%',boxSizing:'border-box',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'10px 12px',fontSize:'13px',outline:'none',...s}}/>
                </div>
              ))}
              <div>
                <label style={{display:'block',fontSize:'12px',color:'#64748b',marginBottom:'5px',fontWeight:'600'}}>บทบาท</label>
                <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
                  style={{width:'100%',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'10px 12px',fontSize:'13px',outline:'none',background:'#fff',...s}}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:'12px',color:'#64748b',marginBottom:'5px',fontWeight:'600'}}>Line User ID (ถ้ามี)</label>
                <input value={newUser.lineUserId} onChange={e => setNewUser(u => ({ ...u, lineUserId: e.target.value }))}
                  placeholder="Uxxxxxx..." style={{width:'100%',boxSizing:'border-box',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'10px 12px',fontSize:'13px',outline:'none',...s}}/>
              </div>
            </div>
            <button onClick={handleAddUser} disabled={saving} style={{
              background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff', border:'none',
              borderRadius:'10px', padding:'11px 24px', fontSize:'14px', fontWeight:'600',
              cursor:saving?'not-allowed':'pointer', opacity:saving?0.6:1,...s,
            }}>{saving ? 'กำลังบันทึก...' : '+ เพิ่มผู้ใช้'}</button>
          </div>

          {/* User List */}
          <div style={{background:'#fff',borderRadius:'20px',border:'1px solid #e2e8f0',overflow:'hidden'}}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h2 style={{fontSize:'16px',fontWeight:'700',color:'#0f172a',margin:0}}>รายชื่อผู้ใช้</h2>
              <span style={{fontSize:'13px',color:'#94a3b8',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'100px',padding:'2px 12px'}}>
                {users.length} คน
              </span>
            </div>
            {loading ? (
              <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>กำลังโหลด...</div>
            ) : users.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>ยังไม่มีผู้ใช้</div>
            ) : (
              <div>
                {users.map((u, i) => {
                  const roleOpt = ROLE_OPTIONS.find(r => r.value === u.role)
                  return (
                    <div key={u.email} style={{
                      display:'flex', alignItems:'center', gap:'14px',
                      padding:'14px 24px',
                      borderBottom: i < users.length - 1 ? '1px solid #f8fafc' : 'none',
                    }}>
                      <div style={{
                        width:'38px', height:'38px', borderRadius:'12px', flexShrink:0,
                        background: roleOpt?.bg || '#f8fafc',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'15px', fontWeight:'700', color: roleOpt?.color || '#64748b',
                      }}>{(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'14px',fontWeight:'600',color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.name}</div>
                        <div style={{fontSize:'12px',color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.email}</div>
                      </div>
                      <select value={u.role} onChange={e => handleRoleChange(u.email, e.target.value)} style={{
                        border:'1px solid #e2e8f0', borderRadius:'8px', padding:'6px 10px',
                        fontSize:'12px', outline:'none', background: roleOpt?.bg || '#f8fafc',
                        color: roleOpt?.color || '#64748b', fontWeight:'600', cursor:'pointer',...s,
                      }}>
                        {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                      <button onClick={() => handleDeleteUser(u.email)} style={{
                        fontSize:'12px', color:'#ef4444', background:'#fef2f2',
                        border:'1px solid #fecaca', borderRadius:'8px',
                        padding:'6px 12px', cursor:'pointer', flexShrink:0,...s,
                      }}>ลบ</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Role Guide */}
          <div style={{background:'#eff6ff',borderRadius:'16px',border:'1px solid #bfdbfe',padding:'20px 24px'}}>
            <div style={{fontSize:'13px',fontWeight:'700',color:'#1e40af',marginBottom:'12px'}}>📋 บทบาทและสิทธิ์การเข้าถึง</div>
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              {ROLE_OPTIONS.filter(r => r.value !== 'admin').map(r => (
                <div key={r.value} style={{display:'flex',alignItems:'center',gap:'10px',fontSize:'12px'}}>
                  <span style={{background:r.bg,color:r.color,padding:'2px 10px',borderRadius:'100px',fontWeight:'600',minWidth:'140px',textAlign:'center',flexShrink:0}}>{r.label}</span>
                  <span style={{color:'#3b82f6'}}>{roleDesc(r.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Logo Tab ─── */}
      {tab === 'logo' && (
        <div style={{background:'#fff',borderRadius:'20px',border:'1px solid #e2e8f0',padding:'32px'}}>
          <h2 style={{fontSize:'16px',fontWeight:'700',color:'#0f172a',margin:'0 0 6px'}}>โลโก้โรงเรียน</h2>
          <p style={{fontSize:'13px',color:'#94a3b8',margin:'0 0 28px'}}>แสดงใน Navbar และหน้า Login — แนะนำ 200×200px, ไม่เกิน 2MB</p>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'20px'}}>
            <div style={{
              width:'140px', height:'140px', borderRadius:'24px',
              border:'2px dashed #e2e8f0', background:'#f8fafc',
              display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
            }}>
              {logoPreview ? (
                <img src={logoPreview} alt="logo" style={{width:'100%',height:'100%',objectFit:'contain',padding:'12px',boxSizing:'border-box'}}/>
              ) : (
                <div style={{textAlign:'center',color:'#94a3b8'}}>
                  <div style={{fontSize:'36px',marginBottom:'4px'}}>🏫</div>
                  <div style={{fontSize:'12px'}}>ยังไม่มีโลโก้</div>
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} style={{display:'none'}}/>
              <button onClick={() => fileRef.current?.click()} disabled={logoUploading} style={{
                background:'linear-gradient(135deg,#1d4ed8,#4f46e5)',color:'#fff',
                border:'none', borderRadius:'10px', padding:'11px 20px',
                fontSize:'14px', fontWeight:'600', cursor:'pointer',...s,
              }}>{logoUploading ? 'กำลังอัปโหลด...' : '📁 เลือกไฟล์'}</button>
              {logoPreview && (
                <button onClick={async () => {
                  setLogoUploading(true)
                  await apiFetch('uploadLogo', { base64: null, fileName: '', mimeType: '' })
                  setLogoPreview(null); setLogoUploading(false)
                  showToast('ลบโลโก้แล้ว')
                }} disabled={logoUploading} style={{
                  border:'1px solid #fecaca',color:'#ef4444',background:'#fef2f2',
                  borderRadius:'10px',padding:'11px 20px',fontSize:'14px',cursor:'pointer',...s,
                }}>ลบโลโก้</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Notify Tab ─── */}
      {tab === 'notify' && (
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div style={{background:'#fff',borderRadius:'20px',border:'1px solid #e2e8f0',padding:'24px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
              <div style={{width:'32px',height:'32px',background:'#dcfce7',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>💬</div>
              <h2 style={{fontSize:'16px',fontWeight:'700',color:'#0f172a',margin:0}}>Line Notify</h2>
            </div>
            <p style={{fontSize:'13px',color:'#94a3b8',margin:'0 0 16px'}}>แจ้งเตือนเข้า Line เมื่อมีเอกสารเปลี่ยนสถานะ</p>
            <label style={{display:'block',fontSize:'12px',color:'#64748b',marginBottom:'5px',fontWeight:'600'}}>Line Notify Token</label>
            <input value={lineToken} onChange={e => setLineToken(e.target.value)} type="password"
              placeholder="Token จาก notify-bot.line.me"
              style={{width:'100%',boxSizing:'border-box',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'10px 12px',fontSize:'13px',outline:'none',fontFamily:'monospace',marginBottom:'4px'}}/>
            <p style={{fontSize:'12px',color:'#94a3b8',margin:'0 0 14px'}}>
              รับ Token ที่ <a href="https://notify-bot.line.me/th/" target="_blank" rel="noopener noreferrer" style={{color:'#22c55e'}}>notify-bot.line.me</a>
            </p>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={handleSaveLine} disabled={savingLine} style={{
                background:'#22c55e',color:'#fff',border:'none',borderRadius:'10px',
                padding:'10px 20px',fontSize:'14px',fontWeight:'600',cursor:'pointer',...s,
              }}>{savingLine ? 'บันทึก...' : 'บันทึก Token'}</button>
              <button onClick={handleTestLine} style={{
                border:'1px solid #86efac',color:'#166534',background:'#f0fdf4',
                borderRadius:'10px',padding:'10px 20px',fontSize:'14px',cursor:'pointer',...s,
              }}>ทดสอบส่ง</button>
            </div>
          </div>

          <div style={{background:'#fff',borderRadius:'20px',border:'1px solid #e2e8f0',padding:'24px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
              <div style={{width:'32px',height:'32px',background:'#fef2f2',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>📧</div>
              <h2 style={{fontSize:'16px',fontWeight:'700',color:'#0f172a',margin:0}}>Email (Gmail)</h2>
            </div>
            <p style={{fontSize:'13px',color:'#94a3b8',margin:'0 0 12px'}}>ส่งอีเมลผ่าน Apps Script MailApp อัตโนมัติ ไม่ต้องตั้งค่าเพิ่ม</p>
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'12px 16px',fontSize:'13px',color:'#166534',fontWeight:'600'}}>
              ✓ พร้อมใช้งานอัตโนมัติ
            </div>
          </div>

          <div style={{background:'#f8fafc',borderRadius:'16px',border:'1px solid #e2e8f0',padding:'20px 24px'}}>
            <div style={{fontSize:'13px',fontWeight:'700',color:'#475569',marginBottom:'12px'}}>เหตุการณ์ที่จะแจ้งเตือน</div>
            {[
              { icon:'📄', event:'ครูส่งเอกสารใหม่', who:'แจ้ง หัวหน้าแผนก' },
              { icon:'✍️', event:'หัวหน้าแผนกเซ็นแล้ว', who:'แจ้ง ผู้ช่วย ผอ.' },
              { icon:'📤', event:'ผู้ช่วย ผอ. ส่งต่อฝ่าย', who:'แจ้ง ฝ่ายที่รับผิดชอบ' },
              { icon:'↩️', event:'ส่งคืนเพื่อแก้ไข', who:'แจ้ง ครูที่สร้างเอกสาร' },
              { icon:'✅', event:'เอกสารสมบูรณ์', who:'แจ้ง ครู + ผู้ช่วย ผอ.' },
            ].map((item, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:'1px solid #f1f5f9',fontSize:'13px'}}>
                <span>{item.icon}</span>
                <span style={{flex:1,color:'#374151'}}>{item.event}</span>
                <span style={{fontSize:'12px',color:'#64748b',background:'#fff',border:'1px solid #e2e8f0',borderRadius:'100px',padding:'2px 10px'}}>{item.who}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function roleDesc(role) {
  return {
    teacher:           'สร้างเอกสาร กรอกข้อมูล เซ็นชื่อ',
    head_kindergarten: 'รับเอกสาร เซ็นรับรอง หรือส่งคืน',
    head_primary_low:  'รับเอกสาร เซ็นรับรอง หรือส่งคืน',
    head_primary_high: 'รับเอกสาร เซ็นรับรอง หรือส่งคืน',
    head_junior:       'รับเอกสาร เซ็นรับรอง หรือส่งคืน',
    head_senior:       'รับเอกสาร เซ็นรับรอง หรือส่งคืน',
    asst_director:     'รับเอกสาร เซ็นรับรอง ส่งต่อฝ่าย (สร้างเอกสาร 3)',
    guidance:          'รับเอกสาร 3 ดำเนินการ เซ็น',
    discipline:        'รับเอกสาร 3 ดำเนินการ เซ็น',
    religious:         'รับเอกสาร 3 ดำเนินการ เซ็น',
  }[role] || ''
}
