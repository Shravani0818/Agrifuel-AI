import React, { useState } from 'react';
import {
  User,
  MapPin,
  Sprout,
  Save,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { CropType, FarmProfile, NavPage } from '../types/agrifuel';
import { DEFAULT_FARM_PROFILE, calculateResidueMetrics } from '../data/demoData';
import { useLanguage } from '../context/LanguageContext';

interface FarmProfileViewProps {
  profile: FarmProfile;
  onSaveProfile: (updated: FarmProfile) => void;
  onResetProfile: () => void;
  onNavigate: (page: NavPage) => void;
}

const CROPS: CropType[] = ['Soybean', 'Wheat', 'Rice', 'Cotton', 'Maize'];
const SOIL_TYPES = [
  'Black Soil',
  'Alluvial Soil',
  'Red Loamy Soil',
  'Clay Loam',
  'Laterite Soil',
];
const IRRIGATION_TYPES = [
  'Rainfed',
  'Drip Irrigation',
  'Sprinkler',
  'Canal / Surface',
  'Borewell + Drip',
];

export const FarmProfileView: React.FC<FarmProfileViewProps> = ({
  profile,
  onSaveProfile,
  onResetProfile,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [formState, setFormState] = useState<FarmProfile>(profile);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formState);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleReset = () => {
    setFormState(DEFAULT_FARM_PROFILE);
    onResetProfile();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const residuePreview = calculateResidueMetrics(
    formState.primaryCrop,
    formState.farmAreaAcres
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono-tabular font-semibold text-emerald-700">
            {t('nav.farmProfile', 'FARM PROFILE')}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {t('nav.farmProfile', 'Farm Profile')} &amp; {t('settings.title', 'Agronomic Configuration')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('settings.subtitle', 'Edit farmer identity, location, acreage, crop, soil, and irrigation details.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F8FAF7] border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('action.back', 'Back to Dashboard')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-medium text-emerald-700">
                {t('nav.farmProfile', 'Farm Record')}
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('action.save', 'Update Farm Details')}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-[#F8FAF7] border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('action.reset', 'Reset to Default Demo')}</span>
            </button>
          </div>

          {savedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {t('profile.savedNotice', 'Farm profile saved to localStorage and synced across AgriFuel AI modules.')}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('profile.farmerName', 'Farmer Name')}
              </label>
              <input
                type="text"
                required
                value={formState.farmerName}
                onChange={(e) =>
                  setFormState({ ...formState, farmerName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('app.location', 'Location')}
              </label>
              <input
                type="text"
                required
                value={formState.location}
                onChange={(e) =>
                  setFormState({ ...formState, location: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('dash.farmArea', 'Farm Area (Acres)')}
              </label>
              <input
                type="number"
                min={0.5}
                max={500}
                step={0.5}
                required
                value={formState.farmAreaAcres}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    farmAreaAcres: Math.max(0.5, Number(e.target.value) || 1),
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm font-mono-tabular bg-[#F8FAF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('dash.primaryCrop', 'Primary Crop')}
              </label>
              <select
                value={formState.primaryCrop}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    primaryCrop: e.target.value as CropType,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
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
                {t('dash.soilType', 'Soil Type')}
              </label>
              <select
                value={formState.soilType}
                onChange={(e) =>
                  setFormState({ ...formState, soilType: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                {SOIL_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {t(s, s)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('profile.irrigationType', 'Irrigation Type')}
              </label>
              <select
                value={formState.irrigationType}
                onChange={(e) =>
                  setFormState({ ...formState, irrigationType: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                {IRRIGATION_TYPES.map((i) => (
                  <option key={i} value={i}>
                    {t(i, i)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{t('profile.saveButton', 'Save Profile to localStorage')}</span>
            </button>
          </div>
        </form>

        {/* Live Summary Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <div className="text-xs font-mono-tabular font-semibold text-emerald-700">
                {t('profile.activeSummary', 'ACTIVE FARM SUMMARY')}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {formState.farmerName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{formState.location}</p>
            </div>

            <div className="divide-y divide-slate-200/70 mt-4 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">{t('profile.farmerName', 'Farmer Name')}</span>
                <span className="font-semibold text-slate-900">{formState.farmerName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">{t('app.location', 'Location')}</span>
                <span className="font-semibold text-slate-900">{formState.location}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">{t('dash.farmArea', 'Farm Area')}</span>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {formState.farmAreaAcres} {t('unit.acres', 'Acres')} ({residuePreview.areaHectares} ha)
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">{t('dash.primaryCrop', 'Primary Crop')}</span>
                <span className="font-semibold text-emerald-800">{t('crop.' + formState.primaryCrop, formState.primaryCrop)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">{t('dash.soilType', 'Soil Type')}</span>
                <span className="font-semibold text-slate-900">{t(formState.soilType, formState.soilType)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">{t('profile.irrigationType', 'Irrigation Type')}</span>
                <span className="font-semibold text-slate-900">{t(formState.irrigationType, formState.irrigationType)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">{t('residue.estimatedResidue', 'Estimated Residue Potential')}</span>
                <span className="font-mono-tabular font-bold text-emerald-700">
                  {residuePreview.estimatedResidueTonnes} {t('unit.tonnes', 'tonnes')} ({formState.farmAreaAcres} ac × {residuePreview.coefficientTonnesPerAcre} t/ac)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-mono-tabular text-slate-500">
            {t('profile.persistedNotice', 'Persisted in browser localStorage')}
          </div>
        </div>
      </div>
    </div>
  );
};
