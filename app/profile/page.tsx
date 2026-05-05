"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UserIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    name: string;
    surname: string;
    email: string;
    birthday?: string;
    role?: string;
  } | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", surname: "", birthday: "" });
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          surname: data.surname || "",
          birthday: data.birthday ? data.birthday.slice(0, 10) : "",
        });
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setEdit(false);
      setProfile((p) => (p ? { ...p, ...form } : p));
    } else {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      /* ยังพาไปล็อกอิน */
    }
    try {
      localStorage.removeItem("role");
    } catch {
      /* ignore */
    }
    window.location.assign("/login");
  }, []);

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-[#fef5f5] text-stone-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-200 border-t-red-600" aria-hidden />
        <p className="mt-4 text-sm">กำลังโหลดโปรไฟล์…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#fef5f5] px-4 pb-28 pt-4">
      <div className="mx-auto w-full max-w-md">
        {/* หัวโปรไฟล์ */}
        <header className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-black/[0.03]">
          <div className="h-20 bg-gradient-to-br from-red-900 via-red-800 to-rose-900" aria-hidden />
          <div className="relative -mt-10 flex flex-col items-center px-6 pb-6 pt-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-red-50 shadow-md ring-1 ring-stone-200/80">
              <UserIcon className="h-11 w-11 text-red-500" aria-hidden />
            </div>
            <h1 className="mt-4 text-center font-serif text-xl font-semibold tracking-tight text-stone-900">
              {profile.name} {profile.surname}
            </h1>
            <p className="mt-1 text-center text-sm text-stone-500">{profile.email}</p>
            {!edit && (
              <button
                type="button"
                onClick={() => setEdit(true)}
                className="absolute right-3 top-3 rounded-full p-2 text-white/90 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label="แก้ไขโปรไฟล์"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </header>

        <form
          onSubmit={edit ? handleSubmit : (e) => e.preventDefault()}
          className="mt-6 space-y-6"
        >
          <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-black/[0.03]">
            <div className="flex items-center gap-4 border-b border-stone-100 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <UserIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  ชื่อ · สกุล
                </label>
                {edit ? (
                  <div className="mt-1 flex gap-2">
                    <input
                      className="w-1/2 rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      autoComplete="given-name"
                      placeholder="ชื่อ"
                    />
                    <input
                      className="w-1/2 rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      name="surname"
                      value={form.surname}
                      onChange={handleChange}
                      required
                      autoComplete="family-name"
                      placeholder="สกุล"
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-base font-medium text-stone-900">
                    {profile.name} {profile.surname}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-stone-100 bg-stone-50/40 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-stone-100">
                <EnvelopeIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  อีเมล
                </label>
                <p className="mt-1 truncate text-base font-medium text-stone-900">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <PhoneIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  วันเกิด
                </label>
                {edit ? (
                  <input
                    type="date"
                    className="mt-1 w-full max-w-[12rem] rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200"
                    name="birthday"
                    value={form.birthday}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="mt-1 text-base font-medium text-stone-900">
                    {profile.birthday ? profile.birthday.slice(0, 10) : "—"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {edit && (
            <div className="flex justify-center gap-3">
              <button
                type="submit"
                className="min-w-[7rem] rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "กำลังบันทึก…" : "บันทึก"}
              </button>
              <button
                type="button"
                className="min-w-[7rem] rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                onClick={() => {
                  setEdit(false);
                  setForm({
                    name: profile.name,
                    surname: profile.surname,
                    birthday: profile.birthday ? profile.birthday.slice(0, 10) : "",
                  });
                }}
              >
                ยกเลิก
              </button>
            </div>
          )}
          {error && <p className="text-center text-xs text-red-600">{error}</p>}
          {success && <p className="text-center text-xs text-red-600">บันทึกสำเร็จ</p>}
        </form>

        {/* ออกจากระบบ */}
        <section
          className="mt-10 overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-black/[0.03]"
          aria-labelledby="logout-heading"
        >
          <h2
            id="logout-heading"
            className="text-sm font-semibold tracking-tight text-stone-900"
          >
            การเข้าสู่ระบบ
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
            ออกจากบัญชีบนอุปกรณ์นี้ เซสชันจะถูกยกเลิกและคุณต้องล็อกอินใหม่เพื่อใช้งานต่อ
          </p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200/90 bg-white px-4 py-3.5 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden />
            {loggingOut ? "กำลังออกจากระบบ…" : "ออกจากระบบ"}
          </button>
        </section>
      </div>
    </div>
  );
}
