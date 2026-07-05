process.env.PAYLOAD_SECRET = 'd895aaf38d63809773302c6b'
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_rq2McyXwGLh4@ep-falling-dawn-atx0k4oh-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
process.env.S3_ENDPOINT = 'https://s3.tybot.ma'
process.env.S3_ACCESS_KEY_ID = 'tlVfOzr1Cot5a5dkidFz'
process.env.S3_SECRET_ACCESS_KEY = 'wOPeOrnR1LxsmlE9yTddVO6zcbY4lrDcSCeKeDWD'
process.env.S3_BUCKET = 'zoraa'
process.env.S3_REGION = 'us-east-1'

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')
  
  const payload = await getPayload({ config })
  const media = await payload.find({
    collection: 'media',
    limit: 100,
  })
  console.log('MEDIA DOCUMENTS:')
  console.dir(media.docs, { depth: null })
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
