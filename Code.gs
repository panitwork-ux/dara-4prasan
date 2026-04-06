// ==========================================
// ระบบ 4 ประสาน 3 สายใย - โรงเรียนดาราวิทยาลัย
// Google Apps Script Backend
// ==========================================

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID' // ← ใส่ ID ของ Google Sheet ที่นี่
const ss = SpreadsheetApp.openById(SHEET_ID)

// ชื่อ Sheet แต่ละแท็บ
const SHEETS = {
  DOCUMENTS: 'Documents',
  FORM3: 'Form3',
  AUDIT: 'AuditLog',
  USERS: 'Users',
}

// ==========================================
// Entry Point
// ==========================================
function doPost(e) {
  const data = JSON.parse(e.postData.contents)
  const { action } = data
  let result

  try {
    if (action === 'createForm1')     result = createForm1(data)
    else if (action === 'getForm1')   result = getForm1(data)
    else if (action === 'createForm3') result = createForm3(data)
    else if (action === 'getForm3')   result = getForm3(data)
    else if (action === 'signDocument') result = signDocument(data)
    else if (action === 'returnDocument') result = returnDocument(data)
    else if (action === 'getMyDocuments') result = getMyDocuments(data)
    else if (action === 'getAuditLog') result = getAuditLog(data)
    else result = { success: false, error: 'Unknown action: ' + action }
  } catch (err) {
    result = { success: false, error: err.message }
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'ระบบ 4 ประสาน 3 สายใย API' }))
    .setMimeType(ContentService.MimeType.JSON)
}

// ==========================================
// สร้างเอกสาร 1+2
// ==========================================
function createForm1(data) {
  const sheet = getOrCreateSheet(SHEETS.DOCUMENTS)

  // สร้าง header ถ้ายังไม่มี
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'docId', 'studentName', 'class', 'no', 'studentId',
      'address', 'phone', 'parentName', 'parentPhone',
      'advisorName', 'advisorPosition',
      'records',
      'referralDate', 'referralTo', 'attachment',
      'problems', 'helpDone', 'remaining', 'suggestions',
      'createdByEmail', 'createdByName', 'createdByPhoto',
      'status', 'createdAt',
      'deptHeadEmail', 'deptHeadName', 'deptHeadSig', 'deptHeadSignedAt',
      'asstDirEmail', 'asstDirName', 'asstDirSig', 'asstDirSignedAt',
      'targetDept', 'targetDeptEmail', 'targetDeptName', 'targetDeptSig', 'targetDeptSignedAt',
      'teacherSig', 'teacherSignedAt',
      'returnReason', 'form3Created'
    ])
  }

  const docId = Utilities.getUuid()
  const now = new Date().toISOString()

  sheet.appendRow([
    docId,
    data.studentName || '',
    data.class || '',
    data.no || '',
    data.studentId || '',
    data.address || '',
    data.phone || '',
    data.parentName || '',
    data.parentPhone || '',
    data.advisorName || '',
    data.advisorPosition || '',
    JSON.stringify(data.records || []),
    data.referralDate || '',
    data.referralTo || '',
    data.attachment || '',
    JSON.stringify(data.problems || []),
    JSON.stringify(data.helpDone || []),
    JSON.stringify(data.remaining || []),
    JSON.stringify(data.suggestions || []),
    data.createdByEmail || '',
    data.createdByName || '',
    data.createdByPhoto || '',
    'wait_dept_head', // status เริ่มต้น
    now,
    '', '', '', '',   // dept head fields
    '', '', '', '',   // asst dir fields
    '', '', '', '', '', // dept fields
    '', '',           // teacher sig
    '', false         // return reason, form3Created
  ])

  addAuditLog(docId, 'created', data.createdByEmail, data.createdByName, 'สร้างเอกสารและส่งให้หัวหน้าแผนกเซ็น')

  return { success: true, docId }
}

// ==========================================
// ดึงเอกสาร 1+2
// ==========================================
function getForm1(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCUMENTS)
  if (!sheet) return { success: false, error: 'ไม่พบ Sheet' }

  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row[0] !== data.docId) continue

    const doc = {}
    headers.forEach((h, j) => { doc[h] = row[j] })

    // Parse JSON fields
    try { doc.records = JSON.parse(doc.records || '[]') } catch (e) { doc.records = [] }
    try { doc.problems = JSON.parse(doc.problems || '[]') } catch (e) { doc.problems = [] }
    try { doc.helpDone = JSON.parse(doc.helpDone || '[]') } catch (e) { doc.helpDone = [] }
    try { doc.remaining = JSON.parse(doc.remaining || '[]') } catch (e) { doc.remaining = [] }
    try { doc.suggestions = JSON.parse(doc.suggestions || '[]') } catch (e) { doc.suggestions = [] }

    return { success: true, document: doc }
  }

  return { success: false, error: 'ไม่พบเอกสาร' }
}

// ==========================================
// เซ็นชื่อ
// ==========================================
function signDocument(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCUMENTS)
  if (!sheet) return { success: false, error: 'ไม่พบ Sheet' }

  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]
  const now = new Date().toISOString()

  const col = (name) => headers.indexOf(name) + 1

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] !== data.docId) continue

    const status = rows[i][col('status') - 1]
    let newStatus = status
    let sigCol = ''
    let sigAtCol = ''
    let action = 'signed'

    if (status === 'wait_dept_head') {
      // หัวหน้าแผนกเซ็น → เปลี่ยนเป็น wait_asst_dir
      sheet.getRange(i + 1, col('deptHeadEmail')).setValue(data.signerEmail)
      sheet.getRange(i + 1, col('deptHeadName')).setValue(data.signerName)
      sheet.getRange(i + 1, col('deptHeadSig')).setValue(data.signature)
      sheet.getRange(i + 1, col('deptHeadSignedAt')).setValue(now)
      newStatus = 'wait_asst_dir'
      action = 'signed_dept_head'
    } else if (status === 'wait_asst_dir') {
      // ผู้ช่วย ผอ. เซ็น → เปลี่ยนเป็น wait_dept (รอสร้าง Form3)
      sheet.getRange(i + 1, col('asstDirEmail')).setValue(data.signerEmail)
      sheet.getRange(i + 1, col('asstDirName')).setValue(data.signerName)
      sheet.getRange(i + 1, col('asstDirSig')).setValue(data.signature)
      sheet.getRange(i + 1, col('asstDirSignedAt')).setValue(now)
      newStatus = 'wait_dept'
      action = 'signed_asst_dir'
    } else if (status === 'wait_dept') {
      // ฝ่ายเซ็น → completed
      sheet.getRange(i + 1, col('targetDeptSig')).setValue(data.signature)
      sheet.getRange(i + 1, col('targetDeptSignedAt')).setValue(now)
      newStatus = 'completed'
      action = 'signed_dept'
    } else {
      return { success: false, error: 'ไม่สามารถเซ็นในสถานะนี้ได้' }
    }

    sheet.getRange(i + 1, col('status')).setValue(newStatus)
    addAuditLog(data.docId, action, data.signerEmail, data.signerName, 'เซ็นชื่อรับรองเอกสาร')

    if (newStatus === 'completed') {
      addAuditLog(data.docId, 'completed', data.signerEmail, data.signerName, 'เอกสารสมบูรณ์')
    }

    return { success: true, newStatus }
  }

  return { success: false, error: 'ไม่พบเอกสาร' }
}

// ==========================================
// ส่งคืน
// ==========================================
function returnDocument(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCUMENTS)
  if (!sheet) return { success: false, error: 'ไม่พบ Sheet' }

  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]
  const col = (name) => headers.indexOf(name) + 1

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] !== data.docId) continue

    sheet.getRange(i + 1, col('status')).setValue('returned')
    sheet.getRange(i + 1, col('returnReason')).setValue(data.reason || '')

    // รีเซ็ต signatures ทั้งหมด
    sheet.getRange(i + 1, col('deptHeadSig')).setValue('')
    sheet.getRange(i + 1, col('deptHeadSignedAt')).setValue('')
    sheet.getRange(i + 1, col('asstDirSig')).setValue('')
    sheet.getRange(i + 1, col('asstDirSignedAt')).setValue('')
    sheet.getRange(i + 1, col('targetDeptSig')).setValue('')
    sheet.getRange(i + 1, col('targetDeptSignedAt')).setValue('')

    addAuditLog(data.docId, 'returned', data.byEmail, data.byName, data.reason || 'ส่งคืนเพื่อแก้ไข')

    return { success: true }
  }

  return { success: false, error: 'ไม่พบเอกสาร' }
}

// ==========================================
// สร้างเอกสาร 3 (ผู้ช่วย ผอ. ส่งต่อฝ่าย)
// ==========================================
function createForm3(data) {
  const sheet = getOrCreateSheet(SHEETS.FORM3)
  const docSheet = ss.getSheetByName(SHEETS.DOCUMENTS)

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['form3Id', 'docId', 'targetDept', 'targetDeptEmail',
      'note', 'createdByEmail', 'createdByName', 'createdAt', 'status'])
  }

  const form3Id = Utilities.getUuid()
  const now = new Date().toISOString()

  // Map dept to email (ตั้งค่าอีเมลของแต่ละฝ่ายที่นี่)
  const DEPT_EMAILS = {
    guidance: 'guidance@dara.ac.th',
    discipline: 'discipline@dara.ac.th',
    academic: 'academic@dara.ac.th',
  }

  sheet.appendRow([
    form3Id,
    data.docId,
    data.targetDept,
    DEPT_EMAILS[data.targetDept] || '',
    data.note || '',
    data.createdByEmail,
    data.createdByName,
    now,
    'pending'
  ])

  // อัปเดต Documents sheet ว่าสร้าง Form3 แล้ว และใครรับผิดชอบ
  if (docSheet) {
    const rows = docSheet.getDataRange().getValues()
    const headers = rows[0]
    const col = (name) => headers.indexOf(name) + 1

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] !== data.docId) continue
      sheet.getRange(i + 1, col('form3Created')).setValue(true)
      docSheet.getRange(i + 1, col('targetDept')).setValue(data.targetDept)
      docSheet.getRange(i + 1, col('targetDeptEmail')).setValue(DEPT_EMAILS[data.targetDept] || '')
      break
    }
  }

  addAuditLog(data.docId, 'forwarded', data.createdByEmail, data.createdByName,
    'ส่งต่อให้ฝ่าย: ' + data.targetDept)

  return { success: true, form3Id }
}

// ==========================================
// ดึงเอกสาร 3
// ==========================================
function getForm3(data) {
  const sheet = ss.getSheetByName(SHEETS.FORM3)
  if (!sheet) return { success: true, form3: null }

  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] !== data.docId) continue
    const form3 = {}
    headers.forEach((h, j) => { form3[h] = rows[i][j] })
    return { success: true, form3 }
  }

  return { success: true, form3: null }
}

// ==========================================
// ดึงเอกสารทั้งหมดของผู้ใช้
// ==========================================
function getMyDocuments(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCUMENTS)
  if (!sheet) return { success: true, documents: [] }

  const rows = sheet.getDataRange().getValues()
  if (rows.length < 2) return { success: true, documents: [] }

  const headers = rows[0]
  const documents = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const doc = {}
    headers.forEach((h, j) => { doc[h] = row[j] })

    // เช็คว่า user คนนี้เกี่ยวข้องกับ doc นี้ไหม
    const isRelated =
      doc.createdByEmail === data.email ||
      doc.deptHeadEmail === data.email ||
      doc.asstDirEmail === data.email ||
      doc.targetDeptEmail === data.email

    if (!isRelated) continue

    // ไม่ส่ง signature base64 เพื่อลดขนาด response
    const light = {
      docId: doc.docId,
      studentName: doc.studentName,
      class: doc.class,
      no: doc.no,
      studentId: doc.studentId,
      createdByName: doc.createdByName,
      createdByEmail: doc.createdByEmail,
      status: doc.status,
      createdAt: doc.createdAt,
      returnReason: doc.returnReason,
    }
    documents.push(light)
  }

  // เรียงจากใหม่ไปเก่า
  documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return { success: true, documents }
}

// ==========================================
// Audit Log
// ==========================================
function addAuditLog(docId, action, byEmail, byName, note) {
  const sheet = getOrCreateSheet(SHEETS.AUDIT)

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['docId', 'action', 'byEmail', 'byName', 'note', 'at'])
  }

  sheet.appendRow([
    docId, action, byEmail || '', byName || '',
    note || '', new Date().toISOString()
  ])
}

function getAuditLog(data) {
  const sheet = ss.getSheetByName(SHEETS.AUDIT)
  if (!sheet) return { success: true, logs: [] }

  const rows = sheet.getDataRange().getValues()
  if (rows.length < 2) return { success: true, logs: [] }

  const headers = rows[0]
  const logs = []

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] !== data.docId) continue
    const log = {}
    headers.forEach((h, j) => { log[h] = rows[i][j] })
    logs.push(log)
  }

  return { success: true, logs }
}

// ==========================================
// Helper
// ==========================================
function getOrCreateSheet(name) {
  return ss.getSheetByName(name) || ss.insertSheet(name)
}
