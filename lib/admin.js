import { authenticateRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function authenticateAdmin(request) {
  let session = await authenticateRequest(request);
  if (!session.user) return { user: null, error: 'UNAUTHORIZED' };
  let conn = await connectToDatabase();
  if (!conn) return { user: null, error: 'DB_UNAVAILABLE' };
  let user = await User.findById(session.user.id).select('name email role department').lean();
  if (!user || !['MAIN_ADMIN', 'DEPARTMENT_ADMIN'].includes(user.role)) {
    return { user: null, error: 'FORBIDDEN' };
  }
  return { user: { ...user, id: user._id.toString() }, error: null };
}

export function adminError(error) {
  if (error === 'DB_UNAVAILABLE') return { message: 'Database is not configured on the server.', code: error, status: 503 };
  if (error === 'FORBIDDEN') return { message: 'Administrator access is required.', code: error, status: 403 };
  return { message: 'Please sign in to continue.', code: 'UNAUTHORIZED', status: 401 };
}

export function scopedReportQuery(user) {
  return user.role === 'DEPARTMENT_ADMIN' ? { department: user.department } : {};
}