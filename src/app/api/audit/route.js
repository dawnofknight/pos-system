import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAuditLogs } from '@/lib/auditLogger';

export async function GET(request) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build filter from query parameters
    const filter = {};
    if (searchParams.get('action')) filter.action = searchParams.get('action');
    if (searchParams.get('resource')) filter.resource = searchParams.get('resource');
    if (searchParams.get('resourceId')) filter.resourceId = searchParams.get('resourceId');
    if (searchParams.get('userId')) filter.userId = searchParams.get('userId');
    if (searchParams.get('userRole')) filter.userRole = searchParams.get('userRole');
    if (searchParams.get('startDate')) filter.startDate = searchParams.get('startDate');
    if (searchParams.get('endDate')) filter.endDate = searchParams.get('endDate');
    
    // Get audit logs
    const result = await getAuditLogs({ page, limit, filter });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}