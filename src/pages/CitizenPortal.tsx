import { useState, useEffect } from 'react';
import { Bell, ArrowRight, GitCommit, FileSpreadsheet, MapPin, Languages } from 'lucide-react';
import { ComplaintForm } from '../components/citizen/ComplaintForm';
import { CommunityFeed } from '../components/citizen/CommunityFeed';
import { ComplaintMap } from '../components/shared/Map';
import { useRealtimeComplaints } from '../hooks/useRealtime';
import { useLanguage } from '../context/LanguageContext';

export function CitizenPortal() {
  const { t, language, setLanguage } = useLanguage();
  const [currentTab, setCurrentTab] = useState<'home' | 'reports' | 'community' | 'profile'>('home');
  const { complaints } = useRealtimeComplaints();
  
  // Profile details load from storage or default
  const [profile, setProfile] = useState({
    name: 'Anubrata Paul',
    email: 'anubratapaul23@gmail.com',
    phone: '+91 98300 12345',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    city: 'Lucknow',
    ward: 'Chinhat',
    age: '24'
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser && savedUser !== 'admin') {
      setProfile(prev => ({
        ...prev,
        name: savedUser
      }));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = '/';
  };

  return (
    <div className="w-full min-h-screen bg-jan-canvas flex flex-col justify-start pb-24 font-sans text-slate-800">
      {/* Citizen Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-12">
          <span className="text-2xl font-black text-slate-800 tracking-tight cursor-pointer" onClick={() => window.location.href = '/'}>
            JanSaath
          </span>
          <nav className="hidden md:flex gap-6 text-sm font-bold text-zinc-400">
            <button 
              onClick={() => setCurrentTab('home')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 hover:text-slate-800 ${
                currentTab === 'home' ? 'border-jan-coral text-slate-800' : 'border-transparent'
              }`}
            >
              {t('home')}
            </button>
            <button 
              onClick={() => setCurrentTab('reports')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 hover:text-slate-800 ${
                currentTab === 'reports' ? 'border-jan-coral text-slate-800' : 'border-transparent'
              }`}
            >
              {t('reports')}
            </button>
            <button 
              onClick={() => setCurrentTab('community')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 hover:text-slate-800 ${
                currentTab === 'community' ? 'border-jan-coral text-slate-800' : 'border-transparent'
              }`}
            >
              {t('community')}
            </button>
            <button 
              onClick={() => setCurrentTab('profile')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 hover:text-slate-800 ${
                currentTab === 'profile' ? 'border-jan-coral text-slate-800' : 'border-transparent'
              }`}
            >
              {t('profile')}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full shadow-inner">
            <a href="/" className="hover:text-slate-800 transition-colors">Landing</a>
            <span>•</span>
            <a href="/admin" className="hover:text-slate-800 transition-colors">Admin</a>
            <span>•</span>
            <a href="/public" className="hover:text-slate-800 transition-colors">Public</a>
          </div>

          {/* Language Selector inside Portal */}
          <div className="relative group bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 flex items-center gap-1.5 cursor-pointer text-slate-700">
            <Languages className="w-3.5 h-3.5 text-jan-coral" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-[10px] font-bold focus:outline-none cursor-pointer border-none text-slate-700 appearance-none"
              style={{ WebkitAppearance: 'none' }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          <button className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-slate-800 transition-colors relative cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-jan-coral rounded-full"></span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="text-xs font-black text-red-500 hover:text-red-700 hover:underline cursor-pointer"
          >
            {t('logout')}
          </button>

          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-zinc-300 overflow-hidden flex items-center justify-center font-bold text-xs text-white uppercase select-none">
            {profile.name.substring(0, 2)}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
        
        {/* Home Tab: Unified complaint filing and simplified voice typing helper */}
        {currentTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            <ComplaintForm />
          </div>
        )}

        {/* Community Tab: Community Feed relocated here with comments/aborts */}
        {currentTab === 'community' && (
          <div className="space-y-6 animate-fade-in">
            <CommunityFeed />
          </div>
        )}

        {/* Reports Tab: Map + Visual Flowchart + Descriptive Tables */}
        {currentTab === 'reports' && (
          <div className="space-y-8 animate-fade-in">
            {/* Descriptive Map View */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-jan-coral" /> {t('active_hotspots')}
              </h3>
              <p className="text-xs text-zinc-500 mb-4">{t('map_desc')}</p>
              <div className="h-96 rounded-2xl overflow-hidden border border-zinc-150 shadow-inner">
                <ComplaintMap complaints={complaints} />
              </div>
            </div>

            {/* Visual Computational Flowchart */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-jan-coral" /> {t('agent_workflow')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative text-center">
                {/* Step 1 */}
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col justify-between items-center">
                  <span className="w-6 h-6 rounded-full bg-red-500 text-white font-black text-xs flex items-center justify-center mb-2">1</span>
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Intake Node</h4>
                  <p className="text-[9px] text-zinc-500 font-medium leading-relaxed mt-1">Transcribes voice & text inputs</p>
                </div>
                {/* Arrow */}
                <div className="hidden md:flex absolute left-[18%] top-1/2 -translate-y-1/2 text-zinc-300 font-black"><ArrowRight className="w-4 h-4" /></div>

                {/* Step 2 */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex flex-col justify-between items-center">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center mb-2">2</span>
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Geospatial Triage</h4>
                  <p className="text-[9px] text-zinc-500 font-medium leading-relaxed mt-1">pgvector similarity index</p>
                </div>
                <div className="hidden md:flex absolute left-[38%] top-1/2 -translate-y-1/2 text-zinc-300 font-black"><ArrowRight className="w-4 h-4" /></div>

                {/* Step 3 */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between items-center">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center mb-2">3</span>
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Fiscal Assessment</h4>
                  <p className="text-[9px] text-zinc-500 font-medium leading-relaxed mt-1">Predicts budget requirements</p>
                </div>
                <div className="hidden md:flex absolute left-[58%] top-1/2 -translate-y-1/2 text-zinc-300 font-black"><ArrowRight className="w-4 h-4" /></div>

                {/* Step 4 */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-black text-xs flex items-center justify-center mb-2">4</span>
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Priority Engine</h4>
                  <p className="text-[9px] text-zinc-500 font-medium leading-relaxed mt-1">Density & decay score</p>
                </div>
                <div className="hidden md:flex absolute left-[78%] top-1/2 -translate-y-1/2 text-zinc-300 font-black"><ArrowRight className="w-4 h-4" /></div>

                {/* Step 5 */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex flex-col justify-between items-center">
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-white font-black text-xs flex items-center justify-center mb-2">5</span>
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Draft Proposal</h4>
                  <p className="text-[9px] text-zinc-500 font-medium leading-relaxed mt-1">Generates Google Docs sanction</p>
                </div>
              </div>
            </div>

            {/* Ward Issues Stats Table */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden">
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-jan-coral" /> {t('incidents_directory')}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-250 text-zinc-400 font-bold tracking-wider uppercase">
                      <th className="py-3 px-4">{t('id')}</th>
                      <th className="py-3 px-4">{t('category')}</th>
                      <th className="py-3 px-4">{t('ward_label')}</th>
                      <th className="py-3 px-4 text-center">{t('priority_score')}</th>
                      <th className="py-3 px-4">{t('status')}</th>
                      <th className="py-3 px-4">{t('logged_at')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 font-medium text-slate-700">
                    {complaints.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">#JS-{c.id}</td>
                        <td className="py-3.5 px-4">{c.category}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{c.ward || 'Lucknow'}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-jan-coral">
                          {Math.round(c.priority_score || 55)}/100
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            c.status === 'resolved' 
                              ? 'bg-green-100 text-green-700' 
                              : c.status === 'under_review'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 text-[10px]">
                          {new Date(c.created_at || Date.now()).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab: Fully descriptive user identity details */}
        {currentTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm animate-fade-in space-y-8">
            <div className="flex items-center gap-6 border-b border-zinc-100 pb-6">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-3xl shadow-lg border-4 border-zinc-100 uppercase select-none">
                {profile.name.substring(0, 2)}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">{profile.name}</h3>
                <p className="text-xs font-black text-jan-coral uppercase tracking-wider mt-0.5">{t('profile_rep')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">{t('email_addr')}</span>
                <p className="font-bold text-slate-800 text-sm">{profile.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">{t('phone_num')}</span>
                <p className="font-bold text-slate-800 text-sm">{profile.phone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">{t('age')}</span>
                <p className="font-bold text-slate-800 text-sm">{profile.age} {t('years')}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">{t('default_ward')}</span>
                <p className="font-bold text-slate-800 text-sm">{profile.ward} Ward</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">{t('city_district')}</span>
                <p className="font-bold text-slate-800 text-sm">{profile.city}, {profile.district}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">{t('state_region')}</span>
                <p className="font-bold text-slate-800 text-sm">{profile.state}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
export default CitizenPortal;