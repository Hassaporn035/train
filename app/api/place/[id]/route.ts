import { NextRequest, NextResponse } from "next/server";
import { pool } from '@/lib/db';


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const res = await pool.query(`
                SELECT *
                FROM places
                WHERE station_id = $1
                `, [id])

        const data = res.rows
        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message || 'Get place failed' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { name, description, latitude, longitude, station_id, image } = await req.json()
        let imageBuffer = null;

        if (typeof image === 'string') {
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
            // 📸 ถ้าไม่ใช่ string แสดงว่าเป็นรูปเดิมที่เป็น Buffer object จาก DB
            // ให้ดึงเฉพาะส่วน data ออกมา หรือใช้ค่าเดิมตรงๆ
            imageBuffer = image.data ? Buffer.from(image.data) : image;
        }

        await pool.query(`
                UPDATE places
                SET name = $1, latitude = $2, longitude = $3, station_id = $4, description = $5, image = $6
                WHERE id = $7
                `, [name, latitude, longitude, station_id, description, imageBuffer, id])
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error(e)
        return NextResponse.json(
            { error: e.message || 'Updated place failed' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const result = await pool.query(`
                DELETE FROM places
                WHERE id = $1
                `, [id])
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message || 'Updated place failed' },
            { status: 500 }
        );
    }
}