export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, surname, birthday, email, password } = await req.json();
    if (!name || !surname || !birthday || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Check if user exists
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    // Insert user
    await pool.query(
      'INSERT INTO users (name, surname, birthday, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, surname, birthday, email, password_hash, 'user']
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
