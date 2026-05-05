import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUserId } from '@/lib/session-user';
import type { PlaceReview } from '@/lib/route-explore';

type ReviewRow = {
  id: number;
  place_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: Date | string;
  user_name: string | null;
  user_surname: string | null;
};

function toPlaceReview(r: ReviewRow): PlaceReview {
  const name = (r.user_name ?? '').trim();
  const sur = (r.user_surname ?? '').trim();
  const reviewerLabel = [name, sur].filter(Boolean).join(' ') || 'ผู้ใช้';
  const createdAt =
    r.created_at instanceof Date
      ? r.created_at.toISOString()
      : String(r.created_at);
  return {
    id: r.id,
    placeId: r.place_id,
    userId: r.user_id,
    reviewerLabel,
    rating: r.rating,
    comment: r.comment,
    createdAt,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId: raw } = await params;
  const placeId = parseInt(raw, 10);
  if (!Number.isFinite(placeId)) {
    return NextResponse.json({ error: 'Invalid placeId' }, { status: 400 });
  }
  try {
    const { rows } = await pool.query(
      `
      SELECT
        r.id,
        r.place_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS user_name,
        u.surname AS user_surname
      FROM place_reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.place_id = $1
      ORDER BY r.created_at DESC
      `,
      [placeId]
    );
    const reviews = (rows as ReviewRow[]).map(toPlaceReview);
    return NextResponse.json({ success: true, reviews });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Query failed';
    return NextResponse.json(
      {
        error: msg,
        hint: 'รัน db/migrations/002_place_reviews.sql ถ้ายังไม่มีตาราง place_reviews',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { placeId: raw } = await params;
  const placeId = parseInt(raw, 10);
  if (!Number.isFinite(placeId)) {
    return NextResponse.json({ error: 'Invalid placeId' }, { status: 400 });
  }

  let body: { rating?: unknown; comment?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const rating =
    typeof body.rating === 'number' ? body.rating : parseInt(String(body.rating), 10);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating ต้องอยู่ระหว่าง 1 ถึง 5' }, { status: 400 });
  }
  const comment =
    typeof body.comment === 'string' ? body.comment.trim() || null : null;

  const client = await pool.connect();
  try {
    const exists = await client.query(`SELECT 1 FROM places WHERE id = $1`, [placeId]);
    if (exists.rows.length === 0) {
      return NextResponse.json({ error: 'ไม่พบสถานที่' }, { status: 404 });
    }

    await client.query('BEGIN');
    try {
      const updated = await client.query(
        `
        UPDATE place_reviews
        SET rating = $1, comment = $2
        WHERE place_id = $3 AND user_id = $4
        `,
        [rating, comment, placeId, userId]
      );
      const n = updated.rowCount ?? 0;
      if (n === 0) {
        await client.query(
          `
          INSERT INTO place_reviews (place_id, user_id, rating, comment)
          VALUES ($1, $2, $3, $4)
          `,
          [placeId, userId, rating, comment]
        );
      }
      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK').catch(() => {});
      throw txErr;
    }

    const { rows } = await pool.query(
      `
      SELECT
        r.id,
        r.place_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS user_name,
        u.surname AS user_surname
      FROM place_reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.place_id = $1 AND r.user_id = $2
      `,
      [placeId, userId]
    );
    const row = rows[0] as ReviewRow | undefined;
    if (!row) {
      return NextResponse.json({ error: 'บันทึกแล้วแต่ดึงข้อมูลไม่สำเร็จ' }, { status: 500 });
    }
    return NextResponse.json({ success: true, review: toPlaceReview(row) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Save failed';
    const hint =
      typeof msg === 'string' && msg.includes('place_reviews')
        ? 'รัน db/migrations/002_place_reviews.sql บน PostgreSQL และตรวจสอบว่ามีตาราง places'
        : undefined;
    return NextResponse.json(
      { error: msg, ...(hint ? { hint } : {}) },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
