import { getAuditCollection } from './mongodb';

/**
 * Log an action to the audit trail
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - The action performed (e.g., 'create', 'update', 'delete', 'view')
 * @param {string} params.resource - The resource being acted upon (e.g., 'item', 'category', 'sale')
 * @param {string} params.resourceId - The ID of the resource (optional)
 * @param {Object} params.user - The user who performed the action
 * @param {string} params.user.id - The user ID
 * @param {string} params.user.name - The user name
 * @param {string} params.user.email - The user email
 * @param {string} params.user.role - The user role
 * @param {Object} params.details - Additional details about the action (optional)
 * @param {string} params.ipAddress - The IP address of the user (optional)
 * @returns {Promise<Object>} - The created audit log entry
 */
export async function logActivity({
  action,
  resource,
  resourceId = null,
  user,
  details = {},
  ipAddress = null
}) {
  try {
    const collection = await getAuditCollection();
    
    const auditLog = {
      timestamp: new Date(),
      action,
      resource,
      resourceId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      details,
      ipAddress
    };
    
    const result = await collection.insertOne(auditLog);
    return { ...auditLog, _id: result.insertedId };
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent disrupting the main application flow
    return null;
  }
}

/**
 * Get audit logs with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Number of items per page
 * @param {Object} options.filter - Filter criteria
 * @returns {Promise<Object>} - Paginated audit logs
 */
export async function getAuditLogs({
  page = 1,
  limit = 20,
  filter = {}
}) {
  try {
    const collection = await getAuditCollection();
    
    // Build query from filter
    const query = {};
    
    if (filter.action) query.action = filter.action;
    if (filter.resource) query.resource = filter.resource;
    if (filter.resourceId) query.resourceId = filter.resourceId;
    if (filter.userId) query['user.id'] = parseInt(filter.userId);
    if (filter.userRole) query['user.role'] = filter.userRole;
    
    // Date range filter
    if (filter.startDate || filter.endDate) {
      query.timestamp = {};
      if (filter.startDate) query.timestamp.$gte = new Date(filter.startDate);
      if (filter.endDate) query.timestamp.$lte = new Date(filter.endDate);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    // Get paginated results
    const logs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error('Failed to fetch audit logs');
  }
}