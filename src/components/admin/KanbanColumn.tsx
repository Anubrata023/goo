import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare } from 'lucide-react';
import { updateComplaintStatusInFirebase } from '../../firebase';

export function SortableComplaintCard({ complaint, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: complaint.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleQuickStatusChange = async (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation();
    try {
      await updateComplaintStatusInFirebase(complaint.id, newStatus);
    } catch (err) {
      console.error(err);
    }
  };
  
  const score = complaint.priority_score || 50;
  const isCritical = score >= 70;
  const isMedium = score >= 40 && score < 70;
  
  const priorityLabel = isCritical ? 'CRITICAL' : isMedium ? 'MEDIUM' : 'LOW';
  
  const badgeColor = isCritical 
    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
    : isMedium 
      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
      : 'bg-green-500/10 text-green-400 border border-green-500/20';
 
  const leftStripColor = isCritical 
    ? 'border-l-4 border-l-red-500' 
    : isMedium 
      ? 'border-l-4 border-l-orange-500' 
      : 'border-l-4 border-l-green-500';
 
  return (
    <div 
      ref={setNodeRef} style={style}
      className={`bg-[#1a1f2c] p-4 rounded-xl border border-white/5 hover:border-white/10 hover:shadow-md mb-3 transition-all flex flex-col justify-between relative group/card ${leftStripColor}`}
    >
      <div onClick={() => onClick(complaint)} className="cursor-pointer flex-1 text-left">
        {/* Card Header (Priority Badge + ID) */}
        <div className="flex justify-between items-center mb-3 pr-6">
          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${badgeColor}`}>
            {priorityLabel}
          </span>
          <span className="text-[9px] font-bold text-zinc-500">#JS-{complaint.id}</span>
        </div>
 
        {/* Title */}
        <h4 className="text-sm font-bold text-white tracking-tight leading-snug mb-1">
          {complaint.category || 'Other'} Issue
        </h4>
        
        {/* Description */}
        <p className="text-xs text-zinc-400 font-medium leading-relaxed line-clamp-2">
          {complaint.raw_text}
        </p>
      </div>

      {/* Drag handle icon - top-right absolute */}
      <div 
        {...attributes} {...listeners}
        className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-grab active:cursor-grabbing p-1 z-25 bg-black/20 rounded border border-white/5"
        title="Drag to change status"
      >
        <span className="text-xs font-bold px-1 select-none">⠿</span>
      </div>
 
      {/* Quick Action Buttons on Card */}
      <div className="mt-3 pt-2 border-t border-white/5 flex gap-2 flex-wrap">
        {(complaint.status || 'new') === 'new' && (
          <button 
            onClick={(e) => handleQuickStatusChange(e, 'under_review')}
            className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-black py-1.5 px-2 rounded-lg border border-amber-500/20 cursor-pointer active:scale-95 transition-all"
          >
            🔍 Review
          </button>
        )}

        {complaint.status === 'under_review' && (
          <>
            <button 
              onClick={(e) => handleQuickStatusChange(e, 'funds_allocated')}
              className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-black py-1.5 px-2 rounded-lg border border-purple-500/20 cursor-pointer active:scale-95 transition-all"
            >
              💰 Fund
            </button>
            <button 
              onClick={(e) => handleQuickStatusChange(e, 'resolved')}
              className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black py-1.5 px-2 rounded-lg border border-emerald-500/20 cursor-pointer active:scale-95 transition-all"
            >
              ✅ Resolve
            </button>
          </>
        )}

        {complaint.status === 'funds_allocated' && (
          <button 
            onClick={(e) => handleQuickStatusChange(e, 'resolved')}
            className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black py-1.5 px-2 rounded-lg border border-emerald-500/20 cursor-pointer active:scale-95 transition-all"
          >
            ✅ Resolve
          </button>
        )}

        {complaint.status === 'resolved' && (
          <div className="w-full text-center text-emerald-500/80 bg-emerald-500/5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-500/10">
            🎉 Closed
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-3">
        {/* Small avatar or mock tag */}
        <div className="w-5 h-5 rounded-full bg-zinc-700/50 text-[9px] font-black flex items-center justify-center text-zinc-400 border border-white/5">
          {complaint.ward ? complaint.ward.substring(0, 2).toUpperCase() : 'G'}
        </div>
        
        {/* Comment Counter */}
        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{complaint.cluster_size || 4}</span>
        </div>
      </div>
    </div>
  );
}

export function KanbanColumn({ id, title, color: _color, complaints, onComplaintClick }: any) {
  const { setNodeRef } = useDroppable({ id });

  // Columns styling matches Image 2:
  // e.g. dark stream column styling
  return (
    <div className="flex flex-col h-full min-h-[500px] bg-[#0c101b] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-4 py-4 font-black text-xs tracking-wider uppercase flex justify-between items-center border-b border-white/5 text-zinc-300">
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <span className="text-[10px] font-black bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full">
            {complaints.length}
          </span>
        </div>
        <span className="text-zinc-600 hover:text-white cursor-pointer transition-colors text-sm">•••</span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto min-h-[400px]">
        <SortableContext items={complaints.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
          {complaints.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[10px] text-zinc-700 font-bold py-12 uppercase tracking-widest">
              Empty Column
            </div>
          ) : (
            complaints.map((c: any) => (
              <SortableComplaintCard key={c.id} complaint={c} onClick={onComplaintClick} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}