import { createError } from 'h3';
import { verifyToken } from '../utils/auth';

export default defineEventHandler(async (event) => {
  // Check if this is an API route
  const path = event.node.req.url;
  
  // Skip validation for non-API routes or health checks
  if (!path?.startsWith('/api/') || path === '/api/health') {
    return;
  }
  
  // Skip validation for auth endpoints
  if (path.startsWith('/api/auth/')) {
    return;
  }
  
  // Get token from headers
  const authHeader = event.node.req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Missing or invalid token',
    });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    // Verify token
    const decodedToken = await verifyToken(token);
    
    // Set user in event context
    event.context.user = decodedToken.user;
    event.context.workspace = decodedToken.workspace;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid token',
    });
  }
});
