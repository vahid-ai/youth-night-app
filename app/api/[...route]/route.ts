import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'

import { z } from 'zod'
import { users } from './db/schema'

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!)

// Initialize Drizzle
const defaultDb = drizzle(sql)

export const createApp = (injectedDb?: any) => {
  const db = injectedDb || defaultDb
  const app = new Hono().basePath('/api')

  // Zod schema for user input validation
  const UserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
  })

  app.get('/users', async (c) => {
    try {
      const allUsers = await db.select().from(users).execute()
      return c.json(allUsers)
    } catch (error) {
      console.error(error)
      return c.json({ error: 'Failed to fetch users' }, 500)
    }
  })

  app.get('/users/:id', async (c) => {
    const id = z.coerce.number().safeParse(c.req.param('id'))
    if (!id.success) {
      return c.json({ error: 'Invalid user ID' }, 400)
    }
    try {
      const user = await db.select().from(users).where(eq(users.id, id.data)).limit(1).execute()
      if (user.length === 0) {
        return c.json({ error: 'User not found' }, 404)
      }
      return c.json(user[0])
    } catch (error) {
      console.error(error)
      return c.json({ error: 'Failed to fetch user' }, 500)
    }
  })

  app.post('/users', async (c) => {
    const body = await c.req.json()
    const result = UserSchema.safeParse(body)
    
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400)
    }

    try {
      const newUser = await db.insert(users).values(result.data).returning().execute()
      return c.json(newUser[0], 201)
    } catch (error) {
      console.error(error)
      return c.json({ error: 'Failed to create user' }, 500)
    }
  })

  return app
}

export const app = createApp()
export const GET = handle(app)
export const POST = handle(app)
