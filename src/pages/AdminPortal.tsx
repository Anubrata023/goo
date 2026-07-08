import { AdminDashboard } from '../components/admin/AdminDashboard';

export function AdminPortal() {
  return (
    <div className="w-full min-h-screen bg-jan-navy text-white p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black text-jan-coral tracking-tight">MP Command Center</h1>
          <nav className="hidden md:flex gap-4">
            <span className="text-sm font-bold text-white border-b-2 border-jan-coral pb-1">Kanban Command</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400">Constituency: Lucknow</span>
          <div className="w-8 h-8 rounded-full bg-jan-coral border-2 border-white/20 flex items-center justify-center font-black text-xs text-white">
            LK
          </div>
        </div>
      </header>

      {/* Main Command Dashboard */}
      <AdminDashboard />
    </div>
  );
}
export default AdminPortal;