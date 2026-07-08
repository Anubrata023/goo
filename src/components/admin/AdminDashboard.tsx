import { useState, useEffect } from 'react';
import { useRealtimeComplaints } from '../../hooks/useRealtime';
import { KanbanBoard } from './KanbanBoard';
import { InsightPanel } from './InsightPanel';
import { Card, CardContent } from '../ui/card';
import { Folder, CheckCircle, Clock, Smile } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function AdminDashboard() {
  const { t } = useLanguage();
  const { complaints, loading } = useRealtimeComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 2842,
    resolved: 1905,
    avgResolution: '4.2d',
    satisfaction: '88%',
  });

  useEffect(() => {
    // If we have live complaints from Firebase, we overlay them or dynamically calculate
    if (complaints.length > 0) {
      const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
      setStats({
        total: Math.max(2842, complaints.length),
        resolved: Math.max(1905, resolvedCount),
        avgResolution: '4.2d',
        satisfaction: '88%',
      });
    }
  }, [complaints]);

  if (loading) {
    return (
      <div className="text-center py-12 text-zinc-400 font-medium">
        <span className="inline-block animate-spin mr-2">🔄</span> {t('loading')}...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Row (Image 2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* TOTAL ISSUES */}
        <Card className="bg-[#141b2b] border border-white/5 shadow-lg rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{t('total_issues')}</span>
              <Folder className="w-4.5 h-4.5 text-jan-coral" />
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-white leading-none">{stats.total.toLocaleString()}</h2>
              <span className="text-[10px] font-black text-jan-coral mb-0.5">~12%</span>
            </div>
          </CardContent>
        </Card>

        {/* RESOLVED */}
        <Card className="bg-[#141b2b] border border-white/5 shadow-lg rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{t('resolved')}</span>
              <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-white leading-none">{stats.resolved.toLocaleString()}</h2>
              <span className="text-[10px] font-black text-emerald-400 mb-0.5">✔ 67%</span>
            </div>
          </CardContent>
        </Card>

        {/* AVG RESOLUTION */}
        <Card className="bg-[#141b2b] border border-white/5 shadow-lg rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{t('avg_resolution')}</span>
              <Clock className="w-4.5 h-4.5 text-zinc-400" />
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-white leading-none">{stats.avgResolution}</h2>
              <span className="text-[10px] font-black text-zinc-400 mb-0.5">⏱ -1.5h</span>
            </div>
          </CardContent>
        </Card>

        {/* SATISFACTION */}
        <Card className="bg-[#141b2b] border border-white/5 shadow-lg rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{t('satisfaction')}</span>
              <Smile className="w-4.5 h-4.5 text-jan-coral" />
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-white leading-none">{stats.satisfaction}</h2>
              <span className="text-[10px] font-black text-jan-coral mb-0.5">☺ +4%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Kanban Content Grid split based on Drawer presence (Image 2) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Kanban Board Container */}
        <div className="flex-1 w-full overflow-x-auto">
          <KanbanBoard complaints={complaints} onComplaintClick={setSelectedComplaint} />
        </div>

        {/* AI Insight Drawer overlay right panel */}
        {selectedComplaint && (
          <InsightPanel 
            complaint={selectedComplaint} 
            onClose={() => setSelectedComplaint(null)} 
          />
        )}
      </div>
    </div>
  );
}
export default AdminDashboard;
