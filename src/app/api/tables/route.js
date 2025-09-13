import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tables - Get all tables
export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const tables = await prisma.table.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}

// POST /api/tables - Create a new table
export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const { name, capacity } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
    }
    
    // Check if table with the same name already exists
    const existingTable = await prisma.table.findUnique({
      where: { name }
    })
    
    if (existingTable) {
      return NextResponse.json({ error: 'Table with this name already exists' }, { status: 400 })
    }
    
    const table = await prisma.table.create({
      data: {
        name,
        capacity: capacity || 4,
        status: 'available'
      }
    })
    
    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}