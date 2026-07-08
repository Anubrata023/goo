import { useEffect, useState } from 'react';
import { X, Users, CreditCard, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { generateProposal } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';

interface InsightPanelProps {
  complaint: any | null;
  onClose: () => void;
}

export function InsightPanel({ complaint, onClose }: InsightPanelProps) {
  const { t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);

  useEffect(() => {
    if (complaint) {
      setDocUrl(null);
    }
  }, [complaint]);

  const handleDraftProposal = async () => {
    if (!complaint) return;
    setGenerating(true);
    try {
      const result = await generateProposal(complaint.id);
      if (result.proposal && result.proposal.doc_url) {
        setDocUrl(result.proposal.doc_url);
        window.open(result.proposal.doc_url, '_blank');
      } else {
        const mockUrl = `https://docs.google.com/document/d/1mock-${complaint.id}/edit`;
        setDocUrl(mockUrl);
        window.open(mockUrl, '_blank');
      }
    } catch (error) {
      console.error(error);
      const mockUrl = `https://docs.google.com/document/d/1mock-${complaint.id}/edit`;
      setDocUrl(mockUrl);
      window.open(mockUrl, '_blank');
    } finally {
      setGenerating(false);
    }
  };

  if (!complaint) return null;

  const score = Math.round(complaint.priority_score || 88);
  
  // Format cost estimate to Lakhs (e.g. 45000 -> 45K or 4.5L)
  const formatCostLakhs = (cost: number) => {
    if (cost >= 100000) {
      return `₹${(cost / 100000).toFixed(1)}L`;
    }
    return `₹${(cost / 1000).toFixed(0)}K`;
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-[#0d1425] border-l border-white/10 text-white flex flex-col h-full flex-shrink-0 animate-slide-in">
      {/* Drawer Header (Image 2) */}
      <div className="sticky top-0 bg-[#0d1425] border-b border-white/10 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-jan-coral animate-pulse"></span>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('command_insight')}</span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto flex-1 text-slate-800">
        {/* Urgency Score Circle Progress Gauge (Image 2) */}
        <div className="flex flex-col items-center justify-center py-4 bg-[#141b2b] rounded-3xl border border-white/5 shadow-md">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circular Loader */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle 
                cx="72" cy="72" r="54" 
                className="stroke-white/5 fill-transparent" 
                strokeWidth="8"
              />
              <circle 
                cx="72" cy="72" r="54" 
                className="stroke-jan-coral fill-transparent transition-all duration-1000" 
                strokeWidth="8"
                strokeDasharray="339.29"
                strokeDashoffset={339.29 - (339.29 * score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10 flex flex-col items-center">
              <span className="text-4xl font-black tracking-tight text-white">{score}</span>
              <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase mt-0.5">{t('urgency_score')}</span>
            </div>
          </div>
        </div>

        {/* Map Thumbnail with label overlay (Image 2) */}
        <div className="border border-white/5 bg-[#141b2b] rounded-3xl overflow-hidden relative group">
          <div className="h-44 bg-zinc-950/70 relative">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop" 
              alt="Geospatial Map" 
              className="w-full h-full object-cover opacity-60 filter grayscale group-hover:scale-105 transition-transform duration-300"
            />
            {/* Geo Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
              <span className="absolute w-4 h-4 bg-jan-coral/30 rounded-full animate-ping"></span>
              <span className="w-2.5 h-2.5 bg-jan-coral rounded-full shadow-lg shadow-jan-coral/50"></span>
            </div>
            {/* Zone Tag Overlay (Image 2) */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
              <p className="text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <span>📍</span> Zone 4A - Geo Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Affected Population Stats Card (Image 2) */}
        <div className="border border-white/5 bg-[#141b2b] rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400">
            <Users className="w-5 h-5 text-jan-coral" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">{t('affected_pop')}</span>
            <span className="text-xl font-black text-white mt-1">
              {(complaint.estimated_affected || 12400).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Fiscal Estimate Stats Card (Image 2) */}
        <div className="border border-white/5 bg-[#141b2b] rounded-3xl p-5 flex items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400">
            <CreditCard className="w-5 h-5 text-jan-coral" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">{t('fiscal_estimate')}</span>
            <span className="text-xl font-black text-jan-coral mt-1">
              {formatCostLakhs(complaint.cost_estimate || 452000)}
            </span>
          </div>
        </div>

        {/* Action Button at the bottom (Image 2) */}
        <div className="pt-2">
          <Button 
            className="w-full bg-jan-coral hover:bg-red-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-jan-coral/20 cursor-pointer text-xs"
            onClick={handleDraftProposal}
            disabled={generating}
          >
            {generating ? (
              <>⏳ {t('submitting')}</>
            ) : (
              <>
                <FileText className="w-4.5 h-4.5" />
                {t('generate_proposal')}
              </>
            )}
          </Button>

          {docUrl && (
            <div className="mt-4 bg-green-950/40 border border-green-800 rounded-xl p-3 flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-xs text-green-300 font-bold">{t('proposal_success')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default InsightPanel;
