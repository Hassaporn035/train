import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, sequence, arrivalTime, departureTime, image, latitude, longitude, googleMapURL, isStation } = await req.json();

    let imageBuffer = null;
    if (image) {
      // ✅ เช็คก่อนว่า image เป็น string หรือไม่ (รูปใหม่ที่ส่งมาจาก FileReader จะเป็น string)
      if (typeof image === 'string') {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        // 📸 ถ้าไม่ใช่ string แสดงว่าเป็นรูปเดิมที่เป็น Buffer object จาก DB
        // ให้ดึงเฉพาะส่วน data ออกมา หรือใช้ค่าเดิมตรงๆ
        imageBuffer = image.data ? Buffer.from(image.data) : image;
      }
    }

    // Check Sequence
    const checkSequence = await pool.query(
      `
      SELECT id 
      FROM stations 
      WHERE sequence = $1 AND id != $2
      `,
      [sequence, id]
    );

    if (checkSequence.rows.length > 0) {
      return NextResponse.json({ error: 'ลำดับสถานีซ้ำ กรุณาเปลื่ยนลำดับใหม่' }, { status: 400 })
    }
    
    const link =
      typeof linkGoogleMymap === "string" && linkGoogleMymap.trim() !== ""
        ? linkGoogleMymap.trim()
        : null;

    const result = await pool.query(
      `
      UPDATE stations   
      SET name = $1, sequence = $2, arrival_time = $3, departure_time = $4, image = $5 , latitude = $6, longitude = $7, link_google_mymap = $9, is_station = $10
      WHERE id = $8
      RETURNING *
      `,
      [name, sequence, arrivalTime, departureTime, "null", latitude, longitude, id, googleMapURL, isStation]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Updated station failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pool.query(`
      DELETE FROM stations WHERE id = $1
      `, [id])
    return NextResponse.json({ status: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Deleted station failed' },
      { status: 500 }
    );
  }
}