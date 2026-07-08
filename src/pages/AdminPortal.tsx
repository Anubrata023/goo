import { useState } from 'react';
import { Bell, Settings, Languages } from 'lucide-react';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AIInsightsPanel } from '../components/admin/AIInsightsPanel';
import { ComplaintMap } from '../components/shared/Map';
import { useRealtimeComplaints } from '../hooks/useRealtime';
import { useLanguage } from '../context/LanguageContext';

export function AdminPortal() {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'geospatial' | 'insights' | 'audit'>('dashboard');
  const { complaints } = useRealtimeComplaints();

  const handleDraftProposalAll = () => {
    // Generate draft for first complaint or mock draft
    const mockUrl = `https://docs.google.com/document/d/1mock-master-proposal/edit`;
    window.open(mockUrl, '_blank');
  };

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white p-6 font-sans flex flex-col justify-start">
      {/* High-fidelity Admin Header matching Image 2 */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-white/10 pb-4 gap-4 sticky top-0 bg-[#090d16]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-8 w-full md:w-auto">
          <span className="text-2xl font-black text-jan-coral tracking-tight">JanSaath</span>
          
          <nav className="flex gap-4 text-xs font-bold text-zinc-400">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 hover:text-white ${
                activeTab === 'dashboard' ? 'border-jan-coral text-white' : 'border-transparent'
              }`}
            >
              {t('dashboard')}
            </button>
            <button 
              onClick={() => setActiveTab('geospatial')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 hover:text-white ${
                activeTab === 'geospatial' ? 'border-jan-coral text-white' : 'border-transparent'
              }`}
            >
              {t('geospatial')}
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 hover:text-white ${
                activeTab === 'insights' ? 'border-jan-coral text-white' : 'border-transparent'
              }`}
            >
              {t('insights')}
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 hover:text-white ${
                activeTab === 'audit' ? 'border-jan-coral text-white' : 'border-transparent'
              }`}
            >
              {t('audit')}
            </button>
          </nav>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          {/* Navigation link tags */}
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full shadow-inner">
            <a href="/" className="hover:text-white transition-colors">Landing</a>
            <span>•</span>
            <a href="/citizen" className="hover:text-white transition-colors">Citizen</a>
            <span>•</span>
            <a href="/public" className="hover:text-white transition-colors">Public</a>
          </div>

          {/* Language Selector inside Admin Portal */}
          <div className="relative group bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 cursor-pointer text-white">
            <Languages className="w-3.5 h-3.5 text-jan-coral" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-[10px] font-bold focus:outline-none cursor-pointer border-none text-white appearance-none"
              style={{ WebkitAppearance: 'none' }}
            >
              <option value="en" className="text-slate-800 font-bold">English</option>
              <option value="hi" className="text-slate-800 font-bold">हिंदी (Hindi)</option>
              <option value="bn" className="text-slate-800 font-bold">বাংলা (Bengali)</option>
              <option value="ta" className="text-slate-800 font-bold">தமிழ் (Tamil)</option>
              <option value="te" className="text-slate-800 font-bold">తెలుగు (Telugu)</option>
              <option value="mr" className="text-slate-800 font-bold">मराठी (Marathi)</option>
            </select>
          </div>

          <button className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleDraftProposalAll}
            className="bg-jan-coral hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-jan-coral/20 cursor-pointer"
          >
            {t('draft_proposal')}
          </button>

          <div className="w-8 h-8 rounded-full bg-jan-coral border-2 border-white/20 flex items-center justify-center font-black text-xs text-white">
            LK
          </div>
        </div>
      </header>

      {/* Tab Switcher Area */}
      {activeTab === 'dashboard' && (
        <div className="animate-fade-in">
          <AdminDashboard />
        </div>
      )}

      {activeTab === 'geospatial' && (
        <div className="bg-[#141b2b] border border-white/5 rounded-3xl p-6 shadow-lg animate-fade-in">
          <h2 className="text-lg font-black tracking-tight text-white mb-2">📌 {t('active_hotspots')}</h2>
          <p className="text-xs text-zinc-400 mb-6">{t('map_desc')}</p>
          <div className="rounded-2xl overflow-hidden border border-white/5 shadow-inner">
            <ComplaintMap complaints={complaints} />
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="animate-fade-in">
          <AIInsightsPanel />
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-[#141b2b] border border-white/5 rounded-3xl p-8 max-w-2xl mx-auto shadow-lg mt-12 animate-fade-in">
          <h3 className="text-lg font-black text-white mb-4">{t('audit')}</h3>
          <div className="space-y-4 text-xs font-semibold text-zinc-400">
            <div className="p-3 bg-black/30 rounded-xl border border-white/5 flex justify-between">
              <span>[06:21:49] AI Triage complete on raw input. Category: Water, Severity: 8/10.</span>
              <span className="text-green-400">VERIFIED</span>
            </div>
            <div className="p-3 bg-black/30 rounded-xl border border-white/5 flex justify-between">
              <span>[06:21:50] Geospatial duplicate index matching similarity computed: 0.88. Issue merged.</span>
              <span className="text-amber-400">MERGED</span>
            </div>
            <div className="p-3 bg-black/30 rounded-xl border border-white/5 flex justify-between">
              <span>[06:21:51] Overpass school gap check returned 0 schools in 3km radius. Gap confirmed.</span>
              <span className="text-red-400">GAP DETECTED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminPortal;