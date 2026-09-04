'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PRIORITY_STYLE } from '@/utils/client';

let DEFAULT_CENTER = [19.8762, 75.3433];

function getMarkerColor(priority) {
  let tone = PRIORITY_STYLE[priority]?.tone || 'sky';
  if (tone === 'red') return '#dc2626';
  if (tone === 'orange') return '#ea580c';
  if (tone === 'amber') return '#d97706';
  return '#0284c7';
}

function formatStatus(status) {
  return (status || 'PENDING')
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function MapState({ markers, selected }) {
  let map = useMap();

  useEffect(() => {
    if (!Array.isArray(markers) || !markers.length) {
      map.setView(DEFAULT_CENTER, 13);
      return;
    }

    if (selected && selected.location && Number.isFinite(selected.location.latitude) && Number.isFinite(selected.location.longitude)) {
      map.flyTo([Number(selected.location.latitude), Number(selected.location.longitude)], 16, { duration: 0.5 });
      return;
    }

    let points = markers
      .filter((item) => item && item.location && Number.isFinite(item.location.latitude) && Number.isFinite(item.location.longitude))
      .map((item) => [Number(item.location.latitude), Number(item.location.longitude)]);

    if (!points.length) {
      map.setView(DEFAULT_CENTER, 13);
      return;
    }

    let bounds = L.latLngBounds(points);
    map.fitBounds(bounds.pad(0.25), { animate: true, duration: 0.5 });
  }, [map, markers, selected]);

  return null;
}

export default function LiveCivicLeafletMap({ markers, selected, onSelect }) {
  let mapMarkers = Array.isArray(markers) ? markers : [];

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={13} scrollWheelZoom={true} className="h-full w-full" style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapState markers={mapMarkers} selected={selected} />
      {mapMarkers.map((marker) => {
        if (!marker || !marker.location || !Number.isFinite(marker.location.latitude) || !Number.isFinite(marker.location.longitude)) return null;

        let position = [Number(marker.location.latitude), Number(marker.location.longitude)];
        let color = getMarkerColor(marker.priority);

        return (
          <CircleMarker
            key={marker.id || `${marker.issue}-${position[0]}-${position[1]}`}
            center={position}
            radius={12}
            pathOptions={{ color: '#fff', weight: 3, fillColor: color, fillOpacity: 0.95 }}
            eventHandlers={{
              click: () => onSelect(marker),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', maxWidth: '220px' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{marker.issue}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{marker.category}</div>
                <div style={{ fontSize: '11.5px', color: '#0f766e', marginTop: '6px', fontWeight: 700 }}>Status: {formatStatus(marker.status)}</div>
                <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '6px' }}>Priority: {marker.priority}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
