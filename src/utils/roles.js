export const ROLES = {
  TEACHER:          'teacher',
  HEAD_KINDERGARTEN:'head_kindergarten',
  HEAD_PRIMARY_LOW: 'head_primary_low',
  HEAD_PRIMARY_HIGH:'head_primary_high',
  HEAD_JUNIOR:      'head_junior',
  HEAD_SENIOR:      'head_senior',
  ASST_DIRECTOR:    'asst_director',
  GUIDANCE:         'guidance',
  DISCIPLINE:       'discipline',
  RELIGIOUS:        'religious',
  ADMIN:            'admin',
}

export const ROLE_LABELS = {
  teacher:           'ครูที่ปรึกษา / ครูที่พบปัญหา',
  head_kindergarten: 'หัวหน้าแผนกอนุบาล',
  head_primary_low:  'หัวหน้าแผนกประถมศึกษาตอนต้น',
  head_primary_high: 'หัวหน้าแผนกประถมศึกษาตอนปลาย',
  head_junior:       'หัวหน้าแผนกมัธยมศึกษาตอนต้น',
  head_senior:       'หัวหน้าแผนกมัธยมศึกษาตอนปลาย',
  asst_director:     'ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน',
  guidance:          'ฝ่ายแนะแนว',
  discipline:        'ฝ่ายพัฒนาวินัย',
  religious:         'ฝ่ายศาสนกิจ',
  admin:             'Admin',
}

export const DOC_STATUS = {
  DRAFT:          'draft',
  WAIT_DEPT_HEAD: 'wait_dept_head',
  WAIT_ASST_DIR:  'wait_asst_dir',
  WAIT_DEPT:      'wait_dept',
  COMPLETED:      'completed',
  RETURNED:       'returned',
}

export const STATUS_LABELS = {
  draft:          'ร่าง',
  wait_dept_head: 'รอหัวหน้าแผนกเซ็น',
  wait_asst_dir:  'รอผู้ช่วย ผอ. เซ็น',
  wait_dept:      'รอฝ่ายดำเนินการ',
  completed:      'สมบูรณ์',
  returned:       'ส่งคืนแก้ไข',
}

export const STATUS_COLORS = {
  draft:          'bg-gray-100 text-gray-700',
  wait_dept_head: 'bg-yellow-100 text-yellow-800',
  wait_asst_dir:  'bg-blue-100 text-blue-800',
  wait_dept:      'bg-purple-100 text-purple-800',
  completed:      'bg-green-100 text-green-800',
  returned:       'bg-red-100 text-red-800',
}
