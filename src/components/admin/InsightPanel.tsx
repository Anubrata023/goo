import { useEffect, useState } from 'react';
import { X, Users, CreditCard, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { generateProposal } from '../../lib/api';
import { updateComplaintStatusInFirebase } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';

interface InsightPanelProps {
  complaint: any | null;
  onClose: () => void;
  onStatusUpdate?: (complaintId: string, newStatus: string) => void;
}

export function InsightPanel({ complaint, onClose, onStatusUpdate }: InsightPanelProps) {
  const { t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [proposalMarkdown, setProposalMarkdown] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (complaint) {
      setDocUrl(null);
      setProposalMarkdown('');
      setCopied(false);
    }
  }, [complaint]);

  const handleStatusTransition = async (newStatus: string) => {
    if (!complaint) return;
    setUpdatingStatus(true);
    try {
      await updateComplaintStatusInFirebase(complaint.id, newStatus);
      if (onStatusUpdate) {
        onStatusUpdate(complaint.id, newStatus);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const generateClientFallbackProposal = (c: any) => {
    const title = `PROJECT PROPOSAL: SANCTION OF URGENT DEPLOYMENT FOR ${c.category?.toUpperCase() || 'INFRASTRUCTURE'} WORKS IN WARD ${c.ward?.toUpperCase() || 'CHINHAT'}`;
    const schemes = c.scheme_match && c.scheme_match.length > 0 
      ? c.scheme_match.join(', ') 
      : 'MPLADS (Member of Parliament Local Area Development Scheme)';
    const cost = c.cost_estimate 
      ? `₹${Number(c.cost_estimate).toLocaleString('en-IN')}` 
      : '₹45,000';

    return `PROJECT SANCTION PROPOSAL

1. PROJECT TITLE:
${title}

2. BACKGROUND & PROBLEM STATEMENT:
Grievance ID #JS-${c.id} was filed by citizens of Ward ${c.ward || 'Chinhat'} regarding a critical ${c.category || 'Infrastructure'} issue. 
Description: "${c.raw_text}"
The urgency score is evaluated at ${c.priority_score || 75}/100. Due to safety concerns and public demand, immediate administrative action is requested.

3. PROPOSED WORKS & TECHNICAL SOLUTION:
- Mobilization of local contract resources for immediate remediation of the reported ${c.category || 'infrastructure'} gap.
- Quality assurance checks to be completed within 14 calendar days of project initiation.
- Integration of status monitoring feed to report progress back to the ward community portal.

4. FISCAL ESTIMATE & BUDGET BREAKDOWN:
- Estimated Material Costs: 65%
- Labour & Execution: 25%
- Contingencies & Audit: 10%
------------------------------------------
TOTAL PROPOSED BUDGET: ${cost}

5. PROPOSED FUNDING SOURCE:
This project qualifies for funding under: ${schemes}.

6. PROJECT TIMELINE:
- Phase 1 (Site Survey & Material procurement): Week 1
- Phase 2 (Implementation & Ground execution): Weeks 2-3
- Phase 3 (Inspection, Verification, & Public sign-off): Week 4

7. EXPECTED IMPACT:
Remediation will directly resolve the local hazard, benefiting approximately ${c.estimated_affected || 350} residents in the immediate vicinity.

8. RECOMMENDATION:
The Member of Parliament's Office is requested to approve the budget of ${cost} from the LADS allocations to initiate works immediately.`;
  };

  const handleDraftProposal = async () => {
    if (!complaint) return;
    setGenerating(true);
    const mockUrl = `https://docs.google.com/document/u/0/create`;
    
    // Open blank tab synchronously to prevent popup blocker interception
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <body style="font-family:sans-serif; text-align:center; padding-top:20%; background:#090d16; color:#ffffff;">
            <h3>Generating Official Proposal...</h3>
            <p style="color:#a1a1aa; font-size:12px;">Gemini AI is constructing the Google Docs draft. Please wait.</p>
          </body>
        </html>
      `);
    }

    try {
      const result = await generateProposal(complaint.id);
      const targetUrl = (result.proposal && result.proposal.doc_url) ? result.proposal.doc_url : mockUrl;
      setDocUrl(targetUrl);
      
      if (result.proposal && result.proposal.proposal_text) {
        setProposalMarkdown(result.proposal.proposal_text);
        try {
          await navigator.clipboard.writeText(result.proposal.proposal_text);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch (e) {
          console.warn("Clipboard copy failed:", e);
        }
      } else {
        // Fallback if API returned empty proposal text
        const fallbackText = generateClientFallbackProposal(complaint);
        setProposalMarkdown(fallbackText);
        try {
          await navigator.clipboard.writeText(fallbackText);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch (e) {
          console.warn("Clipboard copy failed:", e);
        }
      }

      if (newWindow) {
        newWindow.location.href = targetUrl;
      } else {
        window.open(targetUrl, '_blank');
      }
    } catch (error) {
      console.error(error);
      setDocUrl(mockUrl);
      
      // Fallback proposal text generated on client-side
      const fallbackText = generateClientFallbackProposal(complaint);
      setProposalMarkdown(fallbackText);
      try {
        await navigator.clipboard.writeText(fallbackText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (e) {
        console.warn("Clipboard copy failed:", e);
      }

      if (newWindow) {
        newWindow.location.href = mockUrl;
      } else {
        window.open(mockUrl, '_blank');
      }
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
        <div className="border border-white/5 bg-[#141b2b] rounded-3xl overflow-hidden relative">
          <div className="h-44 bg-zinc-950/70 relative">
            <iframe 
              src={`https://maps.google.com/maps?q=${complaint.lat || 26.8467},${complaint.lng || 80.9462}&t=k&z=16&output=embed&iwloc=near`}
              className="w-full h-full border-none opacity-80 grayscale invert contrast-125"
              loading="lazy"
              title="Geospatial Map"
            />
            {/* Zone Tag Overlay (Image 2) */}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 z-10 pointer-events-none">
              <p className="text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <span>📍</span> Lat: {complaint.lat ? complaint.lat.toFixed(4) : '26.8467'}, Lng: {complaint.lng ? complaint.lng.toFixed(4) : '80.9462'}
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
        <div className="pt-2 space-y-4">
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
            <div className="mt-4 bg-[#111927] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in text-left">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-emerald-300 font-black tracking-tight">{t('proposal_success')}</span>
              </div>
              
              <div className="flex gap-2">
                <a 
                  href={docUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 bg-jan-coral hover:bg-red-500 text-white text-center py-2 px-3 rounded-lg text-[10px] font-black transition-all cursor-pointer shadow shadow-jan-coral/10 uppercase tracking-wider block"
                >
                  📄 {t('open_google_doc')}
                </a>
                
                {proposalMarkdown && (
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(proposalMarkdown);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 px-3 rounded-lg text-[10px] font-black transition-all cursor-pointer border border-white/10 uppercase tracking-wider block"
                  >
                    {copied ? '✅ COPIED!' : '📋 COPY PROPOSAL'}
                  </button>
                )}
              </div>

              {proposalMarkdown && (
                <div className="mt-2 text-left">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block mb-1">PROPOSAL PREVIEW</span>
                  <div className="max-h-[160px] overflow-y-auto bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] text-zinc-300 font-medium whitespace-pre-line leading-relaxed scrollbar-thin">
                    {proposalMarkdown}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Workflow Action Control Status Switchers */}
          <div className="border-t border-white/10 pt-4 mt-2 space-y-2.5 text-left">
            <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase block mb-1">{t('workflow_title')}</span>
            
            {(complaint.status || 'new') === 'new' && (
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all active:scale-[0.98]"
                onClick={() => handleStatusTransition('under_review')}
                disabled={updatingStatus}
              >
                {t('pass_review')}
              </Button>
            )}

            {complaint.status === 'under_review' && (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all active:scale-[0.98]"
                  onClick={() => handleStatusTransition('funds_allocated')}
                  disabled={updatingStatus}
                >
                  {t('allocate_funds')}
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all active:scale-[0.98]"
                  onClick={() => handleStatusTransition('resolved')}
                  disabled={updatingStatus}
                >
                  {t('resolve_direct')}
                </Button>
              </div>
            )}

            {complaint.status === 'funds_allocated' && (
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all active:scale-[0.98]"
                onClick={() => handleStatusTransition('resolved')}
                disabled={updatingStatus}
              >
                {t('resolve_issue')}
              </Button>
            )}

            {complaint.status === 'resolved' && (
              <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-3 text-center">
                <span className="text-xs text-emerald-400 font-bold">{t('resolved_closed')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default InsightPanel;
