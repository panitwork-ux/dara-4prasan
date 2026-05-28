import { STATUS_LABELS, STATUS_COLOR } from '../utils/roles'

export default function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || { bg:'#f1f5f9', text:'#64748b', dot:'#94a3b8' }
  const label = STATUS_LABELS[status] || status
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:'6px',
      background: c.bg, color: c.text,
      borderRadius:'100px', padding:'5px 12px',
      fontSize:'13px', fontWeight:'600', whiteSpace:'nowrap',
      fontFamily:"'Sarabun',sans-serif",
    }}>
      <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:c.dot, flexShrink:0 }}/>
      {label}
    </span>
  )
}
