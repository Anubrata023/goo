import { TransparencyDashboard } from '../components/public/TransparencyDashboard';

export function PublicPortal() {
  return (
    <div className="w-full min-h-screen bg-jan-canvas py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <TransparencyDashboard />
      </div>
    </div>
  );
}
export default PublicPortal;
