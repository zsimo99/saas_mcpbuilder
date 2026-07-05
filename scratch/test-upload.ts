process.env.PAYLOAD_SECRET = 'd895aaf38d63809773302c6b'
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_rq2McyXwGLh4@ep-falling-dawn-atx0k4oh-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
process.env.S3_ENDPOINT = 'https://s3.tybot.ma'
process.env.S3_ACCESS_KEY_ID = 'tlVfOzr1Cot5a5dkidFz'
process.env.S3_SECRET_ACCESS_KEY = 'wOPeOrnR1LxsmlE9yTddVO6zcbY4lrDcSCeKeDWD'
process.env.S3_BUCKET = 'zoraa'
process.env.S3_REGION = 'us-east-1'

import path from 'path'
import fs from 'fs'

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')
  
  const payload = await getPayload({ config })
  
  // Create a temporary mock image file
  const tempDir = path.resolve(process.cwd(), '.tmp')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }
  const testFilePath = path.join(tempDir, 'test-upload-hook.png')
  
  // Write 100 bytes of mock binary data
  fs.writeFileSync(testFilePath, Buffer.alloc(100))
  console.log(`Created mock file at: ${testFilePath}`)

  console.log('Uploading file via Payload Local API...')
  const result = await payload.create({
    collection: 'media',
    data: {
      alt: 'Test Hook Upload',
      domain: 1, // Assumes domain ID 1 exists
    },
    filePath: testFilePath,
  })

  console.log('UPLOAD RESULT:')
  console.dir(result, { depth: null })

  // Check if local copy in media/ exists
  const localMediaPath = path.resolve(process.cwd(), 'media', result.filename || '')
  console.log(`Checking if file exists locally at ${localMediaPath}:`, fs.existsSync(localMediaPath))

  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
