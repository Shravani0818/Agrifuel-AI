import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, Loader2 } from 'lucide-react';
import {
  speakRecommendation,
  stopSpeaking,
} from '../services/multilingualService';
import {
  FarmInsightInput,
  FarmInsightResult,
  fetchDynamicFarmInsight,
} from '../services/aiInsightService';
import { useLanguage } from '../context/LanguageContext';

interface AIInsightCardProps {
  /** Farm telemetry inputs used by Gemini to generate the insight */
  farmData: FarmInsightInput;
  /** Optional custom title; defaults to "AI Insight" */
  title?: string;
  /** Optional initial headline fallback */
  initialHeadline?: string;
  /** Optional initial action fallback */
  initialAction?: string;
  /** Optional initial confidence score */
  initialConfidence?: number;
  /** Additional container classes */
  className?: string;
  /** Compact padding mode */
  compact?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  farmData,
  title,
  initialHeadline = 'Delay irrigation today',
  initialAction = 'Rain is likely within 24 hours, and current soil moisture is sufficient. Waiting until tomorrow can help conserve water.',
  initialConfidence = 93,
  className = '',
  compact = false,
}) => {
  const { language: currentLang, t } = useLanguage();
  const cardTitle = title || t('ai.insight', 'AI Insight');
  const [insight, setInsight] = useState<FarmInsightResult>({
    headline: initialHeadline,
    action: initialAction,
    confidence: initialConfidence,
    confidenceBadge: `${initialConfidence}% ${t('ai.confidence', 'Confidence')}`,
    source: 'gemini',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Fetch or regenerate dynamic Gemini recommendation whenever sensor values, weather, or global language change
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    // 280ms debounce to give smooth response when sliding sensors
    const timer = setTimeout(async () => {
      try {
        const result = await fetchDynamicFarmInsight(farmData, currentLang);
        if (active) {
          setInsight(result);
          setIsLoading(false);
        }
      } catch {
        if (active) {
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    farmData.crop,
    farmData.growthStage,
    farmData.soilMoisture,
    farmData.temperature,
    farmData.humidity,
    farmData.rainProbability,
    farmData.biogasLevel,
    farmData.location,
    farmData.farmSize,
    farmData.cropImageAnalysis?.condition,
    farmData.cropImageAnalysis?.risk,
    farmData.context,
    currentLang,
  ]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Handle Text-To-Speech in the currently selected global language
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const fullSpeechText = `${insight.headline}. ${insight.action}`;
    speakRecommendation(
      fullSpeechText,
      currentLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const confidenceLabel = t('ai.confidence', 'Confidence');

  return (
    <div
      className={`rounded-2xl transition-all ${
        compact
          ? 'p-4 bg-gradient-to-br from-emerald-50/90 via-teal-50/30 to-white border border-emerald-300 shadow-2xs'
          : 'p-5 sm:p-6 bg-gradient-to-br from-emerald-50/95 via-teal-50/40 to-white border-2 border-emerald-500/40 shadow-sm'
      } ${className}`}
    >
      {/* Top Header Row: Sparkles + "AI Insight" + "Powered by Gemini" + Confidence Badge + Voice Speaker */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-200/70">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-emerald-950 font-extrabold text-base">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cardTitle}</span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-700 animate-pulse shrink-0" />
            <span>{t('ai.poweredBy', 'Powered by Gemini')}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Small Green Confidence Badge */}
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            {insight.confidence}% {confidenceLabel}
          </span>

          {/* Voice Speaker Icon Button */}
          <button
            type="button"
            onClick={handleToggleSpeak}
            title={isSpeaking ? t('action.stopVoice', 'Stop Voice') : `${t('action.listenVoice', 'Listen (Voice)')} (${currentLang.toUpperCase()})`}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isSpeaking
                ? 'bg-rose-600 text-white shadow-xs animate-pulse ring-2 ring-rose-200'
                : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 shadow-2xs'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[11px]">{t('action.stopVoice', 'Stop Voice')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[11px] hidden sm:inline">{t('action.listenVoice', 'Listen (Voice)')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Dynamic Recommendation Body */}
      <div className="pt-3.5">
        {isLoading ? (
          <div className="flex items-center gap-2.5 py-3 text-emerald-800 text-xs">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
            <span className="font-semibold">
              {t('ai.generating', 'Gemini generating real-time recommendation from live farm data...')}
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* One-line Headline */}
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
              {insight.headline}
            </h3>

            {/* One recommended action (40-60 words maximum, friendly farmer tone) */}
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {insight.action}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

