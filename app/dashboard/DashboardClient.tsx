'use client';
import { useRouter } from 'next/navigation';

export default function DashboardClient({ user }: { user: any }) {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };
  return (
    <div className="max-w-lg w-4xl mx-auto mt-16 p-8 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-3xl font-bold text-center mb-8 text-zinc-900 dark:text-zinc-100">แดชบอร์ด</h2>
      <div className="space-y-3 text-zinc-800 dark:text-zinc-200">
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-2">
          <span className="font-medium">Email</span>
          <span>{user.email}</span>
        </div>
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-2">
          <span className="font-medium">ชื่อ</span>
          <span>{user.name}</span>
        </div>
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-2">
          <span className="font-medium">สกุล</span>
          <span>{user.surname}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">วันเกิด</span>
          <span>{typeof user.birthday === 'string' ? user.birthday : user.birthday?.toISOString().slice(0, 10)}</span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full py-2 mt-8 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow"
      >
        ออกจากระบบ
      </button>
    </div>
  );
}
