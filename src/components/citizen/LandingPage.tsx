import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Phone, MessageCircle, Camera, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ComplaintForm } from './ComplaintForm';

export function LandingPage() {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState<'text' | 'photo' | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* 4 Big Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* IVR - Call */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-green-200">
          <CardContent className="p-6 text-center flex flex-col justify-between h-full">
            <div>
              <Phone className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h3 className="font-bold text-lg text-slate-800">{t('call_us')}</h3>
              <p className="text-xs text-gray-600 mt-2">{t('call_description')}</p>
            </div>
            <div className="mt-4 text-xs font-black text-green-700 bg-green-100 py-1 rounded">
              Dial 1800-JAN-SAATH
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-teal-50 border-teal-200">
          <CardContent className="p-6 text-center flex flex-col justify-between h-full">
            <div>
              <MessageCircle className="w-12 h-12 mx-auto text-teal-600 mb-4" />
              <h3 className="font-bold text-lg text-slate-800">{t('whatsapp')}</h3>
              <p className="text-xs text-gray-600 mt-2">{t('whatsapp_description')}</p>
            </div>
            <div className="mt-4 text-xs font-black text-teal-700 bg-teal-100 py-1 rounded">
              +91 98000 00000
            </div>
          </CardContent>
        </Card>

        {/* Photo */}
        <Card 
          className={`hover:shadow-lg transition-all cursor-pointer bg-purple-50 border-purple-200 ${showForm === 'photo' ? 'ring-2 ring-purple-500 shadow-md' : ''}`}
          onClick={() => setShowForm(showForm === 'photo' ? null : 'photo')}
        >
          <CardContent className="p-6 text-center flex flex-col justify-between h-full">
            <div>
              <Camera className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <h3 className="font-bold text-lg text-slate-800">{t('upload_photo')}</h3>
              <p className="text-xs text-gray-600 mt-2">{t('photo_description')}</p>
            </div>
            <div className="mt-4 text-xs font-black text-purple-700 bg-purple-100 py-1 rounded">
              Upload Geotagged Image
            </div>
          </CardContent>
        </Card>

        {/* Text */}
        <Card 
          className={`hover:shadow-lg transition-all cursor-pointer bg-blue-50 border-blue-200 ${showForm === 'text' ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
          onClick={() => setShowForm(showForm === 'text' ? null : 'text')}
        >
          <CardContent className="p-6 text-center flex flex-col justify-between h-full">
            <div>
              <FileText className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h3 className="font-bold text-lg text-slate-800">{t('text_complaint')}</h3>
              <p className="text-xs text-gray-600 mt-2">{t('text_description')}</p>
            </div>
            <div className="mt-4 text-xs font-black text-blue-700 bg-blue-100 py-1 rounded">
              Write Online Report
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Form */}
      {showForm && (
        <div className="animate-fade-in transition-all duration-300">
          <ComplaintForm type={showForm} onClose={() => setShowForm(null)} />
        </div>
      )}
    </div>
  );
}
