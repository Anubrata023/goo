import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';

// Fix Leaflet default icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  complaints: any[];
  center?: LatLngExpression;
  zoom?: number;
  onMarkerClick?: (complaint: any) => void;
}

// Bypassing React 19 & react-leaflet typings incompatibility via casting
const MapContainerAny = MapContainer as any;
const TileLayerAny = TileLayer as any;
const CircleMarkerAny = CircleMarker as any;
const PopupAny = Popup as any;

export function ComplaintMap({ complaints, center = [26.8467, 80.9462], zoom = 12, onMarkerClick }: MapProps) {
  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-xl border border-zinc-200 mt-8 relative z-10">
      <MapContainerAny center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        {/* OpenStreetMap tile layer */}
        <TileLayerAny
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {complaints.map((complaint, index) => {
          // If complaint doesn't have exact lat/lng, jitter around Lucknow
          const lat = complaint.lat || 26.8467 + (Math.sin(index * 13) * 0.04);
          const lng = complaint.lng || 80.9462 + (Math.cos(index * 17) * 0.04);
          
          const priority = complaint.priority_score || 50;
          const color = priority > 70 ? '#ef4444' : priority > 40 ? '#f59e0b' : '#22c55e';
          const radius = Math.min((complaint.cluster_size || 1) * 3 + 8, 25);

          return (
            <CircleMarkerAny
              key={complaint.id || index}
              center={[lat, lng]}
              radius={radius}
              fillColor={color}
              color={color}
              weight={2}
              opacity={1}
              fillOpacity={0.7}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(complaint),
              }}
            >
              <PopupAny>
                <div className="max-w-xs font-sans text-slate-800">
                  <p className="font-bold text-slate-800">{complaint.category || 'Other'}</p>
                  <p className="text-xs text-slate-600 mt-1">{complaint.summary_en || complaint.raw_text}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-bold text-white bg-jan-slate px-1.5 py-0.5 rounded">
                      Priority: {priority}/100
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                      {complaint.ward}
                    </span>
                  </div>
                  {complaint.is_duplicate && (
                    <p className="text-[10px] text-orange-500 font-bold mt-2">🔄 Merged with {complaint.cluster_size} reports</p>
                  )}
                </div>
              </PopupAny>
            </CircleMarkerAny>
          );
        })}
      </MapContainerAny>
    </div>
  );
}