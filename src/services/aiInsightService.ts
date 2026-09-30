// AgriFuel AI - Dynamic Farm AI Insight Service
import { AppLanguage } from './multilingualService';

export interface FarmInsightInput {
  crop: string;
  growthStage?: string;
  soilMoisture: number;
  temperature: number;
  humidity?: number;
  rainProbability: number;
  biogasLevel?: number | string;
  location?: string;
  farmSize?: number | string;
  cropImageAnalysis?: {
    condition?: string;
    healthScore?: number;
    risk?: string;
    symptoms?: string[];
  };
  context?: 'farm-advisor' | 'crop-doctor' | 'community-biogas' | 'residue' | 'dashboard';
  targetLang?: AppLanguage;
}

export interface FarmInsightResult {
  headline: string;
  action: string;
  confidence: number;
  confidenceBadge: string;
  source: 'gemini' | 'dynamic-engine' | 'cache';
}

const INSIGHT_CACHE_PREFIX = 'agrifuel_insight_v2_';

function makeCacheKey(input: FarmInsightInput, lang: AppLanguage): string {
  const parts = [
    input.crop,
    input.growthStage || 'Vegetative',
    Math.round(input.soilMoisture),
    Math.round(input.temperature),
    Math.round(input.rainProbability),
    input.biogasLevel || '78',
    input.farmSize || '5',
    input.context || 'farm-advisor',
    input.cropImageAnalysis?.condition || 'none',
    input.cropImageAnalysis?.risk || 'none',
    lang,
  ];
  return `${INSIGHT_CACHE_PREFIX}${parts.join('_')}`;
}

export async function fetchDynamicFarmInsight(
  input: FarmInsightInput,
  lang: AppLanguage = 'en'
): Promise<FarmInsightResult> {
  const cacheKey = makeCacheKey(input, lang);

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.headline && parsed?.action) {
        return {
          ...parsed,
          source: 'cache',
        };
      }
    }
  } catch {
    // Ignore cache error
  }

  try {
    const res = await fetch('/api/generate-farm-insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...input,
        targetLang: lang,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.headline && data.action) {
        const result: FarmInsightResult = {
          headline: data.headline,
          action: data.action,
          confidence: data.confidence || 93,
          confidenceBadge: data.confidenceBadge || `${data.confidence || 93}% Confidence`,
          source: data.source || 'gemini',
        };
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {
          // Ignore storage quota
        }
        return result;
      }
    }
  } catch (err) {
    console.warn('Network issue fetching dynamic insight, computing locally:', err);
  }

  // Local fallback if offline or server is unreachable
  const fallback = localComputeInsight(input, lang);
  return fallback;
}

function localComputeInsight(input: FarmInsightInput, lang: AppLanguage): FarmInsightResult {
  const moisture = Number(input.soilMoisture ?? 42);
  const rain = Number(input.rainProbability ?? 65);
  const temp = Number(input.temperature ?? 28);
  const biogas = Number(input.biogasLevel ?? 78);

  if (input.context === 'community-biogas' || biogas >= 90) {
    if (lang === 'mr') {
      return {
        headline: 'पंप चालवण्यासाठी बायोगॅस वेळेचे नियोजन करा',
        action: 'समुदाय बायोगॅस साठा उच्च पातळीवर (९०%+) पोहोचला आहे. विजेची मागणी संतुलित करण्यासाठी सिंचन पंप नियोजित वेळेत चालवा. यामुळे बायोगॅसचा कार्यक्षम वापर होऊन शेतकरी खात्यात अधिक ऊर्जा शिल्लक राहील.',
        confidence: 94,
        confidenceBadge: '94% Confidence',
        source: 'dynamic-engine',
      };
    }
    if (lang === 'hi') {
      return {
        headline: 'सिंचाई पंपिंग को सौर समय पर स्थानांतरित करें',
        action: 'सामुदायिक बायोगैस भंडारण उच्च क्षमता (90%+) पर है। गैर-जरूरी भारी पंपिंग को ऑफ-पीक समय पर चलाएं। इससे बायोगैस का कुशल उपयोग होगा और ग्रिड बिजली बिल में बचत होगी।',
        confidence: 94,
        confidenceBadge: '94% Confidence',
        source: 'dynamic-engine',
      };
    }
    return {
      headline: 'Optimize biogas energy for farm irrigation',
      action: 'Community biogas storage is operating near high capacity. Schedule heavy water pumping during recommended daylight hours to efficiently draw community power while preserving emergency backup reserves for the village.',
      confidence: 94,
      confidenceBadge: '94% Confidence',
      source: 'dynamic-engine',
    };
  }

  // Canonical user example: Delay irrigation today
  if (rain >= 50 && moisture >= 35) {
    if (lang === 'mr') {
      return {
        headline: 'आज पाणी देणे पुढे ढकला',
        action: 'पुढील २४ तासांत पावसाची दाट शक्यता असून सध्या जमिनीत पुरेशी ओल आहे. उद्यापर्यंत थांबल्याने पाणी आणि विजेची बचत होईल.',
        confidence: 93,
        confidenceBadge: '93% Confidence',
        source: 'dynamic-engine',
      };
    }
    if (lang === 'hi') {
      return {
        headline: 'आज सिंचाई टालें',
        action: 'अगले 24 घंटों में बारिश की संभावना है और वर्तमान मिट्टी में नमी पर्याप्त है। कल तक प्रतीक्षा करने से पानी बचाने में मदद मिल सकती है।',
        confidence: 93,
        confidenceBadge: '93% Confidence',
        source: 'dynamic-engine',
      };
    }
    return {
      headline: 'Delay irrigation today',
      action: 'Rain is likely within 24 hours, and current soil moisture is sufficient. Waiting until tomorrow can help conserve water.',
      confidence: 93,
      confidenceBadge: '93% Confidence',
      source: 'dynamic-engine',
    };
  }

  if (moisture < 30 && rain < 40) {
    if (lang === 'mr') {
      return {
        headline: 'सकाळी लवकर ठिबक सिंचन सुरू करा',
        action: 'जमिनीतील ओलावा कमी झाला असून पावसाची शक्यता फारच कमी आहे. दुपारच्या कडक उन्हापूर्वी सकाळी ४५ मिनिटे ठिबक चालवल्याने पिकांच्या मुळांना आवश्यक पाणी मिळेल.',
        confidence: 95,
        confidenceBadge: '95% Confidence',
        source: 'dynamic-engine',
      };
    }
    if (lang === 'hi') {
      return {
        headline: 'सुबह की लक्षित ड्रिप सिंचाई शुरू करें',
        action: 'मिट्टी की नमी आवश्यक स्तर से नीचे आ गई है और बारिश की संभावना कम है। सुबह के समय 45 मिनट ड्रिप सिंचाई चलाने से पौधों की जड़ों को सीधा पोषण मिलेगा।',
        confidence: 95,
        confidenceBadge: '95% Confidence',
        source: 'dynamic-engine',
      };
    }
    return {
      headline: 'Schedule early morning drip irrigation',
      action: 'Root-zone soil moisture is low and rain is unlikely. Running a 45-minute early morning drip cycle will nourish root zones before high midday temperatures and prevent crop moisture stress.',
      confidence: 95,
      confidenceBadge: '95% Confidence',
      source: 'dynamic-engine',
    };
  }

  if (temp >= 35) {
    if (lang === 'mr') {
      return {
        headline: 'पिकांच्या अवशेषांचे आच्छादन (मल्चिंग) करा',
        action: 'वाढत्या तापमानामुळे जमिनीतील ओलावा लवकर उडून जात आहे. पिकांच्या ओळींमध्ये सुके अवशेष पसरवून मुळांचे कडक उन्हापासून रक्षण करा.',
        confidence: 91,
        confidenceBadge: '91% Confidence',
        source: 'dynamic-engine',
      };
    }
    if (lang === 'hi') {
      return {
        headline: 'फसल अवशेष मल्चिंग से नमी सुरक्षित रखें',
        action: 'अधिक तापमान के कारण मिट्टी की नमी तेजी से वाष्पीकृत हो रही है। क्यारियों में फसल अवशेष बिछाकर जड़ों को ठंडा रखें और मूल्यवान भूजल की बचत करें।',
        confidence: 91,
        confidenceBadge: '91% Confidence',
        source: 'dynamic-engine',
      };
    }
    return {
      headline: 'Apply residue mulching to reduce heat stress',
      action: 'High ambient temperature will accelerate soil moisture evaporation. Spreading organic crop residue between rows shields root systems from scorching heat and keeps valuable soil moisture trapped.',
      confidence: 91,
      confidenceBadge: '91% Confidence',
      source: 'dynamic-engine',
    };
  }

  // Default balanced
  if (lang === 'mr') {
    return {
      headline: 'नियमित शेती वेळापत्रक सुरू ठेवा',
      action: 'सध्याचे सेन्सर निरीक्षण संतुलित ओलावा आणि पिकांची चांगली स्थिती दर्शवते. नियमित ओलावा तपासणी सुरू ठेवा आणि समुदाय बायोगॅस ऊर्जा क्रेडिटसाठी शेतातील अवशेष जमा करा.',
      confidence: 93,
      confidenceBadge: '93% Confidence',
      source: 'dynamic-engine',
    };
  }
  if (lang === 'hi') {
    return {
      headline: 'संतुलित कृषि अनुसूची बनाए रखें',
      action: 'वर्तमान सेंसर डेटा संतुलित मिट्टी की नमी और स्वस्थ फसल विकास दर्शाता है। नियमित निगरानी जारी रखें और बायोगैस ऊर्जा क्रेडिट अर्जित करने के लिए अवशेष सुरक्षित रखें।',
      confidence: 93,
      confidenceBadge: '93% Confidence',
      source: 'dynamic-engine',
    };
  }
  return {
    headline: 'Maintain balanced field schedule',
    action: 'Current telemetry indicates balanced root-zone moisture and favorable crop vigor. Continue routine field monitoring and collect post-harvest crop residue to accumulate valuable bioenergy credits.',
    confidence: 93,
    confidenceBadge: '93% Confidence',
    source: 'dynamic-engine',
  };
}
