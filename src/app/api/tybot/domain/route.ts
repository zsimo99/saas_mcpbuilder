import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const POST = async (request: Request) => {
  try {
    const body = await request.json()

    // Accept flexible request body field names
    const name = body.name || body.domainName
    const domain = body.domain || body.domainUrl
    const slug = body.slug || body.domainSlug
    const email = body.email
    const password = body.password
    const userEmail=body.userEmail
    const userPassword=body.userPassword

    // Validate request body
    if (!name || !domain || !slug || !email || !password || !userEmail || !userPassword) {
      return Response.json({
        error: 'Missing required fields: name, domain, slug, email, and password must be provided.'
      }, { status: 400 })
    }
    
    

    const payload = await getPayload({
      config: configPromise,
    })

    const loggedIn=await payload.login({
        collection: 'users',
        data: {
          email: userEmail,
          password: userPassword,
        },
        // overrideAccess: true,
      })
      if(!loggedIn){
        return Response.json({
          error: 'Failed to login.'
        }, { status: 400 })
      }

    // 1. Create the new Domain document (this will trigger S3 bucket creation via Domain hooks)
    const domainDoc = await payload.create({
      collection: 'domain',
      data: {
        title: name,
        domain,
        slug,
      },
      overrideAccess: true,
    })

    // 2. Create the User and link them to the new domain
    const userDoc = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        role: 'user',
        domain: [domainDoc.id],
      },
      overrideAccess: true,
    })

    // 3. Create the Domain default Home Page with a Hero layout block
    const pageDoc = await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        domain: domainDoc.id,
        layout: [
          {
            blockType: 'Hero',
            content: {
              heading: `Welcome to ${name}`,
              subheading: `This is the default home page for ${domain}. You can customize this page and its block layout in the admin panel.`,
            },
          }
        ],
      },
      overrideAccess: true,
    })

    return Response.json({
      message: 'Domain, User, and Page successfully registered.',
      domain: domainDoc,
      user: {
        id: userDoc.id,
        email: userDoc.email,
        role: userDoc.role,
      },
      page: pageDoc,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error in custom domain registration API:', error)
    return Response.json({
      error: error.message || 'An unexpected error occurred during registration.'
    }, { status: 500 })
  }
}
