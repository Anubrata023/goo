import { useLanguage } from '../context/LanguageContext';
import { LandingPage } from '../components/citizen/LandingPage';
import { CommunityFeed } from '../components/citizen/CommunityFeed';
import { ComplaintMap } from '../components/shared/Map';
import { useRealtimeComplaints } from '../hooks/useRealtime';

export function CitizenPortal() {
  const { t } = useLanguage();
  const { complaints } = useRealtimeComplaints();

  return (
    <div className="w-full min-h-screen bg-jan-canvas py-8 px-4 flex flex-col justify-start">
      <header className="text-center mb-8 max-w-xl w-full mx-auto">
        <h1 className="text-4xl font-black text-jan-slate tracking-tight">Citizen Service Portal</h1>
        <p className="text-zinc-500 text-sm font-medium mt-1">{t('tagline')}</p>
      </header>
      
      {/* Landing page triggers form overlays */}
      <LandingPage />

      {/* Live Map of all complaints */}
      <div className="max-w-4xl mx-auto w-full px-4 mb-12">
        <h3 className="font-black text-slate-800 mb-2 uppercase tracking-wider text-xs px-2">📌 Geospatial Feed</h3>
        <ComplaintMap complaints={complaints} />
      </div>

      {/* Real-time community list */}
      <CommunityFeed />
    </div>
  );
}