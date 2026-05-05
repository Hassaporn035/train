import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUserId } from '@/lib/session-user';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { rows } = await pool.query(
      `SELECT place_id FROM user_favorite_places WHERE user_id = $1`,
      [userId]
    );
    const placeIds = (rows as { place_id: number }[]).map((r) => r.place_id);
    return NextResponse.json({
      success: true,
      placeIds,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Query failed';
    return NextResponse.json(
      {
        error: msg,
        hint: 'รันไฟล์ db/migrations/001_user_favorite_places.sql บนฐานข้อมูลก่อนใช้รายการโปรด',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { placeId } = await req.json();
    const pid = typeof placeId === 'number' ? placeId : parseInt(String(placeId), 10);
    if (!Number.isFinite(pid)) {
      return NextResponse.json({ error: 'Invalid placeId' }, { status: 400 });
    }
    await pool.query(
      `
      INSERT INTO user_favorite_places (user_id, place_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, place_id) DO NOTHING
      `,
      [userId, pid]
    );
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Insert failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const placeIdRaw = req.nextUrl.searchParams.get('placeId');
  const pid = placeIdRaw ? parseInt(placeIdRaw, 10) : NaN;
  if (!Number.isFinite(pid)) {
    return NextResponse.json({ error: 'Invalid placeId' }, { status: 400 });
  }
  try {
    await pool.query(
      `DELETE FROM user_favorite_places WHERE user_id = $1 AND place_id = $2`,
      [userId, pid]
    );
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Delete failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
