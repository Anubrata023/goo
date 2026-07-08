import { useState } from 'react';
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

const INFRASTRUCTURE_GAPS = [
  { id: 'gap_01', type: '🎒 School Upgrade Required', desc: 'Kakori High-School enrollment is at 180% capacity. Travel distance to alternative high-school: 14.2 km.', lat: 26.8810, lng: 80.7711, score: 92, ward: 'Kakori' },
  { id: 'gap_02', type: '🏥 Clinic Accessibility Gap', desc: 'Chinhat East Sector has 0 public health clinics within a 5km radius. 12,000 residents affected.', lat: 26.8550, lng: 80.9850, score: 85, ward: 'Chinhat' },
  { id: 'gap_03', type: '💧 Clean Drinking Water Plant', desc: 'Alambagh slum clusters reporting contaminated groundwater. Immediate water purification plant advised.', lat: 26.8015, lng: 80.9024, score: 89, ward: 'Alambagh' }
];

const LADS_ALLOCATIONS = [
  { id: 'lads_01', project: '📖 Kakori Smart Classrooms Upgrade', amount: '₹15 Lakhs', status: 'Sanctioned', lat: 26.8710, lng: 80.7811, ward: 'Kakori' },
  { id: 'lads_02', project: '🌊 Chinhat Stormwater Drainage Line', amount: '₹45 Lakhs', status: 'Approved & Active', lat: 26.8670, lng: 80.9959, ward: 'Chinhat' },
  { id: 'lads_03', project: '☀️ Sarojini Nagar Solar Streetlight Installation', amount: '₹12 Lakhs', status: 'Completed', lat: 26.7812, lng: 80.8920, ward: 'Sarojini Nagar' }
];

export function ComplaintMap({ complaints, center = [26.8467, 80.9462], zoom = 12, onMarkerClick }: MapProps) {
  const [layer, setLayer] = useState<'grievances' | 'gaps' | 'lads'>('grievances');

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-xl border border-zinc-200 mt-8 relative z-10">
      {/* Overlay Switcher Control */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-zinc-200 flex flex-col gap-2 max-w-xs text-left">
        <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider">🗺️ Geospatial Intel Layers</span>
        <div className="flex flex-col gap-1.5 mt-1">
          <button
            onClick={() => setLayer('grievances')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black text-left border transition-all cursor-pointer ${
              layer === 'grievances' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-zinc-50 border-zinc-150 text-slate-700 hover:bg-zinc-100'
            }`}
          >
            📢 Grievances ({complaints.length})
          </button>
          <button
            onClick={() => setLayer('gaps')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black text-left border transition-all cursor-pointer ${
              layer === 'gaps' ? 'bg-amber-500 border-amber-500 text-slate-900' : 'bg-zinc-50 border-zinc-150 text-slate-700 hover:bg-zinc-100'
            }`}
          >
            🧠 AI School/Clinic Gaps (3)
          </button>
          <button
            onClick={() => setLayer('lads')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black text-left border transition-all cursor-pointer ${
              layer === 'lads' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-zinc-50 border-zinc-150 text-slate-700 hover:bg-zinc-100'
            }`}
          >
            💰 LADS Allocations (3)
          </button>
        </div>
      </div>

      <MapContainerAny center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        {/* OpenStreetMap tile layer */}
        <TileLayerAny
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* 1. Citizen Grievances Layer */}
        {layer === 'grievances' && complaints.map((complaint, index) => {
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
                <div className="max-w-xs font-sans text-slate-800 text-left">
                  <p className="font-bold text-slate-800">{complaint.category || 'Other'}</p>
                  <p className="text-xs text-slate-600 mt-1">{complaint.summary_en || complaint.raw_text}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
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

        {/* 2. AI Infrastructure Gaps Layer */}
        {layer === 'gaps' && INFRASTRUCTURE_GAPS.map((gap) => (
          <CircleMarkerAny
            key={gap.id}
            center={[gap.lat, gap.lng]}
            radius={14}
            fillColor="#f59e0b"
            color="#f59e0b"
            weight={2}
            opacity={1}
            fillOpacity={0.7}
          >
            <PopupAny>
              <div className="max-w-xs font-sans text-slate-800 text-left">
                <p className="font-bold text-amber-600">{gap.type}</p>
                <p className="text-xs text-slate-600 mt-1">{gap.desc}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded">
                    AI Gap Priority: {gap.score}/100
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                    {gap.ward}
                  </span>
                </div>
              </div>
            </PopupAny>
          </CircleMarkerAny>
        ))}

        {/* 3. LADS Budget Allocations Layer */}
        {layer === 'lads' && LADS_ALLOCATIONS.map((lads) => (
          <CircleMarkerAny
            key={lads.id}
            center={[lads.lat, lads.lng]}
            radius={16}
            fillColor="#9333ea"
            color="#9333ea"
            weight={2}
            opacity={1}
            fillOpacity={0.7}
          >
            <PopupAny>
              <div className="max-w-xs font-sans text-slate-800 text-left">
                <p className="font-bold text-purple-700">{lads.project}</p>
                <p className="text-xs text-slate-600 mt-1 font-bold">Funding Amount: <span className="text-purple-600">{lads.amount}</span></p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded">
                    Status: {lads.status}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                    {lads.ward}
                  </span>
                </div>
              </div>
            </PopupAny>
          </CircleMarkerAny>
        ))}
      </MapContainerAny>
    </div>
  );
}