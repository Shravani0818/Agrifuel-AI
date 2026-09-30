// Multilingual translation and speech synthesis service for AgriFuel AI
export type AppLanguage = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  flag: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
];

const LANGUAGE_STORAGE_KEY = 'agrifuel_ai_language';
const TRANSLATION_CACHE_PREFIX = 'agrifuel_trans_cache_v1_';

// Global language change event listeners
type LanguageChangeListener = (lang: AppLanguage) => void;
const listeners = new Set<LanguageChangeListener>();

export function getSavedLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'hi' || saved === 'mr') {
      return saved;
    }
  } catch {
    // Ignore localStorage errors
  }
  return 'en';
}

export function setSavedLanguage(lang: AppLanguage) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Ignore
  }
  listeners.forEach((fn) => fn(lang));
}

export function subscribeToLanguageChange(fn: LanguageChangeListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// Curated high-fidelity agronomic translations dictionary for common AgriFuel recommendations
const KNOWN_TRANSLATIONS: Record<string, { hi: string; mr: string }> = {
  // Crop Doctor remedies
  'Apply 5% Neem Seed Kernel Extract (NSKE) spray; prune affected lower foliage.': {
    hi: '5% नीम के बीज की गिरी के अर्क (NSKE) का छिड़काव करें; प्रभावित निचले पत्तों की छंटाई करें।',
    mr: '५% निंबोळी अर्क (NSKE) फवारा; बाधित झालेली खालची पाने छाटून टाका.',
  },
  'Consider soil testing before applying fertilizer.': {
    hi: 'उर्वरक डालने से पहले मिट्टी की जांच कराने पर विचार करें।',
    mr: 'खत देण्यापूर्वी माती परीक्षण करून घेण्याचा विचार करा.',
  },
  'Consider an appropriate nutrient source or stabilized organic bio-digestate.': {
    hi: 'उपयुक्त पोषक तत्व स्रोत या स्थिर जैविक बायो-डाइजेस्टेट के उपयोग पर विचार करें।',
    mr: 'योग्य पोषक खते किंवा स्थिर सेंद्रिय बायोगॅस स्लरी (बायो-डायजेस्टेट) वापरण्याचा विचार करा.',
  },
  'Evaluate crop residue collection for community bioenergy pathways instead of burning — and earn trackable kWh credits in your Farmer Energy Account.': {
    hi: 'जलाने के बजाय सामुदायिक जैव ऊर्जा मार्गों के लिए फसल अवशेष संग्रह का मूल्यांकन करें — और अपने किसान ऊर्जा खाते में ट्रैक करने योग्य kWh क्रेडिट अर्जित करें।',
    mr: 'पिकांचे अवशेष जाळण्याऐवजी समुदाय बायोगॅस ऊर्जा निर्मितीसाठी जमा करा — आणि तुमच्या शेतकरी ऊर्जा खात्यात ट्रॅक करण्यायोग्य kWh क्रेडिट मिळवा.',
  },
  'Delay irrigation because soil moisture is currently adequate and rain probability is elevated.': {
    hi: 'सिंचाई में देरी करें क्योंकि वर्तमान में मिट्टी में नमी पर्याप्त है और बारिश की संभावना अधिक है।',
    mr: 'सध्या जमिनीत पुरेशी ओल असून पावसाची शक्यता जास्त असल्याने पाणी देणे पुढे ढकला.',
  },
  'Schedule targeted root-zone irrigation during early morning hours to prevent moisture deficit.': {
    hi: 'नमी की कमी को रोकने के लिए सुबह के समय लक्षित जड़-क्षेत्र में सिंचाई का समय निर्धारित करें।',
    mr: 'ओलावा कमी पडू नये म्हणून सकाळी लवकर झाडांच्या मुळांशी थेट पाणी देण्याचे नियोजन करा.',
  },
  'Monitor midday canopy transpiration and conserve surface moisture using crop residue mulching.': {
    hi: 'दोपहर में पौधों के वाष्पोत्सर्जन पर नजर रखें और फसल अवशेषों की मल्चिंग करके सतह की नमी बचाएं।',
    mr: 'दुपारच्या वेळी झाडांच्या बाष्पोत्सर्जनावर लक्ष ठेवा आणि पिकांच्या अवशेषांचे आच्छादन (मल्चिंग) करून जमिनीतील ओलावा टिकवा.',
  },
  'Maintain current field schedule and continue routine soil moisture and canopy monitoring.': {
    hi: 'वर्तमान खेत अनुसूची बनाए रखें और नियमित मिट्टी की नमी तथा फसल स्वास्थ्य की निगरानी जारी रखें।',
    mr: 'सध्याचे शेतातील वेळापत्रक चालू ठेवा आणि जमिनीतील ओलावा व पिकांच्या वाढीचे नियमित निरीक्षण करा.',
  },
  'Delay irrigation.': {
    hi: 'सिंचाई टालें।',
    mr: 'पाणी देणे पुढे ढकला.',
  },
  'Inspect lower leaves.': {
    hi: 'निचले पत्तों का निरीक्षण करें।',
    mr: 'खालच्या पानांची पाहणी करा.',
  },
  'Rain tomorrow.': {
    hi: 'कल बारिश की संभावना।',
    mr: 'उद्या पाऊस पडण्याची शक्यता.',
  },
  'Schedule 45-min solar drip irrigation.': {
    hi: '45 मिनट की सौर ड्रिप सिंचाई निर्धारित करें।',
    mr: '४५ मिनिटे सोलर ठिबक सिंचन सुरू करा.',
  },
  'Check digester dome pressure and biogas supply valves.': {
    hi: 'डाइजेस्टर डोम दबाव और बायोगैस आपूर्ति वाल्वों की जांच करें।',
    mr: 'डायजेस्टर डोमवरील दाब आणि बायोगॅस पुरवठा व्हॉल्व्ह तपासा.',
  },
  'Shirur Community Biogas Plant running at optimal capacity. Pooled residue generates continuous power for farm water pumps.': {
    hi: 'शिरूर सामुदायिक बायोगैस संयंत्र इष्टतम क्षमता पर काम कर रहा है। एकत्रित अवशेष कृषि जल पंपों के लिए निरंतर बिजली उत्पन्न करते हैं।',
    mr: 'शिरूर समुदाय बायोगॅस प्रकल्प उत्तम क्षमतेने कार्यरत आहे. एकत्रित अवशेषांमधून शेतीतील पाण्याच्या पंपांसाठी अखंड वीज तयार होत आहे.',
  },
};

function getCacheKey(text: string, lang: AppLanguage): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `${TRANSLATION_CACHE_PREFIX}${lang}_${Math.abs(hash)}`;
}

// Instant translation powered by Gemini API with local caching and offline fallback
export async function translateWithGemini(
  text: string,
  targetLang: AppLanguage
): Promise<string> {
  const clean = text.trim();
  if (!clean || targetLang === 'en') {
    return clean;
  }

  // 1. Check known agronomic dictionary
  const known = KNOWN_TRANSLATIONS[clean];
  if (known && known[targetLang]) {
    return known[targetLang];
  }

  // 2. Check localStorage cache
  const cacheKey = getCacheKey(clean, targetLang);
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {
    // Ignore cache lookup errors
  }

  // 3. Call server-side Gemini endpoint
  try {
    const res = await fetch('/api/translate-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: clean,
        targetLang,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.translatedText) {
        try {
          localStorage.setItem(cacheKey, data.translatedText);
        } catch {
          // Ignore storage quota
        }
        return data.translatedText;
      }
    }
  } catch {
    // Network or server error - continue to fallback
  }

  // 4. Heuristic / graceful fallback if offline
  return fallbackTranslate(clean, targetLang);
}

function fallbackTranslate(text: string, lang: AppLanguage): string {
  // If no network, provide a structured transliteration / key phrase translation
  if (lang === 'mr') {
    if (text.includes('irrigation') || text.includes('Irrigation')) {
      return text.replace(/Delay irrigation/gi, 'पाणी देणे पुढे ढकला')
        .replace(/Schedule/gi, 'नियोजन करा')
        .replace(/soil moisture/gi, 'मातीतील ओलावा')
        .replace(/biogas/gi, 'बायोगॅस')
        .replace(/residue/gi, 'पीक अवशेष');
    }
    return `[मराठी] ${text}`;
  }

  if (lang === 'hi') {
    if (text.includes('irrigation') || text.includes('Irrigation')) {
      return text.replace(/Delay irrigation/gi, 'सिंचाई में देरी करें')
        .replace(/Schedule/gi, 'नियोजित करें')
        .replace(/soil moisture/gi, 'मिट्टी की नमी')
        .replace(/biogas/gi, 'बायोगैस')
        .replace(/residue/gi, 'फसल अवशेष');
    }
    return `[हिन्दी] ${text}`;
  }

  return text;
}

// Text-to-speech engine using Web Speech API
let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
  activeUtterance = null;
}

export function speakRecommendation(
  text: string,
  lang: AppLanguage,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.();
    return () => {};
  }

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;

  // Language tagging
  if (lang === 'mr') {
    utterance.lang = 'mr-IN';
  } else if (lang === 'hi') {
    utterance.lang = 'hi-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  // Voice selection fallback
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const targetTag = utterance.lang.toLowerCase();
    const prefix = targetTag.split('-')[0];

    const exactVoice = voices.find((v) => v.lang.toLowerCase() === targetTag);
    const langVoice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    const fallbackIndianVoice = voices.find((v) => v.lang.toLowerCase().includes('in'));

    if (exactVoice) {
      utterance.voice = exactVoice;
    } else if (langVoice) {
      utterance.voice = langVoice;
    } else if (lang === 'mr' && fallbackIndianVoice) {
      // In many systems Hindi voices read Marathi (both Devanagari) clearly
      utterance.voice = fallbackIndianVoice;
    }
  }

  utterance.rate = 0.92; // Slightly measured rate for clear farm advisories
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    onError?.();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    onError?.();
  }

  return () => {
    stopSpeaking();
  };
}
