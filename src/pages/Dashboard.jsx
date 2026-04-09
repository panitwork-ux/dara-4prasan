import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyDocuments } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user) loadDocs()
  }, [user])

  const loadDocs = async () => {
    setLoading(true)
    try {
      const res = await getMyDocuments(user.email, '')
      if (res.success) setDocs(res.documents || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter)

  const counts = {
    all: docs.length,
    wait_dept_head: docs.filter(d => d.status === 'wait_dept_head').length,
    wait_asst_dir: docs.filter(d => d.status === 'wait_asst_dir').length,
    wait_dept: docs.filter(d => d.status === 'wait_dept').length,
    completed: docs.filter(d => d.status === 'completed').length,
    returned: docs.filter(d => d.status === 'returned').length,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">หน้าหลัก</h1>
          <p className="text-sm text-gray-500 mt-0.5">สวัสดี, {user?.displayName}</p>
        </div>
        <button
          onClick={() => navigate('/document/new')}
          className="bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> สร้างเอกสารใหม่
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {[
          { key: 'all', label: 'ทั้งหมด', color: 'bg-gray-100 text-gray-700' },
          { key: 'wait_dept_head', label: 'รอหัวหน้าแผนก', color: 'bg-yellow-100 text-yellow-800' },
          { key: 'wait_asst_dir', label: 'รอผู้ช่วย ผอ.', color: 'bg-blue-100 text-blue-800' },
          { key: 'wait_dept', label: 'รอฝ่าย', color: 'bg-purple-100 text-purple-800' },
          { key: 'completed', label: 'สมบูรณ์', color: 'bg-green-100 text-green-800' },
          { key: 'returned', label: 'ส่งคืน', color: 'bg-red-100 text-red-800' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`rounded-xl p-3 text-center transition-all border-2 ${filter === item.key ? 'border-blue-500 shadow-sm' : 'border-transparent'} ${item.color}`}
          >
            <div className="text-xl font-bold">{counts[item.key]}</div>
            <div className="text-xs mt-0.5 leading-tight">{item.label}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📄</div>
          <div className="text-gray-500">ยังไม่มีเอกสาร</div>
          <button onClick={() => navigate('/document/new')} className="mt-4 text-blue-600 text-sm hover:underline">
            สร้างเอกสารใหม่
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <div
              key={doc.docId}
              onClick={() => navigate(`/document/${doc.docId}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{doc.studentName}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    ชั้น {doc.class} เลขที่ {doc.no} | {doc.createdByName}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {doc.createdAt ? format(new Date(doc.createdAt), 'd MMM yyyy', { locale: th }) : ''}
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <StatusBadge status={doc.status} />
                  {doc.status === 'returned' && (
                    <span className="text-xs text-red-500">ต้องแก้ไข</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
