import { useState, useRef } from 'react';
import {
  Sparkles, Upload, X, ChevronLeft, Download, Palette,
  FileText, Layers, Target, Lightbulb, CheckCircle,
  RotateCcw, BookOpen,
} from 'lucide-react';
import type {
  QuizResult, BrandInput, BrandEssence, VisualPath,
  CreativeBrief, ColorPalette, MoodImage, ArchetypeKey, LogoConcept,
} from '../types';
import { ARCHETYPES } from '../constants';
import {
  getBrandEssence, getVisualPaths, getMoodboardDescriptions,
  generateMoodImage, getCreativeBrief, getColorPalette,
  getLogoConcepts,
} from '../services/gemini';

interface Props {
  quizResult: QuizResult;
  brandInput: BrandInput; setBrandInput: (b: BrandInput) => void;
  brandEssence: BrandEssence | null; setBrandEssence: (e: BrandEssence) => void;
  visualPaths: VisualPath[]; setVisualPaths: (p: VisualPath[]) => void;
  selectedPath: VisualPath | null; setSelectedPath: (p: VisualPath) => void;
  creativeBrief: CreativeBrief | null; setCreativeBrief: (b: CreativeBrief) => void;
  colorPalette: ColorPalette | null; setColorPalette: (p: ColorPalette) => void;
  logoConcepts: LogoConcept[] | null; setLogoConcepts: (c: LogoConcept[]) => void;
  selectedConcept: LogoConcept | null; setSelectedConcept: (c: LogoConcept) => void;
  onBack: () => void;
  onRestart: () => void;
}

const STEPS = [
  { id: 1, label: 'الأساس',   sublabel: 'الاستراتيجي', icon: Target    },
  { id: 2, label: 'التوجه',   sublabel: 'الإبداعي',    icon: Layers    },
  { id: 3, label: 'الموجز',   sublabel: 'الإبداعي',    icon: FileText  },
  { id: 4, label: 'الألوان',  sublabel: 'لوحة متناغمة', icon: Palette  },
  { id: 5, label: 'الشعار',   sublabel: '3 أفكار',     icon: Lightbulb },
  { id: 6, label: 'التقرير',  sublabel: 'PDF كامل',    icon: BookOpen  },
];

export default function DesignGuideTool(props: Props) {
  const {
    quizResult, brandInput, setBrandInput,
    brandEssence, setBrandEssence, visualPaths, setVisualPaths,
    selectedPath, setSelectedPath, creativeBrief, setCreativeBrief,
    colorPalette, setColorPalette, logoConcepts, setLogoConcepts,
    selectedConcept, setSelectedConcept,
    onBack, onRestart,
  } = props;

  const [step, setStep]                     = useState(1);
  const [loading, setLoading]               = useState(false);
  const [loadingMsg, setLoadingMsg]         = useState('');
  const [error, setError]                   = useState<string | null>(null);
  const [moodImages, setMoodImages]         = useState<MoodImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [moodboardMode, setMoodboardMode]   = useState<'upload' | 'ai' | null>(null);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatedImgUrls, setGeneratedImgUrls] = useState<(string | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const core = ARCHETYPES[quizResult.coreArchetype];
  const edge = ARCHETYPES[quizResult.edgeArchetype];

  // ── PDF Report Generator ─────────────────────────────────────────
  function downloadReport() {
    const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

    function hexToRgb(hex: string): string {
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : '0, 0, 0';
    }

    const css = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Noto Kufi Arabic', Arial, sans-serif; direction: rtl; color: #1e293b; background: white; font-size: 14px; line-height: 1.7; }
      .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 60px; border-bottom: 4px solid ${core.color}; min-height: 100vh; page-break-after: always; break-after: page; }
      .cover-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; margin-bottom: 24px; }
      .cover-brand { font-size: 52px; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
      .cover-sub { font-size: 18px; color: #64748b; margin-bottom: 8px; }
      .cover-divider { width: 80px; height: 3px; border-radius: 2px; margin: 24px auto; }
      .badges { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin: 24px 0; }
      .badge { padding: 8px 20px; border-radius: 999px; font-size: 13px; font-weight: 700; border: 2px solid; }
      .cover-meta { color: #94a3b8; font-size: 13px; }
      .toc { margin-top: 32px; }
      .toc-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; }
      .toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-width: 400px; margin: 0 auto; }
      .toc-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #334155; font-weight: 600; text-align: right; }

      .section { padding: 48px; page-break-before: always; break-before: page; }
      .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9; }
      .section-num { font-size: 52px; font-weight: 900; color: #f0f4f8; line-height: 1; }
      .section-accent { width: 4px; height: 40px; border-radius: 2px; flex-shrink: 0; }
      .section-title { font-size: 26px; font-weight: 900; color: #0f172a; }

      .quote { background: #f0fdfa; border-right: 5px solid #2dd4bf; padding: 20px 24px; border-radius: 0 12px 12px 0; font-size: 17px; font-weight: 700; color: #134e4a; margin-bottom: 24px; line-height: 1.8; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; }
      .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px; }
      .card-value { font-size: 13px; color: #334155; line-height: 1.7; }
      .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .tag-teal { padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #f0fdfa; color: #0d9488; border: 1px solid #99f6e4; }
      .tag-gray { padding: 3px 10px; border-radius: 999px; font-size: 12px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

      .swatch-strip { display: flex; gap: 10px; margin-bottom: 20px; }
      .swatch-block { flex: 1; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
      .swatch-color { height: 90px; }
      .swatch-info { padding: 10px 12px; background: white; border-top: 1px solid #f1f5f9; }
      .swatch-name { font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
      .swatch-hex { font-size: 11px; color: #64748b; font-family: monospace; margin-bottom: 1px; }
      .swatch-rgb { font-size: 10px; color: #94a3b8; font-family: monospace; }

      .do-dont { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
      .do-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; }
      .dont-card { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; }
      .do-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin-bottom: 10px; }
      .dont-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #dc2626; margin-bottom: 10px; }
      .do-dont li { margin-bottom: 5px; font-size: 13px; color: #334155; list-style: none; }

      .usage-table { width: 100%; border-collapse: collapse; }
      .usage-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
      .usage-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-left: 8px; vertical-align: middle; }

      .concept { border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 18px; page-break-inside: avoid; break-inside: avoid; }
      .concept-selected { border-color: #2dd4bf; background: #f0fdfa; }
      .concept-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
      .concept-num { width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: white; flex-shrink: 0; }
      .concept-title { font-size: 19px; font-weight: 800; color: #0f172a; }
      .concept-style { font-size: 12px; color: #94a3b8; margin-top: 2px; }
      .selected-badge { background: #2dd4bf; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; margin-right: auto; white-space: nowrap; }

      .footer { text-align: center; padding: 36px 48px; border-top: 2px solid #f1f5f9; background: #fafafa; }
      .footer-brand { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
      .footer-sub { font-size: 13px; color: #94a3b8; margin-top: 4px; }

      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .cover { page-break-after: always; break-after: page; }
        .section { page-break-before: always; break-before: page; }
      }
    `;

    let body = '';

    // ── COVER ──
    body += `
      <div class="cover">
        <p class="cover-eyebrow">Brand Identity Report · تقرير الهوية البصرية</p>
        <h1 class="cover-brand">${brandInput.name || 'العلامة التجارية'}</h1>
        ${brandInput.industry ? `<p class="cover-sub">${brandInput.industry}${brandInput.audience ? ' · ' + brandInput.audience : ''}</p>` : ''}
        <div class="badges">
          <span class="badge" style="border-color:${core.color};color:${core.color};">CORE · ${core.nameAr} (${core.nameEn})</span>
          <span class="badge" style="border-color:${edge.color};color:${edge.color};">EDGE · ${edge.nameAr} (${edge.nameEn})</span>
        </div>
        <div class="cover-divider" style="background:${core.color};"></div>
        <p class="cover-meta">${today} · مُعدّ بواسطة مستشار الهوية البصرية</p>
        ${(brandEssence || selectedPath || creativeBrief || colorPalette || (logoConcepts && logoConcepts.length > 0)) ? `
        <div class="toc">
          <p class="toc-title">محتويات التقرير</p>
          <div class="toc-grid">
            ${brandEssence  ? '<div class="toc-item">١ · جوهر العلامة التجارية</div>' : ''}
            ${selectedPath  ? '<div class="toc-item">٢ · التوجه الإبداعي</div>' : ''}
            ${creativeBrief ? '<div class="toc-item">٣ · الموجز الإبداعي</div>' : ''}
            ${colorPalette  ? '<div class="toc-item">٤ · لوحة الألوان</div>' : ''}
            ${(logoConcepts && logoConcepts.length > 0) ? '<div class="toc-item">٥ · أفكار الشعار</div>' : ''}
          </div>
        </div>` : ''}
      </div>
    `;

    // ── SECTION 1: Brand Essence ──
    if (brandEssence) {
      body += `
        <div class="section">
          <div class="section-header">
            <span class="section-num">١</span>
            <div class="section-accent" style="background:${core.color};"></div>
            <h2 class="section-title">جوهر العلامة التجارية</h2>
          </div>
          <div class="quote">"${brandEssence.essence}"</div>
          <div class="grid-2">
            <div class="card">
              <p class="card-label">التموضع في السوق</p>
              <p class="card-value">${brandEssence.positioning}</p>
            </div>
            <div class="card">
              <p class="card-label">نبرة الصوت</p>
              <p class="card-value">${brandEssence.brandVoice}</p>
            </div>
          </div>
          <div class="card" style="margin-top:14px;">
            <p class="card-label">القيمة الفريدة</p>
            <p class="card-value">${brandEssence.uniqueValue}</p>
          </div>
          ${brandEssence.personality && brandEssence.personality.length > 0 ? `
          <div style="margin-top:14px;">
            <p class="card-label">سمات الشخصية</p>
            <div class="tags">
              ${brandEssence.personality.map(p => `<span class="badge" style="background:${core.color}12;color:${core.color};border:1px solid ${core.color}30;padding:4px 12px;font-size:12px;">${p}</span>`).join('')}
            </div>
          </div>` : ''}
        </div>
      `;
    }

    // ── SECTION 2: Visual Direction ──
    if (selectedPath) {
      body += `
        <div class="section">
          <div class="section-header">
            <span class="section-num">٢</span>
            <div class="section-accent" style="background:#2dd4bf;"></div>
            <h2 class="section-title">التوجه الإبداعي</h2>
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
            <h3 style="font-size:22px;font-weight:800;color:#0f172a;">${selectedPath.title}</h3>
            <span class="tag-teal">${selectedPath.mood}</span>
          </div>
          <p style="font-size:14px;color:#334155;line-height:1.8;margin-bottom:16px;">${selectedPath.description}</p>
          <div class="grid-2">
            <div class="card">
              <p class="card-label">الكلمات المفتاحية</p>
              <div class="tags">${selectedPath.keywords.map(k => `<span class="tag-gray">${k}</span>`).join('')}</div>
            </div>
            <div class="card">
              <p class="card-label">الخطوط المقترحة</p>
              <p class="card-value">${selectedPath.fontStyle}</p>
            </div>
          </div>
          ${selectedPath.colors && selectedPath.colors.length > 0 ? `
          <div style="margin-top:14px;">
            <p class="card-label">لوحة الإلهام</p>
            <div style="display:flex;gap:8px;margin-top:8px;">
              ${selectedPath.colors.map(c => `<div style="width:48px;height:48px;border-radius:10px;background:${c};border:1px solid rgba(0,0,0,0.1);" title="${c}"></div>`).join('')}
            </div>
          </div>` : ''}
        </div>
      `;
    }

    // ── SECTION 3: Creative Brief ──
    if (creativeBrief) {
      body += `
        <div class="section">
          <div class="section-header">
            <span class="section-num">٣</span>
            <div class="section-accent" style="background:#2dd4bf;"></div>
            <h2 class="section-title">الموجز الإبداعي</h2>
          </div>
          <div class="grid-2">
            ${[
              { label: 'نظرة عامة',         value: creativeBrief.projectOverview },
              { label: 'الهدف',              value: creativeBrief.objective },
              { label: 'الجمهور المستهدف',   value: creativeBrief.targetAudience },
              { label: 'شخصية العلامة',      value: creativeBrief.brandPersonality },
              { label: 'نبرة الصوت',         value: creativeBrief.toneOfVoice },
              { label: 'سيكولوجية الألوان',  value: creativeBrief.colorPsychology },
              { label: 'توجه الخطوط',        value: creativeBrief.typographyDirection },
              { label: 'توجه الشعار',        value: creativeBrief.logoDirection },
            ].map(s => `
              <div class="card">
                <p class="card-label">${s.label}</p>
                <p class="card-value">${s.value || '—'}</p>
              </div>
            `).join('')}
          </div>
          <div class="do-dont">
            <div class="do-card">
              <p class="do-title">✓ يجب أن تفعل</p>
              <ul>${(creativeBrief.doList || []).map(item => `<li>✓ ${item}</li>`).join('')}</ul>
            </div>
            <div class="dont-card">
              <p class="dont-title">✗ تجنّب</p>
              <ul>${(creativeBrief.dontList || []).map(item => `<li>✗ ${item}</li>`).join('')}</ul>
            </div>
          </div>
          ${creativeBrief.inspirations && creativeBrief.inspirations.length > 0 ? `
          <div class="grid-2" style="margin-top:14px;">
            <div class="card">
              <p class="card-label">✦ علامات إلهام</p>
              ${creativeBrief.inspirations.map(it => `<p class="card-value" style="margin-top:4px;">· ${it}</p>`).join('')}
            </div>
            <div class="card">
              <p class="card-label">◆ المخرجات المطلوبة</p>
              ${(creativeBrief.deliverables || []).map(d => `<p class="card-value" style="margin-top:4px;">· ${d}</p>`).join('')}
            </div>
          </div>` : ''}
        </div>
      `;
    }

    // ── SECTION 4: Color Palette ──
    if (colorPalette) {
      const swatches = [
        colorPalette.primary, colorPalette.secondary,
        colorPalette.accent, colorPalette.neutral, colorPalette.background,
      ];
      body += `
        <div class="section">
          <div class="section-header">
            <span class="section-num">٤</span>
            <div class="section-accent" style="background:#2dd4bf;"></div>
            <h2 class="section-title">لوحة الألوان</h2>
          </div>
          <div class="swatch-strip">
            ${swatches.map(s => `
              <div class="swatch-block">
                <div class="swatch-color" style="background:${s.hex};"></div>
                <div class="swatch-info">
                  <p class="swatch-name">${s.nameAr}</p>
                  <p class="swatch-hex">${s.hex}</p>
                  <p class="swatch-rgb">rgb(${s.rgb || hexToRgb(s.hex)})</p>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="grid-2">
            <div class="card">
              <p class="card-label">المنطق اللوني</p>
              <p class="card-value">${colorPalette.rationale}</p>
            </div>
            <div class="card">
              <p class="card-label">سيكولوجية الألوان</p>
              <p class="card-value">${colorPalette.psychologyNotes}</p>
            </div>
          </div>
          ${colorPalette.usage ? `
          <div class="card" style="margin-top:14px;">
            <p class="card-label">دليل الاستخدام</p>
            <table class="usage-table" style="margin-top:10px;">
              <tr>
                <td><span class="usage-dot" style="background:${colorPalette.primary.hex};"></span><strong>الرئيسي</strong></td>
                <td>${colorPalette.usage.primary || ''}</td>
              </tr>
              <tr>
                <td><span class="usage-dot" style="background:${colorPalette.secondary.hex};"></span><strong>الثانوي</strong></td>
                <td>${colorPalette.usage.secondary || ''}</td>
              </tr>
              <tr>
                <td><span class="usage-dot" style="background:${colorPalette.accent.hex};"></span><strong>المميز</strong></td>
                <td>${colorPalette.usage.accent || ''}</td>
              </tr>
            </table>
          </div>` : ''}
        </div>
      `;
    }

    // ── SECTION 5: Logo Concepts ──
    if (logoConcepts && logoConcepts.length > 0) {
      const conceptColors = [core.color, selectedPath?.colors?.[0] ?? '#2dd4bf', edge.color];
      body += `
        <div class="section">
          <div class="section-header">
            <span class="section-num">٥</span>
            <div class="section-accent" style="background:#f59e0b;"></div>
            <h2 class="section-title">أفكار الشعار</h2>
          </div>
          ${logoConcepts.map((concept, i) => {
            const cc = conceptColors[i] ?? core.color;
            const isSel = selectedConcept?.id === concept.id;
            return `
              <div class="concept${isSel ? ' concept-selected' : ''}">
                <div class="concept-header">
                  <span class="concept-num" style="background:${cc};">${i + 1}</span>
                  <div style="flex:1;">
                    <p class="concept-title">${concept.title}</p>
                    <p class="concept-style">${concept.style}</p>
                  </div>
                  ${isSel ? '<span class="selected-badge">✓ المختار</span>' : ''}
                </div>
                <p style="font-size:13px;color:#334155;line-height:1.7;margin-bottom:14px;">${concept.description}</p>
                <div class="grid-2">
                  <div class="card">
                    <p class="card-label" style="color:${cc};">العناصر البصرية</p>
                    <div class="tags">${(concept.visualElements || []).map(el => `<span class="tag-gray">${el}</span>`).join('')}</div>
                  </div>
                  <div class="card">
                    <p class="card-label" style="color:${cc};">الرمزية والمعنى</p>
                    <p class="card-value">${concept.symbolism}</p>
                  </div>
                  <div class="card">
                    <p class="card-label" style="color:${cc};">استخدام الألوان</p>
                    <p class="card-value">${concept.colorUsage}</p>
                  </div>
                  <div class="card">
                    <p class="card-label" style="color:${cc};">توجه الخط</p>
                    <p class="card-value">${concept.typography}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // ── FOOTER ──
    body += `
      <div class="footer">
        <p class="footer-brand">${brandInput.name || 'العلامة التجارية'}</p>
        <p class="footer-sub" style="color:${core.color};">${core.nameAr} + ${edge.nameAr}</p>
        <p class="footer-sub">${today} · مُعدّ بواسطة مستشار الهوية البصرية</p>
      </div>
    `;

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير الهوية البصرية — ${brandInput.name || 'العلامة التجارية'}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>${body}</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 900);
    } else {
      alert('يرجى السماح للنوافذ المنبثقة لتحميل التقرير');
    }
  }

  // ── Handlers ────────────────────────────────────────────────────
  async function handleLoadBrandEssence() {
    if (!brandInput.name || !brandInput.industry) { setError('يرجى إدخال اسم العلامة والمجال على الأقل'); return; }
    setLoading(true); setError(null);
    setLoadingMsg('يحلّل الذكاء الاصطناعي جوهر علامتك...');
    try { setBrandEssence(await getBrandEssence(brandInput, quizResult.coreArchetype, quizResult.edgeArchetype)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleLoadVisualPaths() {
    setLoading(true); setError(null);
    setLoadingMsg('يولّد 3 مسارات بصرية مختلفة...');
    try { setVisualPaths(await getVisualPaths(brandInput, quizResult.coreArchetype, quizResult.edgeArchetype)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleAIMoodboard() {
    if (!selectedPath) return;
    setMoodboardMode('ai'); setGeneratingImages(true); setError(null);
    try {
      const descs = await getMoodboardDescriptions(selectedPath, brandInput, quizResult.coreArchetype);
      setMoodImages(descs);
      setGeneratedImgUrls(await Promise.all(descs.map(d => generateMoodImage(d.prompt))));
    } catch (e: any) { setError(e.message); } finally { setGeneratingImages(false); }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setUploadedImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    setMoodboardMode('upload');
  }

  async function handleLoadBrief() {
    if (!selectedPath || !brandEssence) return;
    setLoading(true); setError(null);
    setLoadingMsg('يُنشئ الموجز الإبداعي الشامل...');
    try { setCreativeBrief(await getCreativeBrief(brandInput, quizResult.coreArchetype, quizResult.edgeArchetype, selectedPath, brandEssence)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleLoadColors() {
    if (!selectedPath) return;
    setLoading(true); setError(null);
    setLoadingMsg('يولّد لوحة الألوان المثالية لعلامتك...');
    try { setColorPalette(await getColorPalette(quizResult.coreArchetype, quizResult.edgeArchetype, brandInput, selectedPath)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleLoadConcepts() {
    setLoading(true); setError(null);
    setLoadingMsg('يُولّد 3 أفكار إبداعية للشعار...');
    try { setLogoConcepts(await getLogoConcepts(quizResult.coreArchetype, quizResult.edgeArchetype, brandInput, selectedPath!, creativeBrief)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  // ── Shared UI ───────────────────────────────────────────────────
  const EmptyState = ({ icon: Icon, title, desc, action }: {
    icon: React.ElementType; title: string; desc: string; action: React.ReactNode;
  }) => (
    <div className="card rounded-2xl p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-elevated border border-brand-line flex items-center justify-center mx-auto">
        <Icon size={22} className="text-brand-muted" />
      </div>
      <div>
        <h4 className="font-semibold text-brand-text mb-1">{title}</h4>
        <p className="text-brand-subtle text-sm max-w-sm mx-auto leading-relaxed">{desc}</p>
      </div>
      {action}
    </div>
  );

  const SectionHeader = ({ step: s, title, subtitle, extra }: {
    step: number; title: string; subtitle: string; extra?: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal font-black text-sm shrink-0">
          {s}
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-text">{title}</h2>
          <p className="text-sm text-brand-muted">{subtitle}</p>
        </div>
      </div>
      {extra}
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── STEP NAV ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-subtle text-sm transition-colors shrink-0">
            <ChevronLeft size={15} /> النتائج
          </button>

          <div className="flex-1 flex items-center gap-0 overflow-x-auto">
            {STEPS.map((s, i) => {
              const Icon  = s.icon;
              const done  = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <button onClick={() => setStep(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      active  ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/30'
                      : done  ? 'text-brand-teal/60 hover:text-brand-teal'
                      : 'text-brand-muted hover:text-brand-subtle'
                    }`}>
                    {done ? <CheckCircle size={13} /> : <Icon size={13} />}
                    <span className="hidden lg:inline">{s.label}</span>
                    <span className="lg:hidden">{s.id}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-px mx-0.5 transition-colors ${done ? 'bg-brand-teal/30' : 'bg-brand-border'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: core.color + '15', color: core.color }}>{core.nameAr}</span>
            <span className="text-brand-border text-xs">+</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: edge.color + '15', color: edge.color }}>{edge.nameAr}</span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {error && (
          <div className="mb-6 bg-red-500/8 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card rounded-2xl px-10 py-8 flex flex-col items-center gap-4 border-brand-line">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-brand-teal/20 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-brand-subtle text-sm">{loadingMsg}</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 1 — Strategic Foundation
        ═══════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={1} title="الأساس الاستراتيجي" subtitle="أدخل معلومات علامتك لبناء جوهرها الإبداعي" />
            <div className="card rounded-2xl p-7 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">اسم العلامة التجارية *</label>
                  <input className="field" placeholder="مثال: نوما، أتلاس، سمّا..."
                    value={brandInput.name} onChange={e => setBrandInput({ ...brandInput, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">المجال / الصناعة *</label>
                  <input className="field" placeholder="مثال: مطاعم، تقنية، أزياء..."
                    value={brandInput.industry} onChange={e => setBrandInput({ ...brandInput, industry: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">الجمهور المستهدف</label>
                <input className="field" placeholder="من هم عملاؤك المثاليون؟"
                  value={brandInput.audience} onChange={e => setBrandInput({ ...brandInput, audience: e.target.value })} />
              </div>
              <div>
                <label className="label">القيم الجوهرية</label>
                <textarea className="field resize-none h-24" placeholder="ما الذي تؤمن به علامتك؟"
                  value={brandInput.values} onChange={e => setBrandInput({ ...brandInput, values: e.target.value })} />
              </div>
              <div>
                <label className="label">معيار الصناعة — اختياري</label>
                <select className="field" value={brandInput.standardArchetype}
                  onChange={e => setBrandInput({ ...brandInput, standardArchetype: e.target.value as ArchetypeKey })}>
                  <option value="">ما الشخصية التي يتوقعها العملاء من مجالك؟</option>
                  {Object.values(ARCHETYPES).map(a => (
                    <option key={a.key} value={a.key}>{a.nameAr} — {a.nameEn}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleLoadBrandEssence} disabled={loading} className="btn-primary w-full py-4 rounded-xl text-base">
                <Sparkles size={18} /> تحليل جوهر العلامة بالذكاء الاصطناعي
              </button>
            </div>

            {brandEssence && (
              <div className="card rounded-2xl p-7 space-y-5 slide-up" style={{ borderColor: core.color + '20' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-teal" />
                  <h3 className="font-bold text-brand-text">جوهر علامتك</h3>
                </div>
                <div className="border-r-2 border-brand-teal pr-5 py-1">
                  <p className="text-brand-text text-lg font-medium leading-relaxed">"{brandEssence.essence}"</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { key: 'التموضع',     val: brandEssence.positioning },
                    { key: 'نبرة الصوت', val: brandEssence.brandVoice },
                    { key: 'القيمة الفريدة', val: brandEssence.uniqueValue },
                  ].map(item => (
                    <div key={item.key} className="card-elevated rounded-xl p-4">
                      <p className="text-xs text-brand-teal font-medium tracking-wide uppercase mb-1.5">{item.key}</p>
                      <p className="text-brand-subtle text-sm leading-relaxed">{item.val}</p>
                    </div>
                  ))}
                  <div className="card-elevated rounded-xl p-4">
                    <p className="text-xs text-brand-teal font-medium tracking-wide uppercase mb-2">سمات الشخصية</p>
                    <div className="flex flex-wrap gap-1.5">
                      {brandEssence.personality.map((p, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-brand-teal/8 text-brand-teal rounded-full border border-brand-teal/15">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="btn-outline w-full py-3 rounded-xl">
                  التالي: التوجه الإبداعي <ChevronLeft size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 2 — Visual Direction
        ═══════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={2} title="التوجه الإبداعي" subtitle="اختر المسار البصري الذي يعبّر عن علامتك" />

            {visualPaths.length === 0 ? (
              <EmptyState icon={Layers} title="توليد المسارات البصرية"
                desc="سيقترح الذكاء الاصطناعي 3 مسارات بصرية مختلفة لعلامتك"
                action={<button onClick={handleLoadVisualPaths} className="btn-primary px-8 py-3.5 rounded-xl"><Sparkles size={17} /> توليد المسارات البصرية</button>} />
            ) : (
              <div className="space-y-3">
                {visualPaths.map((path, i) => {
                  const isSel = selectedPath?.title === path.title;
                  return (
                    <div key={i} onClick={() => setSelectedPath(path)}
                      className={`card rounded-2xl p-6 cursor-pointer transition-all duration-200 ${isSel ? 'border-brand-teal/50 bg-brand-teal/3' : 'hover:border-brand-line'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-brand-teal' : 'border-brand-line'}`}>
                          {isSel && <div className="w-2 h-2 rounded-full bg-brand-teal" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-brand-text">{path.title}</h3>
                            <span className="text-xs text-brand-teal bg-brand-teal/8 px-2 py-0.5 rounded-full">{path.mood}</span>
                          </div>
                          <p className="text-brand-subtle text-sm leading-relaxed mb-4">{path.description}</p>
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex gap-1.5">
                              {path.colors.map((c, j) => <div key={j} className="w-7 h-7 rounded-lg border border-white/8" style={{ background: c }} />)}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {path.keywords.map(k => <span key={k} className="text-xs bg-brand-elevated border border-brand-line text-brand-muted px-2 py-0.5 rounded-lg">{k}</span>)}
                            </div>
                          </div>
                          <p className="text-xs text-brand-muted mt-2.5 border-t border-brand-border pt-2.5">الخطوط: {path.fontStyle}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedPath && (
              <>
                <div className="card rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-brand-text">لوحة الإلهام</h3>
                    <span className="text-xs text-brand-muted bg-brand-elevated px-2 py-0.5 rounded-full border border-brand-line">Moodboard</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <button onClick={() => { setMoodboardMode('upload'); fileInputRef.current?.click(); }}
                      className={`p-5 rounded-xl border-2 text-center transition-all ${moodboardMode === 'upload' ? 'border-brand-teal bg-brand-teal/5' : 'border-brand-border hover:border-brand-line'}`}>
                      <Upload size={22} className="mx-auto mb-2 text-brand-teal" />
                      <p className="font-semibold text-brand-text text-sm">ارفع صورك</p>
                      <p className="text-brand-muted text-xs mt-1">اختر صور إلهامك من جهازك</p>
                    </button>
                    <button onClick={handleAIMoodboard} disabled={generatingImages}
                      className={`p-5 rounded-xl border-2 text-center transition-all ${moodboardMode === 'ai' ? 'border-brand-teal bg-brand-teal/5' : 'border-brand-border hover:border-brand-line'}`}>
                      <Sparkles size={22} className="mx-auto mb-2 text-brand-teal" />
                      <p className="font-semibold text-brand-text text-sm">اترك الأمر للذكاء الاصطناعي</p>
                      <p className="text-brand-muted text-xs mt-1">يولّد صور إلهام مناسبة</p>
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {uploadedImages.map((src, i) => (
                        <div key={i} className="relative group">
                          <img src={src} alt="" className="w-full h-28 object-cover rounded-xl" />
                          <button onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-1.5 left-1.5 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={11} className="text-white" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => fileInputRef.current?.click()}
                        className="h-28 border-2 border-dashed border-brand-border rounded-xl flex items-center justify-center text-brand-muted hover:text-brand-subtle hover:border-brand-line transition-colors">
                        <Upload size={18} />
                      </button>
                    </div>
                  )}
                  {moodboardMode === 'ai' && (
                    <div>
                      {generatingImages && (
                        <div className="flex items-center gap-2.5 text-brand-subtle text-sm">
                          <div className="w-4 h-4 border border-brand-teal border-t-transparent rounded-full animate-spin" />
                          يولّد صور الإلهام...
                        </div>
                      )}
                      {moodImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                          {moodImages.map((img, i) => (
                            <div key={i} className="space-y-1">
                              {generatedImgUrls[i]
                                ? <img src={generatedImgUrls[i]!} alt={img.mood} className="w-full h-32 object-cover rounded-xl" />
                                : <div className="w-full h-32 bg-brand-elevated rounded-xl flex flex-col items-center justify-center gap-2 p-3 text-center border border-brand-border">
                                    <Sparkles size={18} className="text-brand-teal opacity-40" />
                                    <p className="text-brand-muted text-xs">{img.descriptionAr}</p>
                                  </div>
                              }
                              <p className="text-xs text-brand-muted text-center">{img.mood}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setStep(3)} className="btn-primary w-full py-4 rounded-xl">
                  التالي: إنشاء الموجز الإبداعي <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 3 — Creative Brief
        ═══════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={3} title="الموجز الإبداعي" subtitle="مستند كامل للمصمم" />
            {!creativeBrief ? (
              <EmptyState icon={FileText} title="إنشاء الموجز الإبداعي"
                desc="موجز شامل: الهدف، نبرة الصوت، سيكولوجية الألوان، توجه الشعار، وما يجب وما لا يجب"
                action={<button onClick={handleLoadBrief} className="btn-primary px-8 py-3.5 rounded-xl"><Sparkles size={17} /> إنشاء الموجز الإبداعي</button>} />
            ) : (
              <>
                <div className="card rounded-2xl p-7 space-y-5">
                  <div className="flex items-start justify-between border-b border-brand-border pb-5">
                    <div>
                      <p className="text-xs text-brand-teal font-medium tracking-widest uppercase mb-1">Creative Brief</p>
                      <h3 className="text-2xl font-black text-brand-text">{brandInput.name || 'اسم العلامة'}</h3>
                      <p className="text-brand-subtle text-sm">{brandInput.industry}</p>
                    </div>
                    <div className="flex gap-2">
                      {[core, edge].map(a => (
                        <span key={a.key} className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: a.color + '15', color: a.color }}>{a.nameAr}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { label: 'نظرة عامة',         value: creativeBrief.projectOverview },
                      { label: 'الهدف',              value: creativeBrief.objective },
                      { label: 'الجمهور المستهدف',   value: creativeBrief.targetAudience },
                      { label: 'شخصية العلامة',      value: creativeBrief.brandPersonality },
                      { label: 'نبرة الصوت',         value: creativeBrief.toneOfVoice },
                      { label: 'سيكولوجية الألوان',  value: creativeBrief.colorPsychology },
                      { label: 'توجه الخطوط',        value: creativeBrief.typographyDirection },
                      { label: 'توجه الشعار',        value: creativeBrief.logoDirection },
                    ].map(s => (
                      <div key={s.label} className="card-elevated rounded-xl p-4">
                        <p className="text-xs text-brand-teal font-bold tracking-wide uppercase mb-2">{s.label}</p>
                        <p className="text-brand-subtle text-sm leading-relaxed">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl p-4 border" style={{ background: '#10b98108', borderColor: '#10b98120' }}>
                      <p className="text-emerald-400 font-bold text-xs tracking-wide uppercase mb-3">✓ يجب أن تفعل</p>
                      <ul className="space-y-1.5">{creativeBrief.doList.map((item, i) => (
                        <li key={i} className="text-brand-subtle text-xs flex gap-2"><span className="text-emerald-500 shrink-0">✓</span> {item}</li>
                      ))}</ul>
                    </div>
                    <div className="rounded-xl p-4 border" style={{ background: '#ef444408', borderColor: '#ef444420' }}>
                      <p className="text-red-400 font-bold text-xs tracking-wide uppercase mb-3">✗ تجنّب</p>
                      <ul className="space-y-1.5">{creativeBrief.dontList.map((item, i) => (
                        <li key={i} className="text-brand-subtle text-xs flex gap-2"><span className="text-red-500 shrink-0">✗</span> {item}</li>
                      ))}</ul>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(4)} className="btn-primary w-full py-4 rounded-xl">
                  التالي: توليد لوحة الألوان <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 4 — Color Palette
        ═══════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={4} title="لوحة الألوان" subtitle="مُولَّدة بالذكاء الاصطناعي لشخصية علامتك" />
            {!colorPalette ? (
              <EmptyState icon={Palette} title="توليد لوحة الألوان"
                desc={`يحلّل Gemini شخصية ${core.nameAr} + ${edge.nameAr} والمسار البصري المختار ليقترح لوحة ألوان متناغمة`}
                action={<button onClick={handleLoadColors} className="btn-primary px-8 py-3.5 rounded-xl"><Sparkles size={17} /> توليد لوحة الألوان</button>} />
            ) : (
              <div className="space-y-5 fade-in">
                <div className="card rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-5 h-28">
                    {[colorPalette.primary, colorPalette.secondary, colorPalette.accent, colorPalette.neutral, colorPalette.background].map((s, i) => (
                      <button key={i} onClick={() => navigator.clipboard.writeText(s.hex)}
                        className="relative group" style={{ background: s.hex }}>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-xs text-white bg-black/60 px-2 py-0.5 rounded-lg transition-opacity">نسخ</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 border-t border-brand-border">
                    {[colorPalette.primary, colorPalette.secondary, colorPalette.accent, colorPalette.neutral, colorPalette.background].map((s, i) => (
                      <div key={i} className="p-3 text-center border-l border-brand-border first:border-l-0">
                        <p className="text-xs font-bold text-brand-text truncate mb-0.5">{s.nameAr}</p>
                        <button onClick={() => navigator.clipboard.writeText(s.hex)}
                          className="text-xs text-brand-teal hover:text-teal-300 font-mono transition-colors">{s.hex}</button>
                        <p className="text-xs text-brand-muted mt-0.5 hidden sm:block">rgb({s.rgb})</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card-elevated rounded-xl p-5">
                    <p className="text-xs text-brand-teal font-bold tracking-wide uppercase mb-2">المنطق اللوني</p>
                    <p className="text-brand-subtle text-sm leading-relaxed">{colorPalette.rationale}</p>
                  </div>
                  <div className="card-elevated rounded-xl p-5">
                    <p className="text-xs text-brand-teal font-bold tracking-wide uppercase mb-2">سيكولوجية الألوان</p>
                    <p className="text-brand-subtle text-sm leading-relaxed">{colorPalette.psychologyNotes}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleLoadColors} className="btn-ghost"><Sparkles size={14} /> لوحة بديلة</button>
                  <button onClick={() => { setLogoConcepts([]); setStep(5); }} className="btn-primary flex-1 py-3.5 rounded-xl">
                    التالي: أفكار الشعار <ChevronLeft size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 5 — Logo Concepts
        ═══════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={5} title="أفكار الشعار" subtitle="3 مفاهيم إبداعية — اختر الأنسب لعلامتك" />
            {!logoConcepts || logoConcepts.length === 0 ? (
              <EmptyState icon={Lightbulb} title="توليد أفكار الشعار"
                desc={`3 مفاهيم متباينة — كلاسيكي، عصري، ورمزي — لشخصية ${core.nameAr} ومسار ${selectedPath?.title ?? ''}`}
                action={
                  <button onClick={handleLoadConcepts} className="btn-primary px-8 py-3.5 rounded-xl">
                    <Sparkles size={17} /> توليد 3 أفكار للشعار
                  </button>
                } />
            ) : (
              <>
                <div className="space-y-4">
                  {logoConcepts.map((concept, i) => {
                    const isSel = selectedConcept?.id === concept.id;
                    const conceptColor = [core.color, selectedPath?.colors[0] ?? '#2dd4bf', edge.color][i] ?? core.color;
                    return (
                      <div key={concept.id} onClick={() => setSelectedConcept(concept)}
                        className={`card rounded-2xl p-6 cursor-pointer transition-all duration-200 ${isSel ? 'bg-brand-teal/3' : 'hover:border-brand-line'}`}
                        style={{ borderColor: isSel ? conceptColor + '40' : undefined }}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                            style={{ background: isSel ? conceptColor : conceptColor + '20', color: isSel ? '#0a0a12' : conceptColor }}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-bold text-brand-text">{concept.title}</h3>
                              {isSel && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: conceptColor, color: '#0a0a12' }}>✓ مختار</span>}
                            </div>
                            <p className="text-xs font-medium" style={{ color: conceptColor + 'bb' }}>{concept.style}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${isSel ? 'border-brand-teal' : 'border-brand-border'}`}>
                            {isSel && <div className="w-2 h-2 rounded-full bg-brand-teal" />}
                          </div>
                        </div>
                        <p className="text-brand-subtle text-sm leading-relaxed mb-4">{concept.description}</p>
                        <div className="grid md:grid-cols-2 gap-2.5">
                          {[
                            { label: 'العناصر البصرية', content: <div className="flex flex-wrap gap-1">{concept.visualElements.map((el, j) => <span key={j} className="text-xs px-2 py-0.5 rounded-lg text-brand-subtle border border-brand-border">{el}</span>)}</div> },
                            { label: 'الرمزية والمعنى', content: <p className="text-brand-subtle text-xs leading-relaxed">{concept.symbolism}</p> },
                            { label: 'استخدام الألوان',  content: <p className="text-brand-subtle text-xs">{concept.colorUsage}</p> },
                            { label: 'توجه الخط',       content: <p className="text-brand-subtle text-xs">{concept.typography}</p> },
                          ].map(item => (
                            <div key={item.label} className="card-elevated rounded-xl p-3">
                              <p className="text-xs font-bold mb-1.5 tracking-wide" style={{ color: conceptColor }}>{item.label}</p>
                              {item.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={handleLoadConcepts} className="btn-ghost"><Sparkles size={14} /> توليد جديد</button>
                  <button onClick={() => setStep(6)} disabled={!selectedConcept}
                    className="btn-primary flex-1 py-3.5 rounded-xl disabled:opacity-40">
                    <BookOpen size={16} />
                    {selectedConcept ? 'التالي: إنشاء التقرير النهائي' : 'اختر فكرة أولاً'}
                    <ChevronLeft size={15} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 6 — Final Report
        ═══════════════════════════════════════ */}
        {step === 6 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={6} title="التقرير النهائي" subtitle="ملخص كامل لهوية علامتك — جاهز للتحميل" />

            {/* Completion banner */}
            <div className="card rounded-2xl p-8 relative overflow-hidden" style={{ borderColor: core.color + '25' }}>
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top right, ${core.color}, transparent 60%)` }} />
              <div className="relative text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center mx-auto text-3xl">🎉</div>
                <h3 className="text-2xl font-black text-brand-text">اكتملت رحلة الهوية البصرية!</h3>
                <p className="text-brand-subtle text-sm leading-relaxed max-w-md mx-auto">
                  {brandInput.name || 'علامتك'} · {core.nameAr} + {edge.nameAr}<br />
                  تقريرك يضم كل ما تحتاجه للبدء مع مصممك
                </p>
              </div>
            </div>

            {/* What's included */}
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { icon: '💡', label: 'جوهر العلامة',    done: !!brandEssence,   desc: brandEssence ? `"${brandEssence.essence.slice(0, 55)}..."` : '' },
                { icon: '🎨', label: 'التوجه الإبداعي', done: !!selectedPath,   desc: selectedPath?.title },
                { icon: '📄', label: 'الموجز الإبداعي', done: !!creativeBrief,  desc: creativeBrief ? `${creativeBrief.doList.length} توجيه · ${creativeBrief.dontList.length} محظور` : '' },
                { icon: '🖌', label: 'لوحة الألوان',    done: !!colorPalette,   desc: colorPalette ? `${[colorPalette.primary, colorPalette.secondary, colorPalette.accent].map(s => s.hex).join(' · ')}` : '' },
                { icon: '✦',  label: 'أفكار الشعار',    done: !!(logoConcepts?.length), desc: selectedConcept ? `المختار: ${selectedConcept.title.split(' — ')[0]}` : `${logoConcepts?.length ?? 0} أفكار` },
              ].map(item => (
                <div key={item.label} className={`card-elevated rounded-xl p-4 flex items-start gap-3 ${!item.done ? 'opacity-40' : ''}`}>
                  <div className="text-xl shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-brand-text text-sm">{item.label}</p>
                      {item.done
                        ? <span className="text-xs text-emerald-400">✓ مكتمل</span>
                        : <span className="text-xs text-brand-muted">غير مكتمل</span>}
                    </div>
                    {item.desc && <p className="text-xs text-brand-muted truncate">{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={downloadReport}
                className="btn-primary w-full py-4 rounded-xl text-base"
                style={{ background: 'linear-gradient(135deg, #2dd4bf, #0891b2)' }}
              >
                <Download size={20} />
                تحميل التقرير الكامل — PDF
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost py-3 rounded-xl justify-center">
                  <ChevronLeft size={15} /> مراجعة الخطوات
                </button>
                <button
                  onClick={onRestart}
                  className="flex items-center justify-center gap-2 border-2 border-brand-border text-brand-subtle hover:border-red-500/40 hover:text-red-400 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  <RotateCcw size={15} /> إعادة الاختبار من البداية
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
