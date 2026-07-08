import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { X, Loader2 } from 'lucide-react';
import { submitTextComplaint, submitPhotoComplaint } from '../../lib/api';
import { addComplaintToFeed } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';

interface ComplaintFormProps {
  type: 'text' | 'photo';
  onClose: () => void;
}

export function ComplaintForm({ type, onClose }: ComplaintFormProps) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [ward, setWard] = useState('Chinhat');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (type === 'text') {
        response = await submitTextComplaint({ text, ward });
      } else if (type === 'photo' && photo) {
        response = await submitPhotoComplaint(photo, ward);
      } else {
        throw new Error('Please select a photo file');
      }

      // Add to Firebase feed (real-time)
      await addComplaintToFeed({
        ...response.analysis,
        ward,
        status: 'new',
        raw_text: text || 'Photo complaint',
      });

      setResult(response);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
            <span>✅</span> {t('submitted')}
          </h3>
          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>{t('category')}:</strong> {result.analysis.category}</p>
            <p><strong>{t('severity')}:</strong> {result.analysis.severity}/10</p>
            <p><strong>{t('summary')}:</strong> {result.analysis.summary_en}</p>
            <p><strong>{t('priority_score')}:</strong> {result.analysis.priority_score}/100</p>
          </div>
          <Button onClick={onClose} className="mt-6 w-full">{t('done')}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-jan-coral bg-white shadow-xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100">
          <h3 className="text-lg font-bold text-slate-800">
            {type === 'text' ? t('text_complaint') : t('upload_photo')}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-zinc-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'text' && (
            <div>
              <label className="block text-xs font-black uppercase text-zinc-500 tracking-wider mb-1.5">{t('desc_label')}</label>
              <Textarea
                placeholder={t('describe_problem')}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] mb-2"
                required
              />
            </div>
          )}

          {type === 'photo' && (
            <div>
              <label className="block text-xs font-black uppercase text-zinc-500 tracking-wider mb-1.5">{t('upload_photo')}</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="mb-2"
                required
              />
              <p className="text-xs text-gray-500 mt-1">{t('photo_hint')}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 tracking-wider mb-1.5">{t('ward_label')}</label>
            <Input
              placeholder={t('enter_ward')}
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-2 font-medium">⚠️ {error}</p>}

          <Button type="submit" disabled={loading} className="w-full flex items-center justify-center">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}