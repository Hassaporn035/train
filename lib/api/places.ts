import { Place } from "@/app/types/types";

export async function addPlace(params: Place) {
    try {
        const res = await fetch("/api/place", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // ถ้าอยากให้ชัวร์เรื่องพิกัดเหมือนของ Station สามารถครอบ prepareParams ก่อนส่งได้ครับ
            body: JSON.stringify(params),
        });
        
        // ✨ ต้อง return res.json() เพื่อให้หน้าบ้านเช็ค { success: true } ได้
        return await res.json(); 
    } catch (e: any) {
        return { error: "Failed to add place" };
    }
}

export async function getPlace(id: number) {
    try {
        const res = await fetch(`/api/place/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (!res.ok) throw new Error("Fetch failed");
        
        return await res.json();
    } catch (e: any) {
        return { error: "Error fetching place", data: [] };
    }
}

export async function updatePlace(params: Place) {
    try {
        const res = await fetch(`/api/place/${params.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        
        // ✨ คืนค่าผลลัพธ์กลับไปด้วย
        return await res.json();
    } catch (e: any) {
        return { error: "Update failed" };
    }
}

export async function removePlace(id: number) {
    try {
        const res = await fetch(`/api/place/${id}`, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json"
            }
        });
        
        return await res.json();
    } catch (e: any) {
        return { error: "Delete failed" };
    }
}