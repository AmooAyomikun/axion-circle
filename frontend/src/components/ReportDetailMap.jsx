import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getMarkerIcon = (status) => {
  let color = '#3b82f6'; // default blue
  const s = (status || '').toLowerCase();
  if (s === 'reported') color = '#f59e0b'; // amber
  else if (s === 'acknowledged') color = '#3b82f6'; // blue
  else if (s === 'inprogress') color = '#8b5cf6'; // purple
  else if (s === 'resolved') color = '#10b981'; // green

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const ReportDetailMap = ({ report, geoDistrict, geoAddress }) => {
  const latitude = report.latitude || 40.7128;
  const longitude = report.longitude || -74.0060;

  return (
    <MapContainer 
      center={[latitude, longitude]} 
      zoom={15} 
      scrollWheelZoom={false}
      dragging={true}
      touchZoom={true}
      zoomControl={true}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer 
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={18}
      />
      <Marker position={[latitude, longitude]} icon={getMarkerIcon(report.status)}>
        <Popup>
          <div className="font-heading font-bold text-sm text-black">
            {geoDistrict || report.areaName || 'Location'}
          </div>
          <div className="text-xs text-paragraph mt-1">
            {geoAddress || report.address || 'Exact Location'}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default ReportDetailMap;
