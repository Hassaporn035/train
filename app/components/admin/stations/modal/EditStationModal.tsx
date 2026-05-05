import React, { useEffect, useRef, useState } from 'react'
import { Station } from '@/app/types/types'
import { Clock, Trash2, UploadCloud, X } from 'lucide-react'

interface Props {
    form: Station
    setForm: React.Dispatch<React.SetStateAction<Station>>
    onClose: () => void
    onUpdate: () => void
    isSaving: boolean
}

export default function EditStationModal({ form, setForm, onClose, onUpdate, isSaving }: Props) {
    const [preview, setPreview] = useState<string | null>(null);

    const STATIONTYPE = [
        { id: true, label: "สถานี" },
        { id: false, label: "ป้ายจอด" }
    ]

    const disabled = [
        form.name,
        form.sequence,
        form.latitude,
        form.longitude,
        form.googleMapURL
    ].some(value => {
        if (typeof value === 'string') return value.trim() === '';
        return value === null || value === undefined;
    });

    // const fileInputRef = useRef<HTMLInputElement>(null);

    // // --- ฟังก์ชันแปลง Buffer เป็น Base64 เพื่อแสดงรูป ---
    // const getImageSrc = (image: any) => {
    //     if (!image) return null;

    //     // 1. ถ้าเป็น Buffer (ก้อนข้อมูลจาก DB)
    //     if (image.type === 'Buffer' || image.data) {
    //         const rawArray = Array.isArray(image.data) ? image.data : image.data?.data;
    //         if (!Array.isArray(rawArray)) return null;

    //         // แปลงเป็น string ปกติก่อน
    //         const base64Content = btoa(
    //             rawArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
    //         );

    //         // ตรวจสอบว่าในเนื้อข้อมูล มีคำว่า "data:image" ซ่อนอยู่หรือไม่ (กรณีเก็บผิดแบบที่คุณเจอ)
    //         // ถ้าเราเอา "data:image/jpeg;base64" ไป btoa มันจะขึ้นต้นด้วย "ZGF0YTppbWFn..."
    //         if (base64Content.startsWith("ZGF0YTppbWFnZ")) {
    //             // ถอดรหัสชั้นแรกออกมาเพื่อให้ได้ string ที่ถูกต้อง
    //             const decodedString = atob(base64Content);
    //             return decodedString; // คืนค่า string ที่มี data:image... อยู่แล้วได้เลย
    //         }

    //         // กรณีปกติที่ไม่มีหัวซ้อน
    //         return `data:image/jpeg;base64,${base64Content}`;
    //     }

    //     // 2. ถ้าเป็น String อยู่แล้ว
    //     if (typeof image === 'string') return image;

    //     return null;
    // };

    // const handleFileChangeInModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         // แจ้งให้ DetailStationModal ทราบ (เพื่อเอาไปทำ Base64 ต่อ)
    //         onFileChange(file);

    //         // สร้าง Preview URL สำหรับ Modal นี้
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setPreview(reader.result as string); // เก็บ Base64 string สำหรับ Preview
    //         };
    //         reader.readAsDataURL(file);
    //     } else {
    //         setPreview(null);
    //         onFileChange(undefined);
    //     }
    // };

    // const removeImage = () => {
    //     setPreview(null);
    //     onFileChange(undefined);
    //     // เคลียร์ค่าใน input file ด้วย (เผื่อผู้ใช้เลือกไฟล์เดิมซ้ำ)
    //     const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    //     if (fileInput) fileInput.value = '';
    // };

    // useEffect(() => {
    //     if (form.image) {
    //         const imagePreview = getImageSrc(form.image);
    //         setPreview(imagePreview);
    //     }
    // }, [form.image]);

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
            {/* BACKDROP - เข้มและเบลอเพื่อเน้นจุดสนใจ */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px] animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* MODAL CARD - ล็อคความสูงไม่ให้ทะลุจอ */}
            <div className="
            relative
            w-full
            max-w-md
            max-h-[90vh] 
          bg-white
            rounded-4xl
            shadow-[0_20px_50px_rgba(0,0,0,0.15)]
            border 
            border-slate-100
            overflow-hidden
            flex flex-col
            animate-in zoom-in-95 duration-300
            ">

                {/* HEADER - ติดอยู่กับที่ด้านบน */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            แก้ไขสถานี
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all duration-300 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* BODY - ส่วนที่เลื่อนได้ (Scrollable) */}
                <div className="px-8 py-4 space-y-5 overflow-y-auto custom-scrollbar flex-1">

                    {/* Section: ข้อมูลพื้นฐาน */}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">
                                ลำดับ
                            </label>
                            <input
                                type="number"
                                className="w-full px-3 py-3 rounded-2xl border border-slate-100 bg-slate-100 text-center text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all shadow-inner"
                                value={Number(form.sequence)}
                                onChange={(e) => setForm({ ...form, sequence: Number(e.target.value) })}
                            />
                        </div>


                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">
                                ประเภทสถานี
                            </label>
                            <select
                                value={String(form.isStation)} // สมมติ field ชื่อ isStation
                                onChange={(e) =>
                                    setForm({ ...form, isStation: e.target.value === 'true' })
                                }
                                className="
    w-full
    px-4 py-3
    rounded-2xl
    border border-slate-100
    bg-slate-100
    text-sm font-bold text-slate-700
    focus:ring-2 focus:ring-indigo-500
    focus:bg-white
    outline-none
    transition-all
    shadow-inner
    cursor-pointer
  "
                            >
                                {STATIONTYPE.map((st) => (
                                    <option key={String(st.id)} value={String(st.id)}>
                                        {st.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='space-y-1.5'>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">
                                ชื่อสถานี
                            </label>
                            <input
                                className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-100 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className='space-y-1.5'>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">
                                Google Map
                            </label>
                            <input
                                className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-100 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all shadow-inner placeholder:text-slate-300"
                                placeholder="เช่น https://www.google.com/maps/d/viewer?ll=..."
                                value={form.googleMapURL}
                                onChange={(e) => setForm({ ...form, googleMapURL: e.target.value })}
                            />
                        </div>
                    </div>
                    {/* Section: เวลา */}
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">
                            กำหนดการ (เวลาถึง - เวลาออก)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative flex items-center group">
                                <input
                                    type="time"
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-100 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    value={form.arrivalTime ?? ''}
                                    onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                                />
                            </div>
                            <div className="relative flex items-center group">
                                <input
                                    type="time"
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-100 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    value={form.departureTime ?? ''}
                                    onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: พิกัด (GPS) */}
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">
                            พิกัดสถานี (ลาติจูด / ลองจิจูด)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-100 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                placeholder="ลาติจูด"
                                value={form.latitude}
                                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                            />
                            <input
                                className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-100 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                placeholder="ลองจิจูด"
                                value={form.longitude}
                                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Section: รูปภาพ */}
                    {/* <div className="space-y-1.5 pt-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">
                            ภาพประกอบสถานี
                        </label>
                        {preview ? (
                            <div className="relative h-44 rounded-3xl overflow-hidden border-4 border-white shadow-lg group">
                                <img src={preview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md text-white hover:bg-red-500 rounded-xl transition-all shadow-lg active:scale-90 cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative h-44 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl flex flex-col items-center justify-center bg-slate-100 transition-all group cursor-pointer">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChangeInModal}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-all mb-2">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-[11px] font-black text-slate-800">คลิกเพื่อเปลี่ยนรูป</p>
                            </div>
                        )}
                    </div> */}
                </div>

                {/* FOOTER - ติดอยู่กับที่ด้านล่าง */}
                <div className="px-8 py-6 bg-slate-100/80 backdrop-blur-sm flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 border-2 border-black/10 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95 hover:border-slate-200 cursor-pointer"
                    >
                        ยกเลิก
                    </button>

                    <button
                        onClick={onUpdate}
                        disabled={disabled || isSaving}
                        className={`flex-2 py-3.5 rounded-2xl text-sm font-black text-white transition-all shadow-lg active:scale-95
                                ${(disabled || isSaving)
                                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 cursor-pointer'}`}
                    >
                        {isSaving ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                กำลังบันทึก...
                            </div>
                        ) : "อัปเดตข้อมูลสถานี"}
                    </button>
                </div>
            </div>
        </div>
    );
}