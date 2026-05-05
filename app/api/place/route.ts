import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';

export async function POST(req: NextRequest) {
    try {
        const { name, description, latitude, longitude, station_id, image } = await req.json()
        let imageBuffer = null;
        if (image) {
            // ตัดส่วนหัว "data:image/jpeg;base64," ออก (ถ้ามี) แล้วแปลงเป็น Buffer
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            imageBuffer = Buffer.from(base64Data, 'base64');
        }
        await pool.query(`
            INSERT INTO places (name, description, latitude, longitude, station_id, image)
            VALUES ($1, $2, $3, $4, $5, $6)
            `, [name, description, latitude, longitude, station_id, imageBuffer])
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message || 'Insertd place failed' },
            { status: 500 }
        );
    }
}