import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const customPinIcon = L.divIcon({
  className: 'custom-leaflet-pin bg-transparent border-none',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 40px; position: relative;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F04438" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.4));">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3.5" fill="white" stroke="none"></circle>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

function MapClickHandler({ setLatitude, setLongitude, setLocationStatus, setAreaName, setAddressText }) {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setLatitude(lat);
      setLongitude(lng);
      setLocationStatus('loading');
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`, {
          headers: { "User-Agent": "CleanReport-App/1.0 (amoo-ayomikun)" }
        });
        const data = await res.json();
        if (data && data.address) {
          const area = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.city || data.address.town || data.address.county || 'Pinned Location';
          const street = data.address.road ? `${data.address.house_number || ''} ${data.address.road}`.trim() : (data.display_name.split(',')[0] || 'Selected on map');
          const postcode = data.address.postcode || '';
          setAreaName(area);
          setAddressText(`${street}${postcode ? ', ' + postcode : ''}`);
          setLocationStatus('success');
          return;
        }
      } catch (err) {
        console.warn('Reverse geocoding failed:', err);
      }
      setAreaName('Pinned Location');
      setAddressText(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      setLocationStatus('success');
    }
  });
  return null;
}

export default function ReportFormMap({ latitude, longitude, setLatitude, setLongitude, setLocationStatus, setAreaName, setAddressText }) {
  return (
    <MapContainer
      center={latitude !== null && longitude !== null ? [latitude, longitude] : [6.5244, 3.3792]} // Default to Lagos if no coords
      zoom={15}
      scrollWheelZoom={false}
      className="w-full h-full z-0"
      style={{ height: '100%', width: '100%', minHeight: '192px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {latitude !== null && longitude !== null && (
        <Marker position={[latitude, longitude]} icon={customPinIcon} />
      )}
      {latitude !== null && longitude !== null && (
        <RecenterMap lat={latitude} lng={longitude} />
      )}
      <MapClickHandler
        setLatitude={setLatitude}
        setLongitude={setLongitude}
        setLocationStatus={setLocationStatus}
        setAreaName={setAreaName}
        setAddressText={setAddressText}
      />
    </MapContainer>
  );
}
