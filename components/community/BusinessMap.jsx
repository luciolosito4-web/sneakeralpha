import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons (Leaflet + Vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

async function geocodeCity(city) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'it' } }
  );
  const data = await res.json();
  if (data && data[0]) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

export default function BusinessMap() {
  const [markers, setMarkers] = useState([]);
  const [geocoding, setGeocoding] = useState(true);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['all-businesses-map'],
    queryFn: () => base44.entities.BusinessAccount.list('-created_date', 50),
  });

  useEffect(() => {
    if (!businesses.length) {
      setGeocoding(false);
      return;
    }

    // Deduplica per owner_email: tieni solo il record più recente per ogni proprietario
    const byOwner = {};
    businesses.forEach(b => {
      if (!b.owner_email) return;
      if (!byOwner[b.owner_email] || b.created_date > byOwner[b.owner_email].created_date) {
        byOwner[b.owner_email] = b;
      }
    });
    const active = Object.values(byOwner).filter(b => b.is_active && b.city);

    (async () => {
      setGeocoding(true);
      const results = await Promise.all(
        active.map(async (biz) => {
          const coords = await geocodeCity(biz.city);
          return coords ? { ...biz, coords } : null;
        })
      );
      setMarkers(results.filter(Boolean));
      setGeocoding(false);
    })();
  }, [businesses]);

  if (isLoading || geocoding) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Caricamento mappa...</p>
      </div>
    );
  }

  if (markers.length === 0) {
    return (
      <div className="text-center py-16">
        <MapPin className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Nessun negozio business ancora registrato</p>
        <p className="text-xs text-muted-foreground mt-1">I profili business con una città verranno mostrati sulla mappa</p>
      </div>
    );
  }

  const center = [markers[0].coords.lat, markers[0].coords.lng];

  const bizTypeLabels = {
    negozio: '🏪 Negozio',
    reseller: '🔄 Reseller',
    sneaker_boutique: '👟 Boutique',
    dropshipper: '📦 Dropshipper',
    altro: '🏢 Altro',
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
        {markers.length} negozi sulla mappa
      </p>
      <div className="rounded-2xl overflow-hidden border border-border/50 h-[420px]">
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {markers.map((biz) => (
            <Marker key={biz.id} position={[biz.coords.lat, biz.coords.lng]} icon={customIcon}>
              <Popup>
                <div className="min-w-[160px]">
                  {biz.logo_url && (
                    <img src={biz.logo_url} alt={biz.business_name} className="w-full h-20 object-cover rounded mb-2" />
                  )}
                  <p className="font-bold text-sm">{biz.business_name}</p>
                  <p className="text-xs text-gray-500">{bizTypeLabels[biz.business_type] || biz.business_type}</p>
                  <p className="text-xs text-gray-500 mt-1">📍 {biz.city}</p>
                  {biz.description && <p className="text-xs mt-1 text-gray-600">{biz.description}</p>}
                  {biz.website && (
                    <a
                      href={biz.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 flex items-center gap-1 mt-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Sito web
                    </a>
                  )}
                  {biz.instagram_handle && (
                    <p className="text-xs text-pink-500 mt-1">@{biz.instagram_handle}</p>
                  )}
                  {biz.whatsapp && (
                    <a
                      href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 flex items-center gap-1 mt-1"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}