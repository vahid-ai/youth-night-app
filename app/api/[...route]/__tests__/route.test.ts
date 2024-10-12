import { createApp } from '../route'
import { drizzle } from 'drizzle-orm/neon-http'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

// Mock the database
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

jest.mock('drizzle-orm/neon-http');
jest.mock('@neondatabase/serverless');

type MockFunction = jest.Mock<any>

interface MockDatabase {
  select: MockFunction;
  insert: MockFunction;
  where: MockFunction;
  from: MockFunction;
  values: MockFunction;
  returning: MockFunction;
  limit: MockFunction;
  execute: MockFunction;
}

const mockDb: MockDatabase = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  execute: jest.fn().mockImplementation(() => Promise.resolve([])),
}

// Mock the drizzle function to return our mockDb
;(drizzle as jest.MockedFunction<typeof drizzle>).mockReturnValue(mockDb as any)

describe('API Routes', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    jest.clearAllMocks()
    app = createApp(mockDb)
  })

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
      ]
      mockDb.execute.mockResolvedValue(mockUsers)

      const res = await app.request('/api/users')

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(mockUsers)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should return a user when given a valid ID', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' }
      mockDb.execute.mockResolvedValue([mockUser])

      const res = await app.request('/api/users/1')

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(mockUser)
    })

    it('should return 404 when user is not found', async () => {
      mockDb.execute.mockResolvedValue([])

      const res = await app.request('/api/users/999')

      expect(res.status).toBe(404)
      expect(await res.json()).toEqual({ error: 'User not found' })
    })

    it('should return 400 when given an invalid ID', async () => {
      const res = await app.request('/api/users/invalid')

      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'Invalid user ID' })
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user with valid input', async () => {
      const newUser = { name: 'New User', email: 'new@example.com' }
      const createdUser = { id: 3, ...newUser }
      mockDb.execute.mockResolvedValue([createdUser])

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(res.status).toBe(201)
      expect(await res.json()).toEqual(createdUser)
    })

    it('should return 400 with invalid input', async () => {
      const invalidUser = { name: '', email: 'invalid-email' }

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidUser),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(res.status).toBe(400)
      expect(await res.json()).toHaveProperty('error')
    })
  })
})
