import{R as $,f,t as v}from"./index-CVmJXaa1.js";const x=i=>{if(!i)return"...........................";try{return f(new Date(i),"d MMMM yyyy",{locale:v})}catch{return i}},u=i=>{if(!i)return"........../........../...........";try{return f(new Date(i),"d/M/yyyy",{locale:v})}catch{return i}};function D(i,p=null){var d,o,r;const l=i.records||[],g=i.problems||[],h=i.helpDone||[],m=i.remaining||[],c=i.suggestions||[],e=p?`<img src="${p}" style="width:72px;height:72px;object-fit:contain;display:block;margin:0 auto 8px;" />`:'<div style="width:72px;height:72px;background:#1d4ed8;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:800;margin:0 auto 8px;">ด</div>',y=l.length>0?l.map((s,t)=>`
        <tr>
          <td style="border:1px solid #333;padding:4px 6px;text-align:center;">${s.session||t+1}</td>
          <td style="border:1px solid #333;padding:4px 6px;white-space:nowrap;">${s.date||""}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${s.issue||""}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${s.approach||""}</td>
        </tr>`).join(""):Array(6).fill(`<tr>
        <td style="border:1px solid #333;padding:4px 6px;height:26px;"></td>
        <td style="border:1px solid #333;padding:4px 6px;"></td>
        <td style="border:1px solid #333;padding:4px 6px;"></td>
        <td style="border:1px solid #333;padding:4px 6px;"></td>
      </tr>`).join(""),n=(s,t=3)=>(s.length>0?s:Array(t).fill("")).map((b,w)=>`
      <div style="margin-bottom:10px;display:flex;gap:6px;">
        <span style="font-weight:600;white-space:nowrap;">${w+1}.</span>
        <span style="flex:1;border-bottom:1px solid #ccc;padding-bottom:2px;">${b||"&nbsp;"}</span>
      </div>`).join(""),a=$[i.creatorRole]||i.advisorPosition||"ครูที่ปรึกษา";return`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>แบบรายงานการดูแลช่วยเหลือนักเรียน - ${i.studentName}</title>
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
    ${e}
    <h1 style="font-size:16px;font-weight:700;margin:0 0 2px;">แบบรายงานการดูแลช่วยเหลือนักเรียน</h1>
    <div style="font-size:12px;color:#555;">(สำหรับครูที่ปรึกษาและครูทั่วไป)</div>
  </div>

  <div class="info-row">
    <div class="info-field"><span class="info-label">ชื่อ – สกุล นักเรียน</span><span class="info-val" style="min-width:200px;">${i.studentName||""}</span></div>
    <div class="info-field"><span class="info-label">ชั้น</span><span class="info-val" style="min-width:60px;">${i.studentClass||""}</span></div>
    <div class="info-field"><span class="info-label">เลขที่</span><span class="info-val" style="min-width:40px;">${i.studentNo||""}</span></div>
    <div class="info-field"><span class="info-label">เลขประจำตัว</span><span class="info-val" style="min-width:80px;">${i.studentId||""}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ที่อยู่</span><span class="info-val" style="min-width:320px;">${i.address||""}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ชื่อ – สกุล ผู้ปกครอง</span><span class="info-val" style="min-width:180px;">${i.parentName||""}</span></div>
    <div class="info-field"><span class="info-label">เบอร์โทรติดต่อ</span><span class="info-val" style="min-width:120px;">${i.parentPhone||""}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ครูผู้ให้คำปรึกษา</span><span class="info-val" style="min-width:180px;">${i.advisorName||i.createdByName||""}</span></div>
    <div class="info-field"><span class="info-label">ตำแหน่ง</span><span class="info-val" style="min-width:160px;">${a}</span></div>
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
    <tbody>${y}</tbody>
  </table>
</div>

<!-- ═══════ หน้า 2: เอกสาร 2 ═══════ -->
<div class="page">
  <div style="text-align:center;margin-bottom:14px;">
    ${e}
    <h1 style="font-size:16px;font-weight:700;margin:0 0 2px;">แบบรายงานการดูแลช่วยเหลือนักเรียน</h1>
    <h2 style="font-size:14px;font-weight:700;margin:0;">(การส่งต่อนักเรียนภายใน)</h2>
  </div>

  <div class="info-row">
    <div class="info-field"><span class="info-label">วันที่</span><span class="info-val" style="min-width:200px;">${x(i.referralDate||i.createdAt)}</span></div>
  </div>
  <div style="margin:6px 0;font-size:13px;font-weight:600;">เรื่อง &nbsp;ขอความร่วมมือในการดูแลช่วยเหลือนักเรียน</div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">เรียน</span><span class="info-val" style="min-width:280px;">${i.referralTo||""}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">สิ่งที่ส่งมาด้วย</span><span class="info-val" style="min-width:260px;">${i.attachment||"แบบบันทึกการดูแลช่วยเหลือนักเรียน"}</span></div>
  </div>

  <div style="margin:8px 0;font-size:13px;line-height:2;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ด้วยนักเรียน ชื่อ – สกุล
    <span class="info-val" style="min-width:160px;">${i.studentName||""}</span>
    ชั้น <span class="info-val" style="min-width:50px;">${i.studentClass||""}</span>
    เลขที่ <span class="info-val" style="min-width:35px;">${i.studentNo||""}</span>
    เลขประจำตัว <span class="info-val" style="min-width:70px;">${i.studentId||""}</span>
    โทรศัพท์ที่ติดต่อได้ <span class="info-val" style="min-width:100px;">${i.phone||""}</span>
    ปัญหาที่พบสรุปได้ดังนี้
  </div>

  ${n(g)}

  <div style="margin:8px 0 4px;font-weight:600;font-size:13px;">และได้ดำเนินการช่วยเหลือเบื้องต้นแล้วดังนี้</div>
  ${n(h)}

  <div style="margin:8px 0 4px;font-weight:600;font-size:13px;">แต่ยังคงมีปัญหาดังนี้</div>
  ${n(m)}

  <div style="margin:8px 0 4px;font-weight:600;font-size:13px;">ข้อเสนอแนะอื่น ๆ</div>
  ${n(c)}

  <div style="margin:10px 0 4px;font-size:13px;">จึงเรียนมาเพื่อขอความร่วมมือในการดูแลช่วยเหลือแก้ไขปัญหาของนักเรียนดังกล่าว</div>

  <!-- ลายเซ็น 3 ช่อง ตามเอกสารจริง -->
  <div class="sig-section" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;">

    <!-- ซ้าย: ผู้ช่วย ผอ. (กล่อง) -->
    <div style="border:1px solid #999;border-radius:4px;padding:14px;font-size:12px;">
      <div style="margin-bottom:6px;font-size:12px;">
        <span>วันที่</span>
        <span style="border-bottom:1px solid #333;display:inline-block;min-width:160px;padding:0 4px;">
          ${i.asstDirSignedAt?x(i.asstDirSignedAt):""}
        </span>
      </div>
      <div style="margin-bottom:8px;font-size:12px;">
        เรียน <strong>${i.targetDeptName||"หัวหน้างานฝ่ายต่างๆ"}</strong>
      </div>
      ${i.asstDirNote?'<div style="font-size:12px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:4px;padding:8px;margin-bottom:8px;min-height:48px;line-height:1.6;">'+i.asstDirNote+"</div>":'<div style="min-height:48px;border:1px dashed #ccc;border-radius:4px;margin-bottom:8px;"></div>'}
      <div style="height:56px;border:1px dashed #ccc;border-radius:4px;background:#fafafa;margin:8px 0;
           display:flex;align-items:center;justify-content:center;">
        ${i.asstDirSig?`<img src="${i.asstDirSig}" style="max-height:52px;max-width:180px;" />`:""}
      </div>
      <div style="font-size:12px;line-height:1.9;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <span>ลงชื่อ</span>
          <span>ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน</span>
        </div>
        <div style="text-align:center;">(${i.asstDirName||"........................................"})</div>
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
          ${i.teacherSig?`<img src="${i.teacherSig}" style="max-height:56px;max-width:200px;" />`:""}
        </div>
        <div style="font-size:12px;line-height:1.7;">
          <div>(${i.createdByName||"........................................"})</div>
          <div style="font-weight:600;">${a}</div>
        </div>
      </div>

      <!-- ขวาล่าง: ลายเซ็นหัวหน้าแผนก -->
      <div style="text-align:center;">
        <div style="height:56px;border:1px solid #ccc;border-radius:4px;background:#fafafa;
             display:flex;align-items:center;justify-content:center;margin-bottom:4px;">
          ${i.deptHeadSig?`<img src="${i.deptHeadSig}" style="max-height:52px;max-width:200px;" />`:""}
        </div>
        <div style="font-size:12px;line-height:1.7;">
          <div>ลงชื่อ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; หัวหน้าแผนก</div>
          <div>(${i.deptHeadName||"........................................"})</div>
          <div>${i.deptHeadSignedAt?u(i.deptHeadSignedAt):"......../......../........"}  </div>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- ═══════ หน้า 3: เอกสาร 3 ═══════ -->
<div class="page">
  <div style="text-align:center;margin-bottom:14px;">
    ${e}
    <h1 style="font-size:16px;font-weight:700;margin:0 0 2px;">บันทึกการติดตามข้อมูลนักเรียน</h1>
    <h2 style="font-size:14px;font-weight:700;margin:0;">ในระบบดูแลช่วยเหลือนักเรียน โรงเรียนดาราวิทยาลัย</h2>
  </div>

  <div class="info-row">
    <div class="info-field"><span class="info-label">ชื่อ – สกุล นักเรียน</span><span class="info-val" style="min-width:200px;">${i.studentName||""}</span></div>
    <div class="info-field"><span class="info-label">ชั้น</span><span class="info-val" style="min-width:60px;">${i.studentClass||""}</span></div>
    <div class="info-field"><span class="info-label">เลขที่</span><span class="info-val" style="min-width:40px;">${i.studentNo||""}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ที่อยู่</span><span class="info-val" style="min-width:240px;">${i.address||""}</span></div>
    <div class="info-field"><span class="info-label">โทรศัพท์มือถือ</span><span class="info-val" style="min-width:120px;">${i.phone||""}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ชื่อ – สกุล ผู้ปกครอง</span><span class="info-val" style="min-width:160px;">${i.parentName||""}</span></div>
    <div class="info-field"><span class="info-label">โทรศัพท์บ้าน / ที่ทำงาน</span><span class="info-val" style="min-width:100px;">${i.parentPhone||""}</span></div>
  </div>
  <div class="info-row">
    <div class="info-field"><span class="info-label">ครูผู้ให้คำปรึกษา</span>
    <span class="info-val" style="min-width:180px;">${((d=i.form3)==null?void 0:d.assignedTeacherName)||i.createdByName||""}</span></div>
    <div class="info-field"><span class="info-label">ตำแหน่ง</span>
    <span class="info-val" style="min-width:160px;">${((o=i.form3)==null?void 0:o.assignedTeacherPosition)||a}</span></div>
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
      ${(((r=i.form3)==null?void 0:r.followupRecords)||[]).map((s,t)=>`
        <tr>
          <td style="border:1px solid #333;padding:4px 6px;text-align:center;">${t+1}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${s.date||""}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${s.issue||""}</td>
          <td style="border:1px solid #333;padding:4px 6px;">${s.approach||""}</td>
        </tr>`).join("")||Array(8).fill(`<tr>
          <td style="border:1px solid #333;padding:4px 6px;height:26px;"></td>
          <td style="border:1px solid #333;padding:4px 6px;"></td>
          <td style="border:1px solid #333;padding:4px 6px;"></td>
          <td style="border:1px solid #333;padding:4px 6px;"></td>
        </tr>`).join("")}
    </tbody>
  </table>

  <div style="margin-top:12px;font-size:12px;color:#555;">
    <strong>หมายเหตุ:</strong> เอกสารนี้ใช้สำหรับติดตามผลการดูแลช่วยเหลือนักเรียน
    ผู้ช่วยผู้อำนวยการและหัวหน้าแผนกสามารถตรวจสอบความคืบหน้าได้ตลอดเวลาผ่านระบบออนไลน์
  </div>
</div>

</body>
</html>`}export{D as buildPrintHTML};
