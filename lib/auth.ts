// lib/auth.ts
// Simple helpers for session management (get current user from cookie)
import { cookies } from 'next/headers';
import { pool } from './db';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session_user');
  if (!session) return null;
  const { rows } = await pool.query('SELECT id, name, surname, birthday, email, role FROM users WHERE id = $1', [session.value]);
  return rows[0] || null;
}
