"use client";
import { useEffect, useState } from "react";
import { Place, Station } from "@/app/types/types";
import { getPlace, removePlace, updatePlace } from "@/lib/api/places";
import { addPlace } from "@/lib/api/places";
import EditPlaceModal from "./EditPlaceModal";
import AddPlaceModal from "./AddPlaceModal";
import {
  MapPin,
  Edit3,
  Trash2,
  X,
  Clock,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  station: Station;
  onClose: () => void;
}

export default function DetailStationModal({ station, onClose }: Props) {

  const [loading, setLoading] = useState<boolean>(true)
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false)
  const [isOpenAddPlace, SetIsOpenAddPlace] = useState<boolean>(false)
  const [places, setPlaces] = useState<Place[]>([]);
  const [saving, setSaving] = useState<boolean>(false)
  const [form, setForm] = useState<Place>({
    name: "",
    latitude: "",
    longitude: "",
    description: "",
    image: "",
    station_id: station.id
  });

  const openEditPlace = async (place: any) => {
    setForm(place)
    setIsOpenEdit(true)
  }

  const openAddPlace = async () => {
    SetIsOpenAddPlace(true)
  }

  const handleAddPlace = async () => {
    if (!form.name || !form.latitude || !form.longitude || !form.description) {
      return toast.error("กรุณาใส่ข้อมูลสถานที่ท่องเที่ยวให้ครบ")
    }
    if (form.image === "") return toast.error("กรุณาอัปโหลดรูปภาพก่อน")

    try {
      setSaving(true)
      await addPlace(form)
      await fetchData()
      toast.success('เพิ่มสถานที่ท่องเที่ยวสำเร็จ')
      setForm({
        name: "",
        latitude: "",
        longitude: "",
        description: "",
        image: "",
        station_id: station.id
      })

      setSaving(false)
      await fetchData()
      SetIsOpenAddPlace(false)
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdatePlace = async () => {
    if (!form.name || !form.latitude || !form.longitude || !form.description) return toast.error("กรุณาใส่ข้อมูลสถานที่ท่องเที่ยวให้ครบ")
    if (form.image === "") return toast.error("กรุณาอัพโหลดรูปภาพก่อน")

    try {
      setSaving(true)
      await updatePlace(form)
      await fetchData()
      toast.success("อัพเดทข้อมูลสถานที่ท่องเที่ยวสำเร็จ")
      setSaving(false)
      setIsOpenEdit(false)
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleRemove = async (id: number) => {
    if (confirm("คุณต้องการลบสถานที่นี้ใช่หรือไม่?")) {
      try {
        await removePlace(id)
        await fetchData()
        toast.success("ลบข้อมูลสถานีสำเร็จ")
      } catch (e: any) {
        console.error('ERROR')
      }
    }
  }

  const handleFileChange = (file: File | undefined) => {
    if (!file) {
      setForm(prev => ({ ...prev, image: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const fetchData = async () => {
    setLoading(true)
    const res = await getPlace(Number(station.id))
    setPlaces(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (!isOpenAddPlace) {
      setForm({
        name: "",
        latitude: "",
        longitude: "",
        description: "",
        image: "",
        station_id: station.id
      })
    }
  }, [isOpenAddPlace])

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop - นุ่มนวลขึ้นด้วยสี Indigo/Slate */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Card - ปรับมุมโค้งและเงา */}
      <div className="bg-white w-full md:max-w-lg max-h-[85vh] overflow-hidden rounded-4xl md:rounded-[2.5rem] z-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col transform transition-all animate-in slide-in-from-bottom-10 duration-500 ease-out">

        {/* Handle bar - ดีไซน์ Minimal */}
        <div className="md:hidden flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header - สะอาดตา */}
        <div className="px-8 pt-4 md:pt-8 pb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">ข้อมูลสถานี</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all duration-300 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-8 pb-8 overflow-y-auto custom-scrollbar flex-1">

          {/* Station Hero Card - ดีไซน์ใหม่ให้ดูหรูขึ้น */}
          <div className="relative group bg-slate-900 rounded-4xl p-8 mb-8 text-white shadow-2xl shadow-indigo-200/50 overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-black mb-6 tracking-tight leading-tight">{station.name}</h1>

              <div className="flex gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase">ถึงสถานี</span>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                    <Clock size={16} className="text-indigo-400" />
                    <span className="text-sm font-bold">{station.arrivalTime}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase">ออกสถานี</span>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                    <Clock size={16} className="text-indigo-400" />
                    <span className="text-sm font-bold">{station.departureTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Abstract Decorations - แทน Icon ใหญ่ๆ */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-700" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
          </div>

          {/* Section Header */}
          <div className="flex justify-between items-center mb-5 px-1">
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              สถานที่ท่องเที่ยว <span className="text-indigo-500 ml-1 font-black">{places.length}</span>
            </h3>
            <button
              onClick={openAddPlace}
              className="group flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={18} className="transition-transform group-hover:rotate-90" />
              เพิ่มใหม่
            </button>
          </div>

          {/* Place List */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-[1.25rem]" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-slate-200 rounded" />
                      <div className="h-3 w-24 bg-slate-100 rounded" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-9 h-9 bg-slate-200 rounded-xl" />
                    <div className="w-9 h-9 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-4">
            {!loading && places?.map((p) => (
              <div
                key={p.id}
                className="group bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-800 block leading-tight">{p.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-x-0 md:translate-x-2 md:group-hover:translate-x-0">
                    <button
                      className="p-2.5 text-amber-500 hover:bg-amber-50 active:bg-amber-100 rounded-xl transition-all cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPlace(p);
                      }}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      className="p-2.5 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(Number(p.id));
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State - ดีไซน์ให้คลีนกว่าเดิม */}
            {places?.length === 0 && (
              <div className="py-12 text-center bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <div className="bg-white w-16 h-16 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  <MapPin size={28} className="text-slate-200" />
                </div>
                <p className="text-slate-500 font-bold">ยังไม่มีข้อมูลแนะนำ</p>
                <p className="text-slate-400 text-xs mt-1">ลองเพิ่มสถานที่ท่องเที่ยวแรกของคุณ</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isOpenAddPlace &&
        <AddPlaceModal
          stationName={station.name}
          form={form}
          setForm={setForm}
          onSubmit={handleAddPlace}
          onClose={() => SetIsOpenAddPlace(false)}
          onFileChange={(file) => handleFileChange(file)}
          isSaving={saving}
        />}
      {isOpenEdit &&
        <EditPlaceModal
          stationName={station.name}

          form={form}
          setForm={setForm}
          onUpdate={handleUpdatePlace}
          onClose={() => { setIsOpenEdit(false); fetchData() }}
          onFileChange={(file) => handleFileChange(file)}
          isSaving={saving}
        />}
    </div>
  );
}