import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getForm1, signDocument, returnDocument, createForm3, getAuditLog } from '../utils/api'
import SignaturePad from '../components/SignaturePad'
import AuditLog from '../components/AuditLog'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const DEPT_OPTIONS = [
  { value: 'guidance', label: 'ฝ่ายแนะแนว' },
  { value: 'discipline', label: 'ฝ่ายปกครอง' },
  { value: 'academic', label: 'ฝ่ายวิชาการ' },
]

export default function DocumentView() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [doc, setDoc] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSign, setShowSign] = useState(false)
  const [showReturn, setShowReturn] = useState(false)
  const [showForm3, setShowForm3] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [form3Note, setForm3Note] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('doc')

  useEffect(() => {
    loadDoc()
  }, [id])

  const loadDoc = async () => {
    setLoading(true)
    try {
      const [docRes, logRes] = await Promise.all([
        getForm1(id),
        getAuditLog(id),
      ])
      if (docRes.success) setDoc(docRes.document)
      if (logRes.success) setLogs(logRes.logs)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleSign = async (signatureBase64) => {
    setSaving(true)
    setShowSign(false)
    try {
      const res = await signDocument({
        docId: id,
        signerEmail: user.email,
        signerName: user.displayName,
        signature: signatureBase64,
      })
      if (res.success) { await loadDoc() }
      else alert('เกิดข้อผิดพลาด: ' + res.error)
    } catch (e) { alert('เกิดข้อผิดพลาด') }
    setSaving(false)
  }

  const handleReturn = async () => {
    if (!returnReason.trim()) { alert('กรุณาระบุเหตุผลการส่งคืน'); return }
    setSaving(true)
    try {
      const res = await returnDocument({ docId: id, reason: returnReason, byEmail: user.email, byName: user.displayName })
      if (res.success) { setShowReturn(false); setReturnReason(''); await loadDoc() }
      else alert('เกิดข้อผิดพลาด: ' + res.error)
    } catch (e) { alert('เกิดข้อผิดพลาด') }
    setSaving(false)
  }

  const handleForm3 = async () => {
    if (!selectedDept) { alert('กรุณาเลือกฝ่ายที่จะส่งต่อ'); return }
    setSaving(true)
    try {
      const res = await createForm3({
        docId: id,
        targetDept: selectedDept,
        note: form3Note,
        createdByEmail: user.email,
        createdByName: user.displayName,
      })
      if (res.success) { setShowForm3(false); await loadDoc() }
      else alert('เกิดข้อผิดพลาด: ' + res.error)
    } catch (e) { alert('เกิดข้อผิดพลาด') }
    setSaving(false)
  }

  const handleExportPDF = async () => {
    const el = document.getElementById('doc-content')
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`เอกสาร_${doc?.studentName || id}.pdf`)
  }

  const canSign = (doc) => {
    if (!doc) return false
    if (doc.status === 'wait_dept_head' && doc.deptHeadEmail === user.email) return true
    if (doc.status === 'wait_asst_dir' && doc.asstDirEmail === user.email) return true
    if (doc.status === 'wait_dept' && doc.targetDeptEmail === user.email) return true
    return false
  }

  const canReturn = (doc) => {
    if (!doc) return false
    return ['wait_dept_head', 'wait_asst_dir', 'wait_dept'].includes(doc.status) &&
      (doc.deptHeadEmail === user.email || doc.asstDirEmail === user.email || doc.targetDeptEmail === user.email)
  }

  const canForwardForm3 = (doc) => {
    if (!doc) return false
    return doc.status === 'wait_asst_dir' && doc.asstDirEmail === user.email && !doc.form3Created
  }

  if (loading) return <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
  if (!doc) return <div className="text-center py-12 text-gray-500">ไม่พบเอกสาร</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">เอกสาร: {doc.studentName}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge status={doc.status} />
            <span className="text-xs text-gray-400">
              {doc.createdAt ? format(new Date(doc.createdAt), 'd MMM yyyy', { locale: th }) : ''}
            </span>
          </div>
        </div>
        <button onClick={handleExportPDF} className="border border-gray-300 text-gray-600 px-3 py-2 rounded-xl text-xs hover:bg-gray-50 transition-colors">
          ⬇ PDF
        </button>
      </div>

      {doc.status === 'returned' && doc.returnReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
          <span className="font-medium">เหตุผลการส่งคืน:</span> {doc.returnReason}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {canSign(doc) && (
          <button onClick={() => setShowSign(true)} disabled={saving}
            className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors">
            ✍️ เซ็นชื่อ
          </button>
        )}
        {canForwardForm3(doc) && (
          <button onClick={() => setShowForm3(true)} disabled={saving}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
            📤 ส่งต่อฝ่าย (เอกสาร 3)
          </button>
        )}
        {canReturn(doc) && (
          <button onClick={() => setShowReturn(true)} disabled={saving}
            className="border border-red-300 text-red-600 px-4 py-2 rounded-xl text-sm hover:bg-red-50 transition-colors">
            ↩️ ส่งคืนแก้ไข
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        {[
          { key: 'doc', label: 'เอกสาร 1+2' },
          { key: 'form3', label: 'เอกสาร 3' },
          { key: 'signatures', label: 'ลายเซ็น' },
          { key: 'log', label: 'ประวัติ' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors
              ${activeTab === tab.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div id="doc-content">
        {activeTab === 'doc' && (
          <div className="space-y-4">
            {/* เอกสาร 1 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">เอกสาร 1</span>
                แบบบันทึกการดูแลช่วยเหลือนักเรียน
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                <InfoRow label="ชื่อ-สกุล" value={doc.studentName} />
                <InfoRow label="ชั้น" value={doc.class} />
                <InfoRow label="เลขที่" value={doc.no} />
                <InfoRow label="เลขประจำตัว" value={doc.studentId} />
                <InfoRow label="ที่อยู่" value={doc.address} span />
                <InfoRow label="โทรศัพท์" value={doc.phone} />
                <InfoRow label="ชื่อผู้ปกครอง" value={doc.parentName} />
                <InfoRow label="เบอร์ผู้ปกครอง" value={doc.parentPhone} />
                <InfoRow label="ครูผู้ให้คำปรึกษา" value={doc.advisorName} />
                <InfoRow label="ตำแหน่ง" value={doc.advisorPosition} />
              </div>

              <h3 className="text-sm font-medium text-gray-600 mb-2 mt-4">บันทึกการดูแล</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-2 py-1.5 text-left text-xs text-gray-600 w-12">ครั้งที่</th>
                      <th className="border border-gray-200 px-2 py-1.5 text-left text-xs text-gray-600 w-28">วันที่</th>
                      <th className="border border-gray-200 px-2 py-1.5 text-left text-xs text-gray-600">เรื่องที่พบ</th>
                      <th className="border border-gray-200 px-2 py-1.5 text-left text-xs text-gray-600">แนวทางช่วยเหลือ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(doc.records || []).map((r, i) => (
                      <tr key={i} className="align-top">
                        <td className="border border-gray-200 px-2 py-2 text-center text-xs">{r.session}</td>
                        <td className="border border-gray-200 px-2 py-2 text-xs">{r.date}</td>
                        <td className="border border-gray-200 px-2 py-2 text-xs">{r.issue}</td>
                        <td className="border border-gray-200 px-2 py-2 text-xs">{r.approach}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* เอกสาร 2 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full">เอกสาร 2</span>
                แบบส่งต่อภายใน
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                <InfoRow label="วันที่" value={doc.referralDate} />
                <InfoRow label="เรียน" value={doc.referralTo} />
                <InfoRow label="สิ่งที่ส่งมาด้วย" value={doc.attachment} span />
              </div>
              {[
                { key: 'problems', label: 'ปัญหาที่พบ' },
                { key: 'helpDone', label: 'การช่วยเหลือเบื้องต้น' },
                { key: 'remaining', label: 'ปัญหาที่ยังคงมีอยู่' },
                { key: 'suggestions', label: 'ข้อเสนอแนะ' },
              ].map(s => (
                <div key={s.key} className="mb-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">{s.label}</div>
                  {(doc[s.key] || []).filter(Boolean).map((v, i) => (
                    <div key={i} className="text-sm text-gray-700 ml-3">{i + 1}. {v}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'form3' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">เอกสาร 3</span>
              บันทึกการติดตามข้อมูลนักเรียน
            </h2>
            {doc.form3 ? (
              <div className="space-y-3 text-sm">
                <InfoRow label="ฝ่ายที่รับผิดชอบ" value={DEPT_OPTIONS.find(d => d.value === doc.form3.targetDept)?.label} />
                <InfoRow label="บันทึก" value={doc.form3.note} />
                <InfoRow label="ส่งโดย" value={doc.form3.createdByName} />
                <InfoRow label="วันที่ส่ง" value={doc.form3.createdAt ? format(new Date(doc.form3.createdAt), 'd MMM yyyy HH:mm', { locale: th }) : ''} />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm">ยังไม่มีเอกสาร 3</p>
                <p className="text-xs text-gray-400 mt-1">ผู้ช่วย ผอ. จะสร้างหลังจากรับเอกสาร 1+2</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'signatures' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">ลายเซ็นผู้เกี่ยวข้อง</h2>
            <div className="space-y-4">
              {[
                { key: 'teacherSig', label: 'ครูที่ปรึกษา', name: doc.createdByName },
                { key: 'deptHeadSig', label: 'หัวหน้าแผนก', name: doc.deptHeadName },
                { key: 'asstDirSig', label: 'ผู้ช่วย ผอ. ฝ่ายกิจการนักเรียน', name: doc.asstDirName },
                { key: 'deptSig', label: 'ฝ่ายที่รับผิดชอบ', name: doc.targetDeptName },
              ].map(sig => (
                <div key={sig.key} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{sig.label}</span>
                    {doc[sig.key] ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">เซ็นแล้ว</span>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">ยังไม่ได้เซ็น</span>
                    )}
                  </div>
                  {sig.name && <div className="text-xs text-gray-500 mb-2">{sig.name}</div>}
                  {doc[sig.key] ? (
                    <img src={doc[sig.key]} alt="ลายเซ็น" className="h-16 border border-gray-200 rounded-lg bg-gray-50 p-1" />
                  ) : (
                    <div className="h-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">ประวัติการดำเนินการ</h2>
            <AuditLog logs={logs} />
          </div>
        )}
      </div>

      {/* Sign Modal */}
      {showSign && <SignaturePad onSave={handleSign} onCancel={() => setShowSign(false)} />}

      {/* Return Modal */}
      {showReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">ส่งคืนเพื่อแก้ไข</h3>
            <p className="text-sm text-gray-500 mb-4">กรุณาระบุเหตุผลที่ส่งคืน</p>
            <textarea
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              rows={4}
              placeholder="เหตุผลการส่งคืน..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowReturn(false)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleReturn} disabled={saving} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50">ส่งคืน</button>
            </div>
          </div>
        </div>
      )}

      {/* Form3 Modal */}
      {showForm3 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">ส่งต่อให้ฝ่าย (เอกสาร 3)</h3>
            <p className="text-sm text-gray-500 mb-4">เลือกฝ่ายที่จะรับผิดชอบดำเนินการต่อ</p>
            <div className="space-y-2 mb-4">
              {DEPT_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors
                  ${selectedDept === opt.value ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                  <input type="radio" name="dept" value={opt.value} checked={selectedDept === opt.value}
                    onChange={e => setSelectedDept(e.target.value)} className="accent-purple-600" />
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            <textarea
              value={form3Note}
              onChange={e => setForm3Note(e.target.value)}
              rows={3}
              placeholder="บันทึกเพิ่มเติม..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowForm3(false)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleForm3} disabled={saving || !selectedDept} className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50">ส่งต่อ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, span }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <span className="text-xs text-gray-400">{label}: </span>
      <span className="text-sm text-gray-700">{value || '-'}</span>
    </div>
  )
}
