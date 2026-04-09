# ระบบ 4 ประสาน 3 สายใย
### โรงเรียนดาราวิทยาลัย เชียงใหม่

ระบบดูแลช่วยเหลือนักเรียนออนไลน์ พร้อมลายเซ็นดิจิทัล

---

## ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Firebase
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. สร้าง Project ใหม่
3. เปิด Authentication → Sign-in method → เปิด Google
4. คัดลอก config มาใส่ `.env`

```bash
cp .env.example .env
```

### 3. ตั้งค่า Google Sheets + Apps Script
1. สร้าง Google Sheet ใหม่
2. คัดลอก ID จาก URL (ระหว่าง `/d/` และ `/edit`)
3. ไปที่ Extensions → Apps Script
4. วางโค้ดจากไฟล์ `Code.gs` ลงไป
5. เปลี่ยน `YOUR_GOOGLE_SHEET_ID` เป็น ID จริง
6. Deploy → New Deployment → Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
7. คัดลอก URL มาใส่ `.env` เป็น `VITE_APPS_SCRIPT_URL`

### 4. ไฟล์ .env
```
VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/xxxx/exec
```

### 5. Run locally
```bash
npm run dev
```

### 6. Deploy ขึ้น GitHub Pages
```bash
# ติดตั้ง gh-pages
npm install --save-dev gh-pages

# เพิ่มใน package.json > scripts:
# "predeploy": "npm run build",
# "deploy": "gh-pages -d dist"

# แก้ homepage ใน package.json ให้ตรงกับ repo
# "homepage": "https://YOUR_USERNAME.github.io/dara-4prasan"

npm run deploy
```

---

## Workflow

```
ครูที่ปรึกษา / ครูที่พบปัญหา
  → กรอกเอกสาร 1 (แบบบันทึกการดูแล) + เอกสาร 2 (แบบส่งต่อ)
        ↓
หัวหน้าแผนก
  → เซ็นรับรองเอกสาร 1+2 (หรือส่งคืนแก้ไข)
        ↓
ผู้ช่วยผู้อำนวยการฝ่ายกิจการนักเรียน
  → เซ็นรับรอง + สร้างเอกสาร 3 ส่งต่อฝ่ายที่รับผิดชอบ
        ↓
ฝ่ายแนะแนว / ฝ่ายปกครอง / ฝ่ายวิชาการ
  → ดำเนินการ + เซ็น
        ↓
เอกสารสมบูรณ์ (บันทึก Audit Log + ดาวน์โหลด PDF)
```

---

## อีเมลฝ่ายต่างๆ
แก้ไขในไฟล์ `Code.gs` ฟังก์ชัน `createForm3`:
```js
const DEPT_EMAILS = {
  guidance:   'guidance@dara.ac.th',
  discipline: 'discipline@dara.ac.th',
  academic:   'academic@dara.ac.th',
}
```

---

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: Firebase Authentication (Google)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Deploy**: GitHub Pages
