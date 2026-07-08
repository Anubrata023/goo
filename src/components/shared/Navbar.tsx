import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export function Navbar() {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Citizen Portal', labelHi: 'नागरिक पोर्टल' },
    { path: '/admin', label: 'Admin Command Center', labelHi: 'एडमिन कमांड सेंटर' },
    { path: '/public', label: 'Public Transparency', labelHi: 'सार्वजनिक पारदर्शिता' },
  ];

  return (
    <nav className="bg-jan-slate text-white shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black text-jan-coral tracking-tight">JanSaath</span>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-zinc-400">v3.0</span>
      </div>

      <div className="flex items-center gap-2 bg-black/30 p-1 rounded-xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-jan-coral text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {language === 'hi' ? item.labelHi : item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-white/5"
        >
          {language === 'en' ? '🌐 हिंदी' : '🌐 English'}
        </button>
      </div>
    </nav>
  );
}
