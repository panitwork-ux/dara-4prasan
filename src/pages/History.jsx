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

  useEffect(() => {
    if (user) load()
  }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getMyDocuments(user.email, '')
      if (res.success) setDocs(res.documents || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const filtered = docs.filter(d =>
    d.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    d.class?.toLowerCase().includes(search.toLowerCase()) ||
    d.createdByName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-5">ประวัติเอกสารทั้งหมด</h1>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="ค้นหาชื่อนักเรียน, ชั้น, ครู..."
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 mb-5"
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">ไม่พบเอกสาร</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">นักเรียน</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">ชั้น</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium hidden sm:table-cell">ครูที่ปรึกษา</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium hidden sm:table-cell">วันที่</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(doc => (
                <tr
                  key={doc.docId}
                  onClick={() => navigate(`/document/${doc.docId}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{doc.studentName}</td>
                  <td className="px-4 py-3 text-gray-500">{doc.class}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{doc.createdByName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                    {doc.createdAt ? format(new Date(doc.createdAt), 'd MMM yyyy', { locale: th }) : ''}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
