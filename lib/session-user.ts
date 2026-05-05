import { cookies } from 'next/headers';

/** ค่า cookie session_user = id ผู้ใช้หลังล็อกอิน */
export async function getSessionUserId(): Promise<number | null> {
  const c = await cookies();
  const raw = c.get('session_user')?.value;
  if (!raw) return null;
  const id = parseInt(raw, 10);
  return Number.isFinite(id) ? id : null;
}
