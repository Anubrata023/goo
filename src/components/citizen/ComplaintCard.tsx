import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { upvoteComplaint } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';

interface ComplaintCardProps {
  complaint: any;
  onClick?: () => void;
}

export function ComplaintCard({ complaint, onClick }: ComplaintCardProps) {
  const { t, language } = useLanguage();
  const [upvotes, setUpvotes] = useState(complaint.upvotes || 0);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await upvoteComplaint(complaint.id);
    setUpvotes((prev: number) => prev + 1);
  };

  const getPriorityColor = (score: number) => {
    if (score >= 70) return 'bg-red-50 border-red-500';
    if (score >= 40) return 'bg-orange-50 border-orange-500';
    return 'bg-green-50 border-green-500';
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all border-l-4 ${getPriorityColor(complaint.priority_score || 0)}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                {complaint.category || 'Other'}
              </span>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {t('priority')}: {complaint.priority_score || 0}/100
              </span>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {t('severity')}: {complaint.severity || 0}/10
              </span>
            </div>
            
            <p className="text-sm font-semibold text-jan-slate leading-relaxed">
              {language === 'hi' ? complaint.summary_hi : complaint.summary_en || complaint.raw_text}
            </p>
            
            <div className="mt-3 text-xs text-gray-400 font-medium">
              📍 {complaint.ward} • 📅 {new Date(complaint.timestamp || Date.now()).toLocaleDateString()}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUpvote}
            className="flex items-center gap-1.5 h-8 font-bold border-zinc-200"
          >
            👍 {upvotes}
          </Button>
        </div>
        
        {complaint.is_duplicate && (
          <div className="mt-3 text-xs text-orange-600 bg-orange-100/50 border border-orange-200/50 px-2 py-1 rounded font-bold inline-flex items-center gap-1">
            🔄 {t('merged_issue')} - {complaint.cluster_size || 0} {t('reports')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}