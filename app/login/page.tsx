"use client";

import { useState } from "react";
import { InputField } from "./InputField";
import { MapPinIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const goByRole = (role?: string) => {
    if (role === "admin") {
      window.location.assign("/admin/stations");
      return;
    }
    window.location.assign("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      const data = await res.json().catch(() => ({}));
      goByRole(typeof data.role === "string" ? data.role : undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, birthday, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "สมัครสมาชิกไม่สำเร็จ");
        return;
      }
      window.location.assign("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fef5f5]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-[#450a0a] via-[#7f1d1d] to-[#991b1b]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-rose-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 top-40 h-48 w-48 rounded-full bg-red-300/15 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
        <header className="text-center text-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
            <MapPinIcon className="h-8 w-8 text-red-100" aria-hidden />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-200/90">Trian</p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            ธนบุรี — น้ำตก
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-red-100/90">
            แนะนำสถานีและสถานที่ท่องเที่ยว พร้อมรีวิวจากผู้เดินทาง
          </p>
        </header>

        <main className="mt-10 flex flex-1 flex-col">
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-lg ring-1 ring-black/5 sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <LockClosedIcon className="h-5 w-5 text-red-600" aria-hidden />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-stone-900 sm:text-xl">
                  {isRegister ? "สร้างบัญชีใหม่" : "เข้าสู่ระบบ"}
                </h2>
                <p className="mt-0.5 text-sm text-stone-500">
                  {isRegister
                    ? "กรอกข้อมูลให้ครบ แล้วเริ่มบันทึกสถานที่โปรดของคุณ"
                    : "ใช้อีเมลและรหัสผ่านที่ลงทะเบียนไว้"}
                </p>
              </div>
            </div>

            <form
              onSubmit={isRegister ? handleRegister : handleLogin}
              className="space-y-4"
            >
              {isRegister && (
                <>
                  <InputField
                    label="ชื่อ"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="given-name"
                    placeholder="ชื่อจริง"
                  />
                  <InputField
                    label="สกุล"
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    autoComplete="family-name"
                    placeholder="นามสกุล"
                  />
                  <InputField
                    label="วันเกิด"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                    autoComplete="bday"
                  />
                </>
              )}
              <InputField
                label="อีเมล"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
              <InputField
                label="รหัสผ่าน"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? "อย่างน้อย 6 ตัวอักษร" : "••••••••"}
              />

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-center text-sm text-red-800"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "กำลังดำเนินการ…"
                  : isRegister
                    ? "สมัครสมาชิก"
                    : "เข้าสู่ระบบ"}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wide">
                <span className="bg-white px-3 text-stone-400">หรือ</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/80 py-3 text-sm font-medium text-stone-700 transition hover:border-red-200 hover:bg-red-50/50 hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
            >
              {isRegister ? "มีบัญชีแล้ว · เข้าสู่ระบบ" : "ยังไม่มีบัญชี · สมัครสมาชิก"}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-stone-500">
            ดำเนินการต่อถือว่าคุณยอมรับการใช้งานตามนโยบายของระบบ
          </p>
        </main>
      </div>
    </div>
  );
}
