import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import icon_user from "../assets/icon-user.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Setup default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const RoutingControl = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      show: false,
      createMarker: () => null,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: "red", weight: 4, opacity: 0.7 }],
      },
    }).addTo(map);

    // Tunggu sejenak sebelum menyentuh _container
    setTimeout(() => {
      if (routingControl._container) {
        routingControl._container.style.display = "none";
      }
    }, 100);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]);

  return null;
};

const Maps = ({
  coords,
  getCurrentLocation,
  targetCoords,
  isLoadingUser,
  distance,
}) => {
  const mapRef = useRef();
  const [pingRadius, setPingRadius] = useState(100);
  const pingBaseRadius = 100;

  useEffect(() => {
    let growing = true;
    const interval = setInterval(() => {
      setPingRadius((prev) => {
        if (prev >= pingBaseRadius + 30) growing = false;
        if (prev <= pingBaseRadius) growing = true;
        return growing ? prev + 2 : prev - 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      mapRef.current &&
      coords?.lat &&
      coords?.lng &&
      targetCoords?.lat &&
      targetCoords?.lng
    ) {
      const bounds = L.latLngBounds([
        [coords.lat, coords.lng],
        [targetCoords.lat, targetCoords.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coords, targetCoords]);

  const userIcon = new L.Icon({
    iconUrl: icon_user,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const officeIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const goToCurrentLocation = () => {
    if (coords.lat && coords.lng && mapRef.current) {
      mapRef.current.setView([coords.lat, coords.lng], 18);
    }
  };

  const goToOfficeLocation = () => {
    if (mapRef.current) {
      mapRef.current.setView([targetCoords.lat, targetCoords.lng], 17);
    }
    getCurrentLocation();
  };

  const formatDistance = (meters) =>
    meters >= 1000
      ? `${(meters / 1000).toFixed(2)} km`
      : `${meters.toFixed(2)} meter`;

  return (
    <div className="relative w-full h-96 z-0">
      {/* Tombol */}
      <button
        onClick={goToCurrentLocation}
        className="absolute z-[999] top-2 right-2 bg-white shadow px-3 py-1 rounded-full text-xs text-gray-700 hover:bg-gray-100 border"
      >
        📍 Lokasi Saya
      </button>

      <button
        onClick={goToOfficeLocation}
        className="absolute z-[999] top-2 right-[120px] bg-white shadow px-3 py-1 rounded-full text-xs text-gray-700 hover:bg-gray-100 border"
      >
        🔄 Refresh
      </button>

      <MapContainer
        ref={mapRef}
        center={[targetCoords.lat, targetCoords.lng]}
        zoom={17}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Animasi Ping */}
        <Circle
          center={[targetCoords.lat, targetCoords.lng]}
          radius={pingRadius}
          pathOptions={{
            color: "transparent",
            fillColor: "red",
            fillOpacity: 0.2,
          }}
        />

        {/* Lingkaran radius tetap */}
        <Circle
          center={[targetCoords.lat, targetCoords.lng]}
          radius={100}
          pathOptions={{
            color: "red",
            fillColor: "#ffc0cb",
            fillOpacity: 0.4,
          }}
        />

        {/* Routing jika tersedia koordinat */}
        {coords.lat && coords.lng && distance > 100 && (
          <RoutingControl start={coords} end={targetCoords} />
        )}

        <Marker
          position={[targetCoords.lat, targetCoords.lng]}
          icon={officeIcon}
        >
          <Popup>🏢 KPU Kabupaten Sekadau</Popup>
        </Marker>

        <Marker position={[coords.lat, coords.lng]} icon={userIcon}>
          <Popup>📍 Lokasi Kamu Sekarang</Popup>
        </Marker>
      </MapContainer>

      {distance !== null && !isLoadingUser && (
        <div className="absolute z-[999] bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 rounded-md px-4 py-1 text-center text-xs shadow">
          <p className="text-black font-semibold">
            Jarak kamu dari titik kantor:
          </p>
          <p
            className={`mt-1 px-3 py-1 rounded-full text-white ${
              distance > 100 ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {formatDistance(distance)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Maps;
