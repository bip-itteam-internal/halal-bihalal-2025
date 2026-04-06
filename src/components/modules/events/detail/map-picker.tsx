'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Next.js/Webpack
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapPickerProps {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

function LocationMarker({ lat, lng, onChange }: MapPickerProps) {
  const map = useMap()
  
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom())
    }
  }, [lat, lng, map])

  return lat && lng ? (
    <Marker position={[lat, lng]} />
  ) : null
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  // Default to Jakarta if no coordinates
  const defaultCenter: [number, number] = [lat || -6.2, lng || 106.8]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
    </div>
  )
}
