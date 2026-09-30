import React from 'react';
import {
  Sprout,
  BrainCircuit,
  Cpu,
  Recycle,
  Flame,
  ArrowRight,
  Play,
  CheckCircle2,
  Droplets,
  CloudRain,
  ShieldCheck,
  BarChart3,
  Zap,
  UserCheck,
} from 'lucide-react';
import { NavPage } from '../types/agrifuel';
import {
  ImpactDashboardSection,
  ProblemVsSolutionSection,
  SystemArchitectureDiagram,
} from './ArchitectureAndImpact';
import { useLanguage } from '../context/LanguageContext';

interface LandingPageProps {
  onNavigate: (page: NavPage) => void;
  onStartJudgeTour: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onStartJudgeTour,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const coreCapabilities = [
    {
      title: t('cap.1.title', '1. AI Crop Intelligence'),
      desc: t('cap.1.desc', 'Upload real crop leaf photos for Gemini Multimodal analysis with a natural-first Priority 1/2/3 treatment hierarchy.'),
      icon: Sprout,
      target: 'crop-scanner' as NavPage,
      metric: t('Gemini Vision + Priority 1/2/3', 'Gemini Vision + Priority 1/2/3'),
    },
    {
      title: t('cap.2.title', '2. Smart Farm Advisory'),
      desc: t('cap.2.desc', 'Synthesize crop stage, soil moisture, and 7-day rain probability into clear irrigation and crop care decisions.'),
      icon: BrainCircuit,
      target: 'farm-advisor' as NavPage,
      metric: t('Multi-Signal Synthesis', 'Multi-Signal Synthesis'),
    },
    {
      title: t('cap.3.title', '3. IoT Sensor Monitoring'),
      desc: t('cap.3.desc', 'Real-time simulated ESP32 edge telemetry for soil moisture, temperature, humidity, and MQ-4 methane concentration indicators.'),
      icon: Cpu,
      target: 'iot-monitoring' as NavPage,
      metric: t('ESP32 Edge Ready', 'ESP32 Edge Ready'),
    },
    {
      title: t('cap.4.title', '4. Crop Residue Intelligence'),
      desc: t('cap.4.desc', 'Estimate post-harvest crop residue in tonnes/hectare and contribute biomass instead of open-field burning.'),
      icon: Recycle,
      target: 'residue-intelligence' as NavPage,
      metric: t('2.5t / 5-Acre Soybean', '2.5t / 5-Acre Soybean'),
    },
    {
      title: t('cap.5.title', '5. Farmer Energy Accounting'),
      desc: t('cap.5.desc', 'Track individual residue contributions (2.5t), energy earned (850 kWh), farm energy used (700 kWh), and monthly carry-forward (150 kWh).'),
      icon: Zap,
      target: 'farmer-resource-profile' as NavPage,
      metric: t('850 kWh Earned · 150 Carry-Fwd', '850 kWh Earned · 150 Carry-Fwd'),
    },
    {
      title: t('cap.6.title', '6. Community Bioenergy & FPO'),
      desc: t('cap.6.desc', 'Pool residue across village clusters for clean biogas (20,000 kWh/mo capacity) and audit 1,250 farmers in the FPO ledger.'),
      icon: Flame,
      target: 'community-bioenergy' as NavPage,
      metric: t('78% Plant Utilization', '78% Plant Utilization'),
    },
  ];

  const valueChainSteps = [
    { step: '01', label: t('vc.step1', 'FARM'), sub: `Rajesh Patil · 5 ${t('unit.acres', 'Acres')}` },
    { step: '02', label: t('vc.step2', 'IOT + AI SCANNER'), sub: t('Gemini Vision + Priority Care', 'Gemini Vision + Priority Care') },
    { step: '03', label: t('vc.step3', 'RESIDUE COLLECTION'), sub: `2.5t ${t('crop.Soybean', 'Soybean')} ${t('Biomass', 'Biomass')}` },
    { step: '04', label: t('vc.step4', 'COMMUNITY BIOGAS'), sub: `425 ${t('unit.m3', 'm³')} ${t('dash.biogasProduced', 'Biogas Generated')}` },
    { step: '05', label: t('vc.step5', 'ENERGY EARNED'), sub: `+850 ${t('unit.kwh', 'kWh')} ${t('Farmer Credit', 'Farmer Credit')}` },
    { step: '06', label: t('vc.step6', 'ENERGY USED'), sub: `-700 ${t('unit.kwh', 'kWh')} ${t('Irrigation & Equip', 'Irrigation & Equip')}` },
    { step: '07', label: t('vc.step7', 'CARRY FORWARD'), sub: `+150 ${t('unit.kwh', 'kWh')} ${t('hero.rollsToNext', 'Rolls to Next Month')}` },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-slate-900">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  {t('app.title', 'AGRI FUEL AI')}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono-tabular font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  🟢 {t('app.demoModeActive', 'DEMO MODE ACTIVE')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t('app.subtitle', 'Smart Agricultural Intelligence, Bioenergy & Farmer Energy Accounting')}
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#capabilities" className="hover:text-emerald-700 transition-colors">
              {t('Core Capabilities', 'Core Capabilities')}
            </a>
            <a href="#value-chain" className="hover:text-emerald-700 transition-colors">
              {t('Circular Energy Ledger', 'Circular Energy Ledger')}
            </a>
            <a href="#architecture" className="hover:text-emerald-700 transition-colors">
              {t('System Architecture', 'System Architecture')}
            </a>
            <a href="#impact" className="hover:text-emerald-700 transition-colors">
              {t('Impact & FPO Scale', 'Impact & FPO Scale')}
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Global Multilingual Selector Pill */}
            <div className="flex items-center gap-1 bg-[#F8FAF7] border border-slate-200 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English"
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'hi'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिन्दी (Hindi)"
              >
                🇮🇳 हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'mr'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="मराठी (Marathi)"
              >
                🇮🇳 मराठी
              </button>
            </div>

            <button
              type="button"
              onClick={onStartJudgeTour}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700" />
              <span>{t('nav.judgeTour', 'View Demo (Judge Flow)')}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <span>{t('action.explore', 'Explore Platform')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-14">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xs">
          {/* Left Column: Product Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono-tabular font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {t('hero.badge', 'CIRCULAR AGRITECH + BIOENERGY + FARMER LEDGER')}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono-tabular font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {t('app.prototypeNotice', 'Prototype Demo Mode – Sensor and energy values are simulated')}
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono-tabular uppercase tracking-widest font-bold text-emerald-700">
                {t('app.title', 'AGRI FUEL AI')}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                {t('hero.title1', 'Smart Agriculture.')}{' '}
                <span className="text-emerald-700">{t('hero.title2', 'Smarter Residue.')}</span>{' '}
                {t('hero.title3', 'Cleaner Energy.')}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {t('hero.description', 'An AI-powered agricultural intelligence platform that helps farmers monitor crops, optimize farm decisions, manage crop residue, and convert biomass into trackable community energy credits that carry forward across seasons.')}
              </p>
            </div>

            {/* Key Quote Banner (Section 15) */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-950">
              &ldquo;{t('hero.quote', 'AgriFuel AI turns crop residue into trackable community energy credits that farmers can use and carry forward across seasons.')}&rdquo;
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-all whitespace-nowrap"
              >
                <span>{t('hero.explore', 'Explore Platform')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onStartJudgeTour}
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-slate-800 bg-[#F8FAF7] hover:bg-slate-100 border border-slate-300 rounded-xl transition-all whitespace-nowrap"
              >
                <Play className="w-4 h-4 text-emerald-700 fill-emerald-700" />
                <span>{t('hero.viewDemo', 'View Demo (Judge Flow)')}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('farmer-resource-profile')}
                className="inline-flex items-center gap-2 px-4 py-3.5 text-xs font-bold text-emerald-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all whitespace-nowrap"
              >
                <UserCheck className="w-4 h-4 text-emerald-800" />
                <span>{t('hero.farmerAccount', 'Farmer Energy Account (F001)')}</span>
              </button>
            </div>

            {/* Stakeholder Pills */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {t('hero.forFarmers', 'For Farmers: Crop AI & Energy Ledger')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {t('hero.forFpos', 'For FPOs: Biogas & Farmer Credit Pool')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {t('hero.forGov', 'For Agriculture Dept: Zero-Burn Analytics')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Telemetry & Farmer Energy Account Card */}
          <div className="lg:col-span-5 bg-[#F8FAF7] border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-xs font-mono-tabular font-bold text-emerald-800">
                  {t('hero.livePreview', 'LIVE FARM & ENERGY LEDGER PREVIEW')}
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Rajesh Patil (ID: F001) · Shirur, Pune (5 {t('unit.acres', 'Acres')} · {t('crop.Soybean', 'Soybean')})
                </h2>
              </div>
              <span className="text-xs font-mono-tabular font-medium text-slate-500">
                {t('common.simulated', 'Simulated')}
              </span>
            </div>

            {/* Mini Telemetry + Energy Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{t('hero.cropHealth', 'Crop Health')}</span>
                  <Sprout className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-mono-tabular font-bold text-slate-900 mt-1">
                  87% <span className="text-xs font-semibold text-emerald-700">{t('status.good', 'Good')}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t('hero.priorityCareReady', 'Priority 1/2/3 Care Ready')}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{t('hero.soilWeather', 'Soil & Weather')}</span>
                  <Droplets className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-xl font-mono-tabular font-bold text-slate-900 mt-1">
                  42% <span className="text-xs font-semibold text-sky-700">· 65% {t('dash.rainProb', 'Rain')}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{t('advisor.delayAdvice', 'Delay Irrigation')}</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                  <span>{t('hero.residueEarned', 'Residue → Energy Earned')}</span>
                  <Recycle className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-xl font-mono-tabular font-bold text-emerald-800 mt-1">
                  2.5t → 850 <span className="text-xs font-medium">kWh</span>
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  {t('hero.communityBiogasCredit', 'Community Biogas Credit')}
                </div>
              </div>

              <div className="bg-emerald-950 text-white p-3.5 rounded-xl border border-emerald-800">
                <div className="flex items-center justify-between text-xs text-emerald-200 font-semibold">
                  <span>{t('hero.balanceCarry', 'Balance & Carry Forward')}</span>
                  <Zap className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-xl font-mono-tabular font-bold text-amber-300 mt-1">
                  150 <span className="text-xs font-medium text-white">kWh</span>
                </div>
                <div className="text-[11px] text-emerald-200 mt-0.5">
                  700 kWh {t('hero.rollsToNext', 'Used · Rolls to Next Month')}
                </div>
              </div>
            </div>

            {/* AI Synthesis Preview Box */}
            <div className="bg-emerald-950 text-white p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-tabular uppercase tracking-wider text-emerald-300 font-semibold">
                  {t('advisor.title', 'AI DECISION ENGINE + ENERGY LEDGER')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  {t('status.watch', 'STATUS: WATCH')}
                </span>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed">
                &ldquo;{t('advisor.delayAdvice', 'Delay irrigation (42% moisture, 65% rain prob). Contribute 2.5t soybean residue for 850 kWh energy credit; 150 kWh unused balance carries forward.')}&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* CORE CONCEPT VALUE CHAIN FLOW */}
        <section
          id="value-chain"
          className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <span className="text-xs font-mono-tabular uppercase tracking-wider font-semibold text-emerald-700">
                {t('CIRCULAR AGRICULTURAL + BIOENERGY + ACCOUNTING PIPELINE', 'CIRCULAR AGRICULTURAL + BIOENERGY + ACCOUNTING PIPELINE')}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {t('vc.title', 'From Field Sensor to Carry-Forward Farmer Energy Credits')}
              </h2>
            </div>
            <span className="text-xs font-mono-tabular text-slate-500">
              {t('7-Stage Integrated Value Chain', '7-Stage Integrated Value Chain')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {valueChainSteps.map((v) => (
              <div
                key={v.step}
                className="p-3.5 rounded-xl bg-[#F8FAF7] border border-slate-200/90 flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono-tabular font-bold text-emerald-700">
                  {v.step}
                </span>
                <div className="my-2">
                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    {v.label}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{v.sub}</div>
                </div>
                <div className="h-1 w-full bg-emerald-600/20 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6 CORE CAPABILITIES */}
        <section id="capabilities" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-mono-tabular uppercase tracking-wider font-semibold text-emerald-700">
                {t('PLATFORM MODULES', 'PLATFORM MODULES')}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {t('cap.title', '6 Core Capabilities Driving Agricultural & Bioenergy Intelligence')}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 self-start sm:self-auto"
            >
              <span>{t('Open Full Workspace', 'Open Full Workspace')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreCapabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  onClick={() => onNavigate(cap.target)}
                  className="group cursor-pointer bg-white border border-slate-200/90 hover:border-emerald-600/50 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-2xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono-tabular font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                        {cap.metric}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                    <span>{t('action.launch', 'Launch Module')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROBLEM VS SOLUTION SECTION */}
        <section className="space-y-4">
          <ProblemVsSolutionSection />
        </section>

        {/* SYSTEM ARCHITECTURE SECTION */}
        <section id="architecture">
          <SystemArchitectureDiagram />
        </section>

        {/* FINAL IMPACT DASHBOARD */}
        <section id="impact">
          <ImpactDashboardSection />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 mt-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">
              {t('app.title', 'AgriFuel AI')} — {t('app.subtitle', 'Smart Agricultural Intelligence, Bioenergy & Farmer Energy Ledger')}
            </span>
            <span>· Hackathon Prototype v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-tabular text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
              {t('app.prototypeNotice', 'Prototype Demo Mode – Sensor and energy values are simulated')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
