import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

const ss = { fontFamily:"'Sarabun',sans-serif" }

export default function SignaturePad({ onSave, onCancel }) {
  const ref = useRef()
  const [isEmpty, setIsEmpty] = useState(true)
  const [mode, setMode] = useState('draw') // 'draw' | 'upload'
  const [uploadedSig, setUploadedSig] = useState(null)
  const fileRef = useRef()

  const handleSave = () => {
    if (mode === 'draw') {
      if (ref.current.isEmpty()) { alert('กรุณาเซ็นชื่อก่อนบันทึก'); return }
      onSave(ref.current.getTrimmedCanvas().toDataURL('image/png'))
    } else {
      if (!uploadedSig) { alert('กรุณาแนบรูปลายเซ็นก่อน'); return }
      onSave(uploadedSig)
    }
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('ไฟล์ต้องไม่เกิน 2MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setUploadedSig(ev.target.result)
    reader.readAsDataURL(file)
  }

  const canConfirm = mode === 'draw' ? !isEmpty : !!uploadedSig

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'24px',
        width:'100%', maxWidth:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', ...ss }}>

        <h3 style={{ fontSize:'17px', fontWeight:'700', color:'#0f172a', margin:'0 0 4px', ...ss }}>✍️ เซ็นชื่อดิจิทัล</h3>
        <p style={{ fontSize:'13px', color:'#64748b', margin:'0 0 16px', ...ss }}>เลือกวิธีเซ็นชื่อ</p>

        {/* Mode tabs */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'16px', background:'#f1f5f9',
          borderRadius:'12px', padding:'4px' }}>
          {[['draw','✏️ เซ็นชื่อเอง'],['upload','📎 แนบรูปลายเซ็น']].map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer',
              fontSize:'13px', fontWeight:'600', transition:'all 0.15s', ...ss,
              background: mode === m ? '#fff' : 'transparent',
              color: mode === m ? '#1d4ed8' : '#64748b',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>{l}</button>
          ))}
        </div>

        {/* Draw mode */}
        {mode === 'draw' && (
          <>
            <div style={{ border:'2px dashed #cbd5e1', borderRadius:'14px',
              background:'#f8fafc', overflow:'hidden', marginBottom:'12px' }}>
              <SignatureCanvas
                ref={ref}
                penColor="#1e3a5f"
                onBegin={() => setIsEmpty(false)}
                canvasProps={{ style:{ width:'100%', height:'160px', display:'block' } }}
              />
            </div>
            <button onClick={() => { ref.current.clear(); setIsEmpty(true) }}
              style={{ background:'none', border:'none', color:'#64748b', fontSize:'12px',
                cursor:'pointer', marginBottom:'12px', ...ss }}>🔄 ล้างและเซ็นใหม่</button>
          </>
        )}

        {/* Upload mode */}
        {mode === 'upload' && (
          <div style={{ marginBottom:'12px' }}>
            <div onClick={() => fileRef.current.click()} style={{
              border:'2px dashed #cbd5e1', borderRadius:'14px', background:'#f8fafc',
              height:'160px', display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', cursor:'pointer', marginBottom:'8px',
              transition:'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
              {uploadedSig
                ? <img src={uploadedSig} style={{ maxHeight:'140px', maxWidth:'100%', objectFit:'contain' }}/>
                : <>
                    <div style={{ fontSize:'32px', marginBottom:'8px' }}>🖼️</div>
                    <div style={{ fontSize:'13px', color:'#64748b', ...ss }}>คลิกเพื่อเลือกไฟล์รูปลายเซ็น</div>
                    <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'4px', ...ss }}>PNG, JPG ไม่เกิน 2MB</div>
                  </>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload}
              style={{ display:'none' }}/>
            {uploadedSig && (
              <button onClick={() => setUploadedSig(null)}
                style={{ background:'none', border:'none', color:'#64748b', fontSize:'12px', cursor:'pointer', ...ss }}>
                🔄 เปลี่ยนรูป
              </button>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display:'flex', gap:'8px' }}>
          {onCancel && (
            <button onClick={onCancel} style={{
              flex:1, padding:'11px', border:'1px solid #e2e8f0', borderRadius:'12px',
              color:'#64748b', fontSize:'14px', cursor:'pointer', background:'#f8fafc', ...ss,
            }}>ยกเลิก</button>
          )}
          <button onClick={handleSave} disabled={!canConfirm} style={{
            flex:2, padding:'11px',
            background: canConfirm ? 'linear-gradient(135deg,#1d4ed8,#4f46e5)' : '#e2e8f0',
            color: canConfirm ? '#fff' : '#94a3b8',
            border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'600',
            cursor: canConfirm ? 'pointer' : 'not-allowed', ...ss,
          }}>✓ ยืนยันลายเซ็น</button>
        </div>
      </div>
    </div>
  )
}
