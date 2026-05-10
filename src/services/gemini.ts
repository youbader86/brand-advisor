import { GoogleGenAI } from '@google/genai';
import type {
  ArchetypeKey, BrandInput, LogoAnalysis,
  BrandEssence, VisualPath, CreativeBrief, ColorPalette, MoodImage, LogoConcept,
} from '../types';
import { ARCHETYPES } from '../constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function generate(prompt: string, systemInstruction: string, model = 'gemini-2.0-flash'): Promise<string> {
  if (!ai) throw new Error('NO_KEY');
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { systemInstruction, responseMimeType: 'application/json', temperature: 0.8 },
  });
  return response.text ?? '{}';
}

async function tryGenerate(prompt: string, system: string, fallback: string): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await generate(prompt, system);
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isNoKey = msg.includes('NO_KEY') || msg.includes('API Key');
      if (isNoKey) break;
      if (isQuota && attempt < 2) { await sleep((attempt + 1) * 6000); continue; }
      break;
    }
  }
  return fallback;
}

// ─── Fallback data ─────────────────────────────────────────────────────────────

const LOGO_FALLBACKS: Record<ArchetypeKey, LogoAnalysis> = {
  innocent: {
    brandEssence: 'علامة تجارية تنبض بالبساطة والأصالة، تخاطب الروح الفطرية في الإنسان وتعده بعالم أكثر نقاءً وسعادة. هويتها البصرية هادئة ومريحة توحي بالأمان والثقة.',
    archetypeInsight: 'البريء يتجلّى في الخطوط الناعمة والمساحات البيضاء الوفيرة. تجنّب التعقيد البصري — البساطة هي رسالتك الأقوى. الألوان الفاتحة والدافئة تعزز مشاعر الأمان.',
    logoRecommendations: [
      { type: 'wordmark', typeAr: 'علامة نصية', score: 92, reason: 'الخط النظيف والبسيط يجسّد قيم البساطة والصدق المرتبطة بشخصية البريء', designTips: ['استخدم خطاً دائرياً ناعماً بلا زوايا حادة', 'أضف مسافات سخية بين الحروف للإيحاء بالانفتاح', 'اختر وزناً خفيفاً أو متوسطاً لا Bold'] },
      { type: 'brandmark', typeAr: 'رمز مستقل', score: 78, reason: 'رمز بسيط ونظيف يختزل جوهر العلامة في لمحة بصرية واحدة', designTips: ['أشكال دائرية أو عضوية طبيعية', 'تجنّب الزوايا الحادة والمعقدة', 'رمز واحد بسيط يُقرأ بسهولة بأي حجم'] },
      { type: 'combination', typeAr: 'شعار مركّب', score: 70, reason: 'يجمع النص والرمز بتناغم هادئ مناسب للمرحلة الأولى من بناء العلامة', designTips: ['رتّب الرمز فوق النص أو يساره بمسافة كافية', 'حافظ على التوازن البصري بين العناصر', 'لا تكتظ — المساحة البيضاء جزء من التصميم'] },
    ],
    doList: ['استخدم ألواناً فاتحة ودافئة (أبيض، كريمي، سماوي فاتح، وردي باهت)', 'أبقِ التصميم نظيفاً بمسافات بيضاء سخية', 'اختر خطوطاً دائرية ناعمة توحي بالودية', 'استعمل رسائل بصرية إيجابية ومبهجة'],
    dontList: ['تجنّب الألوان الداكنة والقاتمة التي تثير القلق', 'لا تُكثر من العناصر البصرية في التصميم', 'ابتعد عن الزوايا الحادة والأشكال الهندسية الصارمة', 'لا تستخدم خطوطاً ثقيلة وضخمة'],
  },
  sage: {
    brandEssence: 'علامة تجارية تُجسّد الخبرة والمعرفة العميقة، تبني ثقة عملائها من خلال الشفافية والدقة. هويتها البصرية رصينة وموثوقة تعكس السلطة المعرفية.',
    archetypeInsight: 'الحكيم يتحدث بوضوح وثقة. التصميم يجب أن يعكس الرسوخ والعمق — خطوط serif للموثوقية، ألوان داكنة محكمة، تناظر بصري يوحي بالنظام والدقة.',
    logoRecommendations: [
      { type: 'wordmark', typeAr: 'علامة نصية', score: 90, reason: 'الكلمة وحدها تكفي للحكيم — الاسم يحمل ثقل الخبرة والسمعة', designTips: ['خط serif كلاسيكي يوحي بالرسوخ والمصداقية', 'وزن متوسط إلى ثقيل لإبراز الجدية', 'مسافات منتظمة محسوبة بدقة'] },
      { type: 'emblem', typeAr: 'شعار إشارة', score: 80, reason: 'الشعار التقليدي يعزز مكانة السلطة المعرفية ويبني الثقة المؤسسية', designTips: ['دائرة أو شكل هندسي منتظم يحتوي الاسم', 'تفاصيل دقيقة تعكس العناية والاحترافية', 'ألوان داكنة كالكحلي أو الأخضر الداكن أو الرمادي الفولاذي'] },
      { type: 'combination', typeAr: 'شعار مركّب', score: 72, reason: 'رمز هندسي منتظم مع نص رصين يبني هوية أكاديمية محترمة', designTips: ['رمز يرمز للمعرفة (كتاب، ضوء، عين) بأسلوب مجرد', 'توازن بصري محكم بين الرمز والنص', 'لا تبالغ في البساطة — قليل من التفصيل يضيف المصداقية'] },
    ],
    doList: ['استخدم ألواناً راسخة كالكحلي والأخضر الداكن والرمادي الفولاذي', 'اختر خطوطاً كلاسيكية serif للنصوص الرئيسية', 'أظهر الدقة في التفاصيل البصرية', 'حافظ على الاتساق في كل نقاط التواصل'],
    dontList: ['تجنّب الألوان المبهجة والصاخبة', 'لا تستخدم خطوطاً مرحة أو غير رسمية', 'ابتعد عن التصميمات التي تبدو سطحية أو تجارية', 'لا تغيّر هويتك البصرية باستمرار'],
  },
  explorer: {
    brandEssence: 'علامة تجارية تدعو إلى اكتشاف الآفاق وكسر الحدود، تخاطب الأرواح المغامرة الباحثة عن التجارب الأصيلة. هويتها البصرية حرة وديناميكية تفيض بروح المغامرة.',
    archetypeInsight: 'المستكشف يحتاج هوية بصرية تبدو حية ومتحركة. الرموز التي توحي بالحركة والاتساع، الألوان الطبيعية الجريئة، وتصاميم تشعر بالحرية لا الإطار المحدود.',
    logoRecommendations: [
      { type: 'brandmark', typeAr: 'رمز مستقل', score: 88, reason: 'رمز قوي يُعرف على الفور ويحمل روح المغامرة بلا حاجة لكلمات', designTips: ['أشكال تستوحي من الطبيعة والجغرافيا (جبال، موجة، بوصلة)', 'خطوط ديناميكية تحاكي الحركة والانطلاق', 'يجب أن يعمل على المعدات والملابس والأماكن الخارجية'] },
      { type: 'dynamic', typeAr: 'شعار متغير', score: 82, reason: 'الشعار المتكيّف يعكس روح التكيّف والمرونة التي تعيشها علامات المغامرة', designTips: ['شكل ثابت مع تغييرات في اللون أو الملمس حسب السياق', 'يمكن تطبيقه على بيئات مختلفة (رمال، ثلج، غابة)', 'يجب أن يظل مقروءاً في أصعب الظروف البصرية'] },
      { type: 'combination', typeAr: 'شعار مركّب', score: 74, reason: 'اسم قوي مع رمز مميز يبني هوية يسهل حملها في رحلة بناء العلامة', designTips: ['خط sans-serif جريء وعصري يوحي بالحداثة', 'رمز ذو طابع طبيعي أو جغرافي', 'يمكن استخدام الرمز منفرداً في التطبيقات الصغيرة'] },
    ],
    doList: ['استخدم ألوان الطبيعة الجريئة (أخضر الغابة، أزرق المحيط، بني الأرض، برتقالي الغروب)', 'صمّم لأقصى حالات الاستخدام — في الهواء الطلق، على الملابس، في الظروف القاسية', 'استعمل صور ومشاهد طبيعية أصيلة لا مصطنعة', 'أبقِ العلامة متوافقة مع قيم الاستدامة والبيئة'],
    dontList: ['تجنّب التصاميم المعقدة التي لا تصمد على الخامات الخشنة', 'لا تبدو صنعة مكتبية — كل شيء يجب أن يبدو وكأنه اختُبر ميدانياً', 'ابتعد عن الألوان الباردة المعدنية', 'لا تستخدم رموزاً مجردة تفقد معناها في الطبيعة'],
  },
  rebel: {
    brandEssence: 'علامة تحطّم القواعد وتقلب المعادلات، تتحدى الوضع الراهن وتمنح عملاءها شجاعة التمرد المبدع. هويتها البصرية جريئة واستفزازية بشكل محسوب.',
    archetypeInsight: 'المتمرد لا يطلب الإذن. التصميم يجب أن يشعر بالجرأة والتحدي — زوايا حادة، تباين قصوى، كسر للقواعد البصرية التقليدية بأسلوب ذكي لا فوضوي.',
    logoRecommendations: [
      { type: 'abstract', typeAr: 'رمز تجريدي', score: 90, reason: 'الرمز التجريدي الجريء يعكس رفض التصنيف التقليدي ويترك انطباعاً لا يُنسى', designTips: ['أشكال غير متوقعة تتحدى التوقعات البصرية', 'تباين حاد بين العناصر', 'لا تهدأ بسهولة — يجب أن يثير رد فعل'] },
      { type: 'brandmark', typeAr: 'رمز مستقل', score: 84, reason: 'رمز مميز بصمة هوية قوية تصبح مرتبطة بالتمرد والأصالة', designTips: ['خطوط حادة وزوايا قوية', 'تناقضات بصرية صارخة', 'يعمل بالأبيض على الأسود والعكس'] },
      { type: 'wordmark', typeAr: 'علامة نصية', score: 75, reason: 'اسم قوي بخط جريء يصبح شعاراً بحد ذاته كما Nike و Supreme', designTips: ['خط مخصص غير اعتيادي يمثل هوية لا يمتلكها أحد غيرك', 'تلاعب بالمسافات والأحجام بشكل متعمد', 'يمكن تحريف الخط قليلاً كنوع من التمرد المحسوب'] },
    ],
    doList: ['استخدم الأسود والأبيض والألوان الصاخبة بجرأة', 'اكسر قواعد التصميم التقليدية بطريقة مقصودة ومحسوبة', 'اصنع هوية تثير المشاعر القوية — الحب أو عدم المبالاة، لا الحياد', 'كن دائماً أمام الثقافة لا خلفها'],
    dontList: ['لا تكن جريئاً بلا سبب — التمرد يجب أن يخدم رسالة', 'تجنّب الألوان الفاتحة والناعمة — هذا ليس مكانك', 'لا تنتهج طريق الـ"safe" في أي قرار تصميمي', 'ابتعد عن التصاميم المؤسسية الرسمية'],
  },
  magician: {
    brandEssence: 'علامة تجارية تحوّل الواقع وتصنع المستحيل ممكناً، تمنح عملاءها تجارب تتخطى توقعاتهم وتترك في حياتهم أثراً سحرياً لا يُنسى. هويتها البصرية غامضة وساحرة.',
    archetypeInsight: 'الساحر يجعل كل شيء يبدو بلا مجهود. التصميم يجب أن يشعر بالأسرار الكامنة — تدرجات لونية عميقة، رموز غنية بالمعنى، وتفاصيل تكشف نفسها كلما تأملتها.',
    logoRecommendations: [
      { type: 'abstract', typeAr: 'رمز تجريدي', score: 92, reason: 'الرمز التجريدي الغني بالمعنى يجسّد طبيعة الساحر الذي يخفي أسراره في العيان', designTips: ['رمز يحمل طبقات من المعنى تُكشف تدريجياً', 'استخدم التناظر الدقيق أو الكسوري', 'يجب أن يبدو وكأنه ينطوي على سر'] },
      { type: 'brandmark', typeAr: 'رمز مستقل', score: 85, reason: 'رمز قوي يبقى في الذاكرة ويصبح تعويذة بصرية مرتبطة بالعلامة', designTips: ['استلهم من الرموز الكونية والطبيعة (النجوم، الأمواج، الدوامات)', 'تدرج لوني داخل الرمز يضيف العمق والسحر', 'يعمل جيداً كطبع مجسّم وليس فقط رقمياً'] },
      { type: 'combination', typeAr: 'شعار مركّب', score: 76, reason: 'رمز غامض مع اسم أنيق يبني هوية تشعر بالحصرية والفخامة الغامضة', designTips: ['خط serif أنيق يضيف لمسة من القدم والعمق', 'رمز يعلو الاسم كتاج بصري', 'لعب على التباين بين الضوء والظل'] },
    ],
    doList: ['استخدم تدرجات لونية عميقة (بنفسجي، أزرق ملكي، أسود نيلي، ذهبي)', 'أضف طبقات من المعنى في تصميمك — لا يُكشف كله دفعة واحدة', 'استعمل مواد راقية وغير اعتيادية في المطبوعات', 'اصنع تجربة unboxing أو تعامل لا تُنسى'],
    dontList: ['تجنّب البساطة المفرطة التي تخلو من الغموض', 'لا تستخدم ألواناً فاتحة وعادية تفقد الغموض', 'ابتعد عن التصاميم التي تشرح نفسها كاملاً دون ترك مجال للتساؤل', 'لا تكن متوقعاً في أي شيء'],
  },
  hero: {
    brandEssence: 'علامة تجارية تبني الثقة بالنفس وتحفّز على تخطي الحدود، تقف إلى جانب عملائها في أصعب اللحظات وتمنحهم الأدوات لينتصروا. هويتها البصرية قوية ومصممة.',
    archetypeInsight: 'البطل يظهر في اللحظات الفارقة. التصميم يجب أن يُشعر بالقوة والثقة — أشكال هندسية صلبة، ألوان جريئة، خطوط واثقة لا تتردد، مساحة بيضاء تعطي الشعار مجاله.',
    logoRecommendations: [
      { type: 'emblem', typeAr: 'شعار إشارة', score: 90, reason: 'الشعار القوي كالـ badge يمنح العلامة هيبة وثقلاً يتناسب مع طموح البطل', designTips: ['شكل درع أو دائرة قوية تحمي محتواها', 'تفاصيل محكمة تعكس الاحترافية العالية', 'يعمل ممتازاً على الزي الرسمي والمعدات'] },
      { type: 'brandmark', typeAr: 'رمز مستقل', score: 86, reason: 'رمز بسيط وقوي يصبح شارة انتماء وفخر كـ Nike Swoosh', designTips: ['شكل ديناميكي يوحي بالحركة والانطلاق', 'خطوط قوية لا تتردد', 'يعمل منفرداً بكامل قوته'] },
      { type: 'combination', typeAr: 'شعار مركّب', score: 78, reason: 'اسم جريء مع رمز قوي يبني حضوراً بصرياً لا يُنسى في السوق التنافسي', designTips: ['خط sans-serif حديث بوزن ثقيل', 'رمز يوحي بالقوة والحركة', 'تباين واضح — لا رمادي في المنتصف'] },
    ],
    doList: ['استخدم ألواناً قوية كالأحمر والأسود والكحلي والذهبي', 'صمّم للأداء والوضوح في كل الأحجام والمواد', 'استعمل رسائل تشجيعية وتحفيزية في التواصل', 'كن حاضراً في لحظات الإنجاز والتحدي'],
    dontList: ['تجنّب الألوان الفاتحة الباهتة التي تبدو ضعيفة', 'لا تستخدم خطوطاً رفيعة أو ناعمة', 'ابتعد عن الرسائل السلبية أو المعتذرة', 'لا تبدو عادياً — البطل يبرز دائماً'],
  },
  lover: {
    brandEssence: 'علامة تجارية تصنع تجارب حسية فائقة وتبني علاقات عاطفية عميقة مع جمهورها، تعدهم بالجمال والإثارة والانتماء لعالم خاص. هويتها البصرية فاتنة وراقية.',
    archetypeInsight: 'العاشق يتحدث إلى الحواس أولاً. كل عنصر بصري يجب أن يثير مشاعر الرغبة والجذب — ألوان دافئة وعميقة، خطوط أنيقة منحنية، تفاصيل راقية تعكس الاهتمام الفائق.',
    logoRecommendations: [
      { type: 'wordmark', typeAr: 'علامة نصية', score: 91, reason: 'الاسم وحده يصبح رمز الرقي والفتنة كـ Chanel و Dior', designTips: ['خط serif أنيق بضربات رفيعة وسمينة متناوبة', 'مسافات ملكية بين الحروف', 'يقرأ بصوت عالٍ بشكل أنيق'] },
      { type: 'brandmark', typeAr: 'رمز مستقل', score: 80, reason: 'رمز ذو جمالية عالية يرمز إلى الجاذبية والرغبة الجمالية', designTips: ['أشكال منحنية ناعمة تحاكي الجسد والطبيعة', 'رفيع وأنيق — لا ضخامة أو ثقل', 'يعمل جيداً كنقشة على المنتجات'] },
      { type: 'combination', typeAr: 'شعار مركّب', score: 73, reason: 'نص أنيق مع رمز لطيف يبني هوية حسية متكاملة', designTips: ['رمز يكمل الاسم لا يكرره', 'وردة أو خط منحنٍ بدقة استثنائية', 'اهتمام مفرط بالتفاصيل الدقيقة'] },
    ],
    doList: ['استخدم ألواناً دافئة وعميقة (أحمر العنب، وردي داكن، ذهبي، أبيض عاجي)', 'استثمر في الخامات والطباعة عالية الجودة', 'اصنع تجارب حسية في كل نقطة تواصل', 'تحدّث عن المشاعر والرغبات لا عن المواصفات'],
    dontList: ['تجنّب الخطوط الضخمة والصارمة', 'لا تبدو رخيصاً أو عاماً في أي عنصر تصميمي', 'ابتعد عن الألوان الباردة والمعدنية', 'لا تتحدث عن السعر أو الصفقات'],
  },
  jester: {
    brandEssence: 'علامة تجارية تجلب الفرح وتكسر الرتابة، تمنح عملاءها إذناً بالضحك والاستمتاع والتعامل مع الحياة بخفة. هويتها البصرية مرحة وحيوية ومفاجئة دائماً.',
    archetypeInsight: 'المهرج لا يأخذ نفسه بجدية — وهذه قوته. التصميم يجب أن يبتسم: ألوان منير، أشكال مرحة غير متوقعة، طاقة بصرية عالية تُعدي بالمرح والسعادة.',
    logoRecommendations: [
      { type: 'mascot', typeAr: 'شخصية ماسكوت', score: 93, reason: 'الماسكوت يمنح العلامة شخصية مرحة حية يتفاعل معها الجمهور بعاطفة حقيقية', designTips: ['شخصية ذات تعابير مبالغ فيها بطريقة محببة', 'تنوع في مشاعر الشخصية عبر التطبيقات المختلفة', 'يجب أن تضحك فعلاً عند رؤيتها أو على الأقل تبتسم'] },
      { type: 'wordmark', typeAr: 'علامة نصية', score: 80, reason: 'اسم بخط مرح يعكس روح العلامة في أبسط أشكالها', designTips: ['خط مخصص يبدو كأنه كُتب باليد بحماس', 'حروف غير منتظمة الارتفاع قليلاً كالأطفال', 'يمكن إضافة تفاصيل صغيرة مضحكة داخل الحروف'] },
      { type: 'dynamic', typeAr: 'شعار متغير', score: 76, reason: 'شعار يتغير بالمناسبات والمواسم يعكس الديناميكية والمرح اللامتناهي للمهرج', designTips: ['إصدارات موسمية بألوان وتفاصيل مختلفة', 'مفاجآت بصرية في المناسبات الخاصة', 'يشجع الجمهور على انتظار التغييرات القادمة'] },
    ],
    doList: ['استخدم طيفاً واسعاً من الألوان الزاهية والمبهجة', 'لا تخف من المبالغة والحماس في أي عنصر', 'أضف لحظات مفاجأة وفكاهة في كل نقطة تواصل', 'تحدّث بلغة الشارع العصرية ولا تبالغ في الرسمية'],
    dontList: ['تجنّب الألوان الباهتة والتصاميم الرصينة', 'لا تكن جاداً أكثر مما ينبغي', 'ابتعد عن الخطوط الصارمة والهندسية الباردة', 'لا تُهمل الاستجابة لأحداث الثقافة الشعبية'],
  },
  everyman: {
    brandEssence: 'علامة تجارية تعرف قيمة الإنسان العادي وتكرّم احتياجاته الحقيقية، تبني مجتمعاً يشعر فيه كل فرد بالانتماء والقبول. هويتها البصرية صادقة ودافئة وقريبة من الناس.',
    archetypeInsight: 'الشخص العادي لا يريد أن يُعامَل كعميل بل كصديق. التصميم يجب أن يبدو مألوفاً ومريحاً — ألوان دافئة محايدة، خطوط سهلة القراءة، رسائل بسيطة تُفهم من النظرة الأولى.',
    logoRecommendations: [
      { type: 'wordmark', typeAr: 'علامة نصية', score: 88, reason: 'الاسم وحده يكفي — الشخص العادي يقدّر الصدق والوضوح على الزخرفة', designTips: ['خط sans-serif ودي سهل القراءة', 'وزن متوسط لا ثقيل ولا خفيف', 'مسافات طبيعية مريحة للعين'] },
      { type: 'combination', typeAr: 'شعار مركّب', score: 82, reason: 'رمز يرمز للانتماء والمجتمع مع اسم واضح يبني هوية يتعرف عليها الجميع', designTips: ['رمز يرمز للناس أو المجتمع أو التعاون', 'بسيط ومألوف لا غريب', 'يعمل جيداً على القنوات الرقمية والمطبوعة البسيطة'] },
      { type: 'brandmark', typeAr: 'رمز مستقل', score: 70, reason: 'رمز يمثل الانتماء والجذور يمنح العلامة هوية يسهل تذكرها', designTips: ['أشكال إنسانية مجردة أو بيت أو يدان', 'لا تعقيد — الفهم الفوري هو الهدف', 'الحجم الصغير يجب أن يظل واضحاً'] },
    ],
    doList: ['استخدم ألواناً دافئة محايدة (بيج، بني فاتح، أخضر هادئ، أزرق سماوي محايد)', 'تحدّث بلغة الناس الحقيقية لا المصطلحات التسويقية', 'ابرز الاجتماعية والانتماء في كل تواصل', 'قدّم قيمة حقيقية لا وعوداً مبالغاً فيها'],
    dontList: ['تجنّب الفخامة المبالغة التي تُشعر الناس بالغربة', 'لا تبدو نخبوياً أو حصرياً', 'ابتعد عن اللغة المعقدة والمصطلحات الكبيرة', 'لا تضع نفسك فوق جمهورك'],
  },
  caregiver: {
    brandEssence: 'علامة تجارية تضع الإنسان في مركز كل قرار، تبني علاقة قائمة على الرعاية الحقيقية والدعم غير المشروط. هويتها البصرية دافئة وحانية تشعرك بالأمان فور رؤيتها.',
    archetypeInsight: 'المعتني يتحدث بالقلب. التصميم يجب أن يُشعر بالدفء والأمان — ألوان تذكر بالبيت والعائلة، أشكال ناعمة لا حواف حادة، رسائل تحتضن لا تبيع.',
    logoRecommendations: [
      { type: 'combination', typeAr: 'شعار مركّب', score: 90, reason: 'رمز يرمز للرعاية مع اسم دافئ يبني علاقة ثقة فورية مع الجمهور', designTips: ['رمز يد أو قلب أو دائرة تحتضن عناصر أخرى', 'خط دائري ناعم يوحي بالدفء', 'ألوان ترابية دافئة أو أخضر طبيعي هادئ'] },
      { type: 'brandmark', typeAr: 'رمز مستقل', score: 83, reason: 'رمز يرمز للحب والرعاية يصبح رمزاً عاطفياً يتعلق به الجمهور', designTips: ['قلب أو يد أو دائرة بأسلوب أنيق لا طفولي', 'يجب أن يثير مشاعر الدفء عند النظر إليه', 'تجنّب الحدة والزوايا الحادة في كل رموزك'] },
      { type: 'wordmark', typeAr: 'علامة نصية', score: 75, reason: 'اسم بخط ناعم ودافئ يعكس شخصية المعتني الإنسانية', designTips: ['خط مستدير دافئ يشعر بالأمان', 'وزن خفيف أو متوسط لا يبدو ثقيلاً', 'يمكن استخدام حرف أول مخصص يرمز للرعاية'] },
    ],
    doList: ['استخدم ألواناً دافئة (بيج، برتقالي ناعم، أخضر حكيمي، أزرق سماوي فاتح)', 'اجعل تجربة العميل سلسة ومريحة في كل خطوة', 'تحدّث بعاطفة حقيقية وتعاطف صادق', 'أظهر القصص الإنسانية وراء علامتك'],
    dontList: ['تجنّب الألوان الباردة والمعدنية', 'لا تضع الربح فوق احتياجات الإنسان في رسائلك', 'ابتعد عن اللغة الطبية الباردة حتى لو كنت في القطاع الصحي', 'لا تتجاهل القصص العاطفية في تواصلك'],
  },
  ruler: {
    brandEssence: 'علامة تجارية تُجسّد القيادة والسيادة، تبني أنظمة وتضع معايير يحتذي بها الآخرون. هويتها البصرية سلطوية وفاخرة تعكس مكانة لا تُنازَع في قمة السوق.',
    archetypeInsight: 'الحاكم يملي الأجندة ولا يتبعها. التصميم يجب أن يشعر بالهيبة والسلطة — خطوط serif ملكية، ألوان داكنة فاخرة، تناظر محكم، ومساحة بصرية سخية تعكس الثقة بالنفس.',
    logoRecommendations: [
      { type: 'wordmark', typeAr: 'علامة نصية', score: 93, reason: 'الاسم وحده يمثل السلطة — كـ Rolex و HSBC ومؤسسات القيادة الكبرى', designTips: ['خط serif ملكي بضربات متوازنة وهيبة واضحة', 'حروف كبيرة كلها capitals تعكس الهيمنة', 'مسافات ملكية سخية تعطي الاسم مجاله الكامل'] },
      { type: 'emblem', typeAr: 'شعار إشارة', score: 87, reason: 'الشعار كالختم الرسمي يمنح العلامة سلطة مؤسسية راسخة', designTips: ['شكل دائرة أو درع محاط بتفاصيل دقيقة', 'ذهبي أو فضي على خلفية داكنة', 'كل عنصر داخل الشعار له مغزى ومبرر'] },
      { type: 'lettermark', typeAr: 'اختصار حرفي', score: 79, reason: 'الحروف الأولى كـ LV و YSL تصبح رموز القوة والهيمنة', designTips: ['خط مخصص يحمل هوية لا تُقلَّد', 'ترتيب الحروف بتوازن هندسي محكم', 'يعمل ممتازاً كنقشة على المنتجات الفاخرة'] },
    ],
    doList: ['استخدم ألواناً ملكية (كحلي داكن، أسود عميق، ذهبي، بلاتيني)', 'استثمر في أعلى مستويات الجودة في كل ما تُنتج', 'رسائلك تُقرر لا تسأل — أنت تضع المعيار', 'كن حاضراً في أرقى الفضاءات والمنصات'],
    dontList: ['لا تُهادن في معايير الجودة أبداً', 'تجنّب الألوان الزاهية والمرحة', 'لا تبدو متاحاً للجميع — الحصرية جزء من قيمتك', 'ابتعد عن الخصومات والعروض الرخيصة'],
  },
  creator: {
    brandEssence: 'علامة تجارية تؤمن بأن التعبير الإبداعي يغيّر العالم، تمنح عملاءها الأدوات والإلهام لصنع شيء لم يكن موجوداً من قبل. هويتها البصرية ثرية وفريدة تتطور باستمرار.',
    archetypeInsight: 'المبدع يرفض القوالب الجاهزة. التصميم يجب أن يشعر بأنه مصنوع خصيصاً — تفاصيل فريدة، خطوط مخصصة، طبقات بصرية تعكس عملية الإبداع نفسها.',
    logoRecommendations: [
      { type: 'abstract', typeAr: 'رمز تجريدي', score: 91, reason: 'الرمز التجريدي الفريد يعكس جوهر الإبداع الذي يتجاوز التصنيف المعتاد', designTips: ['رمز يحمل شخصية فريدة لا نظير لها', 'يمكن أن يُستوحى من عملية الإبداع ذاتها', 'يعمل بألوان مختلفة دون أن يفقد قوته'] },
      { type: 'dynamic', typeAr: 'شعار متغير', score: 88, reason: 'الشعار المتطور يعكس الطبيعة المتغيرة للإبداع ويجذب الاهتمام باستمرار', designTips: ['نظام بصري يسمح بتنويعات لا نهائية ضمن إطار ثابت', 'كل إصدار يقصّ جزءاً من قصة العلامة', 'يشجع المجتمع على التفاعل والمشاركة'] },
      { type: 'combination', typeAr: 'شعار مركّب', score: 77, reason: 'نص بخط مخصص مع رمز فريد يبني هوية لا تُنسى في عالم الإبداع', designTips: ['خط مخصص يعكس روح العلامة تحديداً', 'رمز يرمز للإبداع والحرفية', 'يمكن تطبيقه على كل المواد الإبداعية بليونة'] },
    ],
    doList: ['استثمر في خط مخصص يمثل هويتك وحدها', 'دع الإبداع يظهر في كل تفصيلة — لا توفير في الجودة البصرية', 'اصنع محتوى يُلهم لا يُعلن فقط', 'شارك عملية صنع الأشياء لا فقط نتائجها'],
    dontList: ['لا تستخدم خطوطاً وتصاميم جاهزة يستخدمها الجميع', 'تجنّب القوالب الممنهجة التي تُشعر بالآلية', 'لا تسوّق — ألهم', 'ابتعد عن التكرار الممل في محتواك'],
  },
};

const ESSENCE_FALLBACKS: Record<ArchetypeKey, BrandEssence> = {
  innocent:  { essence: 'بساطة أصيلة تجلب السكينة', positioning: 'العلامة التي تُذكّرك بما هو حقيقي وجميل في الحياة', personality: ['بسيط', 'صادق', 'متفائل', 'دافئ', 'موثوق'], brandVoice: 'نبرة هادئة ومطمئنة، تتحدث كصديق قديم لا كمعلن', uniqueValue: 'الأصالة والصدق في عالم مليء بالمبالغة' },
  sage:      { essence: 'معرفة راسخة توجّه القرارات الصحيحة', positioning: 'المرجع الموثوق الذي تعود إليه عند أهم القرارات', personality: ['خبير', 'موثوق', 'واضح', 'دقيق', 'محترم'], brandVoice: 'نبرة واثقة وواضحة، تعلّم ولا تُعقّد، تنير ولا تُرهب', uniqueValue: 'المعرفة العميقة المقدّمة بوضوح استثنائي' },
  explorer:  { essence: 'حرية لا حدود لها، تجارب تتخطى المتوقع', positioning: 'بوابة التجارب الأصيلة للأرواح الباحثة عن المعنى', personality: ['مغامر', 'حر', 'أصيل', 'شغوف', 'مستقل'], brandVoice: 'نبرة متحمسة وداعية، تصف لا تبيع، تستدعي لا تُكره', uniqueValue: 'إمكانية الوصول إلى تجارب لا يجدها الآخرون' },
  rebel:     { essence: 'تحدٍّ محسوب يصنع الفارق الحقيقي', positioning: 'البديل الجريء لكل من سئم الخيارات التقليدية', personality: ['جريء', 'أصيل', 'مثير', 'تحرري', 'ذكي'], brandVoice: 'مباشر وصريح، يتحدى ولا يعتذر، يُثير ولا يُزعج', uniqueValue: 'الجرأة على فعل ما يتمنى الجميع فعله' },
  magician:  { essence: 'تحويل الواقع وصنع ما يبدو مستحيلاً', positioning: 'العلامة التي تُحقق ما لم يكن أحد يتصوره ممكناً', personality: ['ساحر', 'ملهم', 'غامض', 'رؤيوي', 'مبدع'], brandVoice: 'شاعري وملهم، يثير التساؤل والدهشة، يعد بالتحول', uniqueValue: 'القدرة على رؤية ما وراء الظاهر وتحويله' },
  hero:      { essence: 'قوة تمكّنك من تخطي حدودك', positioning: 'الشريك الموثوق في أصعب التحديات وأهم اللحظات', personality: ['قوي', 'موثوق', 'محفّز', 'جاد', 'فعّال'], brandVoice: 'قوي وتحفيزي، يُلهم الفعل لا الاستسلام، يُعلي الهمم', uniqueValue: 'الأداء الاستثنائي عندما يكون الرهان عالياً' },
  lover:     { essence: 'تجارب حسية راقية تُغذّي الروح', positioning: 'العلامة التي ترى في عميلها الجمال الذي يستحق أجمل الأشياء', personality: ['فاتن', 'راقٍ', 'حميمي', 'شغوف', 'أنيق'], brandVoice: 'دافئ وحميمي، يتحدث عن الشعور لا الشيء، يُغري ولا يُلزم', uniqueValue: 'الرقي في التفاصيل الذي لا يُقارَن' },
  jester:    { essence: 'بهجة حقيقية تكسر الرتابة اليومية', positioning: 'العلامة التي تمنحك إذناً بالضحك والاستمتاع بلا مبرر', personality: ['مرح', 'خفيف', 'مفاجئ', 'اجتماعي', 'عفوي'], brandVoice: 'مرح وعفوي، لا يأخذ نفسه بجدية، يُدهش ويُسعد', uniqueValue: 'الجرأة على جلب الفرح الحقيقي في عالم جاد' },
  everyman:  { essence: 'قيمة حقيقية للناس الحقيقيين', positioning: 'العلامة التي تعرف ما تحتاجه فعلاً وتقدمه بلا تكلف', personality: ['ودود', 'أصيل', 'عملي', 'موثوق', 'محترم'], brandVoice: 'دافئ وعملي، يتحدث كجار لا كشركة، بسيط ومباشر', uniqueValue: 'الصدق والقيمة الحقيقية دون ادعاء أو مبالغة' },
  caregiver: { essence: 'رعاية تنبع من القلب لا من الواجب', positioning: 'العلامة التي تضعك في المركز وتهتم بتجربتك فوق كل اعتبار', personality: ['حاني', 'موثوق', 'داعم', 'صادق', 'دافئ'], brandVoice: 'دافئ ومطمئن، يستمع ويفهم قبل أن يتكلم، يُشعرك بالأمان', uniqueValue: 'الرعاية الصادقة التي تشعرها لا مجرد تُعلَن' },
  ruler:     { essence: 'قيادة تبني الأنظمة وتضع المعايير', positioning: 'المرجع الذي تقاس به علامات أخرى في القطاع', personality: ['سلطوي', 'واثق', 'منظّم', 'حاسم', 'راسخ'], brandVoice: 'واثق وحاسم، يُقرر لا يُقترح، يُرسي لا يُجرّب', uniqueValue: 'السيادة المبنية على الكفاءة والتاريخ والثقة' },
  creator:   { essence: 'إبداع لا يعرف القوالب الجاهزة', positioning: 'المنصة التي يُطلق منها المبدعون ما لم يُصنع بعد', personality: ['مبدع', 'رؤيوي', 'متميز', 'شغوف', 'أصيل'], brandVoice: 'ملهم ومُثير، يُظهر عملية الإبداع لا فقط النتيجة، يُشجع لا يُلزم', uniqueValue: 'الفضاء الذي تتحول فيه الأفكار إلى واقع فريد' },
};

function getPathsFallback(coreKey: ArchetypeKey): VisualPath[] {
  const core = ARCHETYPES[coreKey];
  return [
    { title: 'الأناقة الكلاسيكية', description: `مسار بصري راقٍ يستوحي من جماليات ${core.nameAr} — نظيف وموقّر يُعبّر عن العمق والرسوخ`, mood: 'رصين · راقٍ · موثوق', keywords: ['كلاسيكي', 'أنيق', 'راسخ', 'محترم'], colors: [core.color, '#1e293b', '#f8fafc', '#94a3b8'], fontStyle: 'Serif كلاسيكي — رصين وذو شخصية قوية' },
    { title: 'الجرأة العصرية', description: `تصميم جريء يعكس الوجه المعاصر لـ ${core.nameAr} — حديث ومنتبه يخاطب الجيل الجديد`, mood: 'جريء · حديث · مؤثر', keywords: ['عصري', 'جريء', 'مؤثر', 'ديناميكي'], colors: [core.color, '#0f172a', '#ffffff', '#6366f1'], fontStyle: 'Sans-serif هندسي حديث — واضح ومباشر' },
    { title: 'الدفء الإنساني', description: `هوية بصرية دافئة تُبرز الجانب الإنساني في شخصية ${core.nameAr} — قريبة ومألوفة`, mood: 'دافئ · إنساني · قريب', keywords: ['دافئ', 'أصيل', 'إنساني', 'مريح'], colors: [core.color, '#78350f', '#fef3c7', '#d97706'], fontStyle: 'خط دائري ودود — ناعم وسهل الاقتراب' },
  ];
}

function getBriefFallback(brandInput: BrandInput, coreKey: ArchetypeKey, edgeKey: ArchetypeKey, path: VisualPath): CreativeBrief {
  const core = ARCHETYPES[coreKey];
  const edge = ARCHETYPES[edgeKey];
  return {
    projectOverview: `${brandInput.name} — علامة تجارية في مجال ${brandInput.industry} تجمع بين شخصية ${core.nameAr} الأساسية وروح ${edge.nameAr} الداعمة لخلق هوية فريدة تترك أثراً حقيقياً.`,
    objective: `بناء هوية بصرية متكاملة وراسخة تعكس قيم العلامة وتخاطب ${brandInput.audience} بصدق وتميّز.`,
    targetAudience: brandInput.audience,
    brandPersonality: `${core.traits.join(' · ')} مع لمسة من ${edge.traits.slice(0,2).join(' و')}`,
    toneOfVoice: ESSENCE_FALLBACKS[coreKey].brandVoice,
    colorPsychology: `ألوان المسار "${path.title}" مختارة لتعكس ${path.mood} — تعزز المشاعر المرتبطة بشخصية ${core.nameAr} وتبني الثقة مع الجمهور المستهدف.`,
    typographyDirection: path.fontStyle,
    logoDirection: LOGO_FALLBACKS[coreKey].logoRecommendations[0].reason,
    doList: LOGO_FALLBACKS[coreKey].doList,
    dontList: LOGO_FALLBACKS[coreKey].dontList,
    inspirations: core.examples.slice(0, 3),
    deliverables: ['الشعار الأساسي بصيغ متعددة (SVG, PNG, PDF)', 'دليل الهوية البصرية (Brand Guidelines)', 'قالب بطاقة العمل والقرطاسية الرسمية', 'ملفات الشبكات الاجتماعية (أحجام وتنسيقات)', 'دليل الألوان والخطوط للاستخدام الرقمي'],
  };
}

function getPaletteFallback(coreKey: ArchetypeKey, path: VisualPath): ColorPalette {
  const [p, s, a, n] = [...path.colors, '#f8fafc', '#1e293b'];
  return {
    primary:    { hex: p,       nameAr: 'اللون الرئيسي',    rgb: hexToRgb(p) },
    secondary:  { hex: s,       nameAr: 'اللون الثانوي',    rgb: hexToRgb(s) },
    accent:     { hex: a,       nameAr: 'لون التأكيد',      rgb: hexToRgb(a) },
    neutral:    { hex: n,       nameAr: 'اللون المحايد',    rgb: hexToRgb(n) },
    background: { hex: '#f8fafc', nameAr: 'لون الخلفية',   rgb: '248, 250, 252' },
    rationale: `اللوحة مستوحاة من مسار "${path.title}" وشخصية ${ARCHETYPES[coreKey].nameAr} — الألوان مختارة لتعكس ${path.mood} وتبني الثقة مع الجمهور.`,
    psychologyNotes: `اللون الرئيسي ${ARCHETYPES[coreKey].color} مرتبط بقيم ${ARCHETYPES[coreKey].traits.slice(0,2).join(' و')} ويثير مشاعر تتوافق مع جوهر العلامة.`,
    usage: {
      primary: 'العناصر الرئيسية: الشعار، الأزرار، العناوين الكبرى، نقاط التركيز البصري',
      secondary: 'العناصر الداعمة: الخلفيات، الإطارات، الأقسام الثانوية',
      accent: 'نقاط الجذب: الـ CTA، التواريخ، الإحصائيات، عناصر التمييز',
    },
    combinations: [
      { bg: p, text: '#ffffff', label: 'رئيسي على أبيض — للأزرار والعناوين' },
      { bg: '#ffffff', text: s, label: 'ثانوي على أبيض — للنصوص الطويلة' },
      { bg: s, text: '#ffffff', label: 'ثانوي كخلفية — للبطاقات والأقسام' },
    ],
  };
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '0, 0, 0';
  const r = parseInt(clean.slice(0,2),16);
  const g = parseInt(clean.slice(2,4),16);
  const b = parseInt(clean.slice(4,6),16);
  return `${r}, ${g}, ${b}`;
}

// ─── 1. Logo Analysis ──────────────────────────────────────────────────────────
export async function getLogoAnalysis(coreKey: ArchetypeKey, edgeKey: ArchetypeKey): Promise<LogoAnalysis> {
  const core = ARCHETYPES[coreKey];
  const edge = ARCHETYPES[edgeKey];
  const prompt = `علامتنا التجارية: CORE "${core.nameAr}" (${core.nameEn}) — ${core.description}\nEDGE "${edge.nameAr}" (${edge.nameEn}) — ${edge.description}\nسمات: ${core.traits.join('، ')}\nأمثلة: ${core.examples.join('، ')}`;
  const system = `أنت خبير هوية بصرية. أجب بـ JSON فقط:\n{"brandEssence":"string","archetypeInsight":"string","logoRecommendations":[{"type":"wordmark|lettermark|brandmark|combination|emblem|mascot|abstract|dynamic","typeAr":"string","score":0,"reason":"string","designTips":["string","string","string"]}],"doList":["string","string","string","string"],"dontList":["string","string","string","string"]}\n3-4 توصيات. عربية فصحى.`;
  const fallback = JSON.stringify(LOGO_FALLBACKS[coreKey]);
  const raw = await tryGenerate(prompt, system, fallback);
  return JSON.parse(raw) as LogoAnalysis;
}

// ─── 2. Brand Essence ──────────────────────────────────────────────────────────
export async function getBrandEssence(brandInput: BrandInput, coreKey: ArchetypeKey, edgeKey: ArchetypeKey): Promise<BrandEssence> {
  const core = ARCHETYPES[coreKey]; const edge = ARCHETYPES[edgeKey];
  const prompt = `اسم: ${brandInput.name}\nمجال: ${brandInput.industry}\nجمهور: ${brandInput.audience}\nقيم: ${brandInput.values}\nCORE: ${core.nameAr} — ${core.description}\nEDGE: ${edge.nameAr}`;
  const system = `أنت مدير إبداعي. أجب بـ JSON فقط:\n{"essence":"string","positioning":"string","personality":["string","string","string","string","string"],"brandVoice":"string","uniqueValue":"string"}`;
  const fallbackObj = { ...ESSENCE_FALLBACKS[coreKey], essence: `${brandInput.name} — ${ESSENCE_FALLBACKS[coreKey].essence}`, positioning: `${brandInput.name}: ${ESSENCE_FALLBACKS[coreKey].positioning}` };
  const raw = await tryGenerate(prompt, system, JSON.stringify(fallbackObj));
  return JSON.parse(raw) as BrandEssence;
}

// ─── 3. Visual Paths ───────────────────────────────────────────────────────────
export async function getVisualPaths(brandInput: BrandInput, coreKey: ArchetypeKey, edgeKey: ArchetypeKey): Promise<VisualPath[]> {
  const core = ARCHETYPES[coreKey]; const edge = ARCHETYPES[edgeKey];
  const prompt = `علامة: ${brandInput.name} | مجال: ${brandInput.industry}\nشخصية: ${core.nameAr} + ${edge.nameAr}\nجمهور: ${brandInput.audience}\nقيم: ${brandInput.values}`;
  const system = `أنت مدير فني. اقترح 3 مسارات بصرية متباينة. أجب بـ JSON:\n{"paths":[{"title":"string","description":"string","mood":"string","keywords":["string","string","string","string"],"colors":["#hex","#hex","#hex","#hex"],"fontStyle":"string"}]}`;
  const raw = await tryGenerate(prompt, system, JSON.stringify({ paths: getPathsFallback(coreKey) }));
  return (JSON.parse(raw) as { paths: VisualPath[] }).paths;
}

// ─── 4. Moodboard Descriptions ─────────────────────────────────────────────────
export async function getMoodboardDescriptions(path: VisualPath, brandInput: BrandInput, coreKey: ArchetypeKey): Promise<MoodImage[]> {
  const core = ARCHETYPES[coreKey];
  const prompt = `مسار: ${path.title} — ${path.description}\nمزاج: ${path.mood}\nكلمات: ${path.keywords.join('، ')}\nعلامة: ${brandInput.name} | شخصية: ${core.nameAr}`;
  const system = `أنت مدير فني. اقترح 4 صور إلهامية للـ Moodboard. أجب بـ JSON:\n{"images":[{"prompt":"detailed English image prompt for AI generation","descriptionAr":"string","mood":"string"}]}`;
  const fallback = JSON.stringify({ images: [
    { prompt: `${path.mood} brand mood board, ${path.keywords.join(', ')}, high quality photography, cinematic lighting`, descriptionAr: `مشهد بصري يعكس ${path.mood}`, mood: path.mood },
    { prompt: `minimalist ${core.nameEn} brand aesthetic, ${path.colors[0]} color palette, elegant composition`, descriptionAr: `تكوين بصري بألوان العلامة`, mood: 'هادئ · منظّم' },
    { prompt: `lifestyle photography representing ${core.nameEn} values, natural light, authentic moment`, descriptionAr: `لقطة حياتية أصيلة تعكس قيم العلامة`, mood: 'أصيل · حي' },
    { prompt: `abstract ${path.keywords[0]} texture, ${path.colors.slice(0,2).join(' and ')} tones, artistic background`, descriptionAr: `ملمس تجريدي يعكس روح المسار البصري`, mood: 'إبداعي · عميق' },
  ]});
  const raw = await tryGenerate(prompt, system, fallback);
  return (JSON.parse(raw) as { images: MoodImage[] }).images;
}

// ─── 5. Generate Moodboard Image ───────────────────────────────────────────────
export async function generateMoodImage(imagePrompt: string): Promise<string | null> {
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: [{ role: 'user', parts: [{ text: `Mood board image for brand identity. Style: cinematic, high-end photography, artistic. ${imagePrompt}` }] }],
      config: { responseModalities: ['image', 'text'] },
    });
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if ((part as any).inlineData) {
        const d = (part as any).inlineData;
        return `data:${d.mimeType};base64,${d.data}`;
      }
    }
    return null;
  } catch { return null; }
}

// ─── 6. Creative Brief ────────────────────────────────────────────────────────
export async function getCreativeBrief(brandInput: BrandInput, coreKey: ArchetypeKey, edgeKey: ArchetypeKey, selectedPath: VisualPath, brandEssence: BrandEssence): Promise<CreativeBrief> {
  const core = ARCHETYPES[coreKey]; const edge = ARCHETYPES[edgeKey];
  const prompt = `علامة: ${brandInput.name}\nمجال: ${brandInput.industry}\nجمهور: ${brandInput.audience}\nقيم: ${brandInput.values}\nشخصية: ${core.nameAr} + ${edge.nameAr}\nمسار: ${selectedPath.title} — ${selectedPath.description}\nجوهر: ${brandEssence.essence}\nنبرة: ${brandEssence.brandVoice}`;
  const system = `أنت مدير إبداعي. أنشئ موجزاً إبداعياً. أجب بـ JSON:\n{"projectOverview":"string","objective":"string","targetAudience":"string","brandPersonality":"string","toneOfVoice":"string","colorPsychology":"string","typographyDirection":"string","logoDirection":"string","doList":["string","string","string","string","string"],"dontList":["string","string","string","string","string"],"inspirations":["string","string","string"],"deliverables":["string","string","string","string","string"]}`;
  const raw = await tryGenerate(prompt, system, JSON.stringify(getBriefFallback(brandInput, coreKey, edgeKey, selectedPath)));
  return JSON.parse(raw) as CreativeBrief;
}

// ─── 7. Color Palette ─────────────────────────────────────────────────────────
export async function getColorPalette(coreKey: ArchetypeKey, edgeKey: ArchetypeKey, brandInput: BrandInput, selectedPath: VisualPath): Promise<ColorPalette> {
  const core = ARCHETYPES[coreKey]; const edge = ARCHETYPES[edgeKey];
  const prompt = `CORE: ${core.nameAr} — سمات: ${core.traits.join('، ')}\nEDGE: ${edge.nameAr}\nمسار: ${selectedPath.title} | مزاج: ${selectedPath.mood}\nمجال: ${brandInput.industry}\nألوان مقترحة: ${selectedPath.colors.join(', ')}`;
  const system = `أنت خبير سيكولوجية الألوان. أنشئ لوحة ألوان احترافية. أجب بـ JSON:\n{"primary":{"hex":"#xxxxxx","nameAr":"string","rgb":"R, G, B"},"secondary":{"hex":"#xxxxxx","nameAr":"string","rgb":"R, G, B"},"accent":{"hex":"#xxxxxx","nameAr":"string","rgb":"R, G, B"},"neutral":{"hex":"#xxxxxx","nameAr":"string","rgb":"R, G, B"},"background":{"hex":"#xxxxxx","nameAr":"string","rgb":"R, G, B"},"rationale":"string","psychologyNotes":"string","usage":{"primary":"string","secondary":"string","accent":"string"},"combinations":[{"bg":"#hex","text":"#hex","label":"string"},{"bg":"#hex","text":"#hex","label":"string"},{"bg":"#hex","text":"#hex","label":"string"}]}`;
  const raw = await tryGenerate(prompt, system, JSON.stringify(getPaletteFallback(coreKey, selectedPath)));
  return JSON.parse(raw) as ColorPalette;
}

// ─── 8. Logo Concepts (Step 5) ────────────────────────────────────────────────
function getConceptsFallback(coreKey: ArchetypeKey, edgeKey: ArchetypeKey, brandInput: BrandInput, path: VisualPath): LogoConcept[] {
  const core = ARCHETYPES[coreKey]; const edge = ARCHETYPES[edgeKey];
  const name = brandInput.name || core.nameAr;
  return [
    {
      id: 1,
      title: `الأصالة الجوهرية — ${core.traits[0]}`,
      description: `فكرة شعار تستلهم من القيمة الأساسية لـ ${name}: ${core.traits[0]} و${core.traits[1]}. شعار كلاسيكي راسخ يبني الثقة من النظرة الأولى — خط أنيق مدعوم برمز بسيط يختزل جوهر العلامة. مصمم للبقاء عقوداً دون أن يبدو قديماً.`,
      visualElements: [`رمز ${core.traits[0]}`, `خط يعكس ${core.traits[1]}`, 'مساحة سلبية وفيرة', 'تناظر محكم'],
      symbolism: `يجسّد ${core.traits[0]} و${core.traits[1]} — الجوهر الذي يميّز ${core.nameAr} عن غيره`,
      style: `كلاسيكي · راسخ · محترم — مصمم للبقاء عقوداً بلا تعديل`,
      colorUsage: `${path.colors[0]} كلون مهيمن مع ${path.colors[3] ?? '#1e293b'} للتوازن الداكن`,
      typography: `${path.fontStyle} — وزن متوسط يعكس الجدية والموثوقية`,
    },
    {
      id: 2,
      title: `الجرأة العصرية — ${core.traits[2] ?? core.traits[1]}`,
      description: `تفسير معاصر يعيد صياغة شخصية ${name} بلغة اليوم البصرية. هندسة جريئة وتباين حاد وخطوط واثقة تعكس ثقة العلامة بنفسها. مناسب للبيئات الرقمية وقنوات التواصل الاجتماعي.`,
      visualElements: ['هندسة جريئة', `${core.traits[2] ?? core.traits[0]} كمفهوم بصري`, 'تباين لوني حاد', 'خط ثقيل حديث'],
      symbolism: `قراءة معاصرة لـ ${core.traits[2] ?? core.traits[0]} تخاطب الجمهور الرقمي دون التخلي عن الجوهر`,
      style: `عصري · جريء · رقمي — يعمل على الشاشات والطباعة بنفس القوة`,
      colorUsage: `تباين حاد بين ${path.colors[0]} و${path.colors[1]} — وضوح بصري أقصى`,
      typography: `sans-serif هندسي بوزن ثقيل — حروف كبيرة أو مختلطة لتأثير بصري قوي`,
    },
    {
      id: 3,
      title: `الرمز الخالد — ${edge.traits[0]}`,
      description: `شعار رمزي مجرد يختزل روح ${name} في علامة واحدة تتجاوز الكلمات. يستلهم من ${edge.traits[0]} كطبقة ثانية تُثري المعنى وتعكس تكامل الشخصيتين ${core.nameAr} و${edge.nameAr}. الهدف: رمز يُعرف قبل أن يُقرأ.`,
      visualElements: [`رمز مجرد يعبّر عن ${edge.traits[0]}`, 'شكل يقرأ من أي اتجاه', 'بساطة قصوى', 'قابلية تطبيق على أي خامة'],
      symbolism: `يوحّد شخصيتي ${core.nameAr} و${edge.nameAr} في رمز واحد يحكي قصتهما معاً`,
      style: `رمزي · دائم · مرن — يعمل بلون واحد ثم يزهر بالألوان`,
      colorUsage: `يشتغل بالأسود وحده أولاً — الألوان تأتي كطبقة ثانية تمنحه الحياة`,
      typography: `خط داعم ثانوي — الرمز هو البطل والخط المرافق يكمل الحكاية`,
    },
  ];
}

export async function getLogoConcepts(
  coreKey: ArchetypeKey,
  edgeKey: ArchetypeKey,
  brandInput: BrandInput,
  selectedPath: VisualPath,
  creativeBrief: CreativeBrief | null,
): Promise<LogoConcept[]> {
  const core = ARCHETYPES[coreKey]; const edge = ARCHETYPES[edgeKey];
  const prompt = `علامة: ${brandInput.name} | مجال: ${brandInput.industry}
CORE: ${core.nameAr} (${core.nameEn}) — سمات: ${core.traits.join('، ')}
EDGE: ${edge.nameAr} — سمات: ${edge.traits.slice(0, 3).join('، ')}
المسار البصري: ${selectedPath.title} | مزاج: ${selectedPath.mood}
كلمات مفتاحية: ${selectedPath.keywords.join('، ')}
توجه الشعار: ${creativeBrief?.logoDirection ?? 'شعار معبّر عن شخصية العلامة'}`;
  const system = `أنت مدير فني إبداعي. قدّم 3 أفكار شعار مكتوبة (logo concepts) مختلفة ومتباينة لهذه العلامة.
أجب بـ JSON فقط:
{"concepts":[{"id":1,"title":"string - اسم الفكرة","description":"string - وصف 3-4 جمل","visualElements":["string","string","string","string"],"symbolism":"string","style":"string","colorUsage":"string","typography":"string"}]}
3 أفكار: كلاسيكية، عصرية، رمزية. عربية فصحى.`;
  const raw = await tryGenerate(prompt, system, JSON.stringify({ concepts: getConceptsFallback(coreKey, edgeKey, brandInput, selectedPath) }));
  return (JSON.parse(raw) as { concepts: LogoConcept[] }).concepts;
}

// ─── 9. Logo Sketches (Step 6) — Professional SVG Generation ─────────────────

/** Escape special chars for SVG text content */
function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Build the SVG inner elements for each archetype.
 * Everything is drawn in a 400×400 coordinate space, centered at (cx, cy).
 * pt(angleDeg, r) → [x, y] where 0° = north, clockwise.
 */
function archetypeMark(key: ArchetypeKey, cx: number, cy: number, color: string, filled: boolean): string {
  const f = filled ? color : 'none';
  const sw = filled ? 0 : 3.5;

  const pt = (deg: number, r: number): [number, number] => {
    const a = (deg - 90) * Math.PI / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const xy = (deg: number, r: number) => { const [x, y] = pt(deg, r); return `${x.toFixed(1)},${y.toFixed(1)}`; };

  switch (key) {
    case 'innocent': {
      // Gentle sun: central circle + 8 satellite circles + core dot
      const petals = Array.from({ length: 8 }, (_, i) => {
        const [x, y] = pt(i * 45, 84);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${filled ? 14 : 13}" fill="${f}" stroke="${color}" stroke-width="${sw}"/>`;
      }).join('');
      return `${petals}
        <circle cx="${cx}" cy="${cy}" r="36" fill="${f}" stroke="${color}" stroke-width="${sw}"/>
        <circle cx="${cx}" cy="${cy}" r="${filled ? 0 : 10}" fill="${color}"/>`;
    }

    case 'sage': {
      // Concentric wisdom rings + 4 radiating beams
      const beams = [0, 90, 180, 270].map(d => {
        const [x1, y1] = pt(d, 42); const [x2, y2] = pt(d, 105);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${filled ? 5 : 3.5}" stroke-linecap="round" opacity="${filled ? 1 : 0.6}"/>`;
      }).join('');
      return `
        <circle cx="${cx}" cy="${cy}" r="105" fill="${f}" stroke="${color}" stroke-width="${sw}"/>
        <circle cx="${cx}" cy="${cy}" r="70" fill="${filled ? 'white' : 'none'}" stroke="${color}" stroke-width="${sw}" opacity="0.7"/>
        <circle cx="${cx}" cy="${cy}" r="35" fill="${f}" stroke="${color}" stroke-width="${sw}"/>
        ${beams}
        <circle cx="${cx}" cy="${cy}" r="12" fill="${color}"/>`;
    }

    case 'explorer': {
      // Compass: outer ring + 4 direction arrows (N filled, others outline)
      const R = 112;
      const arrow = (deg: number, isFilled: boolean) => {
        const [tx, ty] = pt(deg, R - 8);
        const [lx, ly] = pt(deg - 12, R - 52);
        const [rx, ry] = pt(deg + 12, R - 52);
        return `<polygon points="${tx.toFixed(1)},${ty.toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)} ${rx.toFixed(1)},${ry.toFixed(1)}" fill="${isFilled || filled ? color : 'none'}" stroke="${color}" stroke-width="${isFilled || filled ? 0 : 2.5}" stroke-linejoin="round"/>`;
      };
      return `
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="${f}" stroke="${color}" stroke-width="${sw}"/>
        ${arrow(0, true)} ${arrow(90, false)} ${arrow(180, false)} ${arrow(270, false)}
        <circle cx="${cx}" cy="${cy}" r="11" fill="${color}"/>
        <line x1="${cx}" y1="${cy - R + 8}" x2="${cx}" y2="${cy + R - 8}" stroke="${color}" stroke-width="1.5" opacity="0.2"/>
        <line x1="${cx - R + 8}" y1="${cy}" x2="${cx + R - 8}" y2="${cy}" stroke="${color}" stroke-width="1.5" opacity="0.2"/>`;
    }

    case 'rebel': {
      // Lightning bolt
      return `<path d="M${cx + 28},${cy - 130} L${cx - 55},${cy + 12} L${cx - 6},${cy + 12} L${cx - 30},${cy + 130} L${cx + 58},${cy - 15} L${cx + 8},${cy - 15} Z"
        fill="${f}" stroke="${color}" stroke-width="${filled ? 0 : 4}" stroke-linejoin="round" stroke-linecap="round"/>`;
    }

    case 'magician': {
      // Six-pointed star (two overlapping equilateral triangles) + center circle
      const up = [0, 120, 240].map(d => xy(d, 115)).join(' ');
      const dn = [60, 180, 300].map(d => xy(d, 115)).join(' ');
      return `
        <polygon points="${up}" fill="${f}" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" opacity="${filled ? 0.85 : 1}"/>
        <polygon points="${dn}" fill="${f}" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" opacity="${filled ? 0.85 : 1}"/>
        <circle cx="${cx}" cy="${cy}" r="${filled ? 26 : 20}" fill="${color}"/>
        ${filled ? `<circle cx="${cx}" cy="${cy}" r="13" fill="white"/>` : ''}`;
    }

    case 'hero': {
      // Upward rocket/arrow
      return `<path d="M${cx},${cy - 135} L${cx + 100},${cy + 55} L${cx + 48},${cy + 28} L${cx + 48},${cy + 135} L${cx - 48},${cy + 135} L${cx - 48},${cy + 28} L${cx - 100},${cy + 55} Z"
        fill="${f}" stroke="${color}" stroke-width="${filled ? 0 : 4}" stroke-linejoin="round" stroke-linecap="round"/>`;
    }

    case 'lover': {
      // Vesica Piscis — two overlapping circles
      const off = 36;
      return `
        <circle cx="${(cx - off).toFixed(1)}" cy="${cy}" r="94" fill="${f}" stroke="${color}" stroke-width="${sw}" ${filled ? 'opacity="0.8"' : ''}/>
        <circle cx="${(cx + off).toFixed(1)}" cy="${cy}" r="94" fill="${f}" stroke="${color}" stroke-width="${sw}" ${filled ? 'opacity="0.8"' : ''}/>
        <circle cx="${cx}" cy="${cy}" r="11" fill="${color}"/>`;
    }

    case 'jester': {
      // Three circles in triangular arrangement + inner dots
      const centers = [pt(0, 78), pt(120, 78), pt(240, 78)];
      const circles = centers.map(([x, y]) =>
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="52" fill="${f}" stroke="${color}" stroke-width="${sw}"/>`
      ).join('');
      const dots = centers.map(([x, y]) =>
        filled
          ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20" fill="white"/>`
          : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${color}"/>`
      ).join('');
      return `${circles}${dots}`;
    }

    case 'everyman': {
      // Stylized house
      return `
        <polygon points="${xy(0, 135)} ${xy(127, 100)} ${xy(233, 100)}" fill="${f}" stroke="${color}" stroke-width="${filled ? 0 : 4}" stroke-linejoin="round"/>
        <rect x="${cx - 108}" y="${cy - 28}" width="216" height="168" rx="4" fill="${f}" stroke="${color}" stroke-width="${sw}"/>
        ${!filled ? `
          <rect x="${cx - 31}" y="${cy + 68}" width="62" height="72" rx="4" fill="none" stroke="${color}" stroke-width="2.5"/>
          <rect x="${cx - 92}" y="${cy + 16}" width="52" height="46" rx="3" fill="none" stroke="${color}" stroke-width="2.5"/>
          <rect x="${cx + 40}" y="${cy + 16}" width="52" height="46" rx="3" fill="none" stroke="${color}" stroke-width="2.5"/>
        ` : `
          <rect x="${cx - 30}" y="${cy + 68}" width="60" height="72" rx="4" fill="white"/>
          <rect x="${cx - 91}" y="${cy + 16}" width="51" height="45" rx="3" fill="white" opacity="0.4"/>
          <rect x="${cx + 40}" y="${cy + 16}" width="51" height="45" rx="3" fill="white" opacity="0.4"/>
        `}`;
    }

    case 'caregiver': {
      // Protective arch embracing a heart
      return `
        <path d="M${cx - 128},${cy + 22} C${cx - 128},${cy - 110} ${cx - 55},${cy - 145} ${cx},${cy - 145} C${cx + 55},${cy - 145} ${cx + 128},${cy - 110} ${cx + 128},${cy + 22}"
          fill="${f}" stroke="${color}" stroke-width="${filled ? 6 : 5}" stroke-linecap="round"/>
        <path d="M${cx},${cy + 108} C${cx - 45},${cy + 78} ${cx - 100},${cy + 32} ${cx - 100},${cy - 8} C${cx - 100},${cy - 50} ${cx - 68},${cy - 68} ${cx - 42},${cy - 68} C${cx - 22},${cy - 68} ${cx},${cy - 46} ${cx},${cy - 46} C${cx},${cy - 46} ${cx + 22},${cy - 68} ${cx + 42},${cy - 68} C${cx + 68},${cy - 68} ${cx + 100},${cy - 50} ${cx + 100},${cy - 8} C${cx + 100},${cy + 32} ${cx + 45},${cy + 78} ${cx},${cy + 108} Z"
          fill="${f}" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    }

    case 'ruler': {
      // Geometric crown
      return `
        <path d="M${cx - 130},${cy + 118} L${cx - 130},${cy - 20} L${cx - 64},${cy + 42} L${cx},${cy - 130} L${cx + 64},${cy + 42} L${cx + 130},${cy - 20} L${cx + 130},${cy + 118} Z"
          fill="${f}" stroke="${color}" stroke-width="${filled ? 0 : 4}" stroke-linejoin="round"/>
        <rect x="${cx - 130}" y="${cy + 116}" width="260" height="34" rx="6" fill="${f}" stroke="${color}" stroke-width="${sw}"/>
        <circle cx="${cx}" cy="${cy - 108}" r="${filled ? 18 : 14}" fill="${color}"/>
        ${filled ? `<circle cx="${cx}" cy="${cy - 108}" r="9" fill="white"/>
          <circle cx="${cx - 64}" cy="${cy + 40}" r="11" fill="white"/>
          <circle cx="${cx + 64}" cy="${cy + 40}" r="11" fill="white"/>` : `
          <circle cx="${cx - 64}" cy="${cy + 40}" r="10" fill="${color}"/>
          <circle cx="${cx + 64}" cy="${cy + 40}" r="10" fill="${color}"/>`}`;
    }

    case 'creator': {
      // Diamond / pen nib
      return `
        <path d="M${cx},${cy - 135} L${cx + 108},${cy} L${cx},${cy + 135} L${cx - 108},${cy} Z"
          fill="${f}" stroke="${color}" stroke-width="${filled ? 0 : 4}" stroke-linejoin="round"/>
        ${!filled ? `
          <line x1="${cx}" y1="${cy - 135}" x2="${cx}" y2="${cy + 135}" stroke="${color}" stroke-width="2" opacity="0.25"/>
          <line x1="${cx - 108}" y1="${cy}" x2="${cx + 108}" y2="${cy}" stroke="${color}" stroke-width="2" opacity="0.25"/>
          <line x1="${cx - 30}" y1="${cy + 72}" x2="${cx + 30}" y2="${cy + 72}" stroke="${color}" stroke-width="4"/>
          <circle cx="${cx}" cy="${cy + 135}" r="9" fill="${color}"/>
          <circle cx="${cx}" cy="${cy - 135}" r="7" fill="none" stroke="${color}" stroke-width="3.5"/>
        ` : `
          <path d="M${cx},${cy - 68} L${cx + 56},${cy} L${cx},${cy + 68} L${cx - 56},${cy} Z" fill="white" opacity="0.18"/>
          <circle cx="${cx}" cy="${cy + 135}" r="11" fill="white"/>
        `}`;
    }

    default: {
      // Fallback: clean hexagon
      const hex = [0,60,120,180,240,300].map(d => xy(d, 110)).join(' ');
      return `<polygon points="${hex}" fill="${f}" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    }
  }
}

/**
 * Build a complete SVG logo string.
 * variant 0 = minimal outline  |  1 = bold filled  |  2 = combined (symbol + wordmark)
 */
function buildLogoSVG(
  coreKey: ArchetypeKey,
  brandName: string,
  color: string,
  variant: 0 | 1 | 2,
): string {
  const W = 400;
  // Combined variant gets extra height for wordmark
  const H = variant === 2 ? 460 : 400;
  // Symbol center — slightly higher in combined to leave room for text
  const symCY = variant === 2 ? 185 : 200;
  const symCX = 200;
  const filled = variant === 1;

  const markContent = archetypeMark(coreKey, symCX, symCY, color, filled);

  // Wordmark block for combined variant
  let wordmark = '';
  if (variant === 2) {
    const isArabic = /[؀-ۿ]/.test(brandName);
    const display = brandName.length > 14 ? brandName.slice(0, 14) : brandName;
    const fs = display.length > 10 ? 25 : display.length > 7 ? 30 : 35;
    const ls = isArabic ? 2 : Math.max(4, 9 - display.length);
    wordmark = `
  <line x1="115" y1="358" x2="285" y2="358" stroke="${color}" stroke-width="0.8" opacity="0.3"/>
  <text x="200" y="408" text-anchor="middle"
    font-family="'Helvetica Neue','Arial','Noto Kufi Arabic',sans-serif"
    font-size="${fs}" font-weight="300" letter-spacing="${ls}" fill="${color}"
    ${isArabic ? 'direction="rtl"' : ''}>${isArabic ? display : display.toUpperCase()}</text>
  <circle cx="168" cy="436" r="2.5" fill="${color}" opacity="0.35"/>
  <circle cx="200" cy="436" r="2.5" fill="${color}" opacity="0.35"/>
  <circle cx="232" cy="436" r="2.5" fill="${color}" opacity="0.35"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%">
  <rect width="${W}" height="${H}" fill="white"/>
  ${markContent}
  ${wordmark}
</svg>`;
}

// ─── Professional Logo System — Iconify + Container Compositions ─────────────

/**
 * Curated Phosphor Bold icon candidates per archetype.
 * All names resolve to https://api.iconify.design/ph/{name}-bold.svg
 */
const ARCHETYPE_ICONS: Record<ArchetypeKey, string[]> = {
  innocent:  ['sun', 'flower-lotus', 'sparkle', 'cloud-sun', 'star'],
  sage:      ['book-open', 'magnifying-glass', 'graduation-cap', 'eye', 'brain'],
  explorer:  ['compass', 'map-trifold', 'mountains', 'globe-hemisphere-west', 'airplane-takeoff'],
  rebel:     ['lightning', 'flame', 'fire-simple', 'lightning-slash', 'skull'],
  magician:  ['magic-wand', 'star-four', 'infinity', 'shooting-star', 'spiral'],
  hero:      ['shield-star', 'rocket-launch', 'trophy', 'medal', 'sword'],
  lover:     ['heart', 'flower-lotus', 'butterfly', 'diamond', 'heart-straight'],
  jester:    ['smiley-wink', 'confetti', 'star', 'game-controller', 'lightning'],
  everyman:  ['house-simple', 'users-three', 'handshake', 'leaf', 'tree'],
  caregiver: ['heart-half', 'hands-praying', 'shield-heart', 'leaf', 'flower-tulip'],
  ruler:     ['crown-simple', 'building-columns', 'diamond', 'seal-check', 'castle-turret'],
  creator:   ['pen-nib', 'paint-brush', 'pencil-ruler', 'palette', 'scissors'],
};

type ContainerShape = 'circle' | 'rounded-square' | 'hexagon' | 'diamond';

const ARCHETYPE_CONTAINER: Record<ArchetypeKey, ContainerShape> = {
  innocent:  'circle',
  sage:      'rounded-square',
  explorer:  'hexagon',
  rebel:     'diamond',
  magician:  'circle',
  hero:      'hexagon',
  lover:     'circle',
  jester:    'rounded-square',
  everyman:  'rounded-square',
  caregiver: 'circle',
  ruler:     'rounded-square',
  creator:   'diamond',
};

// ─── Iconify Fetch ────────────────────────────────────────────────────────────

/** Fetch a Phosphor Bold icon SVG from Iconify CDN (free, no auth). */
async function fetchIconifySVG(iconName: string): Promise<string | null> {
  try {
    const url = `https://api.iconify.design/ph/${iconName}-bold.svg?width=256&height=256`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const text = await resp.text();
    return text.includes('<svg') && !text.includes('404') ? text : null;
  } catch {
    return null;
  }
}

/** Extract raw SVG path `d` attributes from an SVG string. */
function extractIconPaths(svgText: string): string[] {
  return [...svgText.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(m => m[1]);
}

/** Build a transformed <g> group for the icon paths inside the logo canvas. */
function buildIconGroup(
  paths: string[],
  fillColor: string,
  cx: number,
  cy: number,
  targetSize: number,
  srcSize = 256,
): string {
  if (!paths.length) return '';
  const scale = targetSize / srcSize;
  const tx = (cx - targetSize / 2).toFixed(1);
  const ty = (cy - targetSize / 2).toFixed(1);
  const els = paths.map(d => `<path fill="${fillColor}" d="${d}"/>`).join('');
  return `<g transform="translate(${tx},${ty}) scale(${scale.toFixed(4)})">${els}</g>`;
}

// ─── Container Shapes ─────────────────────────────────────────────────────────

function containerEl(
  shape: ContainerShape,
  cx: number,
  cy: number,
  size: number,
  fill: string,
  stroke: string,
  sw: number,
): string {
  const r = size / 2;
  const strokeAttr = sw > 0 ? ` stroke="${stroke}" stroke-width="${sw}"` : '';
  switch (shape) {
    case 'circle':
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${strokeAttr}/>`;
    case 'rounded-square': {
      const rx = (r * 0.22).toFixed(1);
      return `<rect x="${(cx - r).toFixed(1)}" y="${(cy - r).toFixed(1)}" width="${size}" height="${size}" rx="${rx}" fill="${fill}"${strokeAttr}/>`;
    }
    case 'hexagon': {
      const pts = [0, 60, 120, 180, 240, 300]
        .map(deg => {
          const rad = (deg - 90) * (Math.PI / 180);
          return `${(cx + r * Math.cos(rad)).toFixed(1)},${(cy + r * Math.sin(rad)).toFixed(1)}`;
        })
        .join(' ');
      return `<polygon points="${pts}" fill="${fill}"${strokeAttr}/>`;
    }
    case 'diamond':
      return `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fill}"${strokeAttr}/>`;
  }
}

// ─── Wordmark ─────────────────────────────────────────────────────────────────

function wordmarkEl(brand: string, color: string, cx: number, y: number): string {
  const isArabic = /[؀-ۿ]/.test(brand);
  const display = brand.length > 14 ? brand.slice(0, 14) : brand;
  const fs = display.length > 10 ? 22 : display.length > 7 ? 26 : 30;
  const ls = isArabic ? 2 : Math.max(5, 10 - display.length);
  const text = isArabic ? display : display.toUpperCase();
  const dir = isArabic ? ' direction="rtl"' : '';
  return `<text x="${cx}" y="${y}" text-anchor="middle"
    font-family="'Helvetica Neue','Arial','Noto Kufi Arabic',sans-serif"
    font-size="${fs}" font-weight="300" letter-spacing="${ls}" fill="${color}"${dir}>${text}</text>`;
}

// ─── Logo Composer ────────────────────────────────────────────────────────────

function composeLogo(
  iconPaths: string[],
  brand: string,
  color: string,
  shape: ContainerShape,
  variant: 0 | 1 | 2,
): string {
  const W = 400;
  const H = variant === 2 ? 480 : 400;
  const cx = 200;
  const symCY = variant === 2 ? 172 : 200;
  const contSize = 226;           // container diameter
  const iconRenderSize = 130;     // icon size inside container

  let bg = '';
  let icon = '';
  let divider = '';
  let wm = '';
  let dots = '';

  if (variant === 0) {
    // ── Minimal outline: stroke container, icon in brand color ──────────────
    bg = containerEl(shape, cx, symCY, contSize, 'none', color, 2.5);
    icon = buildIconGroup(iconPaths, color, cx, symCY, iconRenderSize);

  } else if (variant === 1) {
    // ── Bold filled: solid container, icon cut out in white ─────────────────
    bg = containerEl(shape, cx, symCY, contSize, color, color, 0);
    icon = buildIconGroup(iconPaths, 'white', cx, symCY, iconRenderSize);

  } else {
    // ── Combined: smaller filled container + wordmark ────────────────────────
    const cSz = 192;
    const iSz = 110;
    bg = containerEl(shape, cx, symCY, cSz, color, color, 0);
    icon = buildIconGroup(iconPaths, 'white', cx, symCY, iSz);
    divider = `<line x1="115" y1="328" x2="285" y2="328" stroke="${color}" stroke-width="0.8" opacity="0.3"/>`;
    wm = wordmarkEl(brand, color, cx, 368);
    const dy = 400;
    dots = `<circle cx="182" cy="${dy}" r="2.3" fill="${color}" opacity="0.4"/>
  <circle cx="${cx}" cy="${dy}" r="2.3" fill="${color}" opacity="0.4"/>
  <circle cx="218" cy="${dy}" r="2.3" fill="${color}" opacity="0.4"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%">
  <rect width="${W}" height="${H}" fill="white"/>
  ${bg}
  ${icon}
  ${divider}
  ${wm}
  ${dots}
</svg>`;
}

// ─── Icon Selection ───────────────────────────────────────────────────────────

async function selectBestIcon(
  coreKey: ArchetypeKey,
  concept: LogoConcept,
  brandInput: BrandInput,
  color: string,
): Promise<string[]> {
  const candidates = ARCHETYPE_ICONS[coreKey] ?? ['star'];

  // Ask Gemini to pick the most relevant icon from the candidate list
  if (ai) {
    try {
      const prompt = `Pick ONE icon name from this list that best represents a logo for this brand:
Icons: ${candidates.join(', ')}
Brand: "${brandInput.name ?? ''}", Industry: ${brandInput.industry ?? ''}
Visual elements: ${concept.visualElements.slice(0, 4).join(', ')}
Style: ${concept.style ?? ''}

Reply with ONLY the icon name — exactly as written in the list.`;

      const resp = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0.1, maxOutputTokens: 20 },
        }),
        new Promise<null>(r => setTimeout(() => r(null), 6000)),
      ]);

      if (resp && 'text' in resp) {
        const pick = (resp.text ?? '').trim().toLowerCase().replace(/[^a-z-]/g, '');
        if (candidates.includes(pick)) {
          const svg = await fetchIconifySVG(pick);
          if (svg) {
            const paths = extractIconPaths(svg);
            if (paths.length) return paths;
          }
        }
      }
    } catch { /* fall through to sequential fetch */ }
  }

  // Try candidates in order until one resolves
  for (const name of candidates) {
    const svg = await fetchIconifySVG(name);
    if (svg) {
      const paths = extractIconPaths(svg);
      if (paths.length) return paths;
    }
  }

  return []; // will trigger archetype fallback
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate 3 professional SVG logo variants using real icon design system.
 * Uses Phosphor Bold icons (via Iconify CDN) + container compositions.
 * Falls back to archetype marks if network is unavailable.
 */
export async function generateLogoSketches(
  concept: LogoConcept,
  brandInput: BrandInput,
  path: VisualPath,
  coreKey: ArchetypeKey,
  colorPalette?: ColorPalette | null,
): Promise<(string | null)[]> {
  // Color priority: palette primary → path color → archetype color → dark navy
  const primaryColor =
    colorPalette?.primary.hex ??
    (path.colors?.[0]?.startsWith('#') ? path.colors[0] : null) ??
    ARCHETYPES[coreKey]?.color ??
    '#1a1a3e';

  const brandName = esc((brandInput.name ?? '').trim() || 'BRAND');
  const shape = ARCHETYPE_CONTAINER[coreKey] ?? 'circle';

  // Fetch the best icon paths (Iconify CDN, free, no auth)
  let iconPaths: string[] = [];
  try {
    iconPaths = await Promise.race([
      selectBestIcon(coreKey, concept, brandInput, primaryColor),
      new Promise<string[]>(r => setTimeout(() => r([]), 12000)),
    ]);
  } catch { /* use empty → archetype fallback */ }

  // If Iconify unavailable, fall back to geometric archetype marks
  if (!iconPaths.length) {
    return ([0, 1, 2] as const).map(variant => {
      try {
        const svg = buildLogoSVG(coreKey, brandName, primaryColor, variant);
        return 'data:image/svg+xml,' + encodeURIComponent(svg);
      } catch {
        return null;
      }
    });
  }

  // Compose all 3 variants with the fetched icon
  return ([0, 1, 2] as const).map(variant => {
    try {
      const svg = composeLogo(iconPaths, brandName, primaryColor, shape, variant);
      return 'data:image/svg+xml,' + encodeURIComponent(svg);
    } catch {
      try {
        const svg = buildLogoSVG(coreKey, brandName, primaryColor, variant);
        return 'data:image/svg+xml,' + encodeURIComponent(svg);
      } catch {
        return null;
      }
    }
  });
}
