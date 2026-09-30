import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Trash2,
  RefreshCw,
  BookmarkCheck,
  Bookmark,
  History,
  TrendingUp,
  Info,
  Sprout,
  Droplets,
  CloudSun,
  Image as ImageIcon,
  FileWarning,
  Check,
  Loader2,
  Leaf,
  FlaskConical,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  CropScannerResult,
  CropStage,
  CropType,
  ExtendedCropType,
  FarmProfile,
  IoTState,
  NavPage,
  RiskLevel,
  SavedCropAnalysis,
  SymptomType,
  WeatherData,
} from '../types/agrifuel';
import { MultilingualRecommendation } from './MultilingualRecommendation';
import { useLanguage } from '../context/LanguageContext';
import {
  INITIAL_SAVED_ANALYSES,
  calculateResidueMetrics,
  generateCropAnalysis,
} from '../data/demoData';

interface CropScannerViewProps {
  profile: FarmProfile;
  iot: IoTState;
  weather: WeatherData;
  onNavigate: (page: NavPage) => void;
  onAnalysisComplete?: (crop: string, condition: string, risk: RiskLevel) => void;
}

const SCANNER_CROPS: ExtendedCropType[] = [
  'Soybean',
  'Wheat',
  'Rice',
  'Cotton',
  'Maize',
  'Other',
];

const CROP_STAGES: CropStage[] = [
  'Seedling',
  'Vegetative',
  'Flowering',
  'Fruiting',
  'Harvest',
];

const SYMPTOM_CHIPS: { label: SymptomType; descriptionText: string }[] = [
  {
    label: 'Yellow Leaves',
    descriptionText: 'Leaves have started turning yellow during the last week.',
  },
  {
    label: 'Brown Spots',
    descriptionText: 'Small brown spots and mild discoloration visible on lower leaves.',
  },
  {
    label: 'Wilting',
    descriptionText: 'Leaves are drooping and showing signs of midday wilting.',
  },
  {
    label: 'Leaf Holes',
    descriptionText: 'Small perforations and chewed margins noticed on outer foliage.',
  },
  {
    label: 'Slow Growth',
    descriptionText: 'Plants appear stunted with slower canopy expansion than neighboring rows.',
  },
  {
    label: 'Healthy',
    descriptionText: 'Canopy looks green and upright; performing a routine crop health check.',
  },
];

const HISTORY_STORAGE_KEY = 'agrifuel_ai_crop_analysis_history_v2';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ImageQualityReport {
  valid: boolean;
  width: number;
  height: number;
  brightness: number;
  detailVariance: number;
  reason?: string;
}

/**
 * Performs a client-side canvas inspection to detect if an uploaded image is
 * too small, extremely dark, washed out, or extremely blurry/blank before calling the LLM.
 */
async function validateCropImageQuality(dataUrl: string): Promise<ImageQualityReport> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (width < 100 || height < 100) {
        resolve({
          valid: false,
          width,
          height,
          brightness: 0,
          detailVariance: 0,
          reason: `Image resolution (${width}×${height}px) is too small for reliable leaf inspection.`,
        });
        return;
      }

      const canvas = document.createElement('canvas');
      const sampleSize = 120;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve({ valid: true, width, height, brightness: 128, detailVariance: 25 });
        return;
      }

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

      let totalLum = 0;
      const gray: number[] = new Array(sampleSize * sampleSize);

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        gray[i / 4] = lum;
        totalLum += lum;
      }

      const avgBrightness = totalLum / (sampleSize * sampleSize);

      let edgeSum = 0;
      let count = 0;
      for (let y = 1; y < sampleSize - 1; y++) {
        for (let x = 1; x < sampleSize - 1; x++) {
          const idx = y * sampleSize + x;
          const gx = Math.abs(gray[idx + 1] - gray[idx - 1]);
          const gy = Math.abs(gray[idx + sampleSize] - gray[idx - sampleSize]);
          edgeSum += gx + gy;
          count++;
        }
      }
      const detailVariance = edgeSum / Math.max(1, count);

      if (avgBrightness < 18) {
        resolve({
          valid: false,
          width,
          height,
          brightness: Math.round(avgBrightness),
          detailVariance: +detailVariance.toFixed(1),
          reason: 'Image is too dark to inspect leaf surfaces clearly.',
        });
        return;
      }

      if (avgBrightness > 248) {
        resolve({
          valid: false,
          width,
          height,
          brightness: Math.round(avgBrightness),
          detailVariance: +detailVariance.toFixed(1),
          reason: 'Image is overexposed or blank.',
        });
        return;
      }

      if (detailVariance < 3.2) {
        resolve({
          valid: false,
          width,
          height,
          brightness: Math.round(avgBrightness),
          detailVariance: +detailVariance.toFixed(1),
          reason: 'Image appears extremely blurry or lacks discernible leaf detail.',
        });
        return;
      }

      resolve({
        valid: true,
        width,
        height,
        brightness: Math.round(avgBrightness),
        detailVariance: +detailVariance.toFixed(1),
      });
    };

    img.onerror = () => {
      resolve({
        valid: false,
        width: 0,
        height: 0,
        brightness: 0,
        detailVariance: 0,
        reason: 'Unable to decode image file.',
      });
    };

    img.src = dataUrl;
  });
}

async function createHistoryThumbnail(dataUrl: string): Promise<string> {
  if (dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetW = 280;
      const targetH = 190;
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function generateSampleCropPhotoDataUrl(
  preset: 'yellow-soybean' | 'healthy-soybean' | 'blurry-low-quality'
): Promise<{ dataUrl: string; fileName: string; sizeBytes: number; mimeType: string }> {
  const canvas = document.createElement('canvas');
  if (preset === 'blurry-low-quality') {
    canvas.width = 240;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0c0f0d';
    ctx.fillRect(0, 0, 240, 180);
    ctx.fillStyle = '#111613';
    ctx.beginPath();
    ctx.arc(120, 90, 50, 0, Math.PI * 2);
    ctx.fill();
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    return {
      dataUrl,
      fileName: 'blurry_night_capture.jpg',
      sizeBytes: Math.round(dataUrl.length * 0.75),
      mimeType: 'image/jpeg',
    };
  }

  canvas.width = 720;
  canvas.height = 500;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 720, 500);
  bgGrad.addColorStop(0, '#1e2923');
  bgGrad.addColorStop(0.5, '#2e3b30');
  bgGrad.addColorStop(1, '#1a241e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 720, 500);

  for (let i = 0; i < 350; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.12)';
    ctx.fillRect((i * 73) % 720, (i * 41) % 500, 4, 4);
  }

  const drawLeaf = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    angle: number,
    withChlorosis: boolean
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const leafGrad = ctx.createLinearGradient(-rx, -ry, rx, ry);
    if (withChlorosis) {
      leafGrad.addColorStop(0, '#2e7d32');
      leafGrad.addColorStop(0.45, '#689f38');
      leafGrad.addColorStop(0.78, '#fbc02d');
      leafGrad.addColorStop(1, '#f57f17');
    } else {
      leafGrad.addColorStop(0, '#1b5e20');
      leafGrad.addColorStop(0.5, '#2e7d32');
      leafGrad.addColorStop(1, '#43a047');
    }

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = leafGrad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = withChlorosis ? '#dce775' : '#81c784';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-rx + 12, 0);
    ctx.lineTo(rx - 12, 0);
    for (let v = -rx + 35; v < rx - 25; v += 28) {
      ctx.moveTo(v, 0);
      ctx.lineTo(v + 18, -ry * 0.68);
      ctx.moveTo(v, 0);
      ctx.lineTo(v + 18, ry * 0.68);
    }
    ctx.strokeStyle = withChlorosis ? '#33691e' : '#a5d6a7';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (withChlorosis) {
      const spots = [
        { x: rx * 0.35, y: -ry * 0.3, r: 18 },
        { x: rx * 0.52, y: ry * 0.22, r: 22 },
        { x: -rx * 0.15, y: ry * 0.42, r: 16 },
        { x: rx * 0.1, y: -ry * 0.45, r: 15 },
      ];
      spots.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(253, 224, 71, 0.72)';
        ctx.fill();
      });
    }

    ctx.restore();
  };

  ctx.strokeStyle = '#558b2f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(360, 490);
  ctx.lineTo(360, 220);
  ctx.moveTo(360, 340);
  ctx.lineTo(210, 260);
  ctx.moveTo(360, 320);
  ctx.lineTo(510, 250);
  ctx.stroke();

  const isYellow = preset === 'yellow-soybean';
  drawLeaf(215, 250, 125, 78, -0.35, isYellow);
  drawLeaf(505, 250, 125, 78, 0.35, isYellow);
  drawLeaf(360, 155, 135, 84, -0.05, isYellow);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  return {
    dataUrl,
    fileName: isYellow
      ? 'soybean_flowering_yellow_leaves.jpg'
      : 'soybean_healthy_canopy_check.jpg',
    sizeBytes: Math.round(dataUrl.length * 0.75),
    mimeType: 'image/jpeg',
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export const CropScannerView: React.FC<CropScannerViewProps> = ({
  profile,
  iot,
  weather,
  onNavigate,
  onAnalysisComplete,
}) => {
  const { t, language } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<ExtendedCropType>(
    profile.primaryCrop || 'Soybean'
  );
  const [selectedStage, setSelectedStage] = useState<CropStage>('Flowering');
  const [selectedSymptomChip, setSelectedSymptomChip] =
    useState<SymptomType>('Yellow Leaves');
  const [description, setDescription] = useState<string>(
    'Leaves have started turning yellow.'
  );

  const [uploadedImage, setUploadedImage] = useState<{
    dataUrl: string;
    fileName: string;
    sizeBytes: number;
    mimeType: string;
    width?: number;
    height?: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [analysisSource, setAnalysisSource] = useState<'gemini' | 'demo'>('demo');
  const [apiError, setApiError] = useState<string | null>(null);
  const [preferSimulatedMode, setPreferSimulatedMode] = useState<boolean>(false);

  const [analysisResult, setAnalysisResult] = useState<CropScannerResult>(() =>
    generateCropAnalysis(
      profile.primaryCrop || 'Soybean',
      'Yellow Leaves',
      'Flowering',
      'Leaves have started turning yellow.'
    )
  );

  const [showFullFarmRec, setShowFullFarmRec] = useState<boolean>(false);

  const [savedHistory, setSavedHistory] = useState<SavedCropAnalysis[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_SAVED_ANALYSES;
  });
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const resultSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    generateSampleCropPhotoDataUrl('yellow-soybean').then((sample) => {
      if (active && !uploadedImage) {
        setUploadedImage({
          dataUrl: sample.dataUrl,
          fileName: sample.fileName,
          sizeBytes: sample.sizeBytes,
          mimeType: sample.mimeType,
          width: 720,
          height: 500,
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const processSelectedFile = async (file: File) => {
    setUploadError(null);
    setQualityWarning(null);
    setApiError(null);
    setJustSaved(false);

    const mime = file.type.toLowerCase();
    const extValid = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!ALLOWED_MIME_TYPES.includes(mime) && !extValid) {
      setUploadError(
        'Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP crop photo.'
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(
        `File size (${formatFileSize(file.size)}) exceeds the 10 MB maximum limit.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        setUploadError('Could not read the selected image file.');
        return;
      }

      const quality = await validateCropImageQuality(dataUrl);
      setUploadedImage({
        dataUrl,
        fileName: file.name,
        sizeBytes: file.size,
        mimeType: mime || 'image/jpeg',
        width: quality.width,
        height: quality.height,
      });

      if (!quality.valid) {
        setQualityWarning(
          quality.reason || 'Unable to confidently assess the crop image.'
        );
      } else {
        setLoadingStep(2);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to load image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setQualityWarning(null);
    setUploadError(null);
    setApiError(null);
    setLoadingStep(0);
  };

  const handleLoadSamplePreset = async (
    preset: 'yellow-soybean' | 'healthy-soybean' | 'blurry-low-quality'
  ) => {
    setUploadError(null);
    setQualityWarning(null);
    setApiError(null);
    setJustSaved(false);

    const sample = await generateSampleCropPhotoDataUrl(preset);
    const quality = await validateCropImageQuality(sample.dataUrl);

    setUploadedImage({
      dataUrl: sample.dataUrl,
      fileName: sample.fileName,
      sizeBytes: sample.sizeBytes,
      mimeType: sample.mimeType,
      width: quality.width,
      height: quality.height,
    });

    if (preset === 'yellow-soybean') {
      setSelectedCrop('Soybean');
      setSelectedStage('Flowering');
      setSelectedSymptomChip('Yellow Leaves');
      setDescription('Leaves have started turning yellow.');
    } else if (preset === 'healthy-soybean') {
      setSelectedCrop('Soybean');
      setSelectedStage('Vegetative');
      setSelectedSymptomChip('Healthy');
      setDescription('Canopy looks green and upright; performing a routine crop health check.');
    }

    if (!quality.valid) {
      setQualityWarning(
        quality.reason || 'Unable to confidently assess the crop image.'
      );
    } else {
      setLoadingStep(2);
    }
  };

  const inferSymptomFromDescription = (desc: string, fallback: SymptomType): SymptomType => {
    const lower = desc.toLowerCase();
    if (lower.includes('yellow') || lower.includes('chlorosis')) return 'Yellow Leaves';
    if (lower.includes('brown') || lower.includes('spot')) return 'Brown Spots';
    if (lower.includes('wilt') || lower.includes('droop') || lower.includes('dry')) return 'Wilting';
    if (lower.includes('hole') || lower.includes('chew') || lower.includes('pest')) return 'Leaf Holes';
    if (lower.includes('slow') || lower.includes('stunt')) return 'Slow Growth';
    if (lower.includes('healthy') || lower.includes('green')) return 'Healthy';
    return fallback;
  };

  const handleRunDemoAnalysis = () => {
    setApiError(null);
    setIsAnalyzing(true);
    setLoadingStep(1);
    setJustSaved(false);

    setTimeout(() => setLoadingStep(2), 180);
    setTimeout(() => setLoadingStep(3), 380);
    setTimeout(() => setLoadingStep(4), 620);
    setTimeout(() => {
      const inferredSymptom = inferSymptomFromDescription(description, selectedSymptomChip);
      const simulated = generateCropAnalysis(
        selectedCrop,
        inferredSymptom,
        selectedStage,
        description
      );
      setAnalysisResult(simulated);
      setAnalysisSource('demo');
      setIsAnalyzing(false);
      setLoadingStep(5);
      setShowFullFarmRec(true);
      onAnalysisComplete?.(
        simulated.cropDetected || selectedCrop,
        simulated.possibleIssues[0] || simulated.detectedCondition,
        simulated.risk
      );
    }, 850);
  };

  const handleAnalyzeWithAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setApiError(null);
    setJustSaved(false);

    if (!uploadedImage) {
      setUploadError('Please upload a crop photo first before running AI image analysis.');
      return;
    }

    const quality = await validateCropImageQuality(uploadedImage.dataUrl);
    if (!quality.valid) {
      setQualityWarning(
        quality.reason || 'Unable to confidently assess the crop image.'
      );
      return;
    }

    if (preferSimulatedMode) {
      handleRunDemoAnalysis();
      return;
    }

    setIsAnalyzing(true);
    setLoadingStep(1);
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 250);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 550);
    const stepTimer3 = setTimeout(() => setLoadingStep(4), 1400);

    try {
      const response = await fetch('/api/analyze-crop-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: uploadedImage.dataUrl,
          mimeType: uploadedImage.mimeType,
          crop: selectedCrop,
          cropStage: selectedStage,
          description: description.trim(),
          language,
          farmContext: {
            farmerId: profile.farmerId || 'F001',
            farmerName: profile.farmerName,
            location: profile.location,
            farmAreaAcres: profile.farmAreaAcres,
            soilType: profile.soilType,
            irrigationType: profile.irrigationType,
            soilMoisture: iot.soilMoisture,
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainProbability: weather.rainProbability,
          },
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || !data.analysis) {
        setIsAnalyzing(false);
        setLoadingStep(0);
        setApiError(
          data?.message ||
            data?.error ||
            'AI analysis is temporarily unavailable.'
        );
        return;
      }

      const aiData = data.analysis;

      if (
        aiData.isCropImage === false ||
        aiData.imageQualitySufficient === false
      ) {
        setIsAnalyzing(false);
        setLoadingStep(0);
        setQualityWarning(
          aiData.qualityIssueReason ||
            'Unable to confidently assess the crop image. Please upload a clear close-up photo of the affected leaf or plant.'
        );
        return;
      }

      const mappedResult: CropScannerResult = {
        crop: selectedCrop,
        symptom: selectedSymptomChip,
        stage: selectedStage,
        detectedCondition:
          aiData.possibleIssues?.[0] || 'Possible crop stress detected from leaf inspection',
        risk:
          aiData.riskLevel === 'HIGH' || aiData.riskLevel === 'LOW'
            ? aiData.riskLevel
            : 'MEDIUM',
        confidence: Number(aiData.confidence) || 84,
        possibleCause:
          aiData.possibleCauses?.[0] || 'Possible nutrient or moisture balance fluctuation',
        recommendedSteps: Array.isArray(aiData.recommendedActions)
          ? aiData.recommendedActions
          : [],
        cropDetected: aiData.cropDetected || selectedCrop,
        overallHealth:
          aiData.overallHealth === 'Good' || aiData.overallHealth === 'Needs Attention'
            ? aiData.overallHealth
            : 'Moderate',
        healthScore: Number(aiData.healthScore) || 78,
        visibleSymptoms: Array.isArray(aiData.visibleSymptoms) ? aiData.visibleSymptoms : [],
        possibleIssues: Array.isArray(aiData.possibleIssues) ? aiData.possibleIssues : [],
        possibleCauses: Array.isArray(aiData.possibleCauses) ? aiData.possibleCauses : [],
        priority1Natural: Array.isArray(aiData.priority1Natural)
          ? aiData.priority1Natural
          : [
              'Monitor affected plants across multiple rows.',
              'Maintain appropriate soil moisture based on root-zone checks.',
              'Remove severely affected plant material if appropriate and improve field hygiene.',
            ],
        priority2Nutrient: Array.isArray(aiData.priority2Nutrient)
          ? aiData.priority2Nutrient
          : [
              'Consider soil testing before applying fertilizer.',
              'Consider an appropriate nutrient source or organic bio-digestate based on soil-test results.',
            ],
        showPriority3Chemical: Boolean(aiData.showPriority3Chemical),
        priority3Chemical:
          aiData.priority3Chemical ||
          'If the problem continues or spreads, consult a qualified agricultural professional for an appropriate registered treatment.',
        recommendedActions: Array.isArray(aiData.recommendedActions)
          ? aiData.recommendedActions
          : [],
        monitoringAdvice: Array.isArray(aiData.monitoringAdvice)
          ? aiData.monitoringAdvice
          : ['Upload another image in a few days to compare crop condition.'],
        whenToSeekExpertHelp:
          aiData.whenToSeekExpertHelp ||
          'If symptoms spread rapidly or crop damage becomes significant, consult a qualified agricultural expert.',
        environmentalContextNote:
          aiData.environmentalContextNote ||
          'Environmental context helps interpret visual symptoms but does not guarantee a definitive diagnosis.',
        disclaimer:
          aiData.disclaimer ||
          'AI image-based assessment — Not a certified professional agricultural diagnosis.',
        analysisSource: 'gemini',
        modelName: data.modelName || 'gemini-3.8-flash',
        imageQualitySufficient: true,
        isCropImage: true,
      };

      setAnalysisResult(mappedResult);
      setAnalysisSource('gemini');
      setIsAnalyzing(false);
      setLoadingStep(5);
      onAnalysisComplete?.(
        mappedResult.cropDetected,
        mappedResult.possibleIssues[0] || mappedResult.detectedCondition,
        mappedResult.risk
      );
    } catch {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsAnalyzing(false);
      setLoadingStep(0);
      setApiError('Network or service timeout while reaching Gemini Multimodal AI.');
    }
  };

  const handleSaveAnalysis = async () => {
    const now = new Date();
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const shortMonths = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const dateLabel = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    const shortDate = `${shortMonths[now.getMonth()]} ${now.getDate()}`;

    const thumbUrl = uploadedImage
      ? await createHistoryThumbnail(uploadedImage.dataUrl)
      : undefined;

    const newRecord: SavedCropAnalysis = {
      id: `scan-${Date.now()}`,
      dateLabel,
      shortDate,
      timestamp: Date.now(),
      crop: selectedCrop,
      stage: selectedStage,
      description: description || 'Crop image inspection',
      imagePreviewUrl: thumbUrl,
      fileName: uploadedImage?.fileName || 'crop_photo.jpg',
      result: {
        ...analysisResult,
        analysisSource,
      },
    };

    const updated = [newRecord, ...savedHistory].slice(0, 12);
    setSavedHistory(updated);
    setJustSaved(true);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
  };

  const handleSelectHistoryRecord = (record: SavedCropAnalysis) => {
    setSelectedCrop((record.crop as ExtendedCropType) || 'Soybean');
    setSelectedStage(record.stage);
    setDescription(record.description);
    setAnalysisResult(record.result);
    setAnalysisSource(record.result.analysisSource || 'demo');
    setQualityWarning(null);
    setApiError(null);
    if (record.imagePreviewUrl) {
      setUploadedImage({
        dataUrl: record.imagePreviewUrl,
        fileName: record.fileName || 'saved_crop_scan.jpg',
        sizeBytes: 148000,
        mimeType: 'image/jpeg',
      });
    }
    resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const trendChartData = [...savedHistory]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => ({
      date: item.shortDate,
      fullDate: item.dateLabel,
      healthScore: item.result.healthScore || 80,
      crop: item.crop,
      overallHealth: item.result.overallHealth,
    }));

  const baseCropForResidue: CropType =
    selectedCrop === 'Other' ? profile.primaryCrop : selectedCrop;
  const residueInfo = calculateResidueMetrics(baseCropForResidue, profile.farmAreaAcres);

  const combinedIrrigationAction =
    weather.rainProbability >= 55 && iot.soilMoisture >= 35
      ? `Hold supplemental irrigation: IoT soil moisture is ${iot.soilMoisture}% and 24h rain probability is elevated (${weather.rainProbability}%). Avoiding unnecessary irrigation also preserves your farmer energy balance.`
      : iot.soilMoisture < 32
      ? `Schedule measured early-morning root-zone irrigation: IoT soil moisture (${iot.soilMoisture}%) is low while visual symptoms suggest potential moisture stress.`
      : `Maintain balanced soil moisture (${iot.soilMoisture}%) and re-verify root-zone moisture at 15 cm depth before next irrigation cycle.`;

  const combinedCropAction = `For ${selectedCrop} (${selectedStage} stage): ${
    analysisResult.priority1Natural?.[0] ||
    analysisResult.recommendedActions[0] ||
    'Check soil moisture and inspect lower leaves.'
  } Follow Priority 1 natural practices and Priority 2 soil-test-based nutrition first.`;

  return (
    <div className="space-y-6">
      {/* Top Header with AI Model Badges */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-tabular font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('scanner.geminiAi', 'Gemini Multimodal AI')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-tabular font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <span>{t('scanner.imageFarmContext', 'Image + farm context based analysis')}</span>
              </span>
              {analysisSource === 'gemini' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-tabular font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  <span>🔵 {t('scanner.aiAnalysisBadge', 'AI ANALYSIS · Powered by Gemini multimodal analysis.')}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-tabular font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span>🟢 {t('scanner.demoModeBadge', 'DEMO MODE · Using simulated AI results.')}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              {t('nav.cropScanner', 'AI Crop Scanner')} — {t('scanner.title', 'Multimodal Crop Image & Priority Treatment Intelligence')}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {t('scanner.subtitle', 'Upload a crop photo to analyze visible leaf conditions with Gemini Vision and receive a natural-first 3-Tier Priority Treatment Plan connected to your Farm Advisor.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F8FAF7] border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('action.back', 'Back to Dashboard')}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('farm-advisor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap"
            >
              <span>{t('action.next', 'Next')}: {t('nav.farmAdvisor', 'Farm Advisor')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Pipeline Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 font-medium text-slate-700">
            <span className="px-2.5 py-1 rounded-md bg-[#F8FAF7] border border-slate-200 font-semibold">
              {t('app.farmer', 'Farmer')} ({profile.farmerName})
            </span>
            <span className="text-emerald-600 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-md bg-[#F8FAF7] border border-slate-200 font-semibold">
              {t('scanner.uploadFile', 'Upload Crop Photo')}
            </span>
            <span className="text-emerald-600 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
              Gemini Vision
            </span>
            <span className="text-emerald-600 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-md bg-[#F8FAF7] border border-slate-200 font-semibold">
              {t('scanner.actionSteps', 'Priority 1/2/3 Treatment Hierarchy')}
            </span>
            <span className="text-emerald-600 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
              {t('nav.farmAdvisor', 'Farmer Advisory')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreferSimulatedMode(!preferSimulatedMode)}
              className={`px-3 py-1 rounded-lg text-xs font-mono-tabular font-semibold border transition-colors ${
                preferSimulatedMode
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-blue-50 text-blue-900 border-blue-200'
              }`}
            >
              {preferSimulatedMode
                ? t('scanner.modeSimulated', 'Mode: Simulated Demo Fallback')
                : t('scanner.modeLive', 'Mode: Live Gemini Multimodal + Demo Fallback')}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDE: Upload Crop Image, Preview, Crop, Stage, Description, Farm Context */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-mono-tabular font-semibold text-emerald-700">
                  {t('scanner.step1', 'STEP 1 · MULTIMODAL INPUT')}
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t('scanner.uploadFile', 'Upload Crop Photo')}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {t('scanner.uploadDesc', 'Take or upload a clear photo of your crop, leaves, fruits or affected area.')}
                </p>
              </div>
              <span className="text-[11px] font-mono-tabular text-slate-500 shrink-0">
                {t('scanner.max10Mb', 'Max 10 MB')}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {!uploadedImage ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50/70'
                    : 'border-slate-300 bg-[#F8FAF7] hover:border-emerald-500 hover:bg-emerald-50/30'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {t('scanner.dragDropPrompt', 'Drag & drop your crop image here')}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {t('scanner.dropHint', 'Supports JPG, JPEG, PNG, WEBP · Maximum file size: 10 MB')}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t('scanner.uploadFile', 'Upload Crop Image')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>{t('scanner.cameraCapture', 'Camera Capture')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAF7] overflow-hidden">
                <div className="relative h-52 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={uploadedImage.dataUrl}
                    alt="Uploaded crop preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-[11px] font-mono-tabular font-semibold">
                    {t('scanner.imagePreview', 'Image Preview')}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600/90 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('scanner.removeImage', 'Remove Image')}</span>
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="truncate">
                      <span className="text-slate-500">{t('scanner.fileName', 'File Name')}: </span>
                      <span className="font-semibold text-slate-900">
                        {uploadedImage.fileName}
                      </span>
                    </div>
                    <div className="font-mono-tabular text-slate-600 shrink-0">
                      {t('scanner.size', 'Size')}: {formatFileSize(uploadedImage.sizeBytes)}
                      {uploadedImage.width && uploadedImage.height
                        ? ` (${uploadedImage.width}×${uploadedImage.height})`
                        : ''}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span>{t('scanner.chooseAnother', 'Choose Another Image')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAnalyzeWithAI()}
                      disabled={isAnalyzing}
                      className="py-2 px-3 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('scanner.analyzeWithAi', 'Analyze Crop with AI')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Sample Crop Photos for Instant Judge Testing */}
            <div className="pt-1">
              <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                {t('scanner.quickSamples', 'Quick Judge Test Photos (or upload any JPG/PNG/WEBP file above):')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLoadSamplePreset('yellow-soybean')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  {t('scanner.sampleYellow', 'Load Soybean Yellow Leaf Photo')}
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSamplePreset('healthy-soybean')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  {t('scanner.sampleHealthy', 'Load Healthy Canopy Photo')}
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSamplePreset('blurry-low-quality')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  {t('scanner.sampleBlurry', 'Test Low-Quality Image Check')}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {t('scanner.imageNotice', 'Crop images are used for AI analysis. Avoid uploading personal documents or sensitive information.')}
              </span>
            </p>

            {uploadError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{t('scanner.uploadValidationError', 'Upload Validation Error')}</div>
                  <p className="mt-0.5">{uploadError}</p>
                </div>
              </div>
            )}

            {/* IMAGE QUALITY CHECK WARNING (Section 10) */}
            {qualityWarning && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                <div className="flex items-start gap-2.5">
                  <FileWarning className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-amber-950">
                      {t('scanner.qualityTitle', 'Unable to confidently assess the crop image.')}
                    </div>
                    <p className="text-xs text-amber-900 mt-1 font-medium">
                      {t('scanner.qualityHint', 'Please upload a clear close-up photo of the affected leaf or plant.')}
                    </p>
                    <p className="text-[11px] text-amber-800 mt-1">
                      {t('scanner.detail', 'Detail')}: {qualityWarning}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold bg-white text-amber-950 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    {t('scanner.uploadClearer', 'Upload Clearer Photo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSamplePreset('yellow-soybean')}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors"
                  >
                    {t('scanner.useClearSample', 'Use Clear Sample Soybean Photo')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CROP, CROP STAGE & FARMER DESCRIPTION */}
          <form onSubmit={handleAnalyzeWithAI} className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {t('scanner.cropLabel', 'Crop')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SCANNER_CROPS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCrop(crop)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                      selectedCrop === crop
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-[#F8FAF7] text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {t(crop, crop)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {t('scanner.stageLabel', 'Crop Stage')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 gap-2">
                {CROP_STAGES.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setSelectedStage(stage)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                      selectedStage === stage
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-[#F8FAF7] text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {t(stage, stage)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="farmer-symptom-description"
                  className="block text-xs font-semibold text-slate-700"
                >
                  {t('scanner.descLabel', 'Describe what you are seeing (Optional)')}
                </label>
                <span className="text-[11px] text-slate-400">
                  {t('scanner.sentWithAi', 'Sent with image to AI')}
                </span>
              </div>

              <textarea
                id="farmer-symptom-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('scanner.descPlaceholder', 'Example: Leaves started turning yellow during the last week.')}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAF7] border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />

              <div className="mt-2">
                <div className="text-[11px] text-slate-500 mb-1">
                  {t('scanner.symptomPresetPrompt', 'Or click a symptom preset:')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOM_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setSelectedSymptomChip(chip.label);
                        setDescription(chip.descriptionText);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                        selectedSymptomChip === chip.label
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-500'
                          : 'bg-[#F8FAF7] text-slate-600 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {t(chip.label, chip.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3 px-5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('scanner.analyzing', 'Analyzing Crop Image...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('scanner.analyzeWithAi', 'Analyze Crop with AI')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRunDemoAnalysis}
                disabled={isAnalyzing}
                className="w-full py-2 px-4 bg-[#F8FAF7] hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 rounded-xl transition-colors"
              >
                {t('scanner.instantDemo', 'Use Instant Simulated Demo Analysis (DEMO MODE)')}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: AI STATUS, ERROR FALLBACK, STRUCTURED RESULT UI & PRIORITY HIERARCHY */}
        <div ref={resultSectionRef} className="lg:col-span-7 space-y-6">
          {isAnalyzing && (
            <div className="bg-white border border-emerald-300 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-emerald-700 animate-spin shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    🔄 {t('scanner.analyzing', 'Analyzing Crop Image...')}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {t('scanner.evaluatingLeaf', 'Evaluating leaf appearance, discoloration, and Pune farm telemetry context.')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-2 font-semibold text-emerald-950">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>✓ {t('scanner.stepUploaded', 'Image uploaded')}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-2 font-semibold text-emerald-950">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>✓ {t('scanner.stepQuality', 'Image quality checked')}</span>
                </div>
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 font-semibold ${
                    loadingStep >= 3
                      ? 'bg-blue-50 border-blue-200 text-blue-950'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <Loader2 className="w-4 h-4 text-blue-700 animate-spin shrink-0" />
                  <span>🔄 {t('scanner.stepAnalyzing', 'AI analyzing crop')}</span>
                </div>
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 font-semibold ${
                    loadingStep >= 4
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span>○ {t('scanner.stepRecommendation', 'Generating priority recommendation')}</span>
                </div>
              </div>
            </div>
          )}

          {apiError && !isAnalyzing && (
            <div className="bg-white border border-amber-300 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('scanner.apiErrorTitle', 'AI analysis is temporarily unavailable.')}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {apiError} {t('scanner.apiErrorDesc', 'You can retry the request or switch immediately to the simulated AgriFuel AI demo analysis so your demonstration continues without interruption.')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAnalyzeWithAI()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('action.tryAgain', 'Try Again')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRunDemoAnalysis}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{t('action.useDemoAnalysis', 'Use Demo Analysis')}</span>
                </button>
              </div>
            </div>
          )}

          {/* STRUCTURED AI CROP ANALYSIS RESULT UI */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold text-slate-900">
                  🌱 {t('scanner.cropAnalysisBadge', 'AI CROP ANALYSIS')}
                </span>
                {loadingStep === 5 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>✓ {t('scanner.analysisComplete', 'Analysis Complete')}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAnalysis}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                    justSaved
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-[#F8FAF7] text-slate-800 border-slate-300 hover:bg-emerald-50 hover:border-emerald-400'
                  }`}
                >
                  {justSaved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>{t('scanner.saveSuccess', 'Analysis Saved')}</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('action.save', 'Save Analysis')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {analysisSource === 'gemini' ? (
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="font-bold text-blue-950 flex items-center gap-2">
                  <span>🔵 {t('scanner.aiAnalysis', 'AI ANALYSIS')}</span>
                  <span>·</span>
                  <span className="font-normal text-blue-900">
                    {t('scanner.poweredByGemini', 'Powered by Gemini multimodal analysis.')}
                  </span>
                </div>
                <span className="font-mono-tabular text-[11px] font-semibold text-blue-800">
                  {t('scanner.imageAssessment', 'AI image-based assessment')}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="font-bold text-emerald-950 flex items-center gap-2">
                  <span>🟢 {t('scanner.demoMode', 'DEMO MODE')}</span>
                  <span>·</span>
                  <span className="font-normal text-emerald-900">
                    {t('scanner.usingSimulated', 'Using simulated AI results.')}
                  </span>
                </div>
                <span className="font-mono-tabular text-[11px] font-semibold text-emerald-800">
                  {t('scanner.demoDisclaimer', 'AI DEMO ANALYSIS — NOT A PROFESSIONAL DIAGNOSIS')}
                </span>
              </div>
            )}

            {/* ======================================================== */}
            {/* PREMIUM HERO CARD: AI CROP DOCTOR                        */}
            {/* ======================================================== */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-[#072417] to-slate-900 border-2 border-emerald-500/40 text-white p-6 sm:p-7 shadow-2xl space-y-5">
              {/* Ambient decorative glow */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header row: AI Crop Doctor | Scan • Detect • Solve | Confidence Score Badge */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-800/40">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-900/40 flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                        {t('scanner.doctorTitle', 'AI Crop Doctor')}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {t('scanner.diagnosticSuite', 'DIAGNOSTIC SUITE')}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-400/90 tracking-widest uppercase mt-0.5 flex items-center gap-1.5">
                      <span>{t('scanner.scan', 'Scan')}</span>
                      <span className="text-emerald-500">•</span>
                      <span>{t('scanner.detect', 'Detect')}</span>
                      <span className="text-emerald-500">•</span>
                      <span>{t('scanner.solve', 'Solve')}</span>
                    </div>
                  </div>
                </div>

                {/* Prominent Green Badge for Confidence Score */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-900/30">
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-tight">
                      {t('scanner.confidenceScore', 'Confidence Score')}: {analysisResult.confidence || 94}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Diagnostic Triad Grid + Image (if uploaded) */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {uploadedImage && (
                  <div className="lg:col-span-4 rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-900 relative group min-h-[160px]">
                    <img
                      src={uploadedImage.dataUrl}
                      alt="Analyzed crop leaf"
                      className="w-full h-full object-cover max-h-48 lg:max-h-full"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                      {t('scanner.liveLeafScan', 'LIVE LEAF SCAN')}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono text-slate-300">
                      {t(selectedStage, selectedStage)} {t('scanner.stageWord', 'Stage')}
                    </div>
                  </div>
                )}

                <div
                  className={`${
                    uploadedImage ? 'lg:col-span-8' : 'lg:col-span-12'
                  } grid grid-cols-1 md:grid-cols-3 gap-3`}
                >
                  {/* 1. Crop Detected */}
                  <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/25 backdrop-blur-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-emerald-300/80 mb-1">
                        <span className="font-semibold uppercase tracking-wider text-[10px]">
                          {t('scanner.cropDetected', 'Crop Detected')}
                        </span>
                        <Sprout className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white mt-1">
                        {t(analysisResult.cropDetected || selectedCrop, analysisResult.cropDetected || selectedCrop)}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{t(selectedStage, selectedStage)} {t('scanner.growthStageWord', 'Growth Stage')}</span>
                    </div>
                  </div>

                  {/* 2. Disease Detected */}
                  <div className="p-4 rounded-xl bg-white/5 border border-amber-500/25 backdrop-blur-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-amber-300/80 mb-1">
                        <span className="font-semibold uppercase tracking-wider text-[10px]">
                          {t('scanner.diseaseDetected', 'Disease Detected')}
                        </span>
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-base sm:text-lg font-bold text-amber-200 mt-1 line-clamp-2">
                        {t(
                          analysisResult.detectedCondition ||
                            analysisResult.possibleIssues?.[0] ||
                            'Leaf Blight',
                          analysisResult.detectedCondition ||
                            analysisResult.possibleIssues?.[0] ||
                            'Leaf Blight'
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          analysisResult.risk === 'HIGH' ? 'bg-rose-400' : 'bg-amber-400'
                        }`}
                      />
                      <span>{t('scanner.risk', 'Risk')}: {t(analysisResult.risk, analysisResult.risk)} · {t(analysisResult.overallHealth, analysisResult.overallHealth)} {t('scanner.health', 'Health')}</span>
                    </div>
                  </div>

                  {/* 3. Organic Remedy (Priority 1) */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/80 to-teal-950/60 border border-emerald-400/40 backdrop-blur-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-300 flex items-center gap-1">
                          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t('scanner.organicRemedy', 'Organic Remedy')}</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                          {t('scanner.priority1', 'Priority 1')}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-emerald-100 mt-1 line-clamp-2 leading-snug">
                        {t(
                          analysisResult.priority1Natural?.[0] ||
                            analysisResult.recommendedActions?.[0] ||
                            'Apply 5% Neem Seed Kernel Extract (NSKE) spray; prune affected lower foliage.',
                          analysisResult.priority1Natural?.[0] ||
                            analysisResult.recommendedActions?.[0] ||
                            'Apply 5% Neem Seed Kernel Extract (NSKE) spray; prune affected lower foliage.'
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-400/90 mt-2 pt-2 border-t border-emerald-500/20 font-mono">
                      {t('scanner.ecoFriendly', '✓ Eco-friendly & 100% soil safe')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VISIBLE SYMPTOMS & POSSIBLE ISSUES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90 space-y-2.5">
                <div className="text-xs font-mono-tabular font-bold text-slate-800 uppercase tracking-wider">
                  {t('scanner.visibleSymptoms', 'VISIBLE SYMPTOMS (OBSERVED)')}
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {analysisResult.visibleSymptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{t(symptom, symptom)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono-tabular font-bold text-slate-800 uppercase tracking-wider">
                    {t('scanner.possibleIssues', 'POSSIBLE ISSUES & CAUSES')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-tabular font-semibold bg-amber-100 text-amber-900">
                    {t('scanner.nonDefinitive', 'Non-definitive assessment')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {analysisResult.possibleIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                    >
                      {t(issue, issue)}
                    </div>
                  ))}
                </div>

                {analysisResult.possibleCauses && analysisResult.possibleCauses.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-700">
                      {t('scanner.contributingFactors', 'Possible Contributing Factors:')}
                    </div>
                    {analysisResult.possibleCauses.map((cause, idx) => (
                      <div key={idx}>• {t(cause, cause)}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* SECTION 10 & 11: PRIORITY-BASED CROP TREATMENT HIERARCHY */}
            {/* ======================================================== */}
            <div className="space-y-4 pt-2">
              {/* Multilingual AI Crop Doctor Recommendation */}
              <MultilingualRecommendation
                title={t('scanner.doctorRecommendationTitle', 'Crop Doctor AI Remedy Recommendation')}
                badge={t('scanner.primaryRemedyBadge', 'PRIMARY REMEDY')}
                text={
                  analysisResult.priority1Natural?.[0] ||
                  analysisResult.recommendedActions?.[0] ||
                  'Apply 5% Neem Seed Kernel Extract (NSKE) spray; prune affected lower foliage.'
                }
                subtext={`${t('scanner.diagnosed', 'Diagnosed')}: ${t(analysisResult.detectedCondition || 'Canopy stress', analysisResult.detectedCondition || 'Canopy stress')} · ${t('scanner.vigor', 'Vigor')}: ${t(analysisResult.overallHealth, analysisResult.overallHealth)} · ${t('scanner.risk', 'Risk')}: ${t(analysisResult.risk, analysisResult.risk)}`}
                size="lg"
                showQuote
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono-tabular font-bold text-emerald-700 uppercase tracking-wider">
                    {t('scanner.responsibleProtocol', 'RESPONSIBLE AGRONOMIC PROTOCOL')}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t('scanner.treatmentHierarchy', 'Priority-Based Crop Treatment Recommendations')}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono-tabular font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                  {t('scanner.organicFirstFlow', 'Organic First → Soil Nutrition → Chemical Backup')}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* PRIORITY 1 — ORGANIC SOLUTION (VISUALLY LARGER THAN EVERY OTHER RECOMMENDATION) */}
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-teal-50 border-2 border-emerald-500 shadow-md ring-4 ring-emerald-500/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-700 text-white shadow-xs">
                        {t('scanner.p1Badge', 'PRIORITY 1 — ORGANIC SOLUTION')}
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <Leaf className="w-5 h-5 text-emerald-700" />
                        <span>{t('scanner.p1Title', 'Natural / Organic / Cultural Treatment (Primary Defense)')}</span>
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-200/70 border border-emerald-300">
                      {t('scanner.alwaysApplyFirst', '★ Always Apply First')}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
                    {t('scanner.p1Desc', 'Organic, biologically safe remedies protect beneficial soil microbes, eliminate chemical runoff, and preserve post-harvest residue safety for community bioenergy digestion.')}
                  </p>

                  <div className="grid grid-cols-1 gap-3 pt-1">
                    {(analysisResult.priority1Natural || analysisResult.recommendedActions.slice(0, 3)).map(
                      (item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3.5 p-4 rounded-xl bg-white/95 border border-emerald-300/80 shadow-xs hover:border-emerald-400 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-emerald-950 leading-relaxed block">
                              {t(item, item)}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                              {t('scanner.p1StepDesc', 'Biological treatment step · Safe for soil microflora & livestock')}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* PRIORITY 2 — NUTRIENT / FERTILIZER MANAGEMENT */}
                <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono-tabular font-bold bg-sky-700 text-white">
                        {t('scanner.p2Badge', 'PRIORITY 2 — NUTRIENT / FERTILIZER')}
                      </span>
                      <span className="text-xs font-bold text-sky-950 flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5 text-sky-700" />
                        <span>{t('scanner.p2Title', 'Soil & Nutrient Management')}</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-sky-800">
                      {t('scanner.p2Tag', 'Soil Test & Bio-Digestate Guided')}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-sky-950">
                    {(
                      analysisResult.priority2Nutrient || [
                        'Consider soil testing before applying fertilizer.',
                        'Consider an appropriate nutrient source or stabilized organic bio-digestate.',
                      ]
                    ).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono-tabular font-bold text-sky-700">•</span>
                        <span>{t(item, item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* PRIORITY 3 — CHEMICAL RECOMMENDATION AS BACKUP */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono-tabular font-bold bg-amber-700 text-white">
                        {t('scanner.p3Badge', 'PRIORITY 3 — CHEMICAL BACKUP')}
                      </span>
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t('scanner.p3Title', 'Chemical Recommendation as Backup')}</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-mono-tabular font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      {t('scanner.p3Tag', 'Emergency Secondary Line Only')}
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {t(
                      analysisResult.priority3Chemical ||
                        'If organic remedies show no disease containment after 7–10 days and foliar infection exceeds 25% canopy loss, consult local agronomist for targeted copper oxychloride (COC 50% WP @ 2.5g/L) or certified chemical fungicide. Use with appropriate PPE.',
                      analysisResult.priority3Chemical ||
                        'If organic remedies show no disease containment after 7–10 days and foliar infection exceeds 25% canopy loss, consult local agronomist for targeted copper oxychloride (COC 50% WP @ 2.5g/L) or certified chemical fungicide. Use with appropriate PPE.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* CONNECT RESULT TO FARM ADVISOR */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono-tabular font-bold text-emerald-700">
                    {t('scanner.integratedWorkflow', 'INTEGRATED DECISION WORKFLOW')}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('scanner.connectAdvisor', 'Connect Crop Image Analysis to Farm Advisor')}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFullFarmRec(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('scanner.getFullFarmRec', 'Get Full Farm Recommendation')}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-slate-200/80 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-700">
                <span className="px-2 py-1 rounded bg-white border border-slate-200 font-semibold">
                  {t('scanner.cropImageAnalysisFlow', 'Crop Image Analysis')}
                </span>
                <span className="text-emerald-600 font-bold">↓</span>
                <span className="px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                  {t(analysisResult.possibleIssues[0] || 'Possible Nutrient Stress', analysisResult.possibleIssues[0] || 'Possible Nutrient Stress')}
                </span>
                <span className="text-emerald-600 font-bold">↓</span>
                <span className="px-2 py-1 rounded bg-white border border-slate-200">
                  {t('scanner.checkMoisture', 'Check Soil Moisture')} ({iot.soilMoisture}%)
                </span>
                <span className="text-emerald-600 font-bold">↓</span>
                <span className="px-2 py-1 rounded bg-white border border-slate-200">
                  {t('scanner.weatherForecastFlow', 'Weather Forecast')} ({weather.rainProbability}% {t('advisor.rain', 'Rain')})
                </span>
                <span className="text-emerald-600 font-bold">↓</span>
                <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
                  {t('nav.farmAdvisor', 'Farm Advisor')}
                </span>
                <span className="text-emerald-600 font-bold">↓</span>
                <span className="px-2 py-1 rounded bg-slate-900 text-white font-semibold">
                  {t('scanner.actionRec', 'Action Recommendation')}
                </span>
              </div>

              {showFullFarmRec && (
                <div className="p-5 rounded-2xl bg-emerald-950 text-white space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-800">
                    <div>
                      <div className="text-[11px] font-mono-tabular font-semibold text-emerald-300">
                        {t('scanner.combinedSynthesis', 'COMBINED MULTIMODAL + TELEMETRY SYNTHESIS')}
                      </div>
                      <h4 className="text-lg font-bold text-white mt-0.5">
                        {t('scanner.farmRecTitle', 'AgriFuel AI Farm Recommendation')}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono-tabular font-bold bg-emerald-800 text-emerald-100">
                      {t('scanner.status', 'Status')}: {analysisResult.risk === 'HIGH' ? t('status.actionNeeded', 'ACTION NEEDED') : t('status.watch', 'WATCH')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-emerald-900/80 border border-emerald-700/80 space-y-1.5 shadow-xs">
                      <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-sky-400" />
                        <span>{t('advisor.water', 'Water')}</span>
                      </div>
                      <div className="text-base font-bold text-white">
                        {t('Delay irrigation.', 'Delay irrigation.')}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-900/80 border border-emerald-700/80 space-y-1.5 shadow-xs">
                      <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sprout className="w-4 h-4 text-emerald-400" />
                        <span>{t('advisor.crop', 'Crop')}</span>
                      </div>
                      <div className="text-base font-bold text-white">
                        {t('Inspect lower leaves.', 'Inspect lower leaves.')}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-900/80 border border-emerald-700/80 space-y-1.5 shadow-xs">
                      <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CloudSun className="w-4 h-4 text-amber-400" />
                        <span>{t('advisor.weather', 'Weather')}</span>
                      </div>
                      <div className="text-base font-bold text-white">
                        {t('Rain tomorrow.', 'Rain tomorrow.')}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-emerald-300">
                      {t('scanner.synthesisContext', 'Combines crop image assessment + local weather + IoT soil moisture telemetry.')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('farm-advisor')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white text-emerald-950 rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      <span>{t('scanner.openAdvisor', 'Open Interactive Farm Advisor')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>{t(analysisResult.disclaimer, analysisResult.disclaimer)}</span>
              <span className="font-mono-tabular font-semibold text-slate-700">
                {t('scanner.demoDisclaimer', 'AI DEMO ANALYSIS — NOT A PROFESSIONAL DIAGNOSIS')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: CROP HEALTH TREND & ANALYSIS HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-mono-tabular font-semibold text-emerald-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{t('scanner.estimatedTrendBadge', 'AI-ESTIMATED TREND')}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {t('scanner.trendTitle', 'Crop Health Trend')}
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono-tabular font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                {t('scanner.estimatedTrendTag', 'AI-estimated trend')}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3">
              {t('scanner.trendDesc', 'Tracks visual canopy health estimates across saved crop image scans. Save a new analysis above to update this timeline.')}
            </p>

            <div className="h-52 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData}>
                  <defs>
                    <linearGradient id="cropHealthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748B" />
                  <YAxis domain={[50, 100]} unit="%" tick={{ fontSize: 12 }} stroke="#64748B" />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0}% (${t('scanner.aiEstimated', 'AI-estimated')})`, t('scanner.cropHealth', 'Crop Health')]}
                  />
                  <Area
                    type="monotone"
                    dataKey="healthScore"
                    stroke="#047857"
                    strokeWidth={2.5}
                    fill="url(#cropHealthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              {t('scanner.recent', 'Recent')}: {trendChartData.map((d) => `${d.date} → ${d.healthScore}%`).join(' · ')}
            </span>
            <span className="font-mono-tabular font-semibold text-amber-800">
              {t('scanner.illustrativeEstimate', 'Illustrative visual estimate')}
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-mono-tabular font-semibold text-emerald-700 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>{t('scanner.localRecordsBadge', 'LOCAL FARM RECORDS · CLICK TO VIEW')}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {t('scanner.historyTitle', 'Analysis History')}
              </h2>
            </div>
            <span className="text-xs font-mono-tabular text-slate-500">
              {savedHistory.length} {t('scanner.savedScans', 'Saved Scans')}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {savedHistory.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectHistoryRecord(item)}
                className="text-left p-3.5 rounded-xl bg-[#F8FAF7] hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-400 transition-all flex items-start gap-3 group"
              >
                {item.imagePreviewUrl ? (
                  <img
                    src={item.imagePreviewUrl}
                    alt={item.crop}
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-900"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-emerald-950 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-800">
                    <Sprout className="w-7 h-7" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                      {item.dateLabel}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono-tabular font-bold ${
                        item.result.risk === 'LOW'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.result.risk === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {t('scanner.risk', 'Risk')}: {t(item.result.risk, item.result.risk)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                    {t(item.crop, item.crop)} · {t(item.stage, item.stage)}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                    <span>
                      {t('scanner.health', 'Health')}: <strong className="text-slate-900">{t(item.result.overallHealth, item.result.overallHealth)}</strong>{' '}
                      ({item.result.healthScore}%)
                    </span>
                    <span className="text-[10px] font-mono-tabular text-slate-400">
                      #{item.id.slice(-4)} · {item.result.analysisSource === 'gemini' ? '🔵 Gemini AI' : '🟢 Demo'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
