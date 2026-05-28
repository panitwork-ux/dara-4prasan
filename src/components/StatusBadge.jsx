import { STATUS_LABELS, STATUS_COLOR } from '../utils/roles'
const ss = { fontFamily:"'Sarabun',sans-serif" }
export default function StatusBadge({ status, size = 'sm' }) {
  const c = STATUS_COLOR[status] || { bg:'#f8fafc', text:'#475569', dot:'#94a3b8' }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'5px',
      background:c.bg, color:c.text, padding:'3px 10px', borderRadius:'100px',
      fontSize:'11px', fontWeight:'600', whiteSpace:'nowrap', ...ss }}>
      <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:c.dot, flexShrink:0 }}/>
      {STATUS_LABELS[status] || status}
    </span>
  )
}
