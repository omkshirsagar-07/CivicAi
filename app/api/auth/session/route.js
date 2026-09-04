import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function GET(request) {
  const { user: sessionUser } = await authenticateRequest(request);
  if (!sessionUser) {
    return NextResponse.json({ ok: true, user: null });
  }

  const conn = await connectToDatabase();
  if (!conn) {
    // Token is valid but the profile store is unavailable.
    return NextResponse.json({ ok: true, user: { id: sessionUser.id, name: '', email: '' } });
  }

  try {
    const user = await User.findById(sessionUser.id).select('name email role department').lean();
    if (!user) return NextResponse.json({ ok: true, user: null });
    return NextResponse.json({
      ok: true,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, department: user.department },
    });
  } catch {
    return NextResponse.json({ ok: true, user: null });
  }
}
