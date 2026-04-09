// printForm.js — สร้าง HTML ฟอร์มสำหรับพิมพ์ตามต้นฉบับ
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const fmtDate = (d) => {
  if (!d) return '...........................'
  try { return format(new Date(d), 'd MMMM yyyy', { locale: th }) } catch { return d }
}

const line = (len = 40) => '.'.repeat(len)

export function buildPrintHTML(doc, logoUrl = null) {
  const records = doc.records || []
  const problems = doc.problems || []
  const helpDone = doc.helpDone || []
  const remaining = doc.remaining || []
  const suggestions = doc.suggestions || []

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" style="width:60px;height:60px;object-fit:contain;" />`
    : `<div style="width:60px;height:60px;background:#1d4ed8;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:800;">ด</div>`

  const sigBox = (label, name, sigBase64, signedAt) => `
    <div style="text-align:center;min-width:160px;">
      <div style="height:60px;border:1px solid #ccc;border-radius:4px;background:#fafafa;display:flex;align-items:center;justify-content:center;margin-bottom:4px;">
        ${sigBase64 ? `<img src="${sigBase64}" style="max-height:56px;max-width:150px;" />` : ''}
      </div>
      <div style="border-top:1px solid #333;padding-top:4px;font-size:11px;">
        <div>${name || line(20)}</div>
        <div style="color:#555;">${label}</div>
        <div style="color:#555;">${signedAt ? fmtDate(signedAt) : ''}</div>
      </div>
    </div>`

  // ตาราง records (เอกสาร 1)
  const recordRows = records.length > 0
    ? records.map((r, i) => `
        <tr>
          <td style="border:1px solid #333;padding:4px 6px;text-align:center;">${r.session || i + 1}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${r.date || ''}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${r.issue || ''}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${r.approach || ''}</td>
        </tr>`).join('')
    : Array(8).fill(`
        <tr>
          <td style="border:1px solid #333;padding:4px 6px;height:24px;">&nbsp;</td>
          <td style="border:1px solid #333;padding:4px 6px;">&nbsp;</td>
          <td style="border:1px solid #333;padding:4px 6px;">&nbsp;</td>
          <td style="border:1px solid #333;padding:4px 6px;">&nbsp;</td>
        </tr>`).join('')

  const listItems = (arr, fallback = 3) => {
    const items = arr.length > 0 ? arr : Array(fallback).fill('')
    return items.map((v, i) => `
      <div style="margin-bottom:8px;">
        <span style="font-weight:600;">${i + 1}.</span>
        ${v || line(60)}
      </div>`).join('')
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>แบบรายงานการดูแลช่วยเหลือนักเรียน</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sarabun', 'TH Sarabun New', sans-serif; font-size: 13px; color: #000; background: #fff; }
  .page { width: 210mm; min-height: 297mm; padding: 15mm 20mm; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h1 { font-size: 16px; font-weight: 700; text-align: center; margin-bottom: 2px; }
  h2 { font-size: 14px; font-weight: 700; text-align: center; margin-bottom: 12px; }
  .header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px; }
  .field-row { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-bottom: 6px; line-height: 1.8; }
  .field { display: inline-flex; align-items: baseline; gap: 4px; }
  .field-label { font-weight: 600; white-space: nowrap; }
  .field-value { border-bottom: 1px solid #333; min-width: 120px; padding: 0 4px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
  th { border: 1px solid #333; padding: 4px 6px; background: #f5f5f5; font-weight: 600; }
  .sig-row { display: flex; justify-content: space-around; align-items: flex-end; margin-top: 20px; flex-wrap: wrap; gap: 16px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 12mm 18mm; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════ PAGE 1: เอกสาร 1 ═══════ -->
<div class="page">
  <div class="header">
    ${logoHtml}
    <div style="text-align:center;">
      <h1>แบบรายงานการดูแลช่วยเหลือนักเรียน</h1>
      <div style="font-size:13px;">(สำหรับครูที่ปรึกษาและครูทั่วไป)</div>
    </div>
  </div>

  <div class="field-row">
    <div class="field"><span class="field-label">ชื่อ–สกุล นักเรียน</span><span class="field-value" style="min-width:200px;">${doc.studentName || ''}</span></div>
    <div class="field"><span class="field-label">ชั้น</span><span class="field-value" style="min-width:60px;">${doc.class || ''}</span></div>
    <div class="field"><span class="field-label">เลขที่</span><span class="field-value" style="min-width:40px;">${doc.no || ''}</span></div>
    <div class="field"><span class="field-label">เลขประจำตัว</span><span class="field-value" style="min-width:80px;">${doc.studentId || ''}</span></div>
  </div>
  <div class="field-row">
    <div class="field"><span class="field-label">ที่อยู่</span><span class="field-value" style="min-width:300px;">${doc.address || ''}</span></div>
    <div class="field"><span class="field-label">โทรศัพท์</span><span class="field-value" style="min-width:120px;">${doc.phone || ''}</span></div>
  </div>
  <div class="field-row">
    <div class="field"><span class="field-label">ชื่อ–สกุล ผู้ปกครอง</span><span class="field-value" style="min-width:200px;">${doc.parentName || ''}</span></div>
    <div class="field"><span class="field-label">เบอร์โทรติดต่อ</span><span class="field-value" style="min-width:120px;">${doc.parentPhone || ''}</span></div>
  </div>
  <div class="field-row">
    <div class="field"><span class="field-label">ครูผู้ให้คำปรึกษา</span><span class="field-value" style="min-width:200px;">${doc.advisorName || ''}</span></div>
    <div class="field"><span class="field-label">ตำแหน่ง</span><span class="field-value" style="min-width:150px;">${doc.advisorPosition || ''}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:50px;">ครั้งที่</th>
        <th style="width:100px;">วัน/เดือน/ปี</th>
        <th>เรื่องที่พบ</th>
        <th>แนวทางการช่วยเหลือ</th>
      </tr>
    </thead>
    <tbody>${recordRows}</tbody>
  </table>

  <div class="sig-row">
    ${sigBox('ครูที่ปรึกษา / ผู้รายงาน', doc.createdByName, doc.teacherSig, doc.teacherSignedAt)}
    ${sigBox('หัวหน้าแผนก', doc.deptHeadName, doc.deptHeadSig, doc.deptHeadSignedAt)}
    ${sigBox('ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน', doc.asstDirName, doc.asstDirSig, doc.asstDirSignedAt)}
  </div>
</div>

<!-- ═══════════════════════════════════════════════ PAGE 2: เอกสาร 2 ═══════ -->
<div class="page">
  <div class="header">
    ${logoHtml}
    <div style="text-align:center;">
      <h1>แบบรายงานการดูแลช่วยเหลือนักเรียน</h1>
      <div style="font-size:13px;">(การส่งต่อนักเรียนภายใน)</div>
    </div>
  </div>

  <div class="field-row" style="margin-bottom:10px;">
    <div class="field"><span class="field-label">วันที่</span><span class="field-value" style="min-width:180px;">${fmtDate(doc.referralDate)}</span></div>
  </div>

  <div style="font-weight:600;margin-bottom:4px;">เรื่อง ขอความร่วมมือในการดูแลช่วยเหลือนักเรียน</div>
  <div class="field-row" style="margin-bottom:10px;">
    <div class="field"><span class="field-label">เรียน</span><span class="field-value" style="min-width:300px;">${doc.referralTo || ''}</span></div>
  </div>
  <div class="field-row" style="margin-bottom:10px;">
    <div class="field"><span class="field-label">สิ่งที่ส่งมาด้วย</span><span class="field-value" style="min-width:280px;">${doc.attachment || ''}</span></div>
  </div>

  <div style="margin-bottom:6px;">
    <span style="font-weight:600;">ด้วยนักเรียน ชื่อ–สกุล </span>
    <span style="border-bottom:1px solid #333;padding:0 4px;min-width:200px;display:inline-block;">${doc.studentName || ''}</span>
    <span style="font-weight:600;"> ชั้น </span>
    <span style="border-bottom:1px solid #333;padding:0 4px;min-width:60px;display:inline-block;">${doc.class || ''}</span>
    <span style="font-weight:600;"> เลขที่ </span>
    <span style="border-bottom:1px solid #333;padding:0 4px;min-width:40px;display:inline-block;">${doc.no || ''}</span>
    <span style="font-weight:600;"> เลขประจำตัว </span>
    <span style="border-bottom:1px solid #333;padding:0 4px;min-width:80px;display:inline-block;">${doc.studentId || ''}</span>
  </div>

  <div style="margin:12px 0 4px;font-weight:700;">ปัญหาที่พบสรุปได้ดังนี้</div>
  ${listItems(problems)}

  <div style="margin:12px 0 4px;font-weight:700;">และได้ดำเนินการช่วยเหลือเบื้องต้นแล้วดังนี้</div>
  ${listItems(helpDone)}

  <div style="margin:12px 0 4px;font-weight:700;">แต่ยังคงมีปัญหาดังนี้</div>
  ${listItems(remaining)}

  <div style="margin:12px 0 4px;font-weight:700;">ข้อเสนอแนะอื่น ๆ</div>
  ${listItems(suggestions)}

  <div style="margin-top:12px;">จึงเรียนมาเพื่อขอความร่วมมือในการดูแลช่วยเหลือแก้ไขปัญหาของนักเรียนดังกล่าว</div>
  <div style="margin-top:4px;">ขอแสดงความนับถือ</div>

  <div class="sig-row" style="justify-content:flex-start;gap:60px;margin-top:16px;">
    ${sigBox('ครูที่ปรึกษา / ผู้รายงาน', doc.createdByName, doc.teacherSig, doc.teacherSignedAt)}
    ${sigBox('หัวหน้าแผนก', doc.deptHeadName, doc.deptHeadSig, doc.deptHeadSignedAt)}
  </div>
</div>

<!-- ═══════════════════════════════════════════════ PAGE 3: เอกสาร 3 ═══════ -->
<div class="page">
  <div class="header">
    ${logoHtml}
    <div style="text-align:center;">
      <h1>บันทึกการติดตามข้อมูลนักเรียนในระบบดูแลช่วยเหลือนักเรียน</h1>
      <div style="font-size:13px;">โรงเรียนดาราวิทยาลัย</div>
    </div>
  </div>

  <div style="margin-bottom:10px;">
    <div class="field-row">
      <div class="field"><span class="field-label">ชื่อ–สกุล นักเรียน</span><span class="field-value" style="min-width:200px;">${doc.studentName || ''}</span></div>
      <div class="field"><span class="field-label">ชั้น</span><span class="field-value" style="min-width:60px;">${doc.class || ''}</span></div>
      <div class="field"><span class="field-label">เลขที่</span><span class="field-value" style="min-width:40px;">${doc.no || ''}</span></div>
    </div>
    <div class="field-row">
      <div class="field"><span class="field-label">ฝ่ายที่รับผิดชอบ</span><span class="field-value" style="min-width:200px;">${doc.targetDept || ''}</span></div>
      <div class="field"><span class="field-label">วันที่ส่งต่อ</span><span class="field-value" style="min-width:150px;">${fmtDate(doc.asstDirSignedAt)}</span></div>
    </div>
  </div>

  <div style="font-weight:700;margin-bottom:6px;">บันทึกการดำเนินการ</div>
  <div style="border:1px solid #ccc;border-radius:4px;min-height:200px;padding:8px;line-height:2;">
    ${doc.form3?.note || ''}
  </div>

  <div class="sig-row" style="margin-top:24px;">
    ${sigBox('ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน', doc.asstDirName, doc.asstDirSig, doc.asstDirSignedAt)}
    ${sigBox('ฝ่ายที่รับผิดชอบ', doc.targetDeptName, doc.targetDeptSig, doc.targetDeptSignedAt)}
  </div>
</div>

</body>
</html>`
}
