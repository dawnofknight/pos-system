import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tables/[id] - Get a specific table
export async function GET(request, { params }) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const { id } = params
    
    const table = await prisma.table.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }
    
    return NextResponse.json(table)
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json({ error: 'Failed to fetch table' }, { status: 500 })
  }
}

// PUT /api/tables/[id] - Update a table
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const { id } = params
    const { name, capacity, status } = await request.json()
    
    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (!existingTable) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }
    
    // Check if name is unique if it's being changed
    if (name && name !== existingTable.name) {
      const tableWithSameName = await prisma.table.findUnique({
        where: { name }
      })
      
      if (tableWithSameName) {
        return NextResponse.json({ error: 'Table with this name already exists' }, { status: 400 })
      }
    }
    
    const updatedTable = await prisma.table.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingTable.name,
        capacity: capacity !== undefined ? capacity : existingTable.capacity,
        status: status || existingTable.status
      }
    })
    
    return NextResponse.json(updatedTable)
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}

// DELETE /api/tables/[id] - Delete a table
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const { id } = params
    
    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (!existingTable) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }
    
    // Check if table is being used in any active sales
    const activeSales = await prisma.sale.findFirst({
      where: {
        tableId: parseInt(id),
        status: 'active'
      }
    })
    
    if (activeSales) {
      return NextResponse.json({ error: 'Cannot delete table with active sales' }, { status: 400 })
    }
    
    await prisma.table.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}