# تشغيل المشروع

## الخطوات

### 1. تثبيت Node.js
حمّل وثبّت Node.js من: https://nodejs.org (اختر LTS)

### 2. أضف مفتاح Gemini API
أنشئ ملف `.env` في جذر المشروع:
```
VITE_GEMINI_API_KEY=AIza...مفتاحك_هنا
```

### 3. تثبيت الحزم وتشغيل المشروع
افتح Terminal في مجلد المشروع وشغّل:
```bash
npm install
npm run dev
```

### 4. افتح المتصفح على:
```
http://localhost:5173
```

---

## هيكل المشروع
```
src/
  App.tsx              — التطبيق الرئيسي
  types.ts             — أنواع TypeScript
  constants.ts         — الـ 48 سؤالاً وبيانات الشخصيات
  services/gemini.ts   — كل استدعاءات Gemini AI
  components/
    IntroScreen.tsx    — الشاشة التعريفية
    Quiz.tsx           — الاختبار التفاعلي
    Results.tsx        — النتائج والتحليل
    DesignGuideTool.tsx — ورشة التصميم (4 خطوات)
```
