import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function SignaturePad({ onSave, onCancel }) {
  const ref = useRef()
  const [isEmpty, setIsEmpty] = useState(true)

  const handleSave = () => {
    if (ref.current.isEmpty()) {
      alert('กรุณาเซ็นชื่อก่อนบันทึก')
      return
    }
    const base64 = ref.current.getTrimmedCanvas().toDataURL('image/png')
    onSave(base64)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">เซ็นชื่อดิจิทัล</h3>
        <p className="text-sm text-gray-500 mb-4">เซ็นชื่อในกรอบด้านล่าง</p>

        <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
          <SignatureCanvas
            ref={ref}
            penColor="#1e3a5f"
            onBegin={() => setIsEmpty(false)}
            canvasProps={{
              className: 'w-full',
              style: { width: '100%', height: '160px', display: 'block' },
            }}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { ref.current.clear(); setIsEmpty(true) }}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            ล้าง
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isEmpty}
            className="flex-1 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ยืนยันลายเซ็น
          </button>
        </div>
      </div>
    </div>
  )
}
