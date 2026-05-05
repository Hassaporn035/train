"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Settings2 } from "lucide-react";
import {
  createStation,
  getStations,
  removeStation,
  updateStation,
} from "@/lib/api/stations";

import AddStationModal from "@/app/components/admin/stations/modal/AddStationModal";
import EditStationModal from "@/app/components/admin/stations/modal/EditStationModal";
import DetailStationModal from "@/app/components/admin/stations/modal/DetailStationModal";
import { Station } from "@/app/types/types";
import toast from "react-hot-toast";

export default function StationsPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [stations, setStations] = useState<Station[]>([]);
  const [openAddStation, setOpenAddStation] = useState(false);
  const [openEditStation, setOpenEditStation] = useState(false);
  const [isOpenStationDetails, setIsOpenStationDetails] = useState(false);
  const [saving, setSaving] = useState<boolean>(false)
  const [selectedStation, setSelectedStation] = useState<Station>({
    id: null,
    name: "",
    sequence: 0,
    latitude: "",
    longitude: "",
    arrivalTime: "",
    departureTime: "",
    googleMapURL: "",
    isStation: true
  });
  const [form, setForm] = useState<Station>({
    id: null,
    name: "",
    sequence: 0,
    latitude: "",
    longitude: "",
    arrivalTime: "",
    departureTime: "",
    googleMapURL: "",
    isStation: true

  });

  // 📦 fetch data
  const fetchData = async () => {
    try {
      const res = await getStations();
      setStations(res.data || []);
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ➕ create
  const openCreate = () => {
    const nextSeq =
      stations.length > 0
        ? Math.max(...stations.map((s) => Number(s.sequence))) + 1
        : 1;

    setForm({
      name: "",
      sequence: nextSeq,
      latitude: "",
      longitude: "",
      arrivalTime: "",
      departureTime: "",
      googleMapURL: "",
      isStation: true
    });

    setOpenAddStation(true);
  };

  // ✏️ edit
  const openEdit = (s: any) => {
    setForm({ ...s });
    setOpenEditStation(true);
  };

  // ⚙️ detail
  const openStationDetails = (s: any) => {
    setSelectedStation(s);
    setIsOpenStationDetails(true);
  };

  // ✅ submit
  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.sequence ||
      !form.latitude ||
      !form.longitude
    ) {
      return toast.error('กรุณากรอกข้อมูลให้ครบ');
    }

    try {
      setSaving(true)
      const result = await createStation(form);

      if (result.error) return toast.error(result.error)

      await fetchData();
      setOpenAddStation(false);
      toast.success("เพิ่มสถานีสำเร็จ")
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false)
    }
  };

  // 🔄 update
  const handleUpdate = async () => {
    try {
      setSaving(true)
      const result = await updateStation(form);

      if (result.error) return toast.error(result.error)

      await fetchData();
      setSaving(false)
      toast.success("อัปเดตสำเร็จ")
      setOpenEditStation(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false)
    }
  };

  // ❌ delete
  const handleRemove = async (id: number) => {
    if (!confirm("ลบสถานีนี้?")) return;

    try {
      await removeStation(id);
      await fetchData();
      toast.success("ลบสถานีสำเร็จ")
    } catch (e) {
      console.error(e);
    }
  };

  // 📸 upload
  // const handleFileChange = (file?: File) => {
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setForm((prev: any) => ({
  //       ...prev,
  //       image: reader.result,
  //     }));
  //   };
  //   reader.readAsDataURL(file);
  // };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              🚉 จัดการสถานี
            </h1>
            <p className="text-slate-500 text-sm">
              เพิ่ม แก้ไข และจัดลำดับสถานีรถไฟ
            </p>
          </div>

          {!loading && <button
            onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md mt-4 md:mt-0 cursor-pointer w-36"
          >
            <Plus size={18} />
            เพิ่มสถานี
          </button>}

        </div>

        {/* SEARCH + FILTER */}
        {/*
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="ค้นหาสถานี..."
              className="w-full border border-slate-300 rounded-xl px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600">
              กรอง
            </button>
            <button className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600">
              จัดลำดับ
            </button>
          </div>
        </div>
        /*}

        {/* TABLE */}
        {/* 📦 พื้นที่แสดงผลหลัก */}
        <div className="hidden md:block">
          {loading ? (
            /* --- 1. หน้า Loading ตอนยังโหลดไม่เสร็จ (ไม่ต้องมี Table) --- */
            <div className="flex flex-col items-center justify-center py-20 w-full">
              <div className="relative">
                {/* วงนอก - เส้นจางๆ */}
                <div className="w-16 h-16 rounded-full border-4 border-zinc-800"></div>

                {/* วงใน - เส้นที่หมุน (Gradient) */}
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>

                {/* เอฟเฟกต์เรืองแสงจางๆ (Glow) */}
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-indigo-500/20 blur-sm"></div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-zinc-400 font-medium animate-pulse tracking-widest uppercase text-xs">
                  Loading Stations
                </p>
                {/* จุดไข่ปลาวิ่งๆ */}
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          ) : (
            /* --- 2. หน้าแสดงผลจริง เมื่อโหลดเสร็จแล้ว (แสดง Table) --- */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="p-4 text-center">ลำดับ</th>
                    <th className="p-4 text-left">ชื่อสถานี</th>
                    <th className="p-4 text-center">เวลา</th>
                    <th className="p-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.length > 0 ? (
                    stations.map((s) => (
                      <tr key={s.id} className="border-t hover:bg-slate-100 transition">
                        <td className="p-4 text-center font-medium text-slate-600">{s.sequence}</td>
                        <td className="p-4 font-semibold text-slate-800">{s.name}</td>
                        <td className="p-4 text-center text-slate-500">{s.arrivalTime} → {s.departureTime}</td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openStationDetails(s)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"><Settings2 size={16} /></button>
                            <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 cursor-pointer"><Edit2 size={16} /></button>
                            <button onClick={() => handleRemove(Number(s.id))} className="p-2 rounded-lg hover:bg-red-100 text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">🚫 ไม่มีข้อมูลสถานี</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MOBILE */}
        <div className="md:hidden space-y-4">
          {loading ? (
            /* --- 🌀 Loading Spinner สำหรับ Mobile --- */
            <div className="flex flex-col items-center justify-center py-24">
              {/* Spinner ที่ดูเบาบางลง */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-[3px] border-slate-100"></div>
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-[3px] border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>

              {/* ข้อความที่ดูนุ่มนวลขึ้น */}
              <p className="mt-5 text-slate-400 text-sm font-light tracking-wide animate-pulse">
                กำลังโหลดข้อมูลสถานี...
              </p>
            </div>
          ) : stations.length > 0 ? (
            /* --- ✅ รายการสถานีจริง --- */
            stations.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
              >
                <div className="flex justify-between">
                  <h2 className="font-bold text-slate-800">{s.name}</h2>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-800">
                    {s.sequence}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  ⏱ {s.arrivalTime} → {s.departureTime}
                </p>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => openStationDetails(s)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    <Settings2 size={16} />
                  </button>

                  <button
                    onClick={() => openEdit(s)}
                    className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => handleRemove(Number(s.id))}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-500 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* --- 🚫 กรณีไม่มีข้อมูล --- */
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
              🚫 ไม่มีข้อมูลสถานี
            </div>
          )}
        </div>
      </div>

      {openAddStation && (
        <AddStationModal
          form={form}
          setForm={setForm}
          onClose={() => setOpenAddStation(false)}
          onSubmit={handleSubmit}
          // onFileChange={handleFileChange}
          isSaving={saving}
        />
      )}

      {openEditStation && (
        <EditStationModal
          form={form}
          setForm={setForm}
          onClose={() => setOpenEditStation(false)}
          onUpdate={handleUpdate}
          // onFileChange={handleFileChange}
          isSaving={saving}
        />
      )}

      {isOpenStationDetails && (
        <DetailStationModal
          station={selectedStation}
          onClose={() => setIsOpenStationDetails(false)}
        />
      )}
    </div>
  );
}