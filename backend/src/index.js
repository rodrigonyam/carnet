import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const app = express()

const {
  PORT = '8787',
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_SESSION_TOKEN,
  S3_BUCKET,
  S3_PUBLIC_BASE_URL,
  CORS_ORIGIN,
} = process.env

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET) {
  console.error('Missing required env vars. Check backend/.env.example')
  process.exit(1)
}

const allowedOrigins = (CORS_ORIGIN || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean)

app.use(cors(allowedOrigins.length
  ? {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }
        callback(new Error('CORS not allowed'))
      },
    }
  : undefined))

app.use(express.json({ limit: '2mb' }))

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    ...(AWS_SESSION_TOKEN ? { sessionToken: AWS_SESSION_TOKEN } : {}),
  },
})

function isSafeKey(key) {
  return typeof key === 'string' && key.length > 0 && key.length <= 1024 && !key.includes('..')
}

function encodeKeyForUrl(key) {
  return key.split('/').map((part) => encodeURIComponent(part)).join('/')
}

function objectUrlForKey(key) {
  if (S3_PUBLIC_BASE_URL) {
    return `${S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`
  }
  return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${encodeKeyForUrl(key)}`
}

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/s3/presign-upload', async (req, res) => {
  try {
    const { key, contentType } = req.body || {}

    if (!isSafeKey(key)) {
      res.status(400).json({ error: 'Invalid key' })
      return
    }

    if (!contentType || typeof contentType !== 'string') {
      res.status(400).json({ error: 'contentType is required' })
      return
    }

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

    res.json({
      uploadUrl,
      fileUrl: objectUrlForKey(key),
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    console.error('presign-upload error', error)
    res.status(500).json({ error: 'Failed to create upload URL' })
  }
})

app.post('/api/s3/delete', async (req, res) => {
  try {
    const { key } = req.body || {}

    if (!isSafeKey(key)) {
      res.status(400).json({ error: 'Invalid key' })
      return
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      })
    )

    res.json({ ok: true })
  } catch (error) {
    console.error('delete error', error)
    res.status(500).json({ error: 'Failed to delete object' })
  }
})

app.listen(Number(PORT), () => {
  console.log(`S3 backend listening on http://localhost:${PORT}`)
})
