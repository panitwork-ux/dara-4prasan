import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const ACTION_LABELS = {
  created: '📝 สร้างเอกสาร',
  signed_teacher: '✍️ ครูเซ็นชื่อ',
  signed_dept_head: '✍️ หัวหน้าแผนกเซ็นชื่อ',
  signed_asst_dir: '✍️ ผู้ช่วย ผอ. เซ็นชื่อ',
  signed_dept: '✍️ ฝ่ายเซ็นชื่อ',
  returned: '↩️ ส่งคืนแก้ไข',
  forwarded: '📤 ส่งต่อ',
  completed: '✅ เอกสารสมบูรณ์',
}

export default function AuditLog({ logs = [] }) {
  if (!logs.length) return (
    <div className="text-sm text-gray-400 text-center py-4">ยังไม่มีประวัติการดำเนินการ</div>
  )

  return (
    <div className="space-y-3">
      {logs.map((log, i) => (
        <div key={i} className="flex gap-3 text-sm">
          <div className="flex-shrink-0 w-1 bg-blue-200 rounded-full relative">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
          </div>
          <div className="pb-3 flex-1">
            <div className="font-medium text-gray-700">{ACTION_LABELS[log.action] || log.action}</div>
            <div className="text-gray-500 text-xs mt-0.5">{log.by}</div>
            {log.note && <div className="text-gray-500 text-xs mt-0.5 italic">"{log.note}"</div>}
            <div className="text-gray-400 text-xs mt-0.5">
              {log.at ? format(new Date(log.at), 'd MMM yyyy HH:mm', { locale: th }) : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
