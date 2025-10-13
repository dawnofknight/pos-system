import { logActivity } from './auditLogger';
import { headers } from 'next/headers';

/**
 * Middleware to automatically log API actions
 * @param {Object} req - The request object
 * @param {Object} user - The authenticated user
 * @param {string} action - The action being performed
 * @param {string} resource - The resource being acted upon
 * @param {string|number} resourceId - The ID of the resource (optional)
 * @param {Object} details - Additional details about the action (optional)
 */
export async function auditRequest(req, user, action, resource, resourceId = null, details = {}) {
  try {
    // Get IP address from headers
    const headersList = headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    
    // Log the activity
    await logActivity({
      action,
      resource,
      resourceId,
      user,
      details,
      ipAddress
    });
  } catch (error) {
    // Log error but don't disrupt the main flow
    console.error('Audit logging error:', error);
  }
}

/**
 * Higher-order function to wrap API handlers with audit logging
 * @param {Function} handler - The API route handler
 * @param {Object} options - Audit options
 * @param {string} options.action - The action being performed
 * @param {string} options.resource - The resource being acted upon
 * @returns {Function} - The wrapped handler
 */
export function withAudit(handler, { action, resource }) {
  return async (req, params) => {
    let user = req.user;
    
    // If no authenticated user, just call the handler
    if (!user) {
      return handler(req, params);
    }
    
    // If we only have userId, fetch complete user data
    if (user && user.id && (!user.name || !user.email || !user.role)) {
      try {
        const { prisma } = await import('./prisma');
        const completeUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, name: true, email: true, role: true }
        });
        
        if (completeUser) {
          user = completeUser;
        }
      } catch (error) {
        console.error('Error fetching complete user data for audit:', error);
      }
    }
    
    // Extract resource ID from params if available
    const resourceId = params?.id || null;
    
    // Log the activity
    await auditRequest(req, user, action, resource, resourceId);
    
    // Call the original handler
    return handler(req, params);
  };
}