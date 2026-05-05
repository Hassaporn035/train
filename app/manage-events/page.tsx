"use client";
import AdminRoute from "../components/AdminRoute";

export default function ManageEventsPage() {
  return (
    <AdminRoute>
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white">
        <h1 className="text-2xl font-bold text-red-600 mb-4">จัดการสถานี</h1>
        <div className="text-gray-700 text-base">(หน้านี้สำหรับ admin เท่านั้น)</div>
        {/* TODO: ใส่เนื้อหาการจัดการสถานีที่นี่ */}
      </div>
    </AdminRoute>
  );
}