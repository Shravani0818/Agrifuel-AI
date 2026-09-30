import React, { useState } from 'react';
import {
  Recycle,
  ArrowRight,
  ArrowLeft,
  Flame,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  Scale,
  PlusCircle,
  Zap,
  UserCheck,
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
  CropType,
  EnergyConversionCoefficients,
  FarmerEnergyAccount,
  NavPage,
} from '../types/agrifuel';
import {
  CROP_RESIDUE_TYPES,
  RESIDUE_COEFFICIENTS_TONNES_PER_ACRE,
  RESIDUE_COEFFICIENTS_TONNES_PER_HA,
  calculateEnergyFromResidue,
  calculateResidueMetrics,
} from '../data/demoData';
import { MultilingualRecommendation } from './MultilingualRecommendation';
import { useLanguage } from '../context/LanguageContext';

interface ResidueIntelligenceViewProps {
  defaultCrop: CropType;
  defaultAreaAcres: number;
  energyAccount: FarmerEnergyAccount;
  coefficients: EnergyConversionCoefficients;
  onContributeResidue: (
    crop: CropType,
    quantityTonnes: number,
    dateLabel: string
  ) => void;
  onNavigate: (page: NavPage) => void;
}

const CROPS: CropType[] = ['Soybean', 'Wheat', 'Rice', 'Cotton', 'Maize'];

const SUITABILITY_FACTORS = [
  {
    factor: 'Moisture Content',
    detail: 'Optimal anaerobic digestion requires controlled moisture & C:N ratio.',
  },
  {
    factor: 'Collection Feasibility',
    detail: 'Mechanized or community-pooled baling within harvest window.',
  },
  {
    factor: 'Storage Conditions',
    detail: 'Dry covered storage to prevent fungal spoilage before digestion.',
  },
  {
    factor: 'Contamination Level',
    detail: 'Free from soil stones, plastic twine, or heavy chemical residue.',
  },
  {
    factor: 'Pre-Treatment Needs',
    detail: 'Chopping/shredding to 10–20mm particle size for faster microbial breakdown.',
  },
];

export const ResidueIntelligenceView: React.FC<ResidueIntelligenceViewProps> = ({
  defaultCrop,
  defaultAreaAcres,
  energyAccount,
  coefficients,
  onContributeResidue,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [crop, setCrop] = useState<CropType>(defaultCrop);
  const [areaAcres, setAreaAcres] = useState<number>(defaultAreaAcres);
  const [contributionConfirmed, setContributionConfirmed] = useState<string | null>(null);

  // Direct mathematical calculation: farm area × residue coefficient gives displayed residue
  const calculated = calculateResidueMetrics(crop, areaAcres);
  const displayResidueTonnes = calculated.estimatedResidueTonnes;
  const displayBiomassTonnes = calculated.potentialBiomassTonnes;
  const displayFeedstockTonnes = calculated.potentialFeedstockTonnes;

  // Calculate Energy Credit from displayResidueTonnes using configurable coefficients
  const energyConversion = calculateEnergyFromResidue(displayResidueTonnes, coefficients);

  const comparisonData = CROPS.map((c) => {
    const m = calculateResidueMetrics(c, areaAcres);
    const e = calculateEnergyFromResidue(m.estimatedResidueTonnes, coefficients);
    return {
      crop: c,
      residueTonnes: m.estimatedResidueTonnes,
      feedstockTonnes: m.potentialFeedstockTonnes,
      energyKwh: e.farmerEnergyCreditKwh,
    };
  });

  const handleRecordContribution = () => {
    onContributeResidue(crop, displayResidueTonnes, 'Sep 27');
    setContributionConfirmed(
      `${t('action.save', 'Recorded')} ${displayResidueTonnes} ${t('unit.tonnes', 'tonnes')} (${t('crop.' + crop, crop)}) → +${energyConversion.farmerEnergyCreditKwh} ${t('unit.kwh', 'kWh')} ${t('profile.accountNo', 'Account')}!`
    );
    setTimeout(() => setContributionConfirmed(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-tabular uppercase font-semibold text-emerald-700">
              {t('residue.title', 'CROP RESIDUE INTELLIGENCE & BIOMASS CONTRIBUTION')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {t('residue.calculator', 'Post-Harvest Biomass Estimator & Farmer Energy Contribution')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('residue.subtitle', 'Estimate post-harvest crop residue and record contributions directly into the farmer community bioenergy account instead of open-field burning.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('farm-advisor')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F8FAF7] border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('action.back', 'Back')}: {t('nav.farmAdvisor', 'Advisor')}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('farmer-resource-profile')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <span>{t('action.next', 'Next')}: {t('nav.farmerResourceProfile', 'Farmer Energy Profile')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inputs + Coefficient Table */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('residue.farmCropParams', '1. Farm & Crop Parameters')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('residue.farmCropParamsDesc', 'Calculation: Farm Area (Acres) × Residue Coefficient (Tonnes/Acre) = Estimated Gross Residue.')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {t('dash.primaryCrop', 'Select Crop')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CROPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCrop(c)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    crop === c
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-[#F8FAF7] text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {t('crop.' + c, c)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="residue-acres-input"
                className="text-xs font-semibold text-slate-700"
              >
                {t('dash.farmArea', 'Farm Area (Acres)')}
              </label>
              <span className="text-xs font-mono-tabular font-semibold text-emerald-700">
                {areaAcres} {t('unit.acres', 'acres')} ({calculated.areaHectares} {t('unit.hectares', 'ha')})
              </span>
            </div>
            <input
              id="residue-acres-input"
              type="range"
              min={1}
              max={50}
              step={0.5}
              value={areaAcres}
              onChange={(e) => setAreaAcres(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] font-mono-tabular text-slate-400 mt-1">
              <span>1 {t('unit.acres', 'Acre')}</span>
              <button
                type="button"
                onClick={() => {
                  setCrop('Soybean');
                  setAreaAcres(5);
                }}
                className="text-emerald-700 font-semibold hover:underline"
              >
                {t('residue.reset5Acre', 'Reset to 5-Acre Soybean Demo')}
              </button>
              <span>50 {t('unit.acres', 'Acres')}</span>
            </div>
          </div>

          {/* Prototype Coefficients Table */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('residue.demoCoefficients', 'Crop Residue Yield Coefficients (Tonnes / Acre)')}</span>
              </span>
              <span className="text-[10px] font-mono-tabular px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {t('residue.multiplierBadge', 'Area × Coeff')}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center">
              {CROPS.map((c) => (
                <div
                  key={c}
                  className={`p-2 rounded-lg border ${
                    crop === c
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-[#F8FAF7] border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-semibold">{t('crop.' + c, c)}</div>
                  <div className="text-xs font-mono-tabular font-bold mt-0.5">
                    {RESIDUE_COEFFICIENTS_TONNES_PER_ACRE[c].toFixed(2)}
                  </div>
                  <div className="text-[9px] text-slate-500">t/acre</div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-2">
              {t('residue.comparisonTitle', 'Residue Comparison Across Crops')} ({areaAcres} {t('unit.acres', 'Acres')})
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="crop" tick={{ fontSize: 11 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748B" unit="t" />
                  <Tooltip />
                  <Bar
                    dataKey="residueTonnes"
                    name={t('residue.estResidueT', 'Est. Residue (t)')}
                    fill="#047857"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="feedstockTonnes"
                    name={t('residue.biogasFeedstockT', 'Biogas Feedstock (t)')}
                    fill="#0D9488"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Residue Output + Section 2 Residue Contribution to Farmer Energy Account */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-mono-tabular uppercase font-semibold text-emerald-700">
                  {t('residue.estimatedBiomassOutput', 'ESTIMATED BIOMASS OUTPUT')}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {t('crop.' + crop, crop)} — {areaAcres} {t('unit.acres', 'Acres')} ({calculated.areaHectares} ha)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono-tabular font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {t('residue.transparentModel', 'Formula: Area × Coeff')}
                </span>
              </div>
            </div>

            {/* Direct Formula Calculation Display */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-emerald-950">
                <Scale className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold">{t('residue.formulaVerification', 'Direct Calculation:')}</span>
                <span className="font-mono-tabular bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold text-emerald-900">
                  {areaAcres} {t('unit.acres', 'acres')} × {calculated.coefficientTonnesPerAcre.toFixed(2)} t/acre = {displayResidueTonnes} {t('unit.tonnes', 'tonnes')}
                </span>
              </div>
              <span className="text-[11px] text-emerald-800 font-medium">
                {t('crop.' + crop, crop)} ({CROP_RESIDUE_TYPES[crop]})
              </span>
            </div>

            {/* 3 Primary Output Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90">
                <div className="text-xs font-semibold text-slate-500">
                  {t('residue.estimatedResidue', 'Estimated Crop Residue')}
                </div>
                <div className="text-2xl font-mono-tabular font-bold text-slate-900 mt-2">
                  {displayResidueTonnes}{' '}
                  <span className="text-sm font-normal text-slate-600">{t('unit.tonnes', 'tonnes')}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">
                  {areaAcres} ac × {calculated.coefficientTonnesPerAcre.toFixed(2)} t/ac
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90">
                <div className="text-xs font-semibold text-slate-500">{t('residue.potentialBiomass', 'Potential Biomass')}</div>
                <div className="text-2xl font-mono-tabular font-bold text-slate-900 mt-2">
                  {displayBiomassTonnes}{' '}
                  <span className="text-sm font-normal text-slate-600">{t('unit.tonnes', 'tonnes')}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-1">
                  {t('residue.collectibleMatter', 'Collectible dry matter (~85%)')}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="text-xs font-semibold text-emerald-900">
                  {t('residue.biogasFeedstock', 'Potential Biogas Feedstock')}
                </div>
                <div className="text-2xl font-mono-tabular font-bold text-emerald-800 mt-2">
                  {displayFeedstockTonnes}{' '}
                  <span className="text-sm font-normal text-emerald-700">{t('unit.tonnes', 'tonnes')}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">
                  {t('residue.eligibleDigester', 'Eligible for community digester (~80%)')}
                </div>
              </div>
            </div>

            {/* Clear Prototype Assumptions Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t('residue.assumptionsTitle', 'Prototype Estimation Assumptions & Model Rules')}</span>
              </div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>
                  <strong>{t('residue.assumption1Title', 'Direct Yield Equation')}:</strong>{' '}
                  {t('residue.assumption1Desc', 'Residue (tonnes) = Farm Area (acres) × Crop Yield Coefficient (t/acre).')}
                </li>
                <li>
                  <strong>{t('residue.assumption2Title', 'Field Conservation Factor')}:</strong>{' '}
                  {t('residue.assumption2Desc', '15% of biomass is retained on field as stubble mulch for soil moisture & erosion control; 85% is collectible.')}
                </li>
                <li>
                  <strong>{t('residue.assumption3Title', 'Anaerobic Digestion Factor')}:</strong>{' '}
                  {t('residue.assumption3Desc', '80% of gross residue is processed into eligible fine feedstock; coarse woody parts are directed to composting.')}
                </li>
                <li>
                  <strong>{t('residue.assumption4Title', 'Energy Yield Equivalence')}:</strong>{' '}
                  {t('residue.assumption4Desc', 'Each eligible feedstock tonne generates ~212.5 m³ biogas, converting to 2.0 kWh electricity per m³ biogas.')}
                </li>
              </ul>
            </div>

            {/* ============================================================ */}
            {/* SECTION 2: RECORD RESIDUE CONTRIBUTION TO ENERGY ACCOUNT     */}
            {/* ============================================================ */}
            <div className="p-5 rounded-2xl bg-emerald-950 text-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-800">
                <div>
                  <div className="text-[11px] font-mono-tabular font-bold text-emerald-300 uppercase">
                    SECTION 2 · {t('residue.title', 'CONNECT RESIDUE TO FARMER ENERGY ACCOUNT')}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {t('residue.contributeButton', 'Contribute Crop Residue to Community Bioenergy System')}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-mono-tabular font-semibold bg-emerald-800 text-emerald-100">
                  {t('app.farmer', 'Farmer')} ID: {energyAccount.farmerId} ({energyAccount.farmerName})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-900/70 border border-emerald-800">
                  <div className="text-emerald-300 text-[11px]">{t('profile.date', 'Date')}</div>
                  <div className="font-mono-tabular font-bold text-white mt-0.5">
                    September 27, 2026
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/70 border border-emerald-800">
                  <div className="text-emerald-300 text-[11px]">{t('dash.primaryCrop', 'Crop')} &amp; {t('dash.soilType', 'Type')}</div>
                  <div className="font-bold text-white mt-0.5 truncate" title={CROP_RESIDUE_TYPES[crop]}>
                    {t('crop.' + crop, crop)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/70 border border-emerald-800">
                  <div className="text-emerald-300 text-[11px]">{t('residue.stubbleGenerated', 'Residue Quantity')}</div>
                  <div className="font-mono-tabular font-bold text-amber-300 mt-0.5">
                    {displayResidueTonnes} {t('unit.tonnes', 'tonnes')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/70 border border-emerald-800">
                  <div className="text-emerald-300 text-[11px]">{t('profile.status', 'Status')}</div>
                  <div className="font-bold text-emerald-300 mt-0.5">{t('status.optimal', 'Collected')}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-800 border border-emerald-600 col-span-2 sm:col-span-1">
                  <div className="text-emerald-200 text-[11px]">{t('profile.totalEarned', 'Energy Potential')}</div>
                  <div className="font-mono-tabular font-bold text-white text-sm mt-0.5">
                    +{energyConversion.farmerEnergyCreditKwh} {t('unit.kwh', 'kWh')}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs text-emerald-200">
                  {t('profile.passbookHeading', 'Current Cumulative Account')}:{' '}
                  <strong className="font-mono-tabular text-white">
                    {energyAccount.residueContributionTonnes} {t('unit.tonnes', 'tonnes')}
                  </strong>{' '}
                  ·{' '}
                  <strong className="font-mono-tabular text-amber-300">
                    {energyAccount.energyEarnedKwh} {t('unit.kwh', 'kWh')}
                  </strong>{' '}
                  {t('profile.totalEarned', 'earned')}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleRecordContribution}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-colors shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>
                      {t('action.recordResidue', 'Record Contribution')} (+
                      {energyConversion.farmerEnergyCreditKwh} {t('unit.kwh', 'kWh')})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('farmer-resource-profile')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{t('nav.farmerResourceProfile', 'View Energy Account')}</span>
                  </button>
                </div>
              </div>

              {contributionConfirmed && (
                <div className="p-3 rounded-xl bg-emerald-800/90 border border-emerald-500 text-xs font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{contributionConfirmed}</span>
                </div>
              )}
            </div>

            {/* Visual Flow */}
            <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90">
              <div className="text-xs font-mono-tabular uppercase font-semibold text-slate-500 mb-3">
                {t('residue.valueChainPipeline', 'VALUE CHAIN TRANSFORMATION PIPELINE')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                  <Sprout className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">{t('vc.step1', 'CROP')}</div>
                  <div className="text-[11px] text-slate-500">
                    {t('crop.' + crop, crop)} ({areaAcres} {t('unit.acres', 'ac')})
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                  <Recycle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">{t('vc.step3', 'RESIDUE')}</div>
                  <div className="text-[11px] font-mono-tabular text-slate-600">
                    {displayResidueTonnes} {t('unit.tonnes', 't')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">{t('vc.collection', 'COLLECTION')}</div>
                  <div className="text-[11px] font-mono-tabular text-slate-600">
                    {displayFeedstockTonnes} {t('unit.tonnes', 't')} {t('residue.eligible', 'eligible')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                  <Flame className="w-4 h-4 text-teal-700 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">{t('vc.step4', 'BIOGAS')}</div>
                  <div className="text-[11px] font-mono-tabular text-teal-700">
                    ~{energyConversion.estimatedBiogasM3} m³
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950 text-white text-center">
                  <Zap className="w-4 h-4 text-amber-300 mx-auto mb-1" />
                  <div className="text-xs font-bold">{t('vc.energyCredit', 'ENERGY CREDIT')}</div>
                  <div className="text-[11px] font-mono-tabular text-emerald-200">
                    +{energyConversion.farmerEnergyCreditKwh} kWh
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation & Suitability Note */}
            <MultilingualRecommendation
              title={t('residue.advisoryTitle', 'AgriFuel AI Residue Recommendation')}
              badge={t('residue.advisoryBadge', 'BIOENERGY ADVISORY')}
              text={t('residue.recText', 'Evaluate crop residue collection for community bioenergy pathways instead of burning — and earn trackable kWh credits in your Farmer Energy Account.')}
              subtext={`${t('residue.estimatedPotential', 'Estimated potential')}: ~${energyConversion.estimatedBiogasM3} m³ ${t('vc.step4', 'biogas')} ${t('profile.and', 'and')} +${energyConversion.farmerEnergyCreditKwh} kWh ${t('profile.credits', 'energy credits')} ${t('profile.from', 'from')} ${displayResidueTonnes}t ${t('residue.stubbleGenerated', 'residue')}.`}
              size="md"
              showQuote
            />

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {t('residue.engineeringNote', 'Important Engineering Note: Crop residue suitability for biogas depends on:')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUITABILITY_FACTORS.map((item) => (
                  <div
                    key={item.factor}
                    className="p-2.5 rounded-lg bg-white/90 border border-amber-200/80 text-xs"
                  >
                    <div className="font-bold text-slate-900">• {t(item.factor, item.factor)}</div>
                    <div className="text-slate-600 mt-0.5">{t(item.detail, item.detail)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
