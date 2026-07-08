import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '..', 'src', 'context', 'LanguageContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const keysToAdd = {
  cap_voice_title: 'Voice-First Intake',
  cap_voice_desc: 'Removing literacy barriers by transcribing local dialects and speech instantly via multilingual AI, ensuring every voice is captured accurately.',
  cap_voice_link: 'Learn More →',
  cap_geo_title: 'Geospatial Verification',
  cap_geo_desc: 'Mapping regional needs using precision satellite and open-source data to verify development milestones and infrastructure requirements.',
  cap_geo_link: 'View Map Demo →',
  cap_pred_title: 'Predictive Governance',
  cap_pred_desc: 'Forecasting future infrastructure needs and resource allocation automatically using deep-learning models trained on community feedback.',
  cap_pred_link: 'Explore AI Insights →',
};

const keysToAddHi = {
  cap_voice_title: 'आवाज-प्रथम इनटेक',
  cap_voice_desc: 'बहुभाषी एआई के माध्यम से स्थानीय बोलियों और भाषणों को तुरंत ट्रांसक्राइब करके साक्षरता बाधाओं को दूर करना, यह सुनिश्चित करना कि हर आवाज सही ढंग से दर्ज हो।',
  cap_voice_link: 'और जानें →',
  cap_geo_title: 'जियोस्पेशियल सत्यापन',
  cap_geo_desc: 'विकास के मील के पत्थर और बुनियादी ढांचे की आवश्यकताओं को सत्यापित करने के लिए सटीक उपग्रह और ओपन-सोर्स डेटा का उपयोग करके क्षेत्रीय आवश्यकताओं का मानचित्रण करना।',
  cap_geo_link: 'मानचित्र डेमो देखें →',
  cap_pred_title: 'पूर्वानुमानित शासन',
  cap_pred_desc: 'सामुदायिक प्रतिक्रिया पर प्रशिक्षित डीप-लर्निंग और संसाधन आवंटन का स्वचालित रूप से पूर्वानुमान लगाना।',
  cap_pred_link: 'एआई अंतर्दृष्टि का अन्वेषण करें →',
};

const dicts = ['en', 'hi', 'bn', 'ta', 'te', 'mr'];

dicts.forEach(lang => {
  const marker = `${lang}: {`;
  const index = content.indexOf(marker);
  if (index === -1) {
    console.log(`Could not find ${lang} dictionary`);
    return;
  }
  
  // Find closing brace of this dictionary
  let braceCount = 1;
  let closeIndex = -1;
  for (let i = index + marker.length; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        closeIndex = i;
        break;
      }
    }
  }
  
  if (closeIndex === -1) {
    console.log(`Could not find closing brace for ${lang}`);
    return;
  }
  
  // Build insert content
  let insertText = '';
  const currentKeys = lang === 'hi' ? keysToAddHi : keysToAdd;
  Object.entries(currentKeys).forEach(([key, val]) => {
    if (!content.slice(index, closeIndex).includes(`${key}:`)) {
      insertText += `    ${key}: '${val.replace(/'/g, "\\'")}',\n`;
    }
  });
  
  if (insertText) {
    content = content.slice(0, closeIndex) + insertText + content.slice(closeIndex);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added capability keys to other dictionaries!');
