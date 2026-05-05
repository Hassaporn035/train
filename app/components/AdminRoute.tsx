"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        if (data.role === "admin") setIsAdmin(true);
        else setIsAdmin(false);
      });
  }, []);

  useEffect(() => {
    if (isAdmin === false) {
      router.replace("/"); // redirect ถ้าไม่ใช่ admin
    }
  }, [isAdmin, router]);

  if (isAdmin === null) {
    return <div className="flex justify-center items-center min-h-[60vh]">กำลังตรวจสอบสิทธิ์...</div>;
  }

  return <>{children}</>;
}
