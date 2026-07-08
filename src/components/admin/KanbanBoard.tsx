import { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { updateComplaintStatus } from '../../lib/api';

const COLUMNS = [
  { id: 'new', title: '🆕 New', color: 'bg-blue-100 text-blue-800' },
  { id: 'under_review', title: '🔍 Under Review', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'funds_allocated', title: '💰 Funds Allocated', color: 'bg-purple-100 text-purple-800' },
  { id: 'resolved', title: '✅ Resolved', color: 'bg-green-100 text-green-800' },
];

export function KanbanBoard({ complaints, onComplaintClick }: any) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(complaints);
  }, [complaints]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const complaintId = active.id as string;
    const newStatus = over.id as string;

    // Verify it is a valid column target
    if (!COLUMNS.map(c => c.id).includes(newStatus)) {
      return;
    }

    // Update local state temporarily
    setItems((prev: any[]) => 
      prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c)
    );

    // Update backend API
    try {
      await updateComplaintStatus(complaintId, newStatus);
    } catch (error) {
      console.error('Failed to update status in backend, but keeping optimistic UI state:', error);
    }
  };

  const getComplaintsByStatus = (status: string) => {
    return items.filter((c: any) => (c.status || 'new') === status);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[500px]">
        {COLUMNS.map((column) => (
          <SortableContext
            key={column.id}
            items={getComplaintsByStatus(column.id).map((c: any) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              id={column.id}
              title={column.title}
              color={column.color}
              complaints={getComplaintsByStatus(column.id)}
              onComplaintClick={onComplaintClick}
            />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}