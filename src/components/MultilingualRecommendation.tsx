import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import {
  translateWithGemini,
  speakRecommendation,
  stopSpeaking,
} from '../services/multilingualService';
import { useLanguage } from '../context/LanguageContext';

interface MultilingualRecommendationProps {
  /** Source English text of the recommendation */
  text: string;
  /** Optional secondary context or reason line */
  subtext?: string;
  /** Optional title or section label */
  title?: string;
  /** Optional badge */
  badge?: string;
  /** Additional container styling */
  className?: string;
  /** Visual scale */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to enclose the recommendation in quotes */
  showQuote?: boolean;
  /** Compact mode for tight cards */
  compact?: boolean;
}

export const MultilingualRecommendation: React.FC<MultilingualRecommendationProps> = ({
  text,
  subtext,
  title,
  badge,
  className = '',
  size = 'md',
  showQuote = false,
  compact = false,
}) => {
  const { language: currentLang, t } = useLanguage();
  const [displayText, setDisplayText] = useState<string>(text);
  const [displaySubtext, setDisplaySubtext] = useState<string | undefined>(subtext);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  // Update translation whenever source text, subtext, or language changes
  useEffect(() => {
    let active = true;

    if (currentLang === 'en') {
      setDisplayText(text);
      setDisplaySubtext(subtext);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);

    Promise.all([
      translateWithGemini(text, currentLang),
      subtext ? translateWithGemini(subtext, currentLang) : Promise.resolve(undefined),
    ])
      .then(([transMain, transSub]) => {
        if (active) {
          setDisplayText(transMain);
          setDisplaySubtext(transSub);
          setIsTranslating(false);
        }
      })
      .catch(() => {
        if (active) {
          setDisplayText(text);
          setDisplaySubtext(subtext);
          setIsTranslating(false);
        }
      });

    return () => {
      active = false;
    };
  }, [text, subtext, currentLang]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Handle Text-To-Speech toggling in current global language
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const fullSpeechText = displaySubtext
      ? `${displayText}. ${displaySubtext}`
      : displayText;

    cancelSpeechRef.current = speakRecommendation(
      fullSpeechText,
      currentLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Typography sizing
  const textSizeClasses =
    size === 'lg'
      ? 'text-base sm:text-lg font-bold'
      : size === 'sm'
      ? 'text-xs sm:text-sm font-semibold'
      : 'text-sm sm:text-base font-bold';

  return (
    <div
      className={`rounded-2xl transition-all ${
        compact
          ? 'p-3 bg-white/95 border border-emerald-200/90 shadow-2xs'
          : 'p-5 sm:p-6 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/90 shadow-xs'
      } ${className}`}
    >
      {/* Header Row: Title/Badge + Speaker Icon */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-emerald-100/80">
        <div className="flex items-center gap-2 flex-wrap">
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-700 text-white shadow-2xs">
              {badge}
            </span>
          )}
          {title && (
            <span className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{title}</span>
            </span>
          )}
        </div>

        {/* Speaker Icon: Reads text aloud in selected global language */}
        <button
          type="button"
          onClick={handleToggleSpeak}
          title={isSpeaking ? t('action.stopVoice', 'Stop Voice') : `${t('action.listenVoice', 'Listen (Voice)')} (${currentLang.toUpperCase()})`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
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

      {/* Main Recommendation Text */}
      <div className="pt-3.5">
        {isTranslating ? (
          <div className="flex items-center gap-2 text-emerald-800 text-xs py-1">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
            <span className="font-medium">
              {currentLang === 'hi'
                ? 'जेमिनी द्वारा हिन्दी में अनुवाद किया जा रहा है...'
                : 'जेमिनी द्वारा मराठीत भाषांतर केले जात आहे...'}
            </span>
          </div>
        ) : (
          <p className={`${textSizeClasses} text-slate-900 leading-relaxed`}>
            {showQuote && <span className="text-emerald-700 font-serif mr-1">&ldquo;</span>}
            {displayText}
            {showQuote && <span className="text-emerald-700 font-serif ml-1">&rdquo;</span>}
          </p>
        )}

        {/* Secondary context / reason line */}
        {displaySubtext && !isTranslating && (
          <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-emerald-100/70 leading-relaxed font-medium">
            {displaySubtext}
          </p>
        )}
      </div>
    </div>
  );
};

