import { NextResponse } from 'next/server';
import { authenticateAdmin, adminError } from '@/lib/admin';
import { hashPassword } from '@/lib/auth';
import { isSameOrigin, jsonError } from '@/lib/http';
import User from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!isSameOrigin(request)) return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);
  let auth = await authenticateAdmin(request);
  if (!auth.user) { let error = adminError(auth.error); return jsonError(error.message, error.code, error.status); }
  if (auth.user.role !== 'MAIN_ADMIN') return jsonError('Only a main administrator can create department administrators.', 'FORBIDDEN', 403);

  let body;
  try { body = await request.json(); } catch { return jsonError('Invalid JSON body.', 'INVALID_BODY', 400); }
  let name = typeof body?.name === 'string' ? body.name.trim() : '';
  let email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  let password = typeof body?.password === 'string' ? body.password : '';
  let department = typeof body?.department === 'string' ? body.department.trim() : '';
  if (name.length < 2 || name.length > 80) return jsonError('Name must be between 2 and 80 characters.', 'INVALID_NAME', 422);
  if (!/^\S+@\S+\.\S+$/.test(email)) return jsonError('Enter a valid email address.', 'INVALID_EMAIL', 422);
  if (password.length < 8) return jsonError('Password must be at least 8 characters.', 'WEAK_PASSWORD', 422);
  if (!department || department.length > 160) return jsonError('Department is required.', 'INVALID_DEPARTMENT', 422);

  try {
    let passwordHash = await hashPassword(password);
    let user = await User.create({ name, email, passwordHash, role: 'DEPARTMENT_ADMIN', department });
    return NextResponse.json({ ok: true, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, department: user.department } }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000) return jsonError('An account with this email already exists.', 'EMAIL_EXISTS', 409);
    if (error?.name === 'ValidationError') return jsonError('The administrator details are invalid.', 'INVALID_USER', 422);
    console.error('[admin/users]', error?.message);
    return jsonError('The department administrator could not be created.', 'CREATE_FAILED', 500);
  }
}
