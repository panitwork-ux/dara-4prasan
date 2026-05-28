export const ROLE_LABELS = {
  teacher:           'ครูที่ปรึกษา / ครูผู้สอน',
  head_kindergarten: 'หัวหน้าแผนกปฐมวัย',
  head_primary_low:  'หัวหน้าแผนกประถมศึกษาตอนต้น',
  head_primary_high: 'หัวหน้าแผนกประถมศึกษาตอนปลาย',
  head_junior:       'หัวหน้าแผนกมัธยมศึกษาตอนต้น',
  head_senior:       'หัวหน้าแผนกมัธยมศึกษาตอนปลาย',
  asst_director:     'ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน',
  chief_guidance:    'หัวหน้างานฝ่ายแนะแนว',
  chief_discipline:  'หัวหน้างานฝ่ายพัฒนาวินัย',
  chief_nurse:       'หัวหน้างานฝ่ายพยาบาล',
  chief_religious:   'หัวหน้างานฝ่ายศาสนกิจ',
  guidance:          'ครูฝ่ายแนะแนว',
  discipline:        'ครูฝ่ายพัฒนาวินัย',
  nurse:             'ครูพยาบาล',
  religious:         'ครูฝ่ายศาสนกิจ',
  admin:             'Admin',
}

export const ROLE_POSITION = {
  teacher:           'ครูที่ปรึกษา / ครูผู้สอน',
  head_kindergarten: 'หัวหน้าแผนกปฐมวัย',
  head_primary_low:  'หัวหน้าแผนกประถมศึกษาตอนต้น',
  head_primary_high: 'หัวหน้าแผนกประถมศึกษาตอนปลาย',
  head_junior:       'หัวหน้าแผนกมัธยมศึกษาตอนต้น',
  head_senior:       'หัวหน้าแผนกมัธยมศึกษาตอนปลาย',
  asst_director:     'ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน',
  chief_guidance:    'หัวหน้างานฝ่ายแนะแนว',
  chief_discipline:  'หัวหน้างานฝ่ายพัฒนาวินัย',
  chief_nurse:       'หัวหน้างานฝ่ายพยาบาล',
  chief_religious:   'หัวหน้างานฝ่ายศาสนกิจ',
  guidance:          'ครูแนะแนว',
  discipline:        'ครูพัฒนาวินัย',
  nurse:             'ครูพยาบาล',
  religious:         'ครูศาสนกิจ',
  admin:             'Admin',
}

export const DEPT_HEAD_ROLES  = ['head_kindergarten','head_primary_low','head_primary_high','head_junior','head_senior']
export const DEPT_CHIEF_ROLES = ['chief_guidance','chief_discipline','chief_nurse','chief_religious']
export const DEPT_STAFF_ROLES = ['guidance','discipline','nurse','religious']

export const STATUS_LABELS = {
  wait_dept_head: 'รอหัวหน้าแผนกเซ็น',
  wait_asst_dir:  'รอผู้ช่วย ผอ. เซ็น',
  wait_chief:     'รอหัวหน้างานมอบหมาย',
  in_progress:    'กำลังดำเนินการ',
  completed:      'สมบูรณ์',
  returned:       'ส่งคืนแก้ไข',
}

export const STATUS_COLOR = {
  wait_dept_head: { bg:'#fffbeb', text:'#92400e', dot:'#f59e0b' },
  wait_asst_dir:  { bg:'#f5f3ff', text:'#5b21b6', dot:'#8b5cf6' },
  wait_chief:     { bg:'#ecfeff', text:'#155e75', dot:'#06b6d4' },
  in_progress:    { bg:'#eff6ff', text:'#1e40af', dot:'#3b82f6' },
  completed:      { bg:'#f0fdf4', text:'#166534', dot:'#22c55e' },
  returned:       { bg:'#fef2f2', text:'#991b1b', dot:'#ef4444' },
}
