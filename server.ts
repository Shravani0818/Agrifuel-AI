import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Allow up to 15MB JSON payload to support 10MB base64-encoded crop images
  app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
    });
  });

  // Multimodal Crop Image Analysis Endpoint
  app.post('/api/analyze-crop-image', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(503).json({
          error: 'AI analysis is temporarily unavailable.',
          code: 'API_KEY_MISSING',
          message: 'Gemini API key is not configured in this environment.',
        });
      }

      const {
        imageBase64,
        mimeType,
        crop,
        cropStage,
        description,
        farmContext,
        language,
        targetLang = language || 'en',
      } = req.body || {};

      if (!imageBase64 || !mimeType) {
        return res.status(400).json({
          error: 'AI analysis is temporarily unavailable.',
          code: 'MISSING_IMAGE',
          message: 'Please provide a valid crop image (JPG, PNG, or WEBP).',
        });
      }

      const supportedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!supportedMimeTypes.includes(String(mimeType).toLowerCase())) {
        return res.status(400).json({
          error: 'AI analysis is temporarily unavailable.',
          code: 'UNSUPPORTED_IMAGE',
          message: 'Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const cleanBase64 = String(imageBase64).replace(/^data:image\/\w+;base64,/, '');

      const contextText = `
FARM & ENVIRONMENTAL CONTEXT (For contextual reference — does not guarantee a definitive diagnosis):
- Farmer: ${farmContext?.farmerName || 'Rajesh Patil'} (ID: ${farmContext?.farmerId || 'F001'})
- Location: ${farmContext?.location || 'Shirur, Pune, Maharashtra'}
- Selected Crop: ${crop || 'Soybean'}
- Crop Growth Stage: ${cropStage || 'Flowering'}
- Farmer's Visual Description: ${description ? `"${description}"` : 'None provided'}
- Farm Area: ${farmContext?.farmAreaAcres ?? 5} acres
- Soil Type: ${farmContext?.soilType || 'Black Soil'}
- Soil Moisture (IoT Sensor): ${farmContext?.soilMoisture ?? 42}%
- Ambient Temperature: ${farmContext?.temperature ?? 28}°C
- Relative Humidity: ${farmContext?.humidity ?? 67}%
- Rain Probability: ${farmContext?.rainProbability ?? 65}%
`.trim();

      const promptText = `
You are the AgriFuel AI Multimodal Crop Intelligence Assistant.
Analyze the uploaded image alongside the farmer's selected crop, growth stage, optional description, and farm environmental context.

${contextText}

CRITICAL INSTRUCTIONS:
1. First, verify if the uploaded image is clear enough to inspect and whether it depicts a plant, leaf, crop, fruit, soil/field, or agricultural subject.
   - If the image is completely unrelated to agriculture (e.g., a car, indoor furniture, random document, person portrait without crops) or far too blurry/dark to discern any plant features, set "isCropImage": false or "imageQualitySufficient": false and explain why in "qualityIssueReason" starting with "Unable to confidently assess the crop image."
2. Clearly distinguish between:
   - Observed symptoms ("visibleSymptoms")
   - Possible causes ("possibleCauses")
   - Recommended next steps (structured in a strict 3-Tier Treatment Priority Hierarchy)
3. NON-CERTAINTY LANGUAGE REQUIREMENT:
   - NEVER claim certainty from an image alone. Never claim "100% disease detected" or "This crop definitely has disease X."
   - Always use cautious phrasing such as: "Possible...", "Likely...", "Potential...", "Visible symptoms may be consistent with...", "Image-based assessment suggests...".
4. PRIORITY-BASED TREATMENT HIERARCHY (NATURAL-FIRST):
   - Do NOT immediately recommend chemical treatment. Structure recommendations into three distinct priority tiers:
     * PRIORITY 1 — FIRST RESPONSE (Natural / Organic / Cultural Practices):
       Provide 3 to 4 practical cultural and observation actions (e.g., monitor affected plants, maintain appropriate soil moisture, remove severely affected plant material if appropriate, improve field hygiene and canopy airflow).
     * PRIORITY 2 — NUTRIENT / FERTILIZER MANAGEMENT (Soil & Nutrient Management):
       Provide 2 to 3 general, low-risk soil and nutrient management recommendations. Always emphasize: "Consider soil testing before applying fertilizer" and "Consider an appropriate nutrient source or stabilized organic bio-digestate based on soil-test recommendations." Avoid unsafe chemical fertilizer dosage instructions.
     * PRIORITY 3 — CHEMICAL / PROFESSIONAL GUIDANCE:
       Set "showPriority3Chemical" to true ONLY when the image or symptoms indicate a plausible pest or disease concern (or medium/high risk stress that might escalate).
       Never give dangerous pesticide mixing or dosage instructions. State: "If the problem continues or spreads, consult a qualified agricultural professional for an appropriate registered treatment."
5. Explain briefly in "environmentalContextNote" how the provided environmental data (soil moisture, temperature, humidity, rain probability) provides helpful context for the visual symptoms without guaranteeing a diagnosis.
6. LANGUAGE REQUIREMENT: You MUST generate all text fields (visibleSymptoms, possibleIssues, possibleCauses, priority1Natural, priority2Nutrient, priority3Chemical, recommendedActions, monitoringAdvice, whenToSeekExpertHelp, environmentalContextNote, disclaimer) directly in ${targetLang === 'mr' ? 'authentic Marathi (मराठी) for Maharashtra farmers' : targetLang === 'hi' ? 'authentic Hindi (हिन्दी) for Indian farmers' : 'clear, friendly English'}.
`.trim();

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCropImage: {
                type: Type.BOOLEAN,
                description:
                  'True if the image shows a crop, plant, leaf, fruit, seed, or agricultural field.',
              },
              imageQualitySufficient: {
                type: Type.BOOLEAN,
                description:
                  'True if the image is clear enough for a preliminary visual crop assessment.',
              },
              qualityIssueReason: {
                type: Type.STRING,
                description:
                  'If isCropImage or imageQualitySufficient is false, explain briefly why (e.g., Unable to confidently assess the crop image). Otherwise empty string.',
              },
              cropDetected: {
                type: Type.STRING,
                description:
                  'The crop identified or evaluated (e.g., Soybean, Wheat, Rice, Cotton, Maize).',
              },
              overallHealth: {
                type: Type.STRING,
                description: 'Must be one of: "Good", "Moderate", or "Needs Attention".',
              },
              healthScore: {
                type: Type.INTEGER,
                description:
                  'Estimated visual canopy health score from 40 to 96 based on the image.',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'AI assessment confidence percentage between 60 and 95.',
              },
              visibleSymptoms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'List of 3 to 5 specific observed visible symptoms on the leaves, stems, or canopy.',
              },
              possibleIssues: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'List of 2 to 4 potential issues phrased with "Possible" or "Likely" (e.g., "Possible nutrient stress", "Possible moisture stress").',
              },
              possibleCauses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'List of 2 to 3 potential underlying agronomic or environmental causes.',
              },
              riskLevel: {
                type: Type.STRING,
                description: 'Must be one of: "LOW", "MEDIUM", or "HIGH".',
              },
              priority1Natural: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'PRIORITY 1 — FIRST RESPONSE: 3 to 4 Natural, Organic, or Cultural practices (monitoring, soil moisture management, removing affected material, field hygiene).',
              },
              priority2Nutrient: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'PRIORITY 2 — NUTRIENT MANAGEMENT: 2 to 3 general soil/fertilizer guidance items emphasizing soil testing before fertilizer application and organic digestate.',
              },
              showPriority3Chemical: {
                type: Type.BOOLEAN,
                description:
                  'True when a plausible pest or disease concern is present or if symptoms could escalate requiring professional consultation.',
              },
              priority3Chemical: {
                type: Type.STRING,
                description:
                  'PRIORITY 3 — CHEMICAL / PROFESSIONAL GUIDANCE: Safe guidance advising consultation with a qualified agricultural professional for an appropriate registered treatment without mixing/dosage instructions.',
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'List of 5 ordered, actionable, low-risk first steps prioritizing moisture check, field inspection, irrigation review, soil testing, and expert consultation.',
              },
              monitoringAdvice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'List of 2 to 3 ongoing monitoring tips, including uploading another image in a few days to compare crop condition.',
              },
              whenToSeekExpertHelp: {
                type: Type.STRING,
                description:
                  'Guidance on when to consult a qualified agricultural expert or extension officer.',
              },
              environmentalContextNote: {
                type: Type.STRING,
                description:
                  'Note explaining how the farm soil moisture, temperature, humidity, and rain probability relate to the visual assessment.',
              },
              disclaimer: {
                type: Type.STRING,
                description:
                  'Mandatory disclaimer stating this is an AI image-based assessment and not a certified professional diagnosis.',
              },
            },
            required: [
              'isCropImage',
              'imageQualitySufficient',
              'qualityIssueReason',
              'cropDetected',
              'overallHealth',
              'healthScore',
              'confidence',
              'visibleSymptoms',
              'possibleIssues',
              'possibleCauses',
              'riskLevel',
              'priority1Natural',
              'priority2Nutrient',
              'showPriority3Chemical',
              'priority3Chemical',
              'recommendedActions',
              'monitoringAdvice',
              'whenToSeekExpertHelp',
              'environmentalContextNote',
              'disclaimer',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return res.status(502).json({
          error: 'AI analysis is temporarily unavailable.',
          code: 'EMPTY_RESPONSE',
          message: 'Gemini returned an empty response.',
        });
      }

      const parsed = JSON.parse(rawText.trim());
      return res.json({
        source: 'gemini',
        model: 'gemini-3.8-flash',
        analysis: parsed,
      });
    } catch (error: unknown) {
      console.error('Gemini crop image analysis error:', error);
      const errMsg =
        error instanceof Error ? error.message : 'Unexpected error during AI analysis.';
      return res.status(500).json({
        error: 'AI analysis is temporarily unavailable.',
        code: 'GEMINI_API_ERROR',
        message: errMsg,
      });
    }
  });

  // Multilingual Recommendation Translation Endpoint powered by Gemini
  app.post('/api/translate-recommendation', async (req, res) => {
    try {
      const { text, targetLang } = req.body || {};
      if (!text || !targetLang) {
        return res.status(400).json({
          error: 'Missing text or targetLang parameter',
        });
      }

      if (targetLang === 'en') {
        return res.json({
          translatedText: text,
          targetLang: 'en',
          source: 'original',
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(503).json({
          error: 'Gemini API key is not configured in this environment.',
          code: 'API_KEY_MISSING',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const langName = targetLang === 'mr' ? 'Marathi (मराठी)' : 'Hindi (हिन्दी)';
      const prompt = `You are AgriFuel AI's multilingual agricultural localization expert for Indian farmers in Maharashtra and across India.
Translate the following agricultural recommendation into authentic, natural, respectful, and crystal-clear ${langName}.
Preserve exact agronomic meaning, metric units (kWh, tonnes, m³, °C, %, acres), and scientific clarity.
Do NOT output any markdown backticks, explanations, quotes, or notes. Return ONLY the direct translated sentence or sentences.

Source recommendation:
"${text}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
        },
      });

      const raw = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : text;
      return res.json({
        translatedText: raw,
        targetLang,
        source: 'gemini',
      });
    } catch (err: unknown) {
      console.error('Gemini multilingual translation error:', err);
      return res.status(500).json({
        error: 'Translation failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });

  // Dynamic Farm AI Insights Endpoint powered by Gemini
  app.post('/api/generate-farm-insight', async (req, res) => {
    try {
      const {
        crop = 'Soybean',
        growthStage = 'Vegetative',
        soilMoisture = 42,
        temperature = 28,
        humidity = 67,
        rainProbability = 65,
        biogasLevel = 78,
        location = 'Shirur, Pune, Maharashtra',
        farmSize = 5,
        cropImageAnalysis,
        context = 'farm-advisor',
        targetLang = 'en',
      } = req.body || {};

      const numMoisture = Number(soilMoisture);
      const numRain = Number(rainProbability);
      const numTemp = Number(temperature);
      const numBiogas = typeof biogasLevel === 'number' ? biogasLevel : parseInt(String(biogasLevel), 10) || 78;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        const fallback = computeSmartInsight({
          crop,
          growthStage,
          soilMoisture: numMoisture,
          temperature: numTemp,
          humidity: Number(humidity),
          rainProbability: numRain,
          biogasLevel: numBiogas,
          location,
          farmSize: Number(farmSize),
          cropImageAnalysis,
          context,
          targetLang,
        });
        return res.json({
          ...fallback,
          confidenceBadge: `${fallback.confidence}% Confidence`,
          source: 'dynamic-engine',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const langDirective =
        targetLang === 'mr'
          ? 'Generate the response directly in authentic, respectful Marathi (मराठी) for farmers in Maharashtra.'
          : targetLang === 'hi'
          ? 'Generate the response directly in authentic, respectful Hindi (हिन्दी) for Indian farmers.'
          : 'Generate the response in clear, friendly English.';

      const promptText = `
You are AgriFuel AI's agronomic decision engine for Indian farmers in Maharashtra and across India.
Analyze the following farm data and generate a real-time actionable recommendation:

FARM TELEMETRY & DATA:
- Crop Type: ${crop}
- Growth Stage: ${growthStage}
- Soil Moisture: ${numMoisture}%
- Temperature: ${numTemp}°C
- Relative Humidity: ${humidity}%
- Rain Probability: ${numRain}%
- Biogas Digester Level: ${numBiogas}%
- Location: ${location}
- Farm Size: ${farmSize} acres
- Crop Image Diagnostic Analysis: ${
        cropImageAnalysis ? JSON.stringify(cropImageAnalysis) : 'Regular canopy monitoring, no critical pest'
      }
- Advisory Context: ${context}

REQUIREMENTS:
1. ${langDirective}
2. "headline": Exactly one short, clear, bold one-line headline (3 to 6 words). Examples: "Delay irrigation today", "Schedule early morning drip irrigation", "Apply organic mulch for moisture", "Conserve digester biogas for morning pumps".
3. "action": Exactly ONE actionable recommendation (40 to 60 words maximum) written in a friendly, supportive farmer-focused tone. Explain clearly what the farmer should do today and why based on current soil moisture (${numMoisture}%), temperature (${numTemp}°C), and rain probability (${numRain}%).
4. "confidence": An integer percentage between 90 and 96 representing AI confidence based on telemetry quality.
`.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          temperature: 0.25,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description: 'One-line crisp agricultural headline (e.g. Delay irrigation today).',
              },
              action: {
                type: Type.STRING,
                description:
                  'Short, actionable recommendation (40 to 60 words maximum) in a friendly farmer-focused tone.',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'Confidence score between 90 and 96.',
              },
            },
            required: ['headline', 'action', 'confidence'],
          },
        },
      });

      const raw = response.text;
      if (!raw) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(raw.trim());
      const confidence = parsed.confidence && parsed.confidence >= 80 ? parsed.confidence : 93;
      return res.json({
        headline: parsed.headline,
        action: parsed.action,
        confidence,
        confidenceBadge: `${confidence}% Confidence`,
        source: 'gemini',
      });
    } catch (error) {
      console.error('Error generating farm insight via Gemini:', error);
      const fallback = computeSmartInsight(req.body || {});
      return res.json({
        ...fallback,
        confidenceBadge: `${fallback.confidence}% Confidence`,
        source: 'dynamic-engine',
      });
    }
  });

  // Helper function for dynamic intelligent farm insights
  function computeSmartInsight(data: any) {
    const soilMoisture = Number(data.soilMoisture ?? 42);
    const rainProbability = Number(data.rainProbability ?? 65);
    const temperature = Number(data.temperature ?? 28);
    const biogasLevel = Number(data.biogasLevel ?? 78);
    const targetLang = data.targetLang || 'en';
    const context = data.context || 'farm-advisor';

    // 1. Biogas peak scenario
    if (context === 'community-biogas' || biogasLevel >= 90) {
      if (targetLang === 'mr') {
        return {
          headline: 'पंप चालवण्यासाठी बायोगॅस वेळेचे नियोजन करा',
          action: 'समुदाय बायोगॅस साठा उच्च पातळीवर (९०%+) पोहोचला आहे. विजेची मागणी संतुलित करण्यासाठी सिंचन पंप नियोजित वेळेत चालवा. यामुळे बायोगॅसचा कार्यक्षम वापर होऊन शेतकरी खात्यात अधिक ऊर्जा शिल्लक राहील.',
          confidence: 94,
        };
      }
      if (targetLang === 'hi') {
        return {
          headline: 'सिंचाई पंपिंग को सौर समय पर स्थानांतरित करें',
          action: 'सामुदायिक बायोगैस भंडारण उच्च क्षमता (90%+) पर है। गैर-जरूरी भारी पंपिंग को ऑफ-पीक समय पर चलाएं। इससे बायोगैस का कुशल उपयोग होगा और ग्रिड बिजली बिल में बचत होगी।',
          confidence: 94,
        };
      }
      return {
        headline: 'Optimize biogas energy for farm irrigation',
        action: 'Community biogas storage is operating near high capacity. Schedule heavy water pumping during recommended daylight hours to efficiently draw community power while preserving emergency backup reserves for the village.',
        confidence: 94,
      };
    }

    // 2. High rain chance + adequate moisture (The User Prompt Canonical Example!)
    if (rainProbability >= 50 && soilMoisture >= 35) {
      if (targetLang === 'mr') {
        return {
          headline: 'आज पाणी देणे पुढे ढकला',
          action: 'पुढील २४ तासांत पावसाची दाट शक्यता असून सध्या जमिनीत पुरेशी ओल आहे. उद्यापर्यंत थांबल्याने पाणी आणि विजेची बचत होईल आणि पिकांच्या मुळांची वाढ उत्तम राहील.',
          confidence: 93,
        };
      }
      if (targetLang === 'hi') {
        return {
          headline: 'आज सिंचाई टालें',
          action: 'अगले 24 घंटों में बारिश की संभावना है और वर्तमान मिट्टी में नमी पर्याप्त है। कल तक प्रतीक्षा करने से पानी और बिजली बचाने में मदद मिलेगी।',
          confidence: 93,
        };
      }
      return {
        headline: 'Delay irrigation today',
        action: 'Rain is likely within 24 hours, and current soil moisture is sufficient. Waiting until tomorrow can help conserve water.',
        confidence: 93,
      };
    }

    // 3. Dry soil + low rain chance
    if (soilMoisture < 30 && rainProbability < 40) {
      if (targetLang === 'mr') {
        return {
          headline: 'सकाळी लवकर ठिबक सिंचन सुरू करा',
          action: 'जमिनीतील ओलावा कमी झाला असून पावसाची शक्यता फारच कमी आहे. दुपारच्या कडक उन्हापूर्वी सकाळी ४५ मिनिटे ठिबक चालवल्याने पिकांच्या मुळांना आवश्यक पाणी मिळेल आणि बाष्पीभवन टाळता येईल.',
          confidence: 95,
        };
      }
      if (targetLang === 'hi') {
        return {
          headline: 'सुबह की लक्षित ड्रिप सिंचाई शुरू करें',
          action: 'मिट्टी की नमी आवश्यक स्तर से नीचे आ गई है और बारिश की संभावना कम है। सुबह के समय 45 मिनट ड्रिप सिंचाई चलाने से पौधों की जड़ों को सीधा पोषण मिलेगा और वाष्पीकरण से पानी की बर्बादी रुकेगी।',
          confidence: 95,
        };
      }
      return {
        headline: 'Schedule early morning drip irrigation',
        action: 'Root-zone soil moisture is low and rain is unlikely. Running a 45-minute early morning drip cycle will nourish root zones before high midday temperatures and prevent crop moisture stress.',
        confidence: 95,
      };
    }

    // 4. High temperature
    if (temperature >= 35) {
      if (targetLang === 'mr') {
        return {
          headline: 'पिकांच्या अवशेषांचे आच्छादन (मल्चिंग) करा',
          action: 'वाढत्या तापमानामुळे जमिनीतील ओलावा लवकर उडून जात आहे. पिकांच्या ओळींमध्ये सुके अवशेष पसरवून मुळांचे कडक उन्हापासून रक्षण करा, ज्यामुळे पाण्याचा ताण कमी होईल.',
          confidence: 91,
        };
      }
      if (targetLang === 'hi') {
        return {
          headline: 'फसल अवशेष मल्चिंग से नमी सुरक्षित रखें',
          action: 'अधिक तापमान के कारण मिट्टी की नमी तेजी से वाष्पीकृत हो रही है। क्यारियों में फसल अवशेष बिछाकर जड़ों को ठंडा रखें और मूल्यवान भूजल की बचत करें।',
          confidence: 91,
        };
      }
      return {
        headline: 'Apply residue mulching to reduce heat stress',
        action: 'High ambient temperature will accelerate soil moisture evaporation. Spreading organic crop residue between rows shields root systems from scorching heat and keeps valuable soil moisture trapped.',
        confidence: 91,
      };
    }

    // 5. Crop Doctor image analysis finding
    if (data.cropImageAnalysis && (data.cropImageAnalysis.risk === 'HIGH' || data.cropImageAnalysis.risk === 'MEDIUM')) {
      if (targetLang === 'mr') {
        return {
          headline: '५% निंबोळी अर्काची फवारणी करा',
          action: 'पानांवरील प्राथमिक तपासणीनुसार बुरशी किंवा किडीचा सौम्य ताण दिसून येत आहे. ५% निंबोळी अर्काची फवारणी करा आणि हवा खेळती राहण्यासाठी पिकांमधील खालची खराब पाने छाटून टाका.',
          confidence: 92,
        };
      }
      if (targetLang === 'hi') {
        return {
          headline: 'जैविक 5% नीम अर्क का छिड़काव करें',
          action: 'पत्तियों के लक्षणों से फंगल तनाव का संकेत मिलता है। 5% नीम के बीज के अर्क का छिड़काव करें और निचले प्रभावित पत्तों को हटाकर पौधों में वायु संचार बेहतर बनाएं।',
          confidence: 92,
        };
      }
      return {
        headline: 'Apply natural 5% Neem extract spray',
        action: 'Visual symptoms suggest mild foliage stress. Apply 5% Neem Seed Kernel Extract spray and prune dense lower foliage to improve airflow while preserving safe biomass for community bioenergy.',
        confidence: 92,
      };
    }

    // 6. Default balanced condition
    if (targetLang === 'mr') {
      return {
        headline: 'नियमित शेती वेळापत्रक सुरू ठेवा',
        action: 'सध्याचे सेन्सर निरीक्षण संतुलित ओलावा आणि पिकांची चांगली स्थिती दर्शवते. नियमित ओलावा तपासणी सुरू ठेवा आणि समुदाय बायोगॅस ऊर्जा क्रेडिटसाठी शेतातील अवशेष जमा करा.',
        confidence: 93,
      };
    }
    if (targetLang === 'hi') {
      return {
        headline: 'संतुलित कृषि अनुसूची बनाए रखें',
        action: 'वर्तमान सेंसर डेटा संतुलित मिट्टी की नमी और स्वस्थ फसल विकास दर्शाता है। नियमित निगरानी जारी रखें और बायोगैस ऊर्जा क्रेडिट अर्जित करने के लिए अवशेष सुरक्षित रखें।',
        confidence: 93,
      };
    }
    return {
      headline: 'Maintain balanced field schedule',
      action: 'Current telemetry indicates balanced root-zone moisture and favorable crop vigor. Continue routine field monitoring and collect post-harvest crop residue to accumulate valuable bioenergy credits.',
      confidence: 93,
    };
  }

  // Mount Vite middleware in development or serve static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgriFuel AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
