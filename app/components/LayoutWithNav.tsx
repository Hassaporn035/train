"use client";
import { usePathname } from "next/navigation";
import BottomNavBar from "./BottomNavBar";

export default function LayoutWithNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Hide nav on /login (และ /register ในอนาคต)
  const hideNav = pathname.startsWith("/login") || pathname.startsWith("/register");
  return (
    <>
      <div className={hideNav ? "min-h-0 flex-1" : "min-h-0 flex-1 pb-[5.5rem]"}>{children}</div>
      {!hideNav && <BottomNavBar />}
    </>
  );
}
