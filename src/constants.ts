import type { Archetype, Question, LogoType } from './types';

export const ARCHETYPES: Record<string, Archetype> = {
  innocent: {
    key: 'innocent', nameAr: 'البريء', nameEn: 'The Innocent',
    tagline: 'نحو السعادة والبساطة',
    description: 'علامة تجارية تؤمن بالخير وتسعى لجعل العالم أفضل. تقدّر البساطة والأصالة وتبث الطمأنينة في نفوس عملائها.',
    quadrant: 'paradise',
    color: '#86efac',
    examples: ['Dove', 'Innocent Drinks', 'Aveeno', 'Coca-Cola الكلاسيكية'],
    traits: ['بسيط', 'متفائل', 'صادق', 'نظيف', 'موثوق', 'مريح'],
  },
  sage: {
    key: 'sage', nameAr: 'الحكيم', nameEn: 'The Sage',
    tagline: 'المعرفة تحرر',
    description: 'علامة تبحث عن الحقيقة وتشارك المعرفة. تعتمد على الخبرة والتحليل وتقدّر الصدق المطلق.',
    quadrant: 'paradise',
    color: '#93c5fd',
    examples: ['Google', 'BBC', 'Harvard', 'McKinsey'],
    traits: ['خبير', 'تحليلي', 'موضوعي', 'موثوق', 'واعٍ', 'ملهم'],
  },
  explorer: {
    key: 'explorer', nameAr: 'المستكشف', nameEn: 'The Explorer',
    tagline: 'حرية بلا حدود',
    description: 'علامة تدفع نحو اكتشاف الجديد وتجاوز الحدود. تقدّر الحرية والفردية والمغامرة.',
    quadrant: 'paradise',
    color: '#6ee7b7',
    examples: ['North Face', 'Jeep', 'GoPro', 'Patagonia'],
    traits: ['مغامر', 'مستقل', 'فضولي', 'رائد', 'أصيل', 'حر'],
  },
  rebel: {
    key: 'rebel', nameAr: 'المتمرد', nameEn: 'The Rebel',
    tagline: 'كسر القواعد',
    description: 'علامة تتحدى الوضع الراهن وتكسر الأعراف. تستقطب من يريدون التغيير والخروج عن المألوف.',
    quadrant: 'mark',
    color: '#fca5a5',
    examples: ['Harley-Davidson', 'Virgin', 'Red Bull', 'Diesel'],
    traits: ['جريء', 'مختلف', 'مثير', 'ثوري', 'مستقل', 'غير تقليدي'],
  },
  magician: {
    key: 'magician', nameAr: 'الساحر', nameEn: 'The Magician',
    tagline: 'نحوّل الأحلام لواقع',
    description: 'علامة تصنع اللحظات السحرية وتحوّل حياة عملائها. تؤمن بأن كل شيء ممكن.',
    quadrant: 'mark',
    color: '#c4b5fd',
    examples: ['Disney', 'Apple', 'Tesla', 'Dyson'],
    traits: ['رؤيوي', 'محوّل', 'ساحر', 'ملهم', 'مبتكر', 'استثنائي'],
  },
  hero: {
    key: 'hero', nameAr: 'البطل', nameEn: 'The Hero',
    tagline: 'الشجاعة تصنع الفارق',
    description: 'علامة تلهم على التحدي والانتصار. تستقطب الطموحين الساعين للتغلب على العقبات.',
    quadrant: 'mark',
    color: '#fbbf24',
    examples: ['Nike', 'Adidas', 'FedEx', 'BMW'],
    traits: ['شجاع', 'ملهم', 'منضبط', 'هادف', 'بطولي', 'مدافع'],
  },
  lover: {
    key: 'lover', nameAr: 'العاشق', nameEn: 'The Lover',
    tagline: 'الجمال والانتماء',
    description: 'علامة تبني علاقات عاطفية عميقة وتحتفي بالجمال. تجعل عملاءها يشعرون بالتميز والمحبة.',
    quadrant: 'others',
    color: '#f9a8d4',
    examples: ['Chanel', 'Victoria\'s Secret', 'Hallmark', 'Tiffany'],
    traits: ['عاطفي', 'حسّاس', 'رومانسي', 'جذاب', 'متعلق', 'محتفٍ'],
  },
  jester: {
    key: 'jester', nameAr: 'المهرج', nameEn: 'The Jester',
    tagline: 'اجعل الحياة مرحة',
    description: 'علامة تجلب الفرح والمتعة وتكسر الجدية. تحب الإبداع غير التقليدي والروح المرحة.',
    quadrant: 'others',
    color: '#fde68a',
    examples: ['M&Ms', 'Old Spice', 'Dollar Shave Club', 'Skittles'],
    traits: ['مرح', 'مبدع', 'عفوي', 'ذكي', 'خفيف الظل', 'غير رسمي'],
  },
  everyman: {
    key: 'everyman', nameAr: 'الشخص العادي', nameEn: 'The Everyman',
    tagline: 'للجميع بلا استثناء',
    description: 'علامة تحتضن الجميع وتقدّر الانتماء والمجتمع. واقعية وودية وقريبة من كل الناس.',
    quadrant: 'others',
    color: '#d1d5db',
    examples: ['IKEA', 'Gap', 'eBay', 'Levi\'s'],
    traits: ['ودي', 'مقبول', 'واقعي', 'عملي', 'شعبي', 'محتضن'],
  },
  caregiver: {
    key: 'caregiver', nameAr: 'المعتني', nameEn: 'The Caregiver',
    tagline: 'نحمي من نحب',
    description: 'علامة تضع الآخرين أولاً وتقدّم الرعاية والحماية بلا حدود. تبني الثقة من خلال التضحية.',
    quadrant: 'structure',
    color: '#6ee7b7',
    examples: ['Johnson\'s', 'Pampers', 'UNICEF', 'Volvo'],
    traits: ['راعٍ', 'رحيم', 'متفانٍ', 'حامٍ', 'متعاطف', 'موثوق'],
  },
  ruler: {
    key: 'ruler', nameAr: 'الحاكم', nameEn: 'The Ruler',
    tagline: 'الفخامة والسلطة',
    description: 'علامة تُجسّد الفخامة والسيطرة. تستقطب من يقدّرون الجودة العالية والمكانة الرفيعة.',
    quadrant: 'structure',
    color: '#fcd34d',
    examples: ['Rolex', 'Mercedes', 'Louis Vuitton', 'Microsoft'],
    traits: ['متحكم', 'فاخر', 'هيبة', 'منظم', 'قائد', 'تقليدي'],
  },
  creator: {
    key: 'creator', nameAr: 'المبدع', nameEn: 'The Creator',
    tagline: 'الإبداع لا حدود له',
    description: 'علامة تلهم على الإبداع والتعبير الذاتي. تقدّم الأدوات والمنصة لصنع شيء فريد.',
    quadrant: 'structure',
    color: '#a5b4fc',
    examples: ['Apple', 'Adobe', 'LEGO', 'Canva'],
    traits: ['مبتكر', 'خيالي', 'جمالي', 'تعبيري', 'غير تقليدي', 'طموح'],
  },
};

export const ARCHETYPE_KEYS = Object.keys(ARCHETYPES) as Array<keyof typeof ARCHETYPES>;

export const QUESTIONS: Question[] = [
  // البريء (Innocent) Q1-Q4
  { id: 1, archetype: 'innocent', text: 'هل هدف علامتك التجارية مساعدة الناس على إيجاد السعادة أو تحقيقها؟' },
  { id: 2, archetype: 'innocent', text: 'هل تُقدّر شركتك البساطة والأخلاق دون تنازل؟' },
  { id: 3, archetype: 'innocent', text: 'هل تقوم منتجاتك/خدماتك على الطبيعية والنقاء والبساطة والثبات على ما يصلح؟' },
  { id: 4, archetype: 'innocent', text: 'هل تصف علامتك بأنها تؤمن بالخير، مفعمة بالطاقة، تريد جعل العالم أفضل، ومصدراً للإلهام؟' },
  // الحكيم (Sage) Q5-Q8
  { id: 5, archetype: 'sage', text: 'هل هدف علامتك السعي نحو المعرفة لتقديم الخبرة والمعلومات للآخرين؟' },
  { id: 6, archetype: 'sage', text: 'هل تُقدّر شركتك الصدق المطلق والشفافية التامة دون استثناء؟' },
  { id: 7, archetype: 'sage', text: 'هل تشجع على حرية التفكير والفردية والبحث والتحليل والتعلم المستمر؟' },
  { id: 8, archetype: 'sage', text: 'هل تصف علامتك بأنها متواصل ذكي، تتخذ قراراتها بناءً على بحث واقعي، وتحب وجهات النظر البديلة مع الحفاظ على الموضوعية؟' },
  // المستكشف (Explorer) Q9-Q12
  { id: 9, archetype: 'explorer', text: 'هل تشعر علامتك بالانسجام مع الطبيعة والحرية والاكتشاف؟' },
  { id: 10, archetype: 'explorer', text: 'هل تساعد الناس على اكتشاف أشياء جديدة وإيجاد حرية التعبير عن هويتهم؟' },
  { id: 11, archetype: 'explorer', text: 'هل تشجع على عدم المطابقة والفردية واللامركزية والديمقراطية؟' },
  { id: 12, archetype: 'explorer', text: 'هل تصف علامتك بأنها تدفع الحدود، مدفوعة بتجارب جديدة، في مهمة اكتشافية، تحب التنوع وتشق طريقها الخاص؟' },
  // المتمرد (Rebel) Q13-Q16
  { id: 13, archetype: 'rebel', text: 'هل هدف علامتك تحدي الوضع الراهن في صناعتك أو المجتمع؟' },
  { id: 14, archetype: 'rebel', text: 'هل تركز على العملاء الذين يشعرون بالتنافر مع القواعد السائدة ويريدون التعبير عن تمردهم؟' },
  { id: 15, archetype: 'rebel', text: 'هل تشجع على التفكير الحر والأفكار الجذرية التي تتجاوز الحدود المألوفة؟' },
  { id: 16, archetype: 'rebel', text: 'هل تصف علامتك بأنها كاسرة للقواعد، متمردة، إصلاحية أو ناشطة، ذات جرأة واستقلالية واضحة؟' },
  // الساحر (Magician) Q17-Q20
  { id: 17, archetype: 'magician', text: 'هل هدف علامتك خلق "لحظات سحرية" تبدو خاصة أو جديدة أو مثيرة؟' },
  { id: 18, archetype: 'magician', text: 'هل تركز على العملاء الراغبين في تحوّل شخصي عميق (من المرض للصحة، من الفوضى للسلام)؟' },
  { id: 19, archetype: 'magician', text: 'هل لديك هدف عظيم تؤمن أنه إذا طبّقت الصيغة الصحيحة فإن النجاح حتمي؟' },
  { id: 20, archetype: 'magician', text: 'هل تصف علامتك بأنها حالمة كبيرة، لا شيء مستحيل، تحوّل الطاقة الإبداعية إلى تعبير عملي، وتقدّر النقاء والكمال؟' },
  // البطل (Hero) Q21-Q24
  { id: 21, archetype: 'hero', text: 'هل هدف علامتك مساعدة الناس على محاربة عدو (داخلي أو خارجي) وتحقيق الانتصار؟' },
  { id: 22, archetype: 'hero', text: 'هل تركز على العملاء التنافسيين الذين يتوقون للشعور بالإنجاز في التغلب على التحديات؟' },
  { id: 23, archetype: 'hero', text: 'هل تشجع على التفاني والإنجاز وحسّ واضح من القناعة يُعاش يومياً؟' },
  { id: 24, archetype: 'hero', text: 'هل تصف علامتك بأنها شجاعة، منضبطة، موجهة نحو الهدف، تناضل من أجل المحرومين وتيسّر التحول؟' },
  // العاشق (Lover) Q25-Q28
  { id: 25, archetype: 'lover', text: 'هل هدف علامتك تقدير العملاء من خلال بناء علاقات ذات معنى عميق؟' },
  { id: 26, archetype: 'lover', text: 'هل تركز على العملاء الذين يتوقون للتواصل العاطفي ويريدون أن يشعروا بالتميز والمحبة؟' },
  { id: 27, archetype: 'lover', text: 'هل تشجع على تقدير الآخرين والعلاقات الدائمة المحترمة والتعاون وصنع القرار بالتوافق؟' },
  { id: 28, archetype: 'lover', text: 'هل تصف علامتك بأنها عاطفية، رومانسية، رفيقة جديرة بالثقة، ميسّرة للتواصل، عاشقة للجمال بكل أشكاله؟' },
  // المهرج (Jester) Q29-Q32
  { id: 29, archetype: 'jester', text: 'هل هدف علامتك لفت الانتباه بالتهوين من الأمور بأسلوب غير تقليدي أو مرح أو مبالغ فيه؟' },
  { id: 30, archetype: 'jester', text: 'هل تركز على العملاء الأصغر سناً أو "الصغار في القلب" الذين يعزفون عن الجدية ويقدّرون الإبداع؟' },
  { id: 31, archetype: 'jester', text: 'هل تشجع على ثقافة مرحة غير رسمية، وتفكير ابتكاري خارج الصندوق، والعيش الكامل كل يوم؟' },
  { id: 32, archetype: 'jester', text: 'هل تصف علامتك بأنها مُسلٍّية مرحة، تتحدى الأعراف بطرق منعشة، وتساعد الآخرين على رؤية الأشياء بشكل مختلف؟' },
  // الشخص العادي (Everyman) Q33-Q36
  { id: 33, archetype: 'everyman', text: 'هل هدف علامتك ترحيب الجميع بكرامة متساوية بصرف النظر عن الاختلافات؟' },
  { id: 34, archetype: 'everyman', text: 'هل تركز على العملاء الذين يحبون الاندماج مع الآخرين والشعور بالراحة وهم أنفسهم؟' },
  { id: 35, archetype: 'everyman', text: 'هل تشجع على الشفافية والعمل الجماعي والجو غير الرسمي والثقافة العائلية الترحيبية؟' },
  { id: 36, archetype: 'everyman', text: 'هل تصف علامتك بأنها ودية، مفيدة، أصيلة، محترمة، رابطة مجتمعية، مريحة، تلبي الاحتياجات الأساسية بلا تكلف؟' },
  // المعتني (Caregiver) Q37-Q40
  { id: 37, archetype: 'caregiver', text: 'هل هدف علامتك خدمة الآخرين وحمايتهم بأعلى مستوى ممكن؟' },
  { id: 38, archetype: 'caregiver', text: 'هل تركز على العملاء المنهمكين في الاعتناء بالآخرين (الأطفال، الوالدين، المجتمع) الذين يتوقون للتقدير؟' },
  { id: 39, archetype: 'caregiver', text: 'هل تشجع على المشي بما تقوله، وثقافة علائقية راسخة، واستباق الاحتياجات، ومستوى خدمة استثنائي؟' },
  { id: 40, archetype: 'caregiver', text: 'هل تصف علامتك بأنها راعية، رحيمة، متعاطفة، حامية بشدة، لا أنانية، هادئة في الأزمات ومطمئنة دائماً؟' },
  // الحاكم (Ruler) Q41-Q44
  { id: 41, archetype: 'ruler', text: 'هل هدف عملك تحقيق الهيمنة على السوق من خلال تقديم منتجات عالية المكانة أو وعد السلامة والأمان؟' },
  { id: 42, archetype: 'ruler', text: 'هل تركز على العملاء المعنيين بالصورة والمكانة والهيبة، والمنجذبين نحو التقاليد والموروث؟' },
  { id: 43, archetype: 'ruler', text: 'هل تشجع على هيكل مستقر ومنظم ومنتج، مع سيطرة عالية على العمليات ووظيفة تنظيمية واضحة؟' },
  { id: 44, archetype: 'ruler', text: 'هل تصف علامتك بأنها واثقة، مرموقة، قائدة، خبيرة، متمسكة بالتقاليد، محافظة على النظام وموفرة للحماية؟' },
  // المبدع (Creator) Q45-Q48
  { id: 45, archetype: 'creator', text: 'هل هدف عملك إعادة إبداع أو تصوّر شيء ما للسماح للآخرين بالتعبير عن أنفسهم؟' },
  { id: 46, archetype: 'creator', text: 'هل تركز على العملاء الذين يشترون الأشياء للتعبير عن حبهم للجمال والجودة، لا لإبهار الآخرين؟' },
  { id: 47, archetype: 'creator', text: 'هل تشجع على التعبير عن الذات والابتكار والتعاون والاستقلالية وحرية الإبداع وتفكيك القديم لبناء الجديد؟' },
  { id: 48, archetype: 'creator', text: 'هل تصف علامتك بأنها ذات جماليات متطورة، خيالية، غير خطية، كاملة، قاصّة، معبّرة، غير تقليدية وطموحة؟' },
];

export const LOGO_TYPES: LogoType[] = [
  {
    key: 'wordmark', nameAr: 'الشعار النصي', nameEn: 'Wordmark',
    description: 'اسم العلامة التجارية بالكامل مُصمَّم بخط مميز',
    examples: ['Google', 'FedEx', 'Coca-Cola', 'Disney'],
    bestFor: ['العلامات ذات الأسماء الفريدة', 'بناء الوعي بالاسم', 'البساطة والأناقة'],
  },
  {
    key: 'lettermark', nameAr: 'شعار الأحرف', nameEn: 'Lettermark',
    description: 'الأحرف الأولى من اسم العلامة فقط',
    examples: ['IBM', 'CNN', 'HP', 'LV'],
    bestFor: ['الأسماء الطويلة', 'الشركات المؤسسية', 'سهولة التذكر'],
  },
  {
    key: 'brandmark', nameAr: 'الرمز البصري', nameEn: 'Brandmark',
    description: 'رمز أو أيقونة بصرية بدون نص',
    examples: ['Apple', 'Nike', 'Twitter', 'Target'],
    bestFor: ['العلامات العالمية الراسخة', 'التميز البصري القوي', 'التطبيقات المتعددة'],
  },
  {
    key: 'combination', nameAr: 'الشعار المركّب', nameEn: 'Combination Mark',
    description: 'دمج الرمز البصري مع النص',
    examples: ['Adidas', 'Burger King', 'Lacoste', 'Amazon'],
    bestFor: ['العلامات الجديدة', 'المرونة في الاستخدام', 'معظم الصناعات'],
  },
  {
    key: 'emblem', nameAr: 'شعار الختم', nameEn: 'Emblem',
    description: 'نص داخل رمز أو إطار (كالشارة)',
    examples: ['Starbucks', 'Harley-Davidson', 'BMW', 'Warner Bros'],
    bestFor: ['التراث والتقليد', 'القوة والمصداقية', 'التعليم والحكومة'],
  },
  {
    key: 'mascot', nameAr: 'الشخصية المصورة', nameEn: 'Mascot',
    description: 'شخصية كرتونية أو مصورة تمثل العلامة',
    examples: ['KFC (العقيد)', 'Michelin', 'M&Ms', 'Pringles'],
    bestFor: ['العلامات المرحة والعائلية', 'الأطعمة والترفيه', 'بناء الصلة العاطفية'],
  },
  {
    key: 'abstract', nameAr: 'الرمز التجريدي', nameEn: 'Abstract Mark',
    description: 'شكل هندسي أو تجريدي يمثل القيم',
    examples: ['Pepsi', 'Airbnb', 'Spotify', 'Mitsubishi'],
    bestFor: ['العلامات العالمية', 'إيصال المعنى ضمنياً', 'التميز الفريد'],
  },
  {
    key: 'dynamic', nameAr: 'الشعار المتغير', nameEn: 'Dynamic / Adaptive',
    description: 'شعار يتكيف ويتغير حسب السياق مع الحفاظ على الهوية',
    examples: ['Google Doodles', 'MTV', 'Casa da Música', 'Nickelodeon'],
    bestFor: ['العلامات الرقمية', 'الإبداع والتحرر', 'المنصات المتعددة'],
  },
];

export const QUADRANT_LABELS: Record<string, string> = {
  paradise: 'التوق للجنة',
  mark: 'ترك أثر',
  others: 'التواصل مع الآخرين',
  structure: 'توفير الاستقرار',
};

export const SCORE_LABELS: Record<number, string> = {
  1: 'لا يصفنا أبداً',
  2: 'يصفنا جزئياً',
  3: 'يصفنا',
  4: 'يصفنا بقوة',
  5: 'نعم! هذا نحن تماماً',
};
