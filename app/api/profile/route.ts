import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  const { name, surname, birthday } = data;
  await pool.query(
    'UPDATE users SET name = $1, surname = $2, birthday = $3 WHERE id = $4',
    [name, surname, birthday, user.id]
  );
  return NextResponse.json({ success: true });
}
