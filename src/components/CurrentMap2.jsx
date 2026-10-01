import { useEffect, useRef } from "react";
import {
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  Marker,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../context/ThemeContext";
import { FiNavigation, FiMaximize2 } from "react-icons/fi";

const createCustomIcon = (htmlString, className = "", size = [36, 36], anchor = [18, 18]) => {
  return L.divIcon({
    html: htmlString,
    className: `custom-leaflet-icon ${className}`,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -anchor[1]],
  });
};

// 1. Monochromatic Pickup Marker
const pickupIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center">
    <div class="absolute w-7 h-7 bg-black/20 dark:bg-white/20 rounded-full animate-ping"></div>
    <div class="relative w-6 h-6 bg-black text-white dark:bg-white dark:text-black border-2 border-white dark:border-black rounded-full flex items-center justify-center shadow-lg font-bold">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 fill-current" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/></svg>
    </div>
  </div>
`, "pickup-pin");

// 2. Monochromatic Dropoff Marker
const dropoffIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center">
    <div class="absolute w-7 h-7 bg-black/20 dark:bg-white/20 rounded-full animate-ping"></div>
    <div class="relative w-6 h-6 bg-black text-white dark:bg-white dark:text-black border-2 border-white dark:border-black rounded-full flex items-center justify-center shadow-lg font-bold">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
    </div>
  </div>
`, "dropoff-pin");

// 3. User Geolocation Marker
const userGpsIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center">
    <div class="absolute w-6 h-6 bg-black/30 dark:bg-white/30 rounded-full animate-ping"></div>
    <div class="relative w-3.5 h-3.5 bg-black dark:bg-white border-2 border-white dark:border-black rounded-full shadow-md"></div>
  </div>
`, "gps-pin", [24, 24], [12, 12]);

// 4. Monochromatic Driver Car Marker
const driverCarIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center p-1.5 bg-black text-white dark:bg-white dark:text-black border-2 border-white dark:border-black rounded-xl shadow-xl">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
      <circle cx="7.5" cy="14.5" r="1.5"/>
      <circle cx="16.5" cy="14.5" r="1.5"/>
    </svg>
  </div>
`, "driver-car", [32, 32], [16, 16]);

function FitBounds({ route, pickupLocation, dropoffLocation, currentLocation, driverLocation }) {
  const map = useMap();

  useEffect(() => {
    const validPoints = [
      ...(route?.filter((p) => p?.lat && p?.lng).map((p) => [p.lat, p.lng]) || []),
      pickupLocation?.lat && pickupLocation?.lng ? [pickupLocation.lat, pickupLocation.lng] : null,
      dropoffLocation?.lat && dropoffLocation?.lng ? [dropoffLocation.lat, dropoffLocation.lng] : null,
      currentLocation?.lat && currentLocation?.lng ? [currentLocation.lat, currentLocation.lng] : null,
      driverLocation?.lat && driverLocation?.lng ? [driverLocation.lat, driverLocation.lng] : null,
    ].filter(Boolean);

    if (validPoints.length >= 2) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (validPoints.length === 1) {
      map.flyTo(validPoints[0], 14, { animate: true, duration: 1.2 });
    }
  }, [route, pickupLocation, dropoffLocation, currentLocation, driverLocation, map]);

  return null;
}

function FollowDriver({ driverLocation }) {
  const map = useMap();
  const prev = useRef(null);

  useEffect(() => {
    if (!driverLocation?.lat || !driverLocation?.lng) return;
    if (!prev.current || Math.abs(driverLocation.lat - prev.current.lat) > 0.0002 || Math.abs(driverLocation.lng - prev.current.lng) > 0.0002) {
      map.panTo([driverLocation.lat, driverLocation.lng], { animate: true, duration: 0.8 });
      prev.current = driverLocation;
    }
  }, [driverLocation, map]);

  return null;
}

function MapControlsOverlay({ onRecenter, onLocateMe }) {
  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
      <button
        onClick={onLocateMe}
        title="Find My Location"
        className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-neutral-200 dark:border-zinc-800 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
      >
        <FiNavigation className="w-4 h-4" />
      </button>
      <button
        onClick={onRecenter}
        title="Recenter Map Bounds"
        className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-neutral-200 dark:border-zinc-800 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
      >
        <FiMaximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function isValidLatLng(obj) {
  return (
    obj &&
    typeof obj.lat === "number" &&
    typeof obj.lng === "number" &&
    !isNaN(obj.lat) &&
    !isNaN(obj.lng)
  );
}

export default function CurrentMap2({
  currentLocation,
  driverLocation,
  pickupLocation,
  dropoffLocation,
  route,
  drivers = [],
  className = "w-full h-full min-h-[420px] rounded-3xl",
}) {
  const { isDark } = useTheme();
  const mapRef = useRef(null);

  const center = isValidLatLng(driverLocation)
    ? [driverLocation.lat, driverLocation.lng]
    : isValidLatLng(pickupLocation)
    ? [pickupLocation.lat, pickupLocation.lng]
    : isValidLatLng(currentLocation)
    ? [currentLocation.lat, currentLocation.lng]
    : isValidLatLng(dropoffLocation)
    ? [dropoffLocation.lat, dropoffLocation.lng]
    : [28.6139, 77.2090];

  const handleRecenter = () => {
    if (!mapRef.current) return;
    const validPoints = [
      ...(route?.filter(isValidLatLng).map((p) => [p.lat, p.lng]) || []),
      pickupLocation?.lat && pickupLocation?.lng ? [pickupLocation.lat, pickupLocation.lng] : null,
      dropoffLocation?.lat && dropoffLocation?.lng ? [dropoffLocation.lat, dropoffLocation.lng] : null,
      currentLocation?.lat && currentLocation?.lng ? [currentLocation.lat, currentLocation.lng] : null,
      driverLocation?.lat && driverLocation?.lng ? [driverLocation.lat, driverLocation.lng] : null,
    ].filter(Boolean);

    if (validPoints.length >= 2) {
      mapRef.current.fitBounds(L.latLngBounds(validPoints), { padding: [60, 60] });
    } else if (validPoints.length === 1) {
      mapRef.current.flyTo(validPoints[0], 14);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
        },
        () => {}
      );
    }
  };

  return (
    <div className={`relative overflow-hidden shadow-sm border border-neutral-200 dark:border-zinc-800 ${isDark ? "map-dark-filter" : ""} ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        ref={mapRef}
        style={{ height: "100%", width: "100%", minHeight: "360px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        {/* User Marker */}
        {isValidLatLng(currentLocation) && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userGpsIcon}>
            <Popup>
              <div className="p-1 font-bold text-xs">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {/* Pickup Pin */}
        {isValidLatLng(pickupLocation) && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Pickup Location</span>
                <span className="font-bold text-xs text-black dark:text-white">Confirmed Pickup</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Pin */}
        {isValidLatLng(dropoffLocation) && (
          <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Dropoff Point</span>
                <span className="font-bold text-xs text-black dark:text-white">Destination Target</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver Car */}
        {isValidLatLng(driverLocation) && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverCarIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Assigned Driver</span>
                <span className="font-bold text-xs text-black dark:text-white">En Route</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Drivers */}
        {drivers?.map((drv, idx) => {
          if (!drv.location?.coordinates) return null;
          const [lng, lat] = drv.location.coordinates;
          if (!lat || !lng) return null;
          return (
            <Marker key={drv._id || idx} position={[lat, lng]} icon={driverCarIcon}>
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-xs">{drv.name || "Available Driver"}</p>
                  <p className="text-[10px] text-neutral-500">★ {drv.rating || "4.9"} • {drv.vehicleName || "Sedan"}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Monochromatic Route Polyline */}
        {route && route.length > 0 && (
          <>
            <Polyline
              positions={route.filter(isValidLatLng).map((p) => [p.lat, p.lng])}
              color={isDark ? "#ffffff" : "#000000"}
              weight={4}
              opacity={0.9}
            />
          </>
        )}

        <FitBounds
          route={route}
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          currentLocation={currentLocation}
          driverLocation={driverLocation}
        />

        <FollowDriver driverLocation={driverLocation} />
      </MapContainer>

      <MapControlsOverlay onRecenter={handleRecenter} onLocateMe={handleLocateMe} />
    </div>
  );
}
