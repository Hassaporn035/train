"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const allMenus = [
  {
    label: 'หน้าแรก',
    href: '/',
    icon: HomeIcon,
    roles: ['user'],
  },
  {
    label: 'รายการโปรด',
    href: '/favorites',
    icon: HeartIcon,
    roles: ['user'],
  },
  {
    label: 'จัดการสถานี',
    href: '/admin/stations',
    icon: HeartIcon,
    roles: ['admin'],
  },
  {
    label: 'โปรไฟล์',
    href: '/profile',
    icon: UserIcon,
    roles: ['admin', 'user'],
  },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const [role, setRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    // ดึง role จาก localStorage หรือ API (ตัวอย่างนี้ใช้ localStorage)
    // if (typeof window !== 'undefined') {
    //   const r = localStorage.getItem('role');
    //   if (r === 'admin' || r === 'user') {
    //     setRole(r);
    //   } else {
    //     // fallback: ถ้าไม่มีค่า role ใน localStorage ให้ default เป็น user
    //     setRole('user');
    //   }
    // }
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        // สมมติ API ส่ง role มาด้วย ("user" หรือ "admin")
        setRole(data.role ?? "user");
      });
  }, []);

  // เงื่อนไขเมนูตาม role
  let menuItems: (typeof allMenus)[number][] = [];
  if (role === 'user') {
    menuItems = allMenus.filter(m => m.roles.includes('user') && m.label !== 'จัดการสถานี');
  } else if (role === 'admin') {
    menuItems = allMenus.filter(m => m.roles.includes('admin'));
  }

  return (
    <>
      {/* Debug: role ปัจจุบัน */}
      {/* <div className="fixed bottom-16 left-2 z-50 text-xs bg-red-50 text-red-700 px-2 py-1 rounded shadow">role: {role}</div> */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-red-200 shadow-lg flex justify-around py-2 ">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center px-3 py-1 rounded transition-colors duration-150 ${
              isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-500'
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-red-600' : 'stroke-gray-400'}`} />
            <span className="text-xs">{item.label}</span>
          </Link>
        );
        })}
      </nav>
    </>
  );
}
