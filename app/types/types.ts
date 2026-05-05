export interface Station {
    id?: number | null
    name: string
    sequence: number | null
    latitude: string
    longitude: string
    arrivalTime: string
    departureTime: string
    image?: string
    googleMapURL: string
    isStation: boolean
}

export interface Place {
    id?: number | null
    name: string
    latitude: string
    longitude: string
    description: string
    image: string
    station_id?: number | null
}