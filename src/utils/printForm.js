import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { ROLE_POSITION } from './roles'

const fmtDate = (d) => {
  if (!d) return '...........................'
  try { return format(new Date(d), 'd MMMM yyyy', { locale: th }) } catch { return d }
}

const fmtDateShort = (d) => {
  if (!d) return '........../........../...........'
  try { return format(new Date(d), 'd/M/yyyy', { locale: th }) } catch { return d }
}

export function buildPrintHTML(doc, logoUrl = null) {
  const records = doc.records || []
  const problems = doc.problems || []
  const helpDone = doc.helpDone || []
  const remaining = doc.remaining || []
  const suggestions = doc.suggestions || []

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" style="width:72px;height:72px;object-fit:contain;display:block;margin:0 auto 8px;" />`
    : `<div style="width:72px;height:72px;background:#1d4ed8;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:800;margin:0 auto 8px;">ด</div>`

  const dot = (len = 40) => '&nbsp;' + '…'.repeat(Math.floor(len / 2))
  const blank = (px = 200) => `<span style="display:inline-block;border-bottom:1px solid #333;width:${px}px;"></span>`

  // กล่องลายเซ็น
  const sigBox = (sigBase64, label, name, position, signedAt, boxStyle = '') => `
    <div style="text-align:center;${boxStyle}">
      <div style="height:64px;min-width:200px;border:1px solid #ccc;border-radius:4px;background:#fafafa;
           display:flex;align-items:center;justify-content:center;margin-bottom:4px;">
        ${sigBase64 ? `<img src="${sigBase64}" style="max-height:60px;max-width:220px;" />` : ''}
      </div>
      <div style="font-size:12px;padding-top:4px;line-height:1.8;">
        <div>(${name || '................................................'})</div>
        <div style="font-weight:600;">${label}</div>
        ${position ? `<div>ตำแหน่ง ${position}</div>` : ''}
        ${signedAt ? `<div>${fmtDateShort(signedAt)}</div>` : '<div>...../....../.......</div>'}
      </div>
    </div>`

  // ตาราง records
  const recordRows = records.length > 0
    ? records.map((r, i) => `
        <tr>
          <td style="border:1px solid #333;padding:4px 6px;text-align:center;">${r.session || i+1}</td>
          <td style="border:1px solid #333;padding:4px 6px;white-space:nowrap;">${r.date || ''}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${r.issue || ''}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${r.approach || ''}</td>
        </tr>`).join('')
    : Array(6).fill(`<tr>
        <td style="border:1px solid #333;padding:4px 6px;height:26px;"></td>
        <td style="border:1px solid #333;padding:4px 6px;"></td>
        <td style="border:1px solid #333;padding:4px 6px;"></td>
        <td style="border:1px solid #333;padding:4px 6px;"></td>
      </tr>`).join('')

  const listItems = (arr, fallback = 3) => {
    const items = arr.length > 0 ? arr : Array(fallback).fill('')
    return items.map((v, i) => `
      <div style="margin-bottom:10px;display:flex;gap:6px;">
        <span style="font-weight:600;white-space:nowrap;">${i+1}.</span>
        <span style="flex:1;border-bottom:1px solid #ccc;padding-bottom:2px;">${v || '&nbsp;'}</span>
      </div>`).join('')
  }

  // ตำแหน่งของครูที่กรอก
  const creatorPosition = ROLE_POSITION[doc.creatorRole] || doc.advisorPosition || 'ครูที่ปรึกษา'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>แบบรายงานการดูแลช่วยเหลือนักเรียน - ${doc.studentName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sarabun','TH Sarabun New',sans-serif; font-size: 13px; color: #000; background: #fff; }
  .page { width: 210mm; min-height: 297mm; padding: 14mm 18mm; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h1 { font-size: 16px; font-weight: 700; text-align: center; }
  h2 { font-size: 14px; font-weight: 700; text-align: center; margin-bottom: 10px; }
  .header { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 14px; }
  .info-row { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-bottom: 5px; line-height: 1.9; font-size: 13px; }
  .info-field { display: inline-flex; align-items: baseline; gap: 4px; }
  .info-label { font-weight: 600; white-space: nowrap; }
  .info-val { border-bottom: 1px solid #333; min-width: 100px; padding: 0 4px; display: inline-block; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { border: 1px solid #333; padding: 5px 8px; background: #f0f0f0; font-weight: 600; text-align: left; }
  .sig-section { margin-top: 20px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 12mm 16mm; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<!-- ═══════ หน้า 1: เอกสาร 1 ═══════ -->
<div class="page">
  <div style="text-align:center;margin-bottom:14px;">
    ${logoHtml}
    <h1 style="font-size:16px;font-weight:700;margin:0 0 2px;">แบบรายงานการดูแลช่วยเหลือนักเรียน</h1>
    <div style="font-size:12px;color:#555;">(สำหรับครูที่ปรึกษาและครูทั่วไป)</div>
  </div>

  <div class="info-row">
    <div class="info-field"><span class="info-label">ชื่อ – สกุล นักเรียน</span><span class="info-val" style="min-width:200px;">${doc.studentName || ''}</span></div>
    <div class="info-field"><span class="info-label">ชั้น</span><span class="info-val" style="min-width:60px;">${doc.studentClass || ''}</span></div>
    <div class="info-field"><span class="info-label">เลขที่</span><span class="info-val" style="min-width:40px;">${doc.studentNo || ''}</span></div>
    <div class="info-field"><span class="info-label">เลขประจำตัว</span><span class="info-val" style="min-width:80px;">${doc.studentId || ''}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ที่อยู่</span><span class="info-val" style="min-width:320px;">${doc.address || ''}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ชื่อ – สกุล ผู้ปกครอง</span><span class="info-val" style="min-width:180px;">${doc.parentName || ''}</span></div>
    <div class="info-field"><span class="info-label">เบอร์โทรติดต่อ</span><span class="info-val" style="min-width:120px;">${doc.parentPhone || ''}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ครูผู้ให้คำปรึกษา</span><span class="info-val" style="min-width:180px;">${doc.advisorName || doc.createdByName || ''}</span></div>
    <div class="info-field"><span class="info-label">ตำแหน่ง</span><span class="info-val" style="min-width:160px;">${creatorPosition}</span></div>
  </div>

  <div style="margin:12px 0 6px;font-size:12px;color:#444;">บันทึกการดูแลช่วยเหลือ</div>
  <table>
    <thead>
      <tr>
        <th style="width:50px;">ครั้งที่</th>
        <th style="width:90px;">วัน / เดือน / ปี</th>
        <th>เรื่องที่พบ</th>
        <th>แนวทางการช่วยเหลือ</th>
      </tr>
    </thead>
    <tbody>${recordRows}</tbody>
  </table>
</div>

<!-- ═══════ หน้า 2: เอกสาร 2 ═══════ -->
<div class="page">
  <div style="text-align:center;margin-bottom:14px;">
    ${logoHtml}
    <h1 style="font-size:16px;font-weight:700;margin:0 0 2px;">แบบรายงานการดูแลช่วยเหลือนักเรียน</h1>
    <h2 style="font-size:14px;font-weight:700;margin:0;">(การส่งต่อนักเรียนภายใน)</h2>
  </div>

  <div class="info-row">
    <div class="info-field"><span class="info-label">วันที่</span><span class="info-val" style="min-width:200px;">${fmtDate(doc.referralDate || doc.createdAt)}</span></div>
  </div>
  <div style="margin:6px 0;font-size:13px;font-weight:600;">เรื่อง &nbsp;ขอความร่วมมือในการดูแลช่วยเหลือนักเรียน</div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">เรียน</span><span class="info-val" style="min-width:280px;">${doc.referralTo || ''}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">สิ่งที่ส่งมาด้วย</span><span class="info-val" style="min-width:260px;">${doc.attachment || 'แบบบันทึกการดูแลช่วยเหลือนักเรียน'}</span></div>
  </div>

  <div style="margin:8px 0;font-size:13px;line-height:2;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ด้วยนักเรียน ชื่อ – สกุล
    <span class="info-val" style="min-width:160px;">${doc.studentName || ''}</span>
    ชั้น <span class="info-val" style="min-width:50px;">${doc.studentClass || ''}</span>
    เลขที่ <span class="info-val" style="min-width:35px;">${doc.studentNo || ''}</span>
    เลขประจำตัว <span class="info-val" style="min-width:70px;">${doc.studentId || ''}</span>
    โทรศัพท์ที่ติดต่อได้ <span class="info-val" style="min-width:100px;">${doc.phone || ''}</span>
    ปัญหาที่พบสรุปได้ดังนี้
  </div>

  ${listItems(problems)}

  <div style="margin:8px 0 4px;font-weight:600;font-size:13px;">และได้ดำเนินการช่วยเหลือเบื้องต้นแล้วดังนี้</div>
  ${listItems(helpDone)}

  <div style="margin:8px 0 4px;font-weight:600;font-size:13px;">แต่ยังคงมีปัญหาดังนี้</div>
  ${listItems(remaining)}

  <div style="margin:8px 0 4px;font-weight:600;font-size:13px;">ข้อเสนอแนะอื่น ๆ</div>
  ${listItems(suggestions)}

  <div style="margin:10px 0 4px;font-size:13px;">จึงเรียนมาเพื่อขอความร่วมมือในการดูแลช่วยเหลือแก้ไขปัญหาของนักเรียนดังกล่าว</div>

  <!-- ลายเซ็น 3 ช่อง ตามเอกสารจริง -->
  <div class="sig-section" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;">

    <!-- ซ้าย: ผู้ช่วย ผอ. (กล่อง) -->
    <div style="border:1px solid #999;border-radius:4px;padding:14px;font-size:12px;">
      <div style="margin-bottom:6px;font-size:12px;">
        <span>วันที่</span>
        <span style="border-bottom:1px solid #333;display:inline-block;min-width:160px;padding:0 4px;">
          ${doc.asstDirSignedAt ? fmtDate(doc.asstDirSignedAt) : ''}
        </span>
      </div>
      <div style="margin-bottom:8px;font-size:12px;">
        เรียน <strong>${doc.targetDeptName || 'หัวหน้างานฝ่ายต่างๆ'}</strong>
      </div>
      ${doc.asstDirNote ? `<div style="font-size:12px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:4px;padding:8px;margin-bottom:8px;min-height:48px;line-height:1.6;">${doc.asstDirNote}</div>` : '<div style="min-height:48px;border:1px dashed #ccc;border-radius:4px;margin-bottom:8px;"></div>'}
      <div style="height:56px;border:1px dashed #ccc;border-radius:4px;background:#fafafa;margin:8px 0;
           display:flex;align-items:center;justify-content:center;">
        ${doc.asstDirSig ? `<img src="${doc.asstDirSig}" style="max-height:52px;max-width:180px;" />` : ''}
      </div>
      <div style="text-align:center;line-height:1.7;font-size:12px;">
        <div>ลงชื่อ (${doc.asstDirName || '................................'})</div>
        <div style="font-weight:600;">${doc.asstDirName || 'ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน'}</div>
        <div>ตำแหน่ง ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน</div>
      </div>
    </div>

    <!-- ขวา: ครูที่ปรึกษา (บน) + หัวหน้าแผนก (ล่าง) -->
    <div style="display:flex;flex-direction:column;gap:16px;">

      <!-- ขวาบน: ลายเซ็นครูที่ปรึกษา -->
      <div style="text-align:center;">
        <div style="font-size:12px;margin-bottom:4px;">ขอแสดงความนับถือ</div>
        <div style="height:60px;border:1px solid #ccc;border-radius:4px;background:#fafafa;
             display:flex;align-items:center;justify-content:center;margin-bottom:4px;">
          ${doc.teacherSig ? `<img src="${doc.teacherSig}" style="max-height:56px;max-width:200px;" />` : ''}
        </div>
        <div style="font-size:12px;line-height:1.7;">
          <div>(${doc.createdByName || '........................................'})</div>
          <div style="font-weight:600;">${creatorPosition}</div>
        </div>
      </div>

      <!-- ขวาล่าง: ลายเซ็นหัวหน้าแผนก -->
      <div style="text-align:center;">
        <div style="height:56px;border:1px solid #ccc;border-radius:4px;background:#fafafa;
             display:flex;align-items:center;justify-content:center;margin-bottom:4px;">
          ${doc.deptHeadSig ? `<img src="${doc.deptHeadSig}" style="max-height:52px;max-width:200px;" />` : ''}
        </div>
        <div style="font-size:12px;line-height:1.7;">
          <div>ลงชื่อ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; หัวหน้าแผนก</div>
          <div>(${doc.deptHeadName || '........................................'})</div>
          <div>${doc.deptHeadSignedAt ? fmtDateShort(doc.deptHeadSignedAt) : '......../......../........'}  </div>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- ═══════ หน้า 3: เอกสาร 3 ═══════ -->
<div class="page">
  <div style="text-align:center;margin-bottom:14px;">
    ${logoHtml}
    <h1 style="font-size:16px;font-weight:700;margin:0 0 2px;">บันทึกการติดตามข้อมูลนักเรียน</h1>
    <h2 style="font-size:14px;font-weight:700;margin:0;">ในระบบดูแลช่วยเหลือนักเรียน โรงเรียนดาราวิทยาลัย</h2>
  </div>

  <div class="info-row">
    <div class="info-field"><span class="info-label">ชื่อ – สกุล นักเรียน</span><span class="info-val" style="min-width:200px;">${doc.studentName || ''}</span></div>
    <div class="info-field"><span class="info-label">ชั้น</span><span class="info-val" style="min-width:60px;">${doc.studentClass || ''}</span></div>
    <div class="info-field"><span class="info-label">เลขที่</span><span class="info-val" style="min-width:40px;">${doc.studentNo || ''}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ที่อยู่</span><span class="info-val" style="min-width:240px;">${doc.address || ''}</span></div>
    <div class="info-field"><span class="info-label">โทรศัพท์มือถือ</span><span class="info-val" style="min-width:120px;">${doc.phone || ''}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ชื่อ – สกุล ผู้ปกครอง</span><span class="info-val" style="min-width:160px;">${doc.parentName || ''}</span></div>
    <div class="info-field"><span class="info-label">โทรศัพท์บ้าน / ที่ทำงาน</span><span class="info-val" style="min-width:100px;">${doc.parentPhone || ''}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ครูผู้ให้คำปรึกษา</span>
    <span class="info-val" style="min-width:180px;">${doc.form3?.assignedTeacherName || doc.createdByName || ''}</span></div>
    <div class="info-field"><span class="info-label">ตำแหน่ง</span>
    <span class="info-val" style="min-width:160px;">${doc.form3?.assignedTeacherPosition || creatorPosition}</span></div>
  </div>

  <div style="margin:14px 0 6px;font-weight:700;font-size:13px;">บันทึกการดูแลช่วยเหลือ (ติดตามผล)</div>
  <table>
    <thead>
      <tr>
        <th style="width:50px;">ครั้งที่</th>
        <th style="width:90px;">วัน / เดือน / ปี</th>
        <th>ปัญหา</th>
        <th>แนวทางการช่วยเหลือ</th>
      </tr>
    </thead>
    <tbody>
      ${(doc.form3?.followupRecords || []).map((r, i) => `
        <tr>
          <td style="border:1px solid #333;padding:4px 6px;text-align:center;">${i+1}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${r.date || ''}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${r.issue || ''}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${r.approach || ''}</td>
        </tr>`).join('') || Array(8).fill(`<tr>
          <td style="border:1px solid #333;padding:4px 6px;height:26px;"></td>
          <td style="border:1px solid #333;padding:4px 6px;"></td>
          <td style="border:1px solid #333;padding:4px 6px;"></td>
          <td style="border:1px solid #333;padding:4px 6px;"></td>
        </tr>`).join('')}
    </tbody>
  </table>

  <div style="margin-top:12px;font-size:12px;color:#555;">
    <strong>หมายเหตุ:</strong> เอกสารนี้ใช้สำหรับติดตามผลการดูแลช่วยเหลือนักเรียน
    ผู้ช่วยผู้อำนวยการและหัวหน้าแผนกสามารถตรวจสอบความคืบหน้าได้ตลอดเวลาผ่านระบบออนไลน์
  </div>
</div>

</body>
</html>`
}
