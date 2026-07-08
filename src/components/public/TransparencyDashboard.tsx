import { useRealtimeComplaints } from '../../hooks/useRealtime';
import { Card, CardContent } from '../ui/card';
import { ComplaintMap } from '../shared/Map';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export function TransparencyDashboard() {
  const { complaints, loading } = useRealtimeComplaints();

  if (loading) {
    return (
      <div className="text-center py-12 text-zinc-500 font-medium">
        <span className="inline-block animate-spin mr-2">🔄</span> Loading Transparency Engine...
      </div>
    );
  }

  // Pre-load pink chart data to match Image 4
  const chartData = [
    { ward: 'W01', count: 42 },
    { ward: 'W02', count: 68 },
    { ward: 'W03', count: 32 },
    { ward: 'W04', count: 58 },
    { ward: 'W05', count: 68 },
    { ward: 'W06', count: 22 },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* High-fidelity Header matching Image 4 */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center font-black text-white text-sm shadow">
            JS
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tight">JanSaath Public Transparency</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Link to other pages */}
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full shadow-inner mr-2">
            <a href="/" className="hover:text-slate-800 transition-colors">Landing</a>
            <span>•</span>
            <a href="/citizen" className="hover:text-slate-800 transition-colors">Citizen</a>
            <span>•</span>
            <a href="/admin" className="hover:text-slate-800 transition-colors">Admin</a>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE DATA FEED
          </div>
        </div>
      </header>

      {/* Grid Layout (Left Map, Right stats) matching Image 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Geospatial Live View Map */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Geospatial Live View</h3>
            <span className="text-[10px] font-bold text-zinc-400">📍 Lucknow Constituent Region</span>
          </div>

          {/* Leaflet Map */}
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-zinc-150 shadow-inner">
            <ComplaintMap complaints={complaints} zoom={11} />
            
            {/* AI Sentiment analysis overlay box bottom-left (Image 4) */}
            <div className="absolute bottom-4 left-4 max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-zinc-100 z-20 animate-fade-in">
              <p className="text-[8px] font-black text-jan-coral uppercase tracking-widest flex items-center gap-1.5">
                <span>🤖</span> AI Sentiment Analysis
              </p>
              <p className="text-[10px] text-slate-800 font-semibold leading-relaxed mt-1">
                High resolution activity detected in Northern Sector. Deployment efficiency currently optimal.
              </p>
            </div>
          </div>

          {/* Legend row bottom (Image 4) */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-zinc-100 text-xs font-bold text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-sm"></span>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-sm"></span>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-sm"></span>
              <span>Resolved</span>
            </div>
          </div>
        </div>

        {/* Right Side: Incident Volume Bar Chart + Resolution Rate Card */}
        <div className="flex flex-col gap-6">
          {/* Card 1: INCIDENT VOLUME BY WARD */}
          <Card className="border border-zinc-200 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between h-[260px]">
            <CardContent className="p-6">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-4">Incident Volume by Ward</h3>
              
              {/* Pink Recharts Bar Chart (Image 4) */}
              <div className="h-32 w-full text-[9px] font-black text-zinc-400">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                    <XAxis dataKey="ward" stroke="#e5e7eb" tick={{ fill: '#9ca3af' }} tickLine={false} />
                    <YAxis stroke="#e5e7eb" tick={{ fill: '#9ca3af' }} tickLine={false} />
                    <Bar dataKey="count" fill="#ecd5d8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: CURRENT RESOLUTION RATE */}
          <Card className="border border-zinc-200 bg-[#141b2b] text-white rounded-3xl shadow-sm p-6 flex flex-col justify-between h-[230px]">
            <CardContent className="p-0 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Resolution Rate</h3>
                <div className="flex items-end gap-2 mt-4">
                  <span className="text-4xl font-black text-white leading-none">88%</span>
                  <span className="text-xs font-bold text-green-400 mb-0.5">▲ +2.4%</span>
                </div>
              </div>

              {/* Dark solid progress bar indicator (Image 4) */}
              <div className="w-full bg-white/10 rounded-full h-3 mt-4 overflow-hidden">
                <div className="bg-jan-coral h-full rounded-full" style={{ width: '88%' }}></div>
              </div>

              <p className="text-[10px] text-zinc-400 leading-relaxed font-medium mt-4">
                Across 1,240 tracked requests this month. Data verified by independent civic audit.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer (Image 4) */}
      <footer className="flex flex-col md:flex-row justify-between items-center text-xs text-zinc-400 font-bold border-t border-zinc-200 pt-6 mt-12 gap-4">
        <span>© 2024 JanSaath Transparency Framework. AI-Powered Integrity.</span>
        <div className="flex gap-6">
          <a href="/public" className="hover:text-slate-800 transition-colors">Governance Protocol</a>
          <a href="/public" className="hover:text-slate-800 transition-colors">Open Data License</a>
          <a href="/public" className="hover:text-slate-800 transition-colors">System Status</a>
        </div>
      </footer>
    </div>
  );
}
export default TransparencyDashboard;
