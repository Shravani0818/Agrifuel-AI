import React, { useState } from 'react';
import {
  Droplets,
  Sprout,
  CloudSun,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  CropStage,
  CropType,
  FarmProfile,
  IoTState,
  NavPage,
  WeatherData,
} from '../types/agrifuel';
import { MultilingualRecommendation } from './MultilingualRecommendation';
import { AIInsightCard } from './AIInsightCard';
import { useLanguage } from '../context/LanguageContext';

interface FarmAdvisorViewProps {
  profile: FarmProfile;
  iot: IoTState;
  weather: WeatherData;
  onNavigate: (page: NavPage) => void;
}

const CROPS: CropType[] = ['Soybean', 'Wheat', 'Rice', 'Cotton', 'Maize'];
const STAGES: CropStage[] = [
  'Seedling',
  'Vegetative',
  'Flowering',
  'Fruiting',
  'Harvest',
];

export const FarmAdvisorView: React.FC<FarmAdvisorViewProps> = ({
  profile,
  iot,
  weather,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [crop, setCrop] = useState<CropType>(profile.primaryCrop || 'Soybean');
  const [stage, setStage] = useState<CropStage>('Vegetative');
  const [soilMoisture, setSoilMoisture] = useState<number>(iot.soilMoisture || 42);
  const [temperature, setTemperature] = useState<number>(weather.temperature || 28);
  const [humidity, setHumidity] = useState<number>(weather.humidity || 67);
  const [rainProbability, setRainProbability] = useState<number>(
    weather.rainProbability || 65
  );

  const handleResetDefaults = () => {
    setCrop('Soybean');
    setStage('Vegetative');
    setSoilMoisture(42);
    setTemperature(28);
    setHumidity(67);
    setRainProbability(65);
  };

  let farmStatus: 'WATCH' | 'OPTIMAL' | 'ACTION NEEDED' = 'WATCH';
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  if (soilMoisture < 30 && rainProbability < 40) {
    farmStatus = 'ACTION NEEDED';
    riskLevel = 'HIGH';
  } else if (rainProbability >= 55 && soilMoisture >= 35) {
    farmStatus = 'WATCH';
    riskLevel = 'LOW';
  } else if (temperature >= 35) {
    farmStatus = 'WATCH';
    riskLevel = 'MEDIUM';
  } else {
    farmStatus = 'OPTIMAL';
    riskLevel = 'LOW';
  }

  const waterAdvice =
    language === 'mr'
      ? 'सिंचन पुढे ढकला.'
      : language === 'hi'
      ? 'सिंचाई टालें।'
      : 'Delay irrigation.';

  const cropAdvice =
    language === 'mr'
      ? 'खालची पाने तपासा.'
      : language === 'hi'
      ? 'निचली पत्तियों की जाँच करें।'
      : 'Inspect lower leaves.';

  const weatherAdvice =
    language === 'mr'
      ? 'उद्या पाऊस पडेल.'
      : language === 'hi'
      ? 'कल बारिश की संभावना।'
      : 'Rain tomorrow.';

  const initialHeadline =
    language === 'mr'
      ? 'आज पाणी देणे पुढे ढकला'
      : language === 'hi'
      ? 'आज सिंचाई टालें'
      : 'Delay irrigation today';

  const initialAction =
    language === 'mr'
      ? 'पुढील २४ तासांत पाऊस पडण्याची शक्यता आहे आणि जमिनीतील ओलावा पुरेसा आहे. पाणी देणे पुढे ढकलल्याने पाण्याची बचत होईल.'
      : language === 'hi'
      ? 'अगले 24 घंटों में बारिश की संभावना है और वर्तमान में मिट्टी में पर्याप्त नमी है। कल तक प्रतीक्षा करने से पानी की बचत होगी।'
      : 'Rain is likely within 24 hours, and current soil moisture is sufficient. Waiting until tomorrow can help conserve water.';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono-tabular font-semibold text-emerald-700">
            {t('advisor.title', 'SMART FARM ADVISOR')}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {t('nav.farmAdvisor', 'Smart Farm Advisor')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('advisor.subtitle', 'Adjust field parameters below or use the live Pune demo preset to generate actionable Water, Crop, and Weather recommendations.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('crop-scanner')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F8FAF7] border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('action.back', 'Back')}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('iot-monitoring')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap"
          >
            <span>{t('action.next', 'Next')}: {t('nav.iotMonitoring', 'IoT Monitoring')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-medium text-emerald-700">
                {t('advisor.simulator', 'Interactive Field Simulator')}
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('advisor.inputParams', 'Advisory Input Parameters')}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-[#F8FAF7] border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('action.reset', 'Reset Demo')}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('dash.primaryCrop', 'Crop')}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as CropType)}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#F8FAF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {t('crop.' + c, c)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('dash.growthStage', 'Crop Stage')}
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as CropStage)}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#F8FAF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {t('stage.' + s, s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">{t('dash.soilMoisture', 'Soil Moisture')}</span>
                <span className="font-mono-tabular font-bold text-slate-900">
                  {soilMoisture}%
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={85}
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">{t('dash.temperature', 'Temperature')}</span>
                <span className="font-mono-tabular font-bold text-slate-900">
                  {temperature}°C
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={42}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">{t('dash.humidity', 'Humidity')}</span>
                <span className="font-mono-tabular font-bold text-slate-900">
                  {humidity}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={95}
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">{t('dash.rainProb', 'Rain Probability')}</span>
                <span className="font-mono-tabular font-bold text-sky-700">
                  {rainProbability}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={rainProbability}
                onChange={(e) => setRainProbability(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-mono-tabular text-emerald-700 font-semibold">
                  {t('advisor.title', 'ADVISORY SYNTHESIS')}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {t('advisor.primaryRec', 'Primary Farm Recommendation')}
                </h2>
              </div>

              <div className="flex items-center gap-4 font-mono-tabular">
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">{t('advisor.farmStatus', 'Farm Status')}</div>
                  <div
                    className={`text-sm font-bold ${
                      farmStatus === 'OPTIMAL'
                        ? 'text-emerald-700'
                        : farmStatus === 'WATCH'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {farmStatus === 'OPTIMAL' ? t('status.optimal', 'OPTIMAL') : farmStatus === 'WATCH' ? t('status.watch', 'WATCH') : t('status.alert', 'ACTION NEEDED')}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">{t('advisor.risk', 'Risk')}</div>
                  <div className="text-sm font-bold text-slate-900">
                    {riskLevel === 'LOW' ? t('scanner.risk.low', 'LOW') : riskLevel === 'MEDIUM' ? t('scanner.risk.medium', 'MEDIUM') : t('scanner.risk.high', 'HIGH')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <AIInsightCard
                title={t('ai.insight', 'AI Insight')}
                initialHeadline={initialHeadline}
                initialAction={initialAction}
                initialConfidence={93}
                farmData={{
                  crop,
                  growthStage: stage,
                  soilMoisture,
                  temperature,
                  humidity,
                  rainProbability,
                  location: profile.location,
                  farmSize: profile.farmAreaAcres,
                  context: 'farm-advisor',
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">💧 {t('advisor.water', 'Water')}</span>
                    <Droplets className="w-4 h-4 text-sky-600" />
                  </div>
                  <p className="text-base font-semibold text-slate-900 mt-2.5">
                    {waterAdvice}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-200/60 text-[11px] font-mono-tabular text-slate-500">
                  {t('dash.soilMoisture', 'Soil Moisture')}: {soilMoisture}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">🌱 {t('advisor.crop', 'Crop')}</span>
                    <Sprout className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-base font-semibold text-slate-900 mt-2.5">
                    {cropAdvice}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-200/60 text-[11px] font-mono-tabular text-slate-500">
                  {t('crop.' + crop, crop)} ({t('stage.' + stage, stage)})
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">🌦 {t('advisor.weather', 'Weather')}</span>
                    <CloudSun className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-base font-semibold text-slate-900 mt-2.5">
                    {weatherAdvice}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-200/60 text-[11px] font-mono-tabular text-slate-500">
                  {t('dash.rainProb', 'Rain Prob')}: {rainProbability}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-mono-tabular font-semibold text-slate-600">
                  {weather.location}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('advisor.forecastTitle', '7-Day Forecast & Rain Probability Chart')}
                </h3>
              </div>
              <span className="text-xs font-mono-tabular text-slate-500">
                {t('dash.windSpeed', 'Wind')}: {weather.windSpeed} km/h
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weather.forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748B" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748B" />
                  <Tooltip />
                  <Bar
                    dataKey="rainProb"
                    name={t('dash.rainProb', 'Rain Probability (%)')}
                    fill="#0284C7"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
