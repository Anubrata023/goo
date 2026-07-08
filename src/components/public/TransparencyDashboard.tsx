import { useRealtimeComplaints } from '../../hooks/useRealtime';
import { Card, CardContent } from '../ui/card';
import { ComplaintMap } from '../shared/Map';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

export function TransparencyDashboard() {
  const { complaints, loading } = useRealtimeComplaints();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="text-center py-12 text-zinc-500 font-medium">
        <span className="inline-block animate-spin mr-2">🔄</span> {t('loading')}...
      </div>
    );
  }

  // Calculate stats
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const resolutionRate = complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;
  
  const byWard = complaints.reduce((acc: any, c) => {
    const w = c.ward || 'Unknown';
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(byWard).map(([ward, count]) => ({ ward, count }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-4 bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-800">📊 Public Transparency Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time constituency data • No authentication required</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('total_issues')}</p>
            <p className="text-3xl font-black text-slate-800">{complaints.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('resolved')}</p>
            <p className="text-3xl font-black text-green-600">{resolved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resolution Rate</p>
            <p className="text-3xl font-black text-blue-600">{resolutionRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Budget Utilized</p>
            <p className="text-3xl font-black text-slate-800">₹3.2Cr / ₹5Cr</p>
          </CardContent>
        </Card>
      </div>

      {/* Complaint Map */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <h3 className="font-black text-slate-800 mb-4 uppercase tracking-wider text-xs">📌 Geospatial Complaint Hotspots</h3>
        <div className="w-full overflow-hidden rounded-2xl border border-zinc-100">
          <ComplaintMap complaints={complaints} />
        </div>
      </div>

      {/* Charts Section */}
      {chartData.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 uppercase tracking-wider text-xs">📈 Complaint Distribution by Ward</h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="ward" stroke="#9ca3af" tickLine={false} />
                <YAxis stroke="#9ca3af" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }} 
                  labelClassName="font-bold text-slate-800"
                />
                <Bar dataKey="count" fill="#ff4d5a" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-zinc-400 font-bold py-4 border-t border-zinc-200">
        JanSaath Public Dashboard • Updated Live via Cloud Feeds • Powered by Google AI
      </div>
    </div>
  );
}
