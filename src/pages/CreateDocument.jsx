import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createForm1 } from '../utils/api'

const PROBLEM_TYPES = [
  'ปัญหาการเรียน', 'ปัญหาพฤติกรรม', 'ปัญหาครอบครัว',
  'ปัญหาสุขภาพ', 'ปัญหาเศรษฐกิจ', 'ปัญหาความสัมพันธ์', 'อื่นๆ',
]

export default function CreateDocument() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    // ข้อมูลนักเรียน
    studentName: '',
    class: '',
    no: '',
    studentId: '',
    address: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    advisorName: user?.displayName || '',
    advisorPosition: '',
    // บันทึกการดูแล (ตาราง)
    records: [
      { session: 1, date: '', issue: '', approach: '' },
      { session: 2, date: '', issue: '', approach: '' },
      { session: 3, date: '', issue: '', approach: '' },
    ],
    // แบบส่งต่อ (Form 2)
    referralDate: new Date().toISOString().slice(0, 10),
    referralTo: '',
    attachment: '',
    problems: ['', '', ''],
    helpDone: ['', '', ''],
    remaining: ['', '', ''],
    suggestions: ['', '', ''],
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const setRecord = (i, key, val) => {
    const records = [...form.records]
    records[i] = { ...records[i], [key]: val }
    setForm(f => ({ ...f, records }))
  }

  const setListItem = (key, i, val) => {
    const arr = [...form[key]]
    arr[i] = val
    setForm(f => ({ ...f, [key]: arr }))
  }

  const addRecord = () => {
    const records = [...form.records, { session: form.records.length + 1, date: '', issue: '', approach: '' }]
    setForm(f => ({ ...f, records }))
  }

  const validate1 = () => {
    const e = {}
    if (!form.studentName.trim()) e.studentName = 'กรุณากรอกชื่อนักเรียน'
    if (!form.class.trim()) e.class = 'กรุณากรอกชั้น'
    if (!form.advisorName.trim()) e.advisorName = 'กรุณากรอกชื่อครู'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validate2 = () => {
    const e = {}
    if (!form.referralTo.trim()) e.referralTo = 'กรุณาระบุผู้รับ'
    if (!form.problems[0].trim()) e.problem0 = 'กรุณาระบุปัญหาอย่างน้อย 1 ข้อ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validate1()) setStep(2)
  }

  const handleSubmit = async () => {
    if (!validate2()) return
    setSaving(true)
    try {
      const res = await createForm1({
        ...form,
        createdByEmail: user.email,
        createdByName: user.displayName,
        createdByPhoto: user.photoURL,
      })
      if (res.success) {
        navigate(`/document/${res.docId}`)
      } else {
        alert('เกิดข้อผิดพลาด: ' + res.error)
      }
    } catch (e) {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step === 1 ? navigate('/dashboard') : setStep(1)} className="text-gray-400 hover:text-gray-600">
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">สร้างเอกสารใหม่</h1>
          <p className="text-sm text-gray-500">
            {step === 1 ? 'เอกสาร 1 : แบบบันทึกการดูแลช่วยเหลือนักเรียน' : 'เอกสาร 2 : แบบส่งต่อภายใน'}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${step >= s ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {s}
            </div>
            <span className={`text-xs ${step === s ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
              {s === 1 ? 'แบบบันทึกการดูแล' : 'แบบส่งต่อภายใน'}
            </span>
            {s < 2 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          {/* ข้อมูลนักเรียน */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">ข้อมูลนักเรียน</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">ชื่อ - สกุล นักเรียน <span className="text-red-500">*</span></label>
                <input value={form.studentName} onChange={e => set('studentName', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.studentName ? 'border-red-400' : 'border-gray-300'}`} />
                {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ชั้น <span className="text-red-500">*</span></label>
                <input value={form.class} onChange={e => set('class', e.target.value)} placeholder="เช่น ม.3/2"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.class ? 'border-red-400' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เลขที่</label>
                <input value={form.no} onChange={e => set('no', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เลขประจำตัว</label>
                <input value={form.studentId} onChange={e => set('studentId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">โทรศัพท์</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">ที่อยู่</label>
                <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ชื่อ - สกุล ผู้ปกครอง</label>
                <input value={form.parentName} onChange={e => set('parentName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เบอร์โทรผู้ปกครอง</label>
                <input value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ครูผู้ให้คำปรึกษา <span className="text-red-500">*</span></label>
                <input value={form.advisorName} onChange={e => set('advisorName', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.advisorName ? 'border-red-400' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ตำแหน่ง</label>
                <input value={form.advisorPosition} onChange={e => set('advisorPosition', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
          </div>

          {/* ตารางบันทึก */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">บันทึกการดูแลช่วยเหลือ</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-gray-200 px-3 py-2 text-left text-gray-700 w-14">ครั้งที่</th>
                    <th className="border border-gray-200 px-3 py-2 text-left text-gray-700 w-32">วัน/เดือน/ปี</th>
                    <th className="border border-gray-200 px-3 py-2 text-left text-gray-700">เรื่องที่พบ / ปัญหา</th>
                    <th className="border border-gray-200 px-3 py-2 text-left text-gray-700">แนวทางการช่วยเหลือ</th>
                  </tr>
                </thead>
                <tbody>
                  {form.records.map((r, i) => (
                    <tr key={i}>
                      <td className="border border-gray-200 px-3 py-1 text-center text-gray-600">{r.session}</td>
                      <td className="border border-gray-200 px-1 py-1">
                        <input type="date" value={r.date} onChange={e => setRecord(i, 'date', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs focus:outline-none focus:bg-blue-50 rounded" />
                      </td>
                      <td className="border border-gray-200 px-1 py-1">
                        <textarea value={r.issue} onChange={e => setRecord(i, 'issue', e.target.value)} rows={2}
                          className="w-full px-2 py-1.5 text-xs focus:outline-none focus:bg-blue-50 rounded resize-none" />
                      </td>
                      <td className="border border-gray-200 px-1 py-1">
                        <textarea value={r.approach} onChange={e => setRecord(i, 'approach', e.target.value)} rows={2}
                          className="w-full px-2 py-1.5 text-xs focus:outline-none focus:bg-blue-50 rounded resize-none" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addRecord} className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>+</span> เพิ่มแถว
            </button>
          </div>

          <div className="flex justify-end">
            <button onClick={handleNext} className="bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors">
              ถัดไป: แบบส่งต่อ →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">แบบส่งต่อภายใน (เอกสาร 2)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">วันที่</label>
                <input type="date" value={form.referralDate} onChange={e => set('referralDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เรียน (ส่งต่อถึง) <span className="text-red-500">*</span></label>
                <input value={form.referralTo} onChange={e => set('referralTo', e.target.value)}
                  placeholder="ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.referralTo ? 'border-red-400' : 'border-gray-300'}`} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">สิ่งที่ส่งมาด้วย</label>
                <input value={form.attachment} onChange={e => set('attachment', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>

            {[
              { key: 'problems', label: 'ปัญหาที่พบสรุปได้ดังนี้', required: true, errKey: 'problem0' },
              { key: 'helpDone', label: 'และได้ดำเนินการช่วยเหลือเบื้องต้นแล้วดังนี้' },
              { key: 'remaining', label: 'แต่ยังคงมีปัญหาดังนี้' },
              { key: 'suggestions', label: 'ข้อเสนอแนะอื่นๆ' },
            ].map(section => (
              <div key={section.key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {section.label} {section.required && <span className="text-red-500">*</span>}
                </label>
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-sm text-gray-500 mt-2 w-4 flex-shrink-0">{i + 1}.</span>
                    <input
                      value={form[section.key][i]}
                      onChange={e => setListItem(section.key, i, e.target.value)}
                      className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300
                        ${section.errKey === `problem${i}` && errors[section.errKey] ? 'border-red-400' : 'border-gray-300'}`}
                    />
                  </div>
                ))}
                {section.required && errors[section.errKey] && (
                  <p className="text-red-500 text-xs mt-1">{errors[section.errKey]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              ← กลับ
            </button>
            <button onClick={handleSubmit} disabled={saving} className="bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {saving ? 'กำลังบันทึก...' : 'บันทึกและส่ง ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
