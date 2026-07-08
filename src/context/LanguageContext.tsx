import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

const translations = {
  en: {
    tagline: 'AI-Powered Constituency Intelligence Platform',
    call_us: '📞 Call Us',
    call_description: 'Speak your complaint - no internet needed',
    whatsapp: '💬 WhatsApp',
    whatsapp_description: 'Send message on WhatsApp',
    upload_photo: '📷 Upload Photo',
    photo_description: 'Take photo of the problem',
    text_complaint: '✍️ Text Complaint',
    text_description: 'Type your complaint',
    submit: 'Submit',
    submitting: 'Submitting...',
    submitted: 'Complaint Submitted Successfully!',
    category: 'Category',
    severity: 'Severity',
    summary: 'Summary',
    priority_score: 'Priority Score',
    done: 'Done',
    describe_problem: 'Describe your problem in detail...',
    enter_ward: 'Enter ward name (e.g., Chinhat)',
    photo_hint: 'Take a clear photo of the infrastructure issue',
    community_feed: 'Community Feed',
    feed_description: 'Live complaints from your constituency - highest priority first',
    no_complaints: 'No complaints yet. Be the first to report!',
    loading: 'Loading',
    priority: 'Priority',
    merged_issue: 'Merged Issue',
    reports: 'reports',
    total_issues: 'Total Issues',
    resolved: 'Resolved',
    avg_resolution: 'Avg Resolution',
    satisfaction: 'Satisfaction',
    days: 'days',
    ward_label: 'Ward / Area Name',
    desc_label: 'Detailed Description',
  },
  hi: {
    tagline: 'एआई-संचालित निर्वाचन क्षेत्र बुद्धिमत्ता मंच',
    call_us: '📞 कॉल करें',
    call_description: 'अपनी शिकायत बोलें - इंटरनेट की जरूरत नहीं',
    whatsapp: '💬 व्हाट्सएप',
    whatsapp_description: 'व्हाट्सएप पर संदेश भेजें',
    upload_photo: '📷 फोटो अपलोड करें',
    photo_description: 'समस्या की फोटो लें',
    text_complaint: '✍️ टेक्स्ट शिकायत',
    text_description: 'अपनी शिकायत टाइप करें',
    submit: 'जमा करें',
    submitting: 'जमा हो रहा है...',
    submitted: 'शिकायत सफलतापूर्वक जमा हुई!',
    category: 'श्रेणी',
    severity: 'गंभीरता',
    summary: 'सारांश',
    priority_score: 'प्राथमिकता स्कोर',
    done: 'हो गया',
    describe_problem: 'अपनी समस्या का विस्तार से वर्णन करें...',
    enter_ward: 'वार्ड का नाम दर्ज करें (जैसे, चिनहट)',
    photo_hint: 'समस्या की स्पष्ट फोटो लें',
    community_feed: 'समुदाय फीड',
    feed_description: 'अपने निर्वाचन क्षेत्र से लाइव शिकायतें - पहले उच्चतम प्राथमिकता',
    no_complaints: 'अभी कोई शिकायत नहीं। पहले रिपोर्ट करने वाले बनें!',
    loading: 'लोड हो रहा है',
    priority: 'प्राथमिकता',
    merged_issue: 'विलयित मुद्दा',
    reports: 'रिपोर्ट',
    total_issues: 'कुल मुद्दे',
    resolved: 'हल किए गए',
    avg_resolution: 'औसत समाधान',
    satisfaction: 'संतुष्टि',
    days: 'दिन',
    ward_label: 'वार्ड / क्षेत्र का नाम',
    desc_label: 'विस्तृत विवरण',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};