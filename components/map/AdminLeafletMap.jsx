'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function getMarkerColor(priority) {
  if (priority === 'Emergency') return '#dc2626';
  if (priority === 'High') return '#ea580c';
  if (priority === 'Medium') return '#d97706';
  if (priority === 'Low') return '#0284c7';
  return '#0284c7';
}

function formatStatus(status) {
  return (status || 'PENDING')
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function MapViewState({ reports, selected }) {
  let map = useMap();

  useEffect(() => {
    if (!Array.isArray(reports) || !reports.length) {
      map.setView([19.8762, 75.3433], 13);
      return;
    }

    if (selected && selected.location && Number.isFinite(selected.location.latitude) && Number.isFinite(selected.location.longitude)) {
      map.flyTo([Number(selected.location.latitude), Number(selected.location.longitude)], 15, { duration: 0.6 });
      return;
    }

    let points = reports
      .filter((report) => report && report.location && Number.isFinite(report.location.latitude) && Number.isFinite(report.location.longitude))
      .map((report) => [Number(report.location.latitude), Number(report.location.longitude)]);

    if (!points.length) {
      map.setView([19.8762, 75.3433], 13);
      return;
    }

    let bounds = L.latLngBounds(points);
    map.fitBounds(bounds.pad(0.2), { animate: true, duration: 0.6 });
  }, [map, reports, selected]);

  return null;
}

export default function AdminLeafletMap({ reports, selected, onSelect }) {
  let safeReports = Array.isArray(reports) ? reports : [];

  return (
    <MapContainer
      center={[19.8762, 75.3433]}
      zoom={13}
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
      <MapViewState reports={safeReports} selected={selected} />
      {safeReports.map((report) => {
        if (!report || !report.location || !Number.isFinite(report.location.latitude) || !Number.isFinite(report.location.longitude)) return null;

        let position = [Number(report.location.latitude), Number(report.location.longitude)];
        let color = getMarkerColor(report.priority);

        return (
          <CircleMarker
            key={report.reportId || `${report.issue}-${position[0]}-${position[1]}`}
            center={position}
            radius={11}
            pathOptions={{ color: '#fff', weight: 3, fillColor: color, fillOpacity: 0.95 }}
            eventHandlers={{
              click: () => onSelect(report),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', maxWidth: '220px' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{report.issue}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{report.category}</div>
                <div style={{ fontSize: '11.5px', color: '#0f766e', marginTop: '6px', fontWeight: 700 }}>Status: {formatStatus(report.status)}</div>
                <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '6px' }}>Priority: {report.priority}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
