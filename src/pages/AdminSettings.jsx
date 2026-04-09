import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'

const ROLE_OPTIONS = [
  { value: 'teacher', label: 'ครูที่ปรึกษา / ครูที่พบปัญหา' },
  { value: 'dept_head', label: 'หัวหน้าแผนก' },
  { value: 'asst_director', label: 'ผู้ช่วย ผอ. ฝ่ายกิจการนักเรียน' },
  { value: 'guidance', label: 'ฝ่ายแนะแนว' },
  { value: 'discipline', label: 'ฝ่ายปกครอง' },
  { value: 'academic', label: 'ฝ่ายวิชาการ' },
  { value: 'admin', label: 'Admin' },
]

export default function AdminSettings() {
  const { user } = useAuth()
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

  useEffect(() => {
    loadSettings()
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
    if (!file.type.startsWith('image/')) { alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return }
    if (file.size > 2 * 1024 * 1024) { alert('ไฟล์ต้องมีขนาดไม่เกิน 2MB'); return }

    setLogoUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result
      setLogoPreview(base64)
      try {
        const res = await apiFetch('uploadLogo', { base64, fileName: file.name, mimeType: file.type })
        if (!res.success) alert('อัปโหลดไม่สำเร็จ: ' + res.error)
        else alert('อัปโหลดโลโก้สำเร็จ!')
      } catch (err) { alert('เกิดข้อผิดพลาด') }
      setLogoUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = async () => {
    if (!confirm('ลบโลโก้ออกจากระบบ?')) return
    setLogoUploading(true)
    try {
      await apiFetch('uploadLogo', { base64: null, fileName: '', mimeType: '' })
      setLogoPreview(null)
    } catch (e) { }
    setLogoUploading(false)
  }

  const handleAddUser = async () => {
    if (!newUser.email.trim() || !newUser.name.trim()) { alert('กรุณากรอกอีเมลและชื่อ'); return }
    setSaving(true)
    try {
      const res = await apiFetch('upsertUser', newUser)
      if (res.success) {
        await loadSettings()
        setNewUser({ email: '', name: '', role: 'teacher', lineUserId: '' })
      } else alert('เกิดข้อผิดพลาด: ' + res.error)
    } catch (e) { alert('เกิดข้อผิดพลาด') }
    setSaving(false)
  }

  const handleRoleChange = async (email, role) => {
    try {
      await apiFetch('upsertUser', { email, role })
      setUsers(u => u.map(x => x.email === email ? { ...x, role } : x))
    } catch (e) { alert('เกิดข้อผิดพลาด') }
  }

  const handleDeleteUser = async (email) => {
    if (!confirm(`ลบผู้ใช้ ${email} ออกจากระบบ?`)) return
    try {
      await apiFetch('deleteUser', { email })
      setUsers(u => u.filter(x => x.email !== email))
    } catch (e) { alert('เกิดข้อผิดพลาด') }
  }

  const handleSaveLine = async () => {
    setSavingLine(true)
    try {
      const res = await apiFetch('saveSettings', { lineToken })
      if (res.success) alert('บันทึก Line Token สำเร็จ!')
      else alert('เกิดข้อผิดพลาด: ' + res.error)
    } catch (e) { alert('เกิดข้อผิดพลาด') }
    setSavingLine(false)
  }

  const handleTestLine = async () => {
    try {
      const res = await apiFetch('testLineNotify', { lineToken })
      if (res.success) alert('ส่งทดสอบ Line Notify สำเร็จ! ตรวจสอบ Line ของคุณ')
      else alert('ส่งไม่สำเร็จ: ' + res.error)
    } catch (e) { alert('เกิดข้อผิดพลาด') }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">ตั้งค่าระบบ (Admin)</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'users', label: 'จัดการผู้ใช้' },
          { key: 'logo', label: 'โลโก้โรงเรียน' },
          { key: 'notify', label: 'การแจ้งเตือน' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Users ─── */}
      {tab === 'users' && (
        <div className="space-y-4">
          {/* เพิ่มผู้ใช้ใหม่ */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">เพิ่มผู้ใช้ใหม่</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">อีเมล Google</label>
                <input value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                  placeholder="teacher@gmail.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">ชื่อ-สกุล</label>
                <input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                  placeholder="ครูสมชาย ใจดี"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">บทบาท</label>
                <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Line User ID (ถ้ามี)</label>
                <input value={newUser.lineUserId} onChange={e => setNewUser(u => ({ ...u, lineUserId: e.target.value }))}
                  placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            <button onClick={handleAddUser} disabled={saving}
              className="bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {saving ? 'กำลังบันทึก...' : '+ เพิ่มผู้ใช้'}
            </button>
          </div>

          {/* รายชื่อผู้ใช้ */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">รายชื่อผู้ใช้ทั้งหมด ({users.length} คน)</h2>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">กำลังโหลด...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">ยังไม่มีผู้ใช้</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {users.map(u => (
                  <div key={u.email} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                      {u.name?.[0] || u.email?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{u.name}</div>
                      <div className="text-xs text-gray-400 truncate">{u.email}</div>
                    </div>
                    <select value={u.role} onChange={e => handleRoleChange(u.email, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
                      {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button onClick={() => handleDeleteUser(u.email)}
                      className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* คำอธิบาย Role */}
          <div className="bg-blue-50 rounded-2xl p-5 text-sm text-blue-800">
            <div className="font-medium mb-2">บทบาทและสิทธิ์การเข้าถึง</div>
            <div className="space-y-1 text-xs text-blue-700">
              {ROLE_OPTIONS.filter(r => r.value !== 'admin').map(r => (
                <div key={r.value}>• <span className="font-medium">{r.label}</span> — {roleDesc(r.value)}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Logo ─── */}
      {tab === 'logo' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-700 mb-1">โลโก้โรงเรียน</h2>
          <p className="text-xs text-gray-400 mb-6">แสดงในหน้า Login และ Navbar — ขนาดแนะนำ 200×200px, ไม่เกิน 2MB</p>

          <div className="flex flex-col items-center gap-5">
            {/* Preview */}
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="โลโก้" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-3xl mb-1">🏫</div>
                  <div className="text-xs">ยังไม่มีโลโก้</div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml"
                onChange={handleLogoChange} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={logoUploading}
                className="bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors">
                {logoUploading ? 'กำลังอัปโหลด...' : '📁 เลือกไฟล์โลโก้'}
              </button>
              {logoPreview && (
                <button onClick={handleRemoveLogo} disabled={logoUploading}
                  className="border border-red-300 text-red-500 px-5 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors">
                  ลบโลโก้
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400">รองรับ PNG, JPG, GIF, SVG</p>
          </div>
        </div>
      )}

      {/* ─── Tab: Notify ─── */}
      {tab === 'notify' && (
        <div className="space-y-4">
          {/* Line Notify */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">L</div>
              <h2 className="font-semibold text-gray-700">Line Notify</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">แจ้งเตือนเข้า Line เมื่อมีเอกสารส่งมาให้เซ็น / ถูกส่งคืน / สมบูรณ์</p>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Line Notify Token (Group หรือ Personal)</label>
              <input value={lineToken} onChange={e => setLineToken(e.target.value)}
                type="password"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-300" />
              <p className="text-xs text-gray-400 mt-1">
                รับ Token ได้ที่{' '}
                <a href="https://notify-bot.line.me/th/" target="_blank" rel="noopener noreferrer"
                  className="text-green-600 underline">notify-bot.line.me</a>
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSaveLine} disabled={savingLine}
                className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors">
                {savingLine ? 'กำลังบันทึก...' : 'บันทึก Token'}
              </button>
              <button onClick={handleTestLine}
                className="border border-green-400 text-green-600 px-4 py-2 rounded-xl text-sm hover:bg-green-50 transition-colors">
                ทดสอบส่ง
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">@</div>
              <h2 className="font-semibold text-gray-700">Email (Gmail)</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">ส่งอีเมลผ่าน Apps Script MailApp อัตโนมัติ ไม่ต้องตั้งค่าเพิ่ม</p>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
              <span>✓</span> พร้อมใช้งานอัตโนมัติ — ส่งถึง Email Google Account ของผู้รับ
            </div>
          </div>

          {/* สรุปเหตุการณ์ */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">เหตุการณ์ที่จะแจ้งเตือน</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {[
                { icon: '📄', event: 'ครูส่งเอกสารใหม่', who: 'แจ้ง หัวหน้าแผนก' },
                { icon: '✍️', event: 'หัวหน้าแผนกเซ็นแล้ว', who: 'แจ้ง ผู้ช่วย ผอ.' },
                { icon: '📤', event: 'ผู้ช่วย ผอ. ส่งต่อฝ่าย', who: 'แจ้ง ฝ่ายที่รับผิดชอบ' },
                { icon: '↩️', event: 'ส่งคืนเพื่อแก้ไข', who: 'แจ้ง ครูที่สร้างเอกสาร' },
                { icon: '✅', event: 'เอกสารสมบูรณ์', who: 'แจ้ง ครู + ผู้ช่วย ผอ.' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.event}</span>
                  <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">{item.who}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function roleDesc(role) {
  const map = {
    teacher: 'สร้างเอกสาร กรอกข้อมูล เซ็นชื่อ',
    dept_head: 'รับเอกสาร เซ็นรับรอง หรือส่งคืน',
    asst_director: 'รับเอกสาร เซ็นรับรอง ส่งต่อฝ่าย (สร้างเอกสาร 3)',
    guidance: 'รับเอกสาร 3 ดำเนินการ เซ็น',
    discipline: 'รับเอกสาร 3 ดำเนินการ เซ็น',
    academic: 'รับเอกสาร 3 ดำเนินการ เซ็น',
  }
  return map[role] || ''
}
