import { useState, useEffect } from 'react';
import { useRealtimeComplaints } from '../../hooks/useRealtime';
import { KanbanBoard } from './KanbanBoard';
import { InsightPanel } from './InsightPanel';
import { Card, CardContent } from '../ui/card';
import { useLanguage } from '../../context/LanguageContext';

export function AdminDashboard() {
  const { complaints, loading } = useRealtimeComplaints();
  const { t } = useLanguage();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    avgResolution: 0,
    satisfaction: 0,
  });

  useEffect(() => {
    if (complaints.length > 0) {
      const resolved = complaints.filter(c => c.status === 'resolved').length;
      setStats({
        total: complaints.length,
        resolved: resolved,
        avgResolution: 4.2, // Mock - would calculate from date difference in real app
        satisfaction: 4.5, // Mock rating
      });
    } else {
      setStats({
        total: 0,
        resolved: 0,
        avgResolution: 0,
        satisfaction: 0,
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
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-jan-slate border-white/5 shadow-lg">
          <CardContent className="p-5 flex flex-col justify-between">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t('total_issues')}</p>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-white">{stats.total}</h2>
              <span className="text-xs font-bold text-jan-coral mb-1">Live</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-jan-slate border-white/5 shadow-lg">
          <CardContent className="p-5 flex flex-col justify-between">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t('resolved')}</p>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-emerald-400">{stats.resolved}</h2>
              <span className="text-xs font-bold text-emerald-400 mb-1">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-jan-slate border-white/5 shadow-lg">
          <CardContent className="p-5 flex flex-col justify-between">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t('avg_resolution')}</p>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-white">{stats.avgResolution}d</h2>
              <span className="text-xs font-bold text-zinc-400 mb-1">Target 5d</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-jan-slate border-white/5 shadow-lg">
          <CardContent className="p-5 flex flex-col justify-between">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t('satisfaction')}</p>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-white">⭐ {stats.satisfaction}/5</h2>
              <span className="text-xs font-bold text-jan-coral mb-1">+4%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="h-full">
        <KanbanBoard complaints={complaints} onComplaintClick={setSelectedComplaint} />
      </div>

      {/* Insight Panel */}
      <InsightPanel 
        complaint={selectedComplaint} 
        onClose={() => setSelectedComplaint(null)} 
      />
    </div>
  );
}
