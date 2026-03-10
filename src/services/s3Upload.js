const API_BASE = (import.meta.env.VITE_S3_API_BASE_URL || '').replace(/\/$/, '')

function endpoint(path) {
  return `${API_BASE}${path}`
}

function fileKey(category, fileName) {
  const safeName = fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
  return `carnet/${category}/${Date.now()}_${safeName}`
}

async function requestUploadUrl({ key, fileType }) {
  const response = await fetch(endpoint('/api/s3/presign-upload'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, contentType: fileType }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Failed to get upload URL (${response.status}): ${message}`)
  }

  return response.json()
}

function putFileWithProgress(uploadUrl, file, onProgress, headers = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)

    Object.entries(headers).forEach(([name, value]) => {
      xhr.setRequestHeader(name, value)
    })

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onerror = () => reject(new Error('S3 upload request failed'))

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`S3 upload failed (${xhr.status})`))
      }
    }

    xhr.send(file)
  })
}

export async function uploadFileToS3({ file, category, onProgress }) {
  const key = fileKey(category, file.name)
  const payload = await requestUploadUrl({ key, fileType: file.type || 'application/octet-stream' })

  await putFileWithProgress(payload.uploadUrl, file, onProgress, payload.headers || {})

  return {
    key,
    fileUrl: payload.fileUrl,
  }
}

export async function deleteFileFromS3({ key }) {
  if (!key) return

  const response = await fetch(endpoint('/api/s3/delete'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Failed to delete S3 object (${response.status}): ${message}`)
  }
}
