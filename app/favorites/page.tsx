import { HeartIcon } from '@heroicons/react/24/outline';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getFavoritePlacesForUser } from '@/lib/route-explore';
import FavoritesClient from '../components/explore/FavoritesClient';

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  let items: Awaited<ReturnType<typeof getFavoritePlacesForUser>> = [];
  let loadError: string | null = null;
  try {
    items = await getFavoritePlacesForUser(Number(user.id));
  } catch (e: unknown) {
    loadError =
      e instanceof Error
        ? e.message
        : 'โหลดรายการโปรดไม่สำเร็จ — ตรวจสอบว่ารัน migration แล้ว';
  }

  return (
    <div className="min-h-screen bg-[#fef5f5] pb-6 text-stone-900">
      <header className="border-b border-red-950/20 bg-gradient-to-br from-[#450a0a] via-[#7f1d1d] to-[#991b1b] px-4 pb-8 pt-10 text-white shadow-md">
        <div className="mx-auto flex max-w-2xl items-end gap-3">
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
            <HeartIcon className="h-8 w-8 text-rose-100" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold sm:text-3xl">รายการโปรด</h1>
            <p className="mt-1 text-sm text-rose-100/90">
              สถานที่ที่คุณบันทึกจากเส้นทางธนบุรี — น้ำตก
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 text-sm text-red-950">
            <p className="font-medium">ยังใช้งานตารางรายการโปรดไม่ได้</p>
            <p className="mt-2 text-red-900/90">{loadError}</p>
            <p className="mt-3 text-xs text-red-800/80">
              รันไฟล์{' '}
              <code className="rounded bg-white/60 px-1">db/migrations/001_user_favorite_places.sql</code>{' '}
              บน PostgreSQL แล้วลองใหม่
            </p>
          </div>
        ) : (
          <FavoritesClient initialItems={items} />
        )}
      </div>
    </div>
  );
}
