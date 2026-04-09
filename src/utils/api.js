const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export async function apiFetch(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action, ...payload }),
  })
  return res.json()
}

// เอกสาร 1: แบบบันทึกการดูแล
export const createForm1 = (data) => apiFetch('createForm1', data)
export const getForm1 = (docId) => apiFetch('getForm1', { docId })

// เอกสาร 2: แบบส่งต่อภายใน
export const createForm2 = (data) => apiFetch('createForm2', data)
export const getForm2 = (docId) => apiFetch('getForm2', { docId })

// เอกสาร 3: บันทึกการติดตาม
export const createForm3 = (data) => apiFetch('createForm3', data)
export const getForm3 = (docId) => apiFetch('getForm3', { docId })

// การเซ็นชื่อ
export const signDocument = (data) => apiFetch('signDocument', data)

// การส่งคืน
export const returnDocument = (data) => apiFetch('returnDocument', data)

// ดึงเอกสารทั้งหมดของผู้ใช้
export const getMyDocuments = (email, role) => apiFetch('getMyDocuments', { email, role })

// ประวัติ audit log
export const getAuditLog = (docId) => apiFetch('getAuditLog', { docId })
