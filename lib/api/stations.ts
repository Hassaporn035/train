import { Station } from "@/app/types/types";

// ฟังก์ชันช่วยจัดการข้อมูลก่อนส่ง (Helper)
const prepareParams = (params: Station) => {
    const link =
        typeof params.linkGoogleMymap === "string" && params.linkGoogleMymap.trim() !== ""
            ? params.linkGoogleMymap.trim()
            : null;
    return {
        ...params,
        latitude: params.latitude !== "" ? parseFloat(String(params.latitude)) : null,
        longitude: params.longitude !== "" ? parseFloat(String(params.longitude)) : null,
        sequence: Number(params.sequence),
        linkGoogleMymap: link,
    };
};

export async function createStation(params: Station) {
    try {
        const res = await fetch("/api/stations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prepareParams(params)), // ✨ แปลงข้อมูลก่อนส่ง
        });
        return await res.json();
    } catch (e: any) {
        return { error: "Connection error" };
    }
}

export async function getStations() {
    try {
        const res = await fetch("/api/stations", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        return await res.json();
    } catch (e) {
        return { error: "Failed to fetch stations", data: [] };
    }
}

export async function updateStation(params: Station) {
    try {
        const res = await fetch(`/api/stations/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },  
            body: JSON.stringify(prepareParams(params)), // ✨ แปลงข้อมูลก่อนส่ง
        });
        return await res.json();
    } catch (e: any) {
        return { error: "Update failed" };
    }
}

export async function removeStation(id: number) {
    try {
        const res = await fetch(`/api/stations/${id}`, {
            method: "DELETE",
            headers: { "Content-type": "application/json" }
        });
        // คืนค่า json เพื่อให้หน้าบ้านเช็ค success: true ได้
        return await res.json();
    } catch (e: any) {
        return { error: "Delete failed" };
    }
}