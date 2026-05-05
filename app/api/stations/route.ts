import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';

export async function POST(req: NextRequest) {
  try {

    const { name, sequence, latitude, longitude, arrivalTime, departureTime, image, googleMapURL, isStation } = await req.json();

    let imageBuffer = null;
    if (image) {
      // ตัดส่วนหัว "data:image/jpeg;base64," ออก (ถ้ามี) แล้วแปลงเป็น Buffer
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, 'base64');
    }

    // Check Sequence
    const checkSequence = await pool.query(
      `
      SELECT id 
      FROM stations 
      WHERE sequence = $1
      `,
      [sequence]
    );

    if (checkSequence.rows.length > 0) {
      return NextResponse.json({ error: 'ลำดับสถานีซ้ำ กรุณาเปลื่ยนลำดับใหม่' }, { status: 400 })
    }

    // Insert station
    const link =
      typeof linkGoogleMymap === "string" && linkGoogleMymap.trim() !== ""
        ? linkGoogleMymap.trim()
        : null;

    await pool.query(
      `
      INSERT INTO stations ("name", "sequence", "arrival_time", "departure_time", "image", "latitude", "longitude", "link_google_mymap", "is_station")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [name, sequence, arrivalTime, departureTime, "null", latitude, longitude,googleMapURL ,isStation]
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Insert station failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const res = await pool.query(`
      SELECT
        id,
        name,
        latitude,
        longitude,
        sequence,
        arrival_time AS "arrivalTime",
        departure_time AS "departureTime",
        image,
        is_station AS "isStation",
        link_google_mymap AS "googleMapURL"
      FROM stations
      ORDER BY sequence ASC
      `)
    return NextResponse.json({ success: true, data: res.rows })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Get station failed' },
      { status: 500 }
    );
  }
}