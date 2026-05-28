// ==========================================
// ระบบ 4 ประสาน 3 สายใย - โรงเรียนดาราวิทยาลัย
// Version 2.0 - Rebuilt
// ==========================================

const SHEET_ID = '1Mgtb5hCU2iyLL7eOWp7el8J-ZZ4CdCzVVuMJ8wxMcgU'
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID' // ← ใส่ Folder ID ที่นี่
const ss = SpreadsheetApp.openById(SHEET_ID)

const SHEETS = { DOCS:'Documents', FORM3:'Form3', AUDIT:'AuditLog', USERS:'Users' }

// ─── Entry Point ───
function doPost(e) {
  const data = JSON.parse(e.postData.contents)
  const { action } = data
  let result
  try {
    const map = {
      createDocument, getForm1, getForm3, getAuditLog,
      signDocument, returnDocument, resubmitDocument,
      assignChief, createForm3, updateForm3, deleteDocument,
      getMyDocuments, getUserProfile, getUsers, upsertUser, deleteUser,
      getSettings, saveSettings, uploadLogo, testLineNotify,
    }
    result = map[action] ? map[action](data) : { success:false, error:'Unknown action: '+action }
  } catch(err) { result = { success:false, error:err.message } }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON)
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON)
}

// ─── Helpers ───
function getOrCreate(name) { return ss.getSheetByName(name) || ss.insertSheet(name) }
function uuid() { return Utilities.getUuid() }
function now() { return new Date().toISOString() }
function col(headers, name) { return headers.indexOf(name) }

// ─── Create Document ───
function createDocument(data) {
  const sheet = getOrCreate(SHEETS.DOCS)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'docId','studentName','class','no','studentId','address','phone',
      'parentName','parentPhone','advisorName','advisorPosition','creatorRole',
      'records','referralDate','deptHeadEmail','deptHeadName','attachment',
      'problems','helpDone','remaining','suggestions',
      'createdByEmail','createdByName','createdByPhoto','status','createdAt',
      'teacherSig','teacherSignedAt',
      'deptHeadSig','deptHeadSignedAt','deptHeadRole',
      'asstDirEmail','asstDirName','asstDirSig','asstDirSignedAt',
      'targetDept','targetDeptName','targetDeptEmail',
      'returnReason','form3Created','pdfUrl'
    ])
  }
  const docId = uuid()
  sheet.appendRow([
    docId, data.studentName||'', data.class||'', data.no||'', data.studentId||'',
    data.address||'', data.phone||'', data.parentName||'', data.parentPhone||'',
    data.advisorName||data.createdByName||'', data.advisorPosition||'', data.creatorRole||'teacher',
    JSON.stringify(data.records||[]),
    data.referralDate||'', data.deptHeadEmail||'', data.deptHeadName||'', data.attachment||'',
    JSON.stringify(data.problems||[]), JSON.stringify(data.helpDone||[]),
    JSON.stringify(data.remaining||[]), JSON.stringify(data.suggestions||[]),
    data.createdByEmail||'', data.createdByName||'', data.createdByPhoto||'',
    'wait_dept_head', now(),
    data.teacherSig||'', data.teacherSig ? now() : '',
    '','','',
    '','','','',
    '','','',
    '',false,''
  ])
  addLog(docId,'created',data.createdByEmail,data.createdByName,'สร้างเอกสาร ส่งให้หัวหน้าแผนก')
  notify(docId,'wait_dept_head',data.studentName,data.createdByName)
  return { success:true, docId }
}

// ─── Get Form1 ───
function getForm1(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCS)
  if (!sheet) return { success:false, error:'ไม่พบ Sheet' }
  const rows = sheet.getDataRange().getValues()
  const h = rows[0]
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0] !== data.docId) continue
    const doc = {}
    h.forEach((k,j) => doc[k] = rows[i][j])
    ;['records','problems','helpDone','remaining','suggestions'].forEach(k => {
      try { doc[k] = JSON.parse(doc[k]||'[]') } catch { doc[k] = [] }
    })
    return { success:true, document:doc }
  }
  return { success:false, error:'ไม่พบเอกสาร' }
}

// ─── Sign Document ───
function signDocument(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCS)
  if (!sheet) return { success:false, error:'ไม่พบ Sheet' }
  const rows = sheet.getDataRange().getValues()
  const h = rows[0]
  const c = (n) => col(h,n)+1

  for (let i=1; i<rows.length; i++) {
    if (rows[i][0] !== data.docId) continue
    const status = rows[i][col(h,'status')]
    let newStatus

    if (status === 'wait_dept_head') {
      sheet.getRange(i+1,c('deptHeadSig')).setValue(data.signature)
      sheet.getRange(i+1,c('deptHeadSignedAt')).setValue(now())
      sheet.getRange(i+1,c('deptHeadEmail')).setValue(data.signerEmail)
      sheet.getRange(i+1,c('deptHeadName')).setValue(data.signerName)
      sheet.getRange(i+1,c('deptHeadRole')).setValue(data.signerRole||'')
      newStatus = 'wait_asst_dir'
    } else if (status === 'wait_asst_dir') {
      sheet.getRange(i+1,c('asstDirEmail')).setValue(data.signerEmail)
      sheet.getRange(i+1,c('asstDirName')).setValue(data.signerName)
      sheet.getRange(i+1,c('asstDirSig')).setValue(data.signature)
      sheet.getRange(i+1,c('asstDirSignedAt')).setValue(now())
      newStatus = 'wait_asst_dir' // ยังรออยู่ รอ assign
    } else {
      return { success:false, error:'ไม่สามารถเซ็นในสถานะนี้' }
    }

    sheet.getRange(i+1,c('status')).setValue(newStatus)
    addLog(data.docId,'signed',data.signerEmail,data.signerName,'เซ็นชื่อรับรอง')
    if (newStatus !== status) notify(data.docId, newStatus, rows[i][col(h,'studentName')], data.signerName)
    return { success:true, newStatus }
  }
  return { success:false, error:'ไม่พบเอกสาร' }
}

// ─── Assign Chief ─── (ผู้ช่วย ผอ. มอบหมายหัวหน้างาน)
function assignChief(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCS)
  if (!sheet) return { success:false, error:'ไม่พบ Sheet' }
  const rows = sheet.getDataRange().getValues()
  const h = rows[0]
  const c = (n) => col(h,n)+1

  // หาอีเมลหัวหน้างานฝ่ายนั้น
  const chiefEmail = getChiefEmail(data.targetDept)
  const chiefName = getChiefName(data.targetDept)

  for (let i=1; i<rows.length; i++) {
    if (rows[i][0] !== data.docId) continue
    sheet.getRange(i+1,c('targetDept')).setValue(data.targetDept)
    sheet.getRange(i+1,c('targetDeptEmail')).setValue(chiefEmail)
    sheet.getRange(i+1,c('targetDeptName')).setValue(chiefName)
    sheet.getRange(i+1,c('status')).setValue('wait_chief')
    addLog(data.docId,'assigned',data.byEmail,data.byName,'มอบหมายให้ฝ่าย: '+data.targetDept+(data.note?'\n'+data.note:''))
    notify(data.docId,'wait_chief',rows[i][col(h,'studentName')],data.byName)
    return { success:true }
  }
  return { success:false, error:'ไม่พบเอกสาร' }
}

function getChiefEmail(dept) {
  const sheet = ss.getSheetByName(SHEETS.USERS)
  if (!sheet) return ''
  const rows = sheet.getDataRange().getValues()
  for (let i=1; i<rows.length; i++) {
    if (rows[i][2] === dept) return rows[i][0]
  }
  return ''
}

function getChiefName(dept) {
  const sheet = ss.getSheetByName(SHEETS.USERS)
  if (!sheet) return ''
  const rows = sheet.getDataRange().getValues()
  for (let i=1; i<rows.length; i++) {
    if (rows[i][2] === dept) return rows[i][1]
  }
  return ''
}

// ─── Return Document ───
function returnDocument(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCS)
  if (!sheet) return { success:false, error:'ไม่พบ Sheet' }
  const rows = sheet.getDataRange().getValues()
  const h = rows[0]; const c=(n)=>col(h,n)+1
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0] !== data.docId) continue
    sheet.getRange(i+1,c('status')).setValue('returned')
    sheet.getRange(i+1,c('returnReason')).setValue(data.reason||'')
    ;['deptHeadSig','deptHeadSignedAt','asstDirSig','asstDirSignedAt'].forEach(k => sheet.getRange(i+1,c(k)).setValue(''))
    addLog(data.docId,'returned',data.byEmail,data.byName,data.reason||'ส่งคืนแก้ไข')
    notify(data.docId,'returned',rows[i][col(h,'studentName')],data.byName)
    return { success:true }
  }
  return { success:false, error:'ไม่พบเอกสาร' }
}

// ─── Resubmit ───
function resubmitDocument(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCS)
  if (!sheet) return { success:false, error:'ไม่พบ Sheet' }
  const rows = sheet.getDataRange().getValues()
  const h = rows[0]; const c=(n)=>col(h,n)
  for (let i=1; i<rows.length; i++) {
    if (rows[i][c('docId')] !== data.docId) continue
    const u = data.updates||{}
    if(u.studentName) sheet.getRange(i+1,c('studentName')+1).setValue(u.studentName)
    if(u.class) sheet.getRange(i+1,c('class')+1).setValue(u.class)
    if(u.no) sheet.getRange(i+1,c('no')+1).setValue(u.no)
    if(u.problems) sheet.getRange(i+1,c('problems')+1).setValue(JSON.stringify(u.problems))
    sheet.getRange(i+1,c('status')+1).setValue('wait_dept_head')
    sheet.getRange(i+1,c('returnReason')+1).setValue('')
    addLog(data.docId,'resubmitted',data.byEmail,data.byName,u.returnNote||'แก้ไขและส่งใหม่')
    notify(data.docId,'wait_dept_head',rows[i][c('studentName')],data.byName)
    return { success:true }
  }
  return { success:false, error:'ไม่พบเอกสาร' }
}

// ─── Create Form3 ───
function createForm3(data) {
  const sheet = getOrCreate(SHEETS.FORM3)
  if (sheet.getLastRow()===0) {
    sheet.appendRow(['form3Id','docId','assignedDept','assignedTeacherName','assignedTeacherPosition',
      'note','records','createdByEmail','createdByName','creatorRole','createdAt','status'])
  }
  const form3Id = uuid()
  sheet.appendRow([
    form3Id, data.docId, data.assignedDept||'',
    data.createdByName||'', data.assignedTeacherPosition||'',
    data.note||'', JSON.stringify(data.records||[]),
    data.createdByEmail||'', data.createdByName||'', data.creatorRole||'',
    now(), 'in_progress'
  ])

  // อัปเดต status ของ Documents
  const docSheet = ss.getSheetByName(SHEETS.DOCS)
  if (docSheet) {
    const rows = docSheet.getDataRange().getValues()
    const h = rows[0]; const c=(n)=>col(h,n)+1
    for (let i=1; i<rows.length; i++) {
      if (rows[i][0] !== data.docId) continue
      docSheet.getRange(i+1,c('form3Created')).setValue(true)
      docSheet.getRange(i+1,c('status')).setValue('in_progress')
      break
    }
  }
  addLog(data.docId,'form3_created',data.createdByEmail,data.createdByName,'สร้างเอกสาร 3 เริ่มดำเนินการ')
  return { success:true, form3Id }
}

// ─── Update Form3 ───
function updateForm3(data) {
  const sheet = ss.getSheetByName(SHEETS.FORM3)
  if (!sheet) return { success:false, error:'ไม่พบ Sheet' }
  const rows = sheet.getDataRange().getValues()
  const h = rows[0]; const c=(n)=>col(h,n)+1
  for (let i=1; i<rows.length; i++) {
    if (rows[i][1] !== data.docId) continue
    if(data.note) sheet.getRange(i+1,c('note')).setValue(data.note)
    if(data.records) sheet.getRange(i+1,c('records')).setValue(JSON.stringify(data.records))
    if(data.status==='completed') {
      sheet.getRange(i+1,c('status')).setValue('completed')
      // อัปเดต Documents ด้วย
      const docSheet = ss.getSheetByName(SHEETS.DOCS)
      if (docSheet) {
        const drows = docSheet.getDataRange().getValues()
        const dh = drows[0]; const dc=(n)=>col(dh,n)+1
        for (let j=1; j<drows.length; j++) {
          if (drows[j][0] !== data.docId) continue
          docSheet.getRange(j+1,dc('status')).setValue('completed')
          // Generate PDF
          try { generateAndSavePDF(data.docId) } catch(e) { Logger.log('PDF error: '+e.message) }
          break
        }
      }
      addLog(data.docId,'completed',data.byEmail,data.byName,'เอกสารสมบูรณ์')
    }
    return { success:true }
  }
  return { success:false, error:'ไม่พบเอกสาร 3' }
}

// ─── Get Form3 ───
function getForm3(data) {
  const sheet = ss.getSheetByName(SHEETS.FORM3)
  if (!sheet) return { success:true, form3:null }
  const rows = sheet.getDataRange().getValues()
  const h = rows[0]
  for (let i=1; i<rows.length; i++) {
    if (rows[i][1] !== data.docId) continue
    const f = {}; h.forEach((k,j)=>f[k]=rows[i][j])
    try { f.records = JSON.parse(f.records||'[]') } catch { f.records=[] }
    return { success:true, form3:f }
  }
  return { success:true, form3:null }
}

// ─── Get My Documents ───
function getMyDocuments(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCS)
  if (!sheet) return { success:true, documents:[] }
  const rows = sheet.getDataRange().getValues()
  if (rows.length<2) return { success:true, documents:[] }
  const h = rows[0]
  const docs = []
  for (let i=1; i<rows.length; i++) {
    const r = rows[i]
    const doc = {}; h.forEach((k,j)=>doc[k]=r[j])
    const related = doc.createdByEmail===data.email ||
      doc.deptHeadEmail===data.email ||
      doc.asstDirEmail===data.email ||
      doc.targetDeptEmail===data.email
    if (!related) continue
    docs.push({
      docId:doc.docId, studentName:doc.studentName, class:doc.class, no:doc.no,
      studentId:doc.studentId, createdByName:doc.createdByName, createdByEmail:doc.createdByEmail,
      status:doc.status, createdAt:doc.createdAt, returnReason:doc.returnReason, pdfUrl:doc.pdfUrl||'',
    })
  }
  docs.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
  return { success:true, documents:docs }
}

// ─── Delete Document ───
function deleteDocument(data) {
  const sheet = ss.getSheetByName(SHEETS.DOCS)
  if (!sheet) return { success:false, error:'ไม่พบ Sheet' }
  const rows = sheet.getDataRange().getValues()
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0] !== data.docId) continue
    sheet.deleteRow(i+1)
    addLog(data.docId,'deleted',data.byEmail||'',data.byName||'','ลบเอกสารโดย Admin')
    return { success:true }
  }
  return { success:false, error:'ไม่พบเอกสาร' }
}

// ─── Audit Log ───
function addLog(docId,action,byEmail,byName,note) {
  const sheet = getOrCreate(SHEETS.AUDIT)
  if (sheet.getLastRow()===0) sheet.appendRow(['docId','action','byEmail','byName','note','at'])
  sheet.appendRow([docId,action,byEmail||'',byName||'',note||'',now()])
}

function getAuditLog(data) {
  const sheet = ss.getSheetByName(SHEETS.AUDIT)
  if (!sheet) return { success:true, logs:[] }
  const rows = sheet.getDataRange().getValues()
  if (rows.length<2) return { success:true, logs:[] }
  const h = rows[0]
  const logs = []
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0]!==data.docId) continue
    const l={}; h.forEach((k,j)=>l[k]=rows[i][j]); logs.push(l)
  }
  return { success:true, logs }
}

// ─── Users ───
function getUserProfile(data) {
  const sheet = ss.getSheetByName(SHEETS.USERS)
  if (!sheet) return { success:true, user:null }
  const rows = sheet.getDataRange().getValues()
  const h = rows[0]
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0]===data.email) {
      const u={}; h.forEach((k,j)=>u[k]=rows[i][j]); return { success:true, user:u }
    }
  }
  return { success:true, user:null }
}

function getUsers(data) {
  const sheet = ss.getSheetByName(SHEETS.USERS)
  if (!sheet) return { success:true, users:[] }
  const rows = sheet.getDataRange().getValues()
  if (rows.length<2) return { success:true, users:[] }
  const h = rows[0]; const users=[]
  for (let i=1; i<rows.length; i++) {
    if (!rows[i][0]) continue
    const u={}; h.forEach((k,j)=>u[k]=rows[i][j]); users.push(u)
  }
  return { success:true, users }
}

function upsertUser(data) {
  const sheet = getOrCreate(SHEETS.USERS)
  if (sheet.getLastRow()===0) sheet.appendRow(['email','name','role','lineUserId'])
  const rows = sheet.getDataRange().getValues()
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0]===data.email) {
      if(data.name) sheet.getRange(i+1,2).setValue(data.name)
      if(data.role) sheet.getRange(i+1,3).setValue(data.role)
      if(data.lineUserId!==undefined) sheet.getRange(i+1,4).setValue(data.lineUserId)
      return { success:true }
    }
  }
  sheet.appendRow([data.email,data.name||'',data.role||'teacher',data.lineUserId||''])
  return { success:true }
}

function deleteUser(data) {
  const sheet = ss.getSheetByName(SHEETS.USERS)
  if (!sheet) return { success:true }
  const rows = sheet.getDataRange().getValues()
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0]===data.email) { sheet.deleteRow(i+1); return { success:true } }
  }
  return { success:true }
}

// ─── Settings ───
function getSettings(data) {
  const sheet = ss.getSheetByName('Settings')
  if (!sheet) return { success:true, logoUrl:null, lineToken:'' }
  const rows = sheet.getDataRange().getValues()
  const s={}; rows.forEach(r=>s[r[0]]=r[1])
  return { success:true, logoUrl:s['logoUrl']||null, lineToken:s['lineToken']||'' }
}

function saveSettings(data) {
  const sheet = getOrCreate('Settings')
  const rows = sheet.getDataRange().getValues()
  ;['lineToken','logoUrl'].forEach(key => {
    if(data[key]===undefined) return
    for(let i=0;i<rows.length;i++) { if(rows[i][0]===key) { sheet.getRange(i+1,2).setValue(data[key]); return } }
    sheet.appendRow([key,data[key]])
  })
  return { success:true }
}

function uploadLogo(data) {
  return saveSettings({ logoUrl: data.logoUrl||'' })
}

// ─── Notifications ───
function getLineToken() { return (getSettings({}).lineToken)||'' }

function sendEmail(to,subject,body) {
  if(!to) return
  try {
    MailApp.sendEmail({
      to, subject:'🏫 '+subject+' | ระบบ 4 ประสาน 3 สายใย',
      htmlBody:`<div style="font-family:sans-serif;max-width:500px;padding:20px;"><h2 style="color:#1d4ed8;">ระบบ 4 ประสาน 3 สายใย</h2><p>${body}</p><hr><small style="color:#94a3b8;">โรงเรียนดาราวิทยาลัย เชียงใหม่</small></div>`,
    })
  } catch(e) { Logger.log('Email error: '+e.message) }
}

function sendLine(token,msg) {
  if(!token) return
  try { UrlFetchApp.fetch('https://notify-api.line.me/api/notify',{method:'post',headers:{'Authorization':'Bearer '+token},payload:{message:msg},muteHttpExceptions:true}) } catch {}
}

function testLineNotify(data) {
  try {
    const res = UrlFetchApp.fetch('https://notify-api.line.me/api/notify',{method:'post',headers:{'Authorization':'Bearer '+data.lineToken},payload:{message:'\n🏫 ทดสอบ\nระบบ 4 ประสาน 3 สายใย ✅'},muteHttpExceptions:true})
    return { success:res.getResponseCode()===200 }
  } catch(e) { return { success:false, error:e.message } }
}

function notify(docId,status,studentName,by) {
  const lineToken = getLineToken()
  const msgs = {
    wait_dept_head: { line:`\n📄 มีเอกสารรอเซ็น\nนักเรียน: ${studentName}\nโดย: ${by}`, sub:'มีเอกสารรอเซ็น', body:`มีเอกสารนักเรียน <b>${studentName}</b> รอการเซ็น โดย ${by}` },
    wait_asst_dir:  { line:`\n✍️ หัวหน้าแผนกเซ็นแล้ว\nนักเรียน: ${studentName}`, sub:'เอกสารรอผู้ช่วย ผอ. เซ็น', body:`เอกสารนักเรียน <b>${studentName}</b> ผ่านหัวหน้าแผนกแล้ว รอผู้ช่วย ผอ.` },
    wait_chief:     { line:`\n📋 มีงานรอมอบหมาย\nนักเรียน: ${studentName}`, sub:'มีงานรอมอบหมาย', body:`ผู้ช่วย ผอ. มอบหมายงานเรื่องนักเรียน <b>${studentName}</b>` },
    in_progress:    { line:`\n🔄 เริ่มดำเนินการแล้ว\nนักเรียน: ${studentName}`, sub:'เริ่มดำเนินการ', body:`เอกสาร 3 ของนักเรียน <b>${studentName}</b> เริ่มดำเนินการแล้ว` },
    returned:       { line:`\n↩️ เอกสารถูกส่งคืน\nนักเรียน: ${studentName}\nโดย: ${by}`, sub:'เอกสารถูกส่งคืน', body:`เอกสารนักเรียน <b>${studentName}</b> ถูกส่งคืนให้แก้ไข โดย ${by}` },
    completed:      { line:`\n✅ เอกสารสมบูรณ์\nนักเรียน: ${studentName}`, sub:'เอกสารสมบูรณ์', body:`เอกสารนักเรียน <b>${studentName}</b> ดำเนินการครบทุกขั้นตอนแล้ว` },
  }
  const m = msgs[status]; if(!m) return
  sendLine(lineToken, m.line)
  // หาอีเมลผู้รับ
  const docSheet = ss.getSheetByName(SHEETS.DOCS)
  if(!docSheet) return
  const rows=docSheet.getDataRange().getValues(); const h=rows[0]
  for(let i=1;i<rows.length;i++) {
    if(rows[i][0]!==docId) continue
    let to=''
    if(status==='wait_dept_head') to=rows[i][col(h,'deptHeadEmail')]
    else if(status==='wait_asst_dir') to=rows[i][col(h,'asstDirEmail')]
    else if(status==='wait_chief') to=rows[i][col(h,'targetDeptEmail')]
    else if(status==='returned'||status==='completed') to=rows[i][col(h,'createdByEmail')]
    if(to) sendEmail(to,m.sub,m.body)
    break
  }
}

// ─── Generate PDF & Save to Drive ───
function generateAndSavePDF(docId) {
  const docRes = getForm1({docId})
  if(!docRes.success) return
  const doc = docRes.document
  const form3Res = getForm3({docId})
  const form3 = form3Res.form3

  // สร้างชื่อไฟล์
  const year = new Date().getFullYear() + 543
  const fileName = `${doc.studentName}_${doc.class}_เลขที่${doc.no}_${year}.html`

  // หา folder
  let folder
  try { folder = DriveApp.getFolderById(DRIVE_FOLDER_ID) }
  catch(e) { Logger.log('Drive folder error: '+e.message); return }

  // ลบไฟล์เก่า
  const files = folder.getFilesByName(fileName)
  while(files.hasNext()) files.next().setTrashed(true)

  // บันทึก HTML (Google Drive ไม่รองรับ PDF โดยตรงจาก Apps Script ง่ายๆ)
  const html = buildSimpleHTML(doc, form3)
  const blob = Utilities.newBlob(html,'text/html',fileName)
  const file = folder.createFile(blob)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  const url = file.getUrl()

  // บันทึก URL กลับใน Sheet
  const sheet = ss.getSheetByName(SHEETS.DOCS)
  const rows = sheet.getDataRange().getValues()
  const h = rows[0]; const c=(n)=>col(h,n)+1
  for(let i=1;i<rows.length;i++) {
    if(rows[i][0]===docId) { sheet.getRange(i+1,c('pdfUrl')).setValue(url); break }
  }
  addLog(docId,'pdf_saved','system','system','บันทึกไฟล์: '+fileName)
}

function buildSimpleHTML(doc, form3) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${doc.studentName}</title></head><body style="font-family:sans-serif;padding:20px;">
    <h2>แบบรายงานการดูแลช่วยเหลือนักเรียน</h2>
    <p><b>ชื่อ:</b> ${doc.studentName} <b>ชั้น:</b> ${doc.class} <b>เลขที่:</b> ${doc.no}</p>
    <p><b>สถานะ:</b> สมบูรณ์ ✅</p>
    ${form3 ? `<h3>เอกสาร 3</h3><p>${form3.note||''}</p>` : ''}
  </body></html>`
}
