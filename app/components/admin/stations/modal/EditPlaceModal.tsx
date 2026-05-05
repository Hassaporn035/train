"use client";
import React, { useEffect, useRef, useState } from 'react'
import { Place } from '@/app/types/types';
import {
  ArrowLeft,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

interface Props {
  stationName: string
  form: Place
  setForm: React.Dispatch<React.SetStateAction<Place>>
  onUpdate: () => void
  onClose: () => void
  onFileChange: (file: File | undefined) => void
  isSaving: boolean
}

export default function EditPlaceModal({ stationName, form, setForm, onUpdate, onClose, onFileChange, isSaving }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const disabled = [
    form.name,
    form.latitude,
    form.longitude,
    form.description,
    form.image
  ].some(value => !value || (typeof value === 'string' && value.trim() === ''));

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ฟังก์ชันแปลง Buffer เป็น Base64 เพื่อแสดงรูป ---
  const getImageSrc = (image: any) => {
    if (!image) return null;

    // 1. ถ้าเป็น Buffer (ก้อนข้อมูลจาก DB)
    if (image.type === 'Buffer' || image.data) {
      const rawArray = Array.isArray(image.data) ? image.data : image.data?.data;
      if (!Array.isArray(rawArray)) return null;

      // แปลงเป็น string ปกติก่อน
      const base64Content = btoa(
        rawArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      // ตรวจสอบว่าในเนื้อข้อมูล มีคำว่า "data:image" ซ่อนอยู่หรือไม่ (กรณีเก็บผิดแบบที่คุณเจอ)
      // ถ้าเราเอา "data:image/jpeg;base64" ไป btoa มันจะขึ้นต้นด้วย "ZGF0YTppbWFn..."
      if (base64Content.startsWith("ZGF0YTppbWFnZ")) {
        // ถอดรหัสชั้นแรกออกมาเพื่อให้ได้ string ที่ถูกต้อง
        const decodedString = atob(base64Content);
        return decodedString; // คืนค่า string ที่มี data:image... อยู่แล้วได้เลย
      }

      // กรณีปกติที่ไม่มีหัวซ้อน
      return `data:image/jpeg;base64,${base64Content}`;
    }

    // 2. ถ้าเป็น String อยู่แล้ว
    if (typeof image === 'string') return image;

    return null;
  };

  const handleFileChangeInModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // แจ้งให้ DetailStationModal ทราบ (เพื่อเอาไปทำ Base64 ต่อ)
      onFileChange(file);

      // สร้าง Preview URL สำหรับ Modal นี้
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string); // เก็บ Base64 string สำหรับ Preview
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      onFileChange(undefined);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onFileChange(undefined);
    // เคลียร์ค่าใน input file ด้วย (เผื่อผู้ใช้เลือกไฟล์เดิมซ้ำ)
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };


  useEffect(() => {
    if (form.image) {
      const imagePreview = getImageSrc(form.image);
      setPreview(imagePreview);
    }
  }, [form.image]);

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 md:p-6">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={() => onClose()}
      />

      {/* MODAL CARD - เพิ่ม flex และ max-height */}
      <div className="relative bg-white w-full max-w-115 max-h-[90vh] rounded-4xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* HEADER - คงที่ไว้ด้านบน */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onClose()}
              className="p-2 bg-slate-100 hover:bg-slate-100 text-slate-500 rounded-xl transition-all active:scale-90 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-black text-slate-900 text-lg tracking-tight">เพิ่มสถานที่ท่องเที่ยว</h1>
          </div>
        </div>

        {/* BODY - ส่วนที่เลื่อนได้ (Scrollable) */}
        <div className="px-6 pb-4 overflow-y-auto custom-scrollbar flex-1 space-y-5">

          {/* Hero Title - ปรับขนาดลงหน่อยเพื่อประหยัดพื้นที่ */}
          <div className="px-2 pt-2">
            <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tighter">
              {stationName}
            </h2>
          </div>

          {/* ฟอร์มกรอกข้อมูล - ปรับลดระยะห่าง (Space-y) และ Padding ภายใน */}
          <div className="space-y-4">
            {/* ชื่อสถานที่ */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">ชื่อสถานที่</label>
              <input
                type="text"
                placeholder="ชื่อที่เที่ยว..."
                className="w-full bg-slate-100 border border-transparent px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-bold text-slate-800"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* พิกัด GPS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">ละติจูด</label>
                <input
                  className="w-full bg-slate-100 border border-transparent px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="13.7xxx"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">ลองจิจูด</label>
                <input
                  className="w-full bg-slate-100 border border-transparent px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="100.4xxx"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>

            {/* รายละเอียด */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">รายละเอียด</label>
              <textarea
                rows={3}
                placeholder="เล่าเรื่องราว..."
                className="w-full bg-slate-100 border border-transparent px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-slate-600 resize-none leading-relaxed"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* อัปโหลดรูปภาพ - ปรับความสูงลงเพื่อไม่ให้กินพื้นที่มาก */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">รูปภาพประกอบ</label>

              {preview ? (
                <div className="relative h-40 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                  <img src={preview} className="w-full h-full object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-red-500 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative h-32 border-2 border-dashed border-slate-200 bg-slate-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChangeInModal}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <UploadCloud size={24} className="text-slate-300 mb-1 group-hover:text-indigo-500 transition-colors" />
                  <p className="text-[11px] font-black text-slate-800">เพิ่มรูปภาพ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER - คงที่ไว้ด้านล่าง */}
        <div className="px-6 py-4 bg-white border-t border-slate-50 shrink-0">
          <button
            onClick={onUpdate}
            disabled={!preview || disabled || isSaving}
            className={`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg
            ${(!preview || disabled || isSaving)
                ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 cursor-pointer'}`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                บันทึกสถานที่
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
