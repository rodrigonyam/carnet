import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc, deleteDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBxjAmE1ZjFw4EM2hv--oaYfd_lwbZ5v9g',
  authDomain: 'carnets-cbb8b.firebaseapp.com',
  projectId: 'carnets-cbb8b',
  storageBucket: 'carnets-cbb8b.firebasestorage.app',
  messagingSenderId: '1091141529740',
  appId: '1:1091141529740:web:cb8ff55ec31bcd3e288ba9',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const key = `carnet/test/image-consistency-${Date.now()}.png`
const pngBytes = Uint8Array.from([
  0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,
  0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
  0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
  0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,
  0xDE,0x00,0x00,0x00,0x0C,0x49,0x44,0x41,
  0x54,0x08,0xD7,0x63,0xF8,0xCF,0xC0,0x00,
  0x00,0x03,0x01,0x01,0x00,0x18,0xDD,0x8D,
  0xB1,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,
  0x44,0xAE,0x42,0x60,0x82
])

const presignRes = await fetch('http://localhost:8787/api/s3/presign-upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key, contentType: 'image/png' }),
})
if (!presignRes.ok) {
  throw new Error(`Presign failed: ${presignRes.status} ${await presignRes.text()}`)
}
const presign = await presignRes.json()

const putRes = await fetch(presign.uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/png', ...(presign.headers || {}) },
  body: pngBytes,
})
if (!putRes.ok) {
  throw new Error(`S3 PUT failed: ${putRes.status} ${await putRes.text()}`)
}

const docRef = await addDoc(collection(db, 'entries'), {
  title: 'Image Consistency Smoke Test',
  notes: 'automated check',
  category: 'photo',
  fileName: 'smoke.png',
  fileType: 'image/png',
  fileSize: pngBytes.length,
  downloadURL: presign.fileUrl,
  storagePath: key,
  createdAt: serverTimestamp(),
})

const snap = await getDoc(doc(db, 'entries', docRef.id))
if (!snap.exists()) {
  throw new Error('Firestore document was not found after write')
}
const data = snap.data()

const checks = {
  fileType: data.fileType === 'image/png',
  category: data.category === 'photo',
  downloadURL: data.downloadURL === presign.fileUrl,
  storagePath: data.storagePath === key,
  hasCreatedAt: !!data.createdAt,
}

const failed = Object.entries(checks).filter(([, ok]) => !ok)
if (failed.length) {
  throw new Error(`Consistency check failed: ${failed.map(([k]) => k).join(', ')}`)
}

await deleteDoc(doc(db, 'entries', docRef.id))
await fetch('http://localhost:8787/api/s3/delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key }),
})

console.log('CONSISTENCY_OK')
console.log(`DOC_ID:${docRef.id}`)
console.log(`S3_URL:${presign.fileUrl}`)
