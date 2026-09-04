'use client';

import { useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from './map-config';

function roundCoord(value) {
  let safeValue = Number(value);
  if (!Number.isFinite(safeValue)) return safeValue;
  return Math.round(safeValue * 1e6) / 1e6;
}

function isValidLocation(lat, lng) {
  let safeLat = Number(lat);
  let safeLng = Number(lng);
  return Number.isFinite(safeLat) && Number.isFinite(safeLng) && safeLat >= -90 && safeLat <= 90 && safeLng >= -180 && safeLng <= 180;
}

export default function LeafletMap({ value, onSelect }) {
  let markerIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    let icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    return icon;
  }, []);

  let selectedCenter = [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];
  if (value && isValidLocation(value.latitude, value.longitude)) {
    selectedCenter = [Number(value.latitude), Number(value.longitude)];
  }

  function MapSelectionHandler() {
    useMapEvents({
      click(event) {
        let latitude = roundCoord(event.latlng.lat);
        let longitude = roundCoord(event.latlng.lng);
        onSelect(latitude, longitude, { source: 'map' });
      },
    });
    return null;
  }

  return (
    <MapContainer
      center={selectedCenter}
      zoom={DEFAULT_MAP_ZOOM}
      scrollWheelZoom={true}
      zoomControl={true}
      dragging={true}
      tap={true}
      className="h-full w-full"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapSelectionHandler />
      {value && isValidLocation(value.latitude, value.longitude) && (
        <Marker position={[Number(value.latitude), Number(value.longitude)]} icon={markerIcon} />
      )}
    </MapContainer>
  );
}
