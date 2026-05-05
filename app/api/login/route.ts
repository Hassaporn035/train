export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }
    const { rows } = await pool.query('SELECT id, password_hash, role FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, role: user.role ?? 'user' });
    res.cookies.set('session_user', user.id, { httpOnly: true, path: '/' });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
