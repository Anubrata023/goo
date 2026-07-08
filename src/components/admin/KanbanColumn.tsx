import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye } from 'lucide-react';

export function SortableComplaintCard({ complaint, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: complaint.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  const priorityColor = complaint.priority_score > 70 
    ? 'bg-jan-coral shadow-jan-coral/50' 
    : complaint.priority_score > 40 
      ? 'bg-orange-500 shadow-orange-500/50' 
      : 'bg-emerald-500 shadow-emerald-500/50';

  return (
    <div 
      ref={setNodeRef} style={style} 
      className="bg-jan-navy p-4 rounded-xl border border-white/10 shadow-lg mb-3 hover:border-jan-coral/50 transition-colors flex flex-col justify-between group"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded">#{complaint.id}</span>
          <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${priorityColor}`}></div>
        </div>
        <p className="text-sm text-zinc-300 font-medium line-clamp-2 leading-relaxed mb-3">{complaint.raw_text}</p>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{complaint.ward || 'General'}</span>
        <button
          onClick={() => onClick(complaint)}
          className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-jan-coral" />
          <span>Insights</span>
        </button>
      </div>
    </div>
  );
}

export function KanbanColumn({ id, title, color, complaints, onComplaintClick }: any) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-jan-slate/20 rounded-2xl border border-white/5 overflow-hidden">
      <div className={`px-4 py-3 font-bold text-sm flex justify-between items-center ${color}`}>
        <span>{title}</span>
        <span className="text-xs opacity-70 bg-black/10 px-2 py-0.5 rounded-full">{complaints.length}</span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto min-h-[400px]">
        <SortableContext items={complaints.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
          {complaints.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-600 font-bold py-12">
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