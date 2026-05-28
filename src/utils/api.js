const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export async function apiFetch(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action, ...payload }),
  })
  return res.json()
}

export const createDocument   = (d) => apiFetch('createDocument', d)
export const getDocument      = (docId) => apiFetch('getDocument', { docId })
export const getMyDocuments   = (email) => apiFetch('getMyDocuments', { email })
export const signDocument     = (d) => apiFetch('signDocument', d)
export const returnDocument   = (d) => apiFetch('returnDocument', d)
export const resubmitDocument = (d) => apiFetch('resubmitDocument', d)
export const assignChief      = (d) => apiFetch('assignChief', d)
export const createForm3      = (d) => apiFetch('createForm3', d)
export const updateForm3      = (d) => apiFetch('updateForm3', d)
export const getForm3         = (docId) => apiFetch('getForm3', { docId })
export const getAuditLog      = (docId) => apiFetch('getAuditLog', { docId })
export const deleteDocument   = (docId, byEmail, byName) => apiFetch('deleteDocument', { docId, byEmail, byName })
export const getUsers         = () => apiFetch('getUsers', {})
export const upsertUser       = (d) => apiFetch('upsertUser', d)
export const deleteUser       = (email) => apiFetch('deleteUser', { email })
export const getUserProfile   = (email) => apiFetch('getUserProfile', { email })
export const getSettings      = () => apiFetch('getSettings', {})
export const saveSettings     = (d) => apiFetch('saveSettings', d)
export const resetAllSheets   = (byEmail, byName) => apiFetch('resetAllSheets', { byEmail, byName })
