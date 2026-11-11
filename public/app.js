const STORAGE_KEY = 'siyaj.solarGuardian.v1';
const DB_NAME = 'siyaj-local-media';
const DB_STORE = 'attachments';
const STEPS = [
  { title: 'بيانات البيئة والموقع', short: 'البيئة والموقع', description: 'أخبرنا عن موقع النظام والظروف المحيطة بالألواح.' },
  { title: 'بيانات الألواح', short: 'الألواح', description: 'أضف معلومات الألواح وأرفق صورة أو مقطعاً قصيراً لفحصها بصرياً.' },
  { title: 'فاتورة الكهرباء', short: 'الفاتورة', description: 'تساعدنا بيانات الفاتورة على تقدير قيمة الطاقة التي قد تفقدها.' },
  { title: 'تأكيد البيانات', short: 'التأكيد', description: 'راجع ملخص المعلومات قبل أن يبدأ سياج بتحليل نظامك.' },
];
// Search aliases support familiar spellings; free text also accepts unlisted and legacy brands.
const PANEL_MANUFACTURERS = [
  ['Sheida Solar', ['Sheida', 'شيدا', 'شيدة']],
  ['Desert Technologies', ['DT', 'ديزرت تكنولوجيز', 'تقنيات الصحراء']],
  ['Philadelphia Solar', ['Philadelphia', 'فيلادلفيا', 'فيلادلفيا سولار']],
  ['DuSol', ['Dusol', 'دو سول', 'دوسول']],
  ['JinkoSolar', ['Jinko', 'Jinko Solar', 'جينكو', 'جنكو']],
  ['JA Solar', ['JASolar', 'JA', 'جي اي', 'جي إيه', 'جا سولار']],
  ['LONGi Solar', ['LONGi', 'لونجي', 'لونغي', 'لونجى']],
  ['Trina Solar', ['Trina', 'Trinasolar', 'ترينا']],
  ['Canadian Solar', ['Canadian', 'CSI Solar', 'كنديان', 'كاناديان', 'كندي']],
  ['Qcells', ['Q Cells', 'Q-Cells', 'Hanwha', 'كيو سيلز', 'هانوا']],
  ['REC', ['REC Group', 'ار اي سي', 'آر إي سي', 'ريك']],
  ['Maxeon', ['Maxeon Solar', 'ماكسيون', 'ماكسون']],
  ['SunPower', ['Sun Power', 'صن باور', 'سان باور']],
  ['First Solar', ['First', 'فيرست سولار', 'فيرست']],
  ['Astronergy', ['CHINT', 'Chint Solar', 'Astro Energy', 'أسترونرجي', 'استرونرجي', 'شينت']],
  ['Risen Energy', ['Risen', 'ريزن', 'رايزن']],
  ['Tongwei Solar', ['TW Solar', 'Tongwei', 'تونغوي', 'تونجوي', 'تي دبليو']],
  ['DMEGC Solar', ['DMEGC', 'Hengdian', 'دي ام اي جي سي', 'دي إم إي جي سي']],
  ['AIKO', ['Aiko Solar', 'Aiko Energy', 'أيكو', 'ايكو']],
  ['DAS Solar', ['DAS', 'داس', 'داس سولار']],
  ['Huasun', ['Huasun Solar', 'هواسن', 'هواسان']],
  ['Seraphim', ['Seraphim Solar', 'سيرافيم', 'سرافيم']],
  ['PHONO Solar', ['Phono', 'SUMEC', 'فونو', 'فونو سولار']],
  ['Talesun', ['Talesun Solar', 'تايلسن', 'تاليسن']],
  ['Suntech', ['Suntech Power', 'Sun Tech', 'صن تك', 'سانتك', 'سنتك']],
  ['Yingli Solar', ['Yingli', 'ينجلي', 'ينغلي']],
  ['GCL System Integration', ['GCL', 'GCL SI', 'GCL Solar', 'جي سي ال', 'جي سي إل']],
  ['EGing PV', ['Eging', 'ايجينج', 'إيجينغ']],
  ['Jolywood', ['Jolywood Solar', 'جولي وود', 'جوليوود']],
  ['ZNShine Solar', ['Znshine', 'زينشاين', 'زد ان شاين']],
  ['Sunova Solar', ['Sunova', 'صنوفا', 'سانوفا']],
  ['URE', ['United Renewable Energy', 'يو آر إي', 'يو ار اي']],
  ['VSUN', ['VSUN Solar', 'Vietnam Sunergy', 'في صن', 'في سان']],
  ['Sharp', ['Sharp Solar', 'شارب']],
  ['Waaree', ['Waaree Energies', 'واري', 'واريي']],
  ['Vikram Solar', ['Vikram', 'فيكرام']],
  ['Adani Solar', ['Adani', 'أداني', 'اداني']],
  ['Tata Power Solar', ['Tata', 'TP Solar', 'Tata Solar', 'تاتا', 'تاتا باور']],
  ['RenewSys', ['Renew Sys', 'رينيو سيس', 'رينيوسيس']],
  ['Goldi Solar', ['Goldi', 'جولدي', 'غولدي']],
  ['Premier Energies', ['Premier', 'بريمير', 'بريميير']],
  ['Emmvee', ['Emmvee Solar', 'إمفي', 'امفي']],
  ['Saatvik', ['Saatvik Green Energy', 'ساتفيك']],
  ['Rayzon Solar', ['Rayzon', 'رايزون', 'ريزون']],
  ['AESOLAR', ['AE Solar', 'AE-Solar', 'اي اي سولار', 'إيه إي سولار']],
  ['Solarwatt', ['Solar Watt', 'سولار وات', 'سولاروات']],
  ['SoliTek', ['سوليتك', 'سولي تك']],
  ['Eurener', ['يورينر', 'يورينير']],
  ['Silfab Solar', ['Silfab', 'سيلفاب']],
  ['Mission Solar', ['Mission Solar Energy', 'Mission', 'ميشن سولار', 'ميشن']],
  ['SEG Solar', ['SEG', 'اس اي جي', 'إس إي جي']],
  ['Heliene', ['هيليين', 'هيليان']],
  ['Qn-SOLAR', ['Qn Solar', 'كيو ان سولار']],
  ['Osda', ['Osda Solar', 'أوسدا', 'اوسدا']],
  ['Bluesun Solar', ['Bluesun', 'Blue Sun', 'بلو صن', 'بلوسن']],
  ['Luxen Solar', ['Luxen', 'لوكسن', 'لوكسين']],
  ['CW Enerji', ['CW Energy', 'سي دبليو', 'سي دبليو إنرجي']],
].sort(([a], [b]) => a.localeCompare(b, 'en'));
const TRANSLATIONS = {
  'ابحث عن الشركة المصنّعة': 'Search for a manufacturer',
  'عرض الشركات المصنّعة': 'Show manufacturers', 'الشركات المصنّعة': 'Manufacturers',
  'ابحث بالعربية أو الإنجليزية، أو اكتب اسم الشركة. يمكنك اختيار «غير معروف».': 'Search in Arabic or English, or enter the company name. You can choose “Unknown”.',
  'تحليل الفاتورة باستخدام Ai': 'Analyze bill with Ai',
  'الغبار في الجو': 'Airborne dust', 'استخدام موقعك الحالي': 'Use your current location',
  'تمت التعبئة من الطقس': 'Filled from weather data', 'جارٍ تحديد الموقع…': 'Getting location…',
  'تحليل الألواح باستخدام Claude': 'Panel assessment with Claude', 'تحليل الفاتورة باستخدام Claude': 'Read bill with Claude',
  'الظل والغبار واتجاه الشمس': 'Shade, dust and sun direction', 'خسارة الطاقة وقيمتها': 'Energy deficit and its value',
  'حفظ البيانات': 'Save details',
  'عند ضغط هذا الزر، تُرسل صور الألواح ولقطات موزعة من الفيديو إلى Anthropic، حتى 8 صور في الطلب. لا يُحلل الصوت أو كل الإطارات.': 'Choosing this button sends panel photos and frames sampled across your video to Anthropic, up to 8 images per request. Audio and every frame are not assessed.',
  'اتجاه واجهة الألواح (اختياري)': 'Panel facing direction (optional)', '0° شمال · 90° شرق · 180° جنوب · 270° غرب. أدخل قراءة بوصلة للواجهة التي تواجه الشمس.': '0° north · 90° east · 180° south · 270° west. Enter a compass reading for the panel facing direction.',
  'وقت تصوير الألواح': 'Panel capture time', 'وقت محلي تختاره؛ لا نستخرجه من الفيديو. يلزم الموقع والميل والاتجاه والوقت لحساب زاوية الشمس.': 'Your selected local time; it is not extracted from video metadata. Location, tilt, direction and time are needed for sun geometry.',
  'يفحص Claude صوراً ولقطات مختارة من المقاطع، حتى 8 صور في الطلب. لا يفحص الصوت أو كل إطارات الفيديو.': 'Claude inspects photos and selected frames from your clips, up to 8 images per request. Audio and every video frame are not analyzed.',
  'لا يمكن قياس حرارة السطح أو زاوية الميل الدقيقة من صورة عادية؛ يعتمد الحساب على البيانات التي تدخلها والطقس.': 'An ordinary image cannot measure surface temperature or exact panel tilt; calculations use your inputs and weather.',
  'تُرسل الصور واللقطات إلى Anthropic فقط عند ضغط «تحليل الألواح باستخدام Claude».': 'Images and frames are sent to Anthropic only when you choose “Panel assessment with Claude”.',
  'إنتاج متوقع للشهر (اختياري)': 'Expected monthly generation (optional)', 'إنتاج فعلي للشهر (اختياري)': 'Actual monthly generation (optional)',
  'استخدم خط أساس موثوقاً للنظام. يجب أن يغطي الإنتاج المتوقع والفعلي الفترة نفسها.': 'Use a reliable baseline for your system. Expected and actual generation must cover the same period.',
  'قراءة عدّاد الإنتاج أو العاكس؛ استهلاك الفاتورة ليس إنتاج الألواح.': 'A generation meter or inverter reading; bill consumption is not panel generation.',
  'قد تتضمن الفاتورة بيانات شخصية؛ احجب ما لا يلزم. لن تُرسل إلى Anthropic إلا عند ضغط زر تحليل الفاتورة.': 'Bills may contain personal details; cover anything unnecessary. The bill is sent to Anthropic only when you press the bill analysis button.',
  'راجع قراءة الفاتورة': 'Review extracted bill details', 'استخدام البيانات المراجعة': 'Apply reviewed details', 'إلغاء': 'Cancel',
  'استهلاك الطاقة': 'Energy consumption', 'العملة': 'Currency', 'التعرفة لكل kWh': 'Rate per kWh', 'أيام الفاتورة': 'Billing days',
  'هذه قراءة آلية قابلة للخطأ. راجع الأرقام والعملة والشهر قبل استخدامها. الفاتورة وحدها لا تثبت خسارة الألواح.': 'Automatic extraction can be wrong. Review numbers, currency and month before applying them. A bill alone cannot establish solar losses.',
  'الخسارة في الشهر المحدد': 'Loss for selected month', 'الشهر': 'Month', 'تحديث تحليل الشهر': 'Update monthly assessment',
  'Claude غير مفعّل بعد. يستطيع مسؤول الموقع تفعيله بمفتاح Anthropic.': 'Claude is not enabled yet. The site administrator can enable it with an Anthropic key.',
  'تعذر معرفة حالة Claude؛ حاول مرة أخرى.': 'Could not check Claude availability; try again.',
  'جارٍ قراءة الفاتورة…': 'Reading bill…', 'تعذر قراءة الفاتورة. جرّب صورة أوضح.': 'Could not read the bill. Try a clearer image.',
  'تم استخدام بيانات الفاتورة التي راجعتها.': 'Your reviewed bill details were applied.', 'تأكد من الشهر والأرقام قبل استخدام بيانات الفاتورة.': 'Check the month and numbers before applying bill details.',
  'حساب القيمة هنا يدعم الريال العُماني؛ أدخل تعرفة بالريال العُماني يدوياً لهذه الفاتورة.': 'The value calculation supports Omani rials; enter an OMR rate manually for this bill.',
  'تأكد من اتجاه الألواح بين 0 و360 درجة.': 'Panel direction must be between 0 and 360 degrees.', 'تأكد من الميل بين 0 و90 درجة.': 'Panel tilt must be between 0 and 90 degrees.',
  'تأكد من وقت التصوير.': 'Check the capture time.', 'تأكد من قيمة الإنتاج المتوقّع والفعلي.': 'Check expected and actual generation.',
  'تعذر فتح الفيديو في هذا المتصفح؛ جرّب MP4 أو أرفق صوراً من المقطع.': 'This browser could not open the video; try MP4 or attach still images from the clip.',
  'لا توجد لقطات قابلة للتحليل؛ أرفق صورة واضحة أو فيديو مدعوماً.': 'No readable frames were available; attach a clear image or supported video.',
  'تغيرت البيانات أثناء التحليل. أعد الطلب باستخدام البيانات الحالية.': 'Details changed during analysis. Submit again with the current details.',
  'تعذر التحقق من حد استخدام التحليل الآن. أعد المحاولة لاحقاً.': 'Could not check the analysis usage limit. Try again later.',
  'التحليل الذكي متوقف حالياً وفق إعدادات الاستخدام.': 'AI analysis is currently disabled by the usage settings.',
  'يوجد تحليل لحسابك قيد التنفيذ. انتظر اكتماله.': 'An assessment for your account is already running. Wait for it to finish.',
  'التحليل مشغول حالياً. أعد المحاولة بعد قليل.': 'The analysis service is busy. Try again shortly.',
  'وصلت إلى حد التحليل اليومي لحسابك. يتجدد الحد عند منتصف الليل بتوقيت UTC.': 'Your account has reached its daily analysis limit. The limit resets at midnight UTC.',
  'وصل الموقع إلى حد التحليل اليومي. يتجدد الحد عند منتصف الليل بتوقيت UTC.': 'The site has reached its daily analysis limit. The limit resets at midnight UTC.',
  'انتظر 30 ثانية بين طلبات التحليل.': 'Wait 30 seconds between analysis requests.',
  'انتهت جلسة الدخول؛ سجّل الدخول من جديد.': 'Your session has expired. Log in again.',
  'أضف GOOGLE_CLIENT_ID إلى ملف .env لتفعيل تسجيل Google.': 'Add GOOGLE_CLIENT_ID to the .env file to enable Google sign-in.',
  'أرفق صورة أو فيديو للألواح قبل التحليل.': 'Attach a panel photo or video before analysis.',
  'تعذر قراءة الصور المرفقة. جرّب صور JPEG أو PNG أو WEBP.': 'Could not read the attached images. Try JPEG, PNG, or WEBP images.',
  'رفيقك الذكي للطاقة الشمسية': 'Your smart solar companion', 'نحمي إنتاجك، خطوة بخطوة': 'Protecting your solar output, step by step',
  'الرئيسية': 'Home', 'السجل': 'History', 'الإعدادات': 'Settings', 'تسجيل الدخول': 'Log in', 'إنشاء حساب': 'Create account',
  'حدّد موقع النظام': 'Set system location', 'العودة للرئيسية': 'Back to home', 'القائمة': 'Menu',
  'صباح الطاقة، ': 'Hello, ', 'يا صديق الشمس': 'sunshine', 'هذه لمحة سريعة عن أداء نظامك اليوم.': 'Here is a quick look at your system today.',
  'تحديث بيانات النظام': 'Update system details', 'حالة اليوم': 'Today’s status', 'بانتظار بيانات نظامك': 'Waiting for your system details',
  'ابدأ التحليل': 'Start analysis', 'فقد تقديري': 'Estimated loss', 'نحتاج بعض التفاصيل أولاً': 'A few details are needed first',
  'أدخل بيانات النظام وأرفق صورة أو مقطعاً للألواح للحصول على قراءة أوضح.': 'Enter your system details and add a panel photo or video for a clearer estimate.',
  'إعداد النظام': 'Set up system', 'الطقس —': 'Weather —', 'الطقس غير متاح': 'Weather unavailable',
  'آخر تحديث ': 'Last updated ', 'ملخص النظام': 'System overview', 'نظرة على الألواح': 'Panel overview',
  'درجة الحرارة': 'Temperature', 'حرارة الجو الحالية': 'Current air temperature', 'الرطوبة': 'Humidity', 'الرطوبة النسبية': 'Relative humidity',
  'مستوى الغبار': 'Dust level', 'تقدير أولي': 'Initial estimate', 'تقدير الغبار على الألواح': 'Estimated panel dust',
  'تقديرك اليدوي للألواح': 'Your panel estimate', 'مؤشر جوي': 'air indicator', 'الخسارة اليومية': 'Daily energy loss',
  'طاقة تقديرية': 'Estimated energy', 'تحديث الطقس والموقع': 'Refresh weather and location', 'توصية سياج': 'Siyaj recommendation',
  'ابدأ بفحص ألواحك': 'Start with a panel check', 'قد يكون تنظيف الألواح مفيداً': 'Panel cleaning may help',
  'راقب أثر الحرارة على الألواح': 'Keep an eye on heat impact', 'حافظ على متابعة دورية': 'Keep checking your system regularly',
  'تم التنظيف': 'Cleaned', 'متابعة الأداء': 'Performance', 'قراءة الأسبوع': 'Weekly outlook', 'الإنتاج المتوقع': 'Estimated output',
  'آخر 7 أيام': 'Last 7 days', 'الأيام السبعة القادمة': 'Next 7 days', 'مخطط الإنتاج المتوقع خلال الأيام السبعة القادمة': 'Expected solar output for the next seven days', 'تقديرات أولية تتحدث مع الطقس': 'Initial estimates update with the weather',
  'بيانات مختصرة': 'System details', 'لم تتم إضافة بيانات بعد.': 'No system details added yet.',
  'ميل الألواح والغبار': 'Panel tilt and dust', 'زاوية اللوح وتراكم الغبار': 'Tilt angle and dust build-up',
  'يتغيّر المشهد حسب ميل اللوح المدخل في صفحة التسجيل، وأدنى ميل يعني غباراً أكثر.': 'The scene follows the tilt entered on the setup page: the lower the tilt, the more dust collects.',
  'القدرة': 'Capacity', 'الألواح': 'Panels', 'الموقع': 'Location', 'الميل': 'Tilt', 'غير محدد': 'Not set',
  'النتائج التقديرية لا تستبدل فحص فني مختص.': 'Estimates do not replace an inspection by a qualified technician.',
  'خطوة بسيطة نحو طاقة أفضل': 'A few steps toward better solar performance', 'لنتعرّف على نظامك ': 'Let’s get to know your system ',
  'أجب عن هذه الخطوات لتحصل سياج على صورة متكاملة عن ألواحك.': 'Answer these questions to help Siyaj understand your panels.',
  'البيئة والموقع': 'Environment & location', 'بيانات البيئة والموقع': 'Environment and location',
  'الألواح': 'Panels', 'بيانات الألواح': 'Panel details', 'الفاتورة': 'Electricity bill', 'فاتورة الكهرباء': 'Electricity bill',
  'التأكيد': 'Review', 'تأكيد البيانات': 'Review details', 'بياناتك تحفظ على حسابك وتظهر عند تسجيل الدخول من أجهزتك.': 'Your details are saved to your account and appear when you sign in on your devices.',
  'حفظ تلقائي': 'Saved automatically', 'التالي ': 'Next ', 'السابق': 'Back', 'تستغرق أقل من دقيقتين': 'Takes less than two minutes',
  'تقديرات سياج إرشادية': 'Siyaj estimates are guidance only', 'ابدأ التحليل ': 'Analyze system ',
  'أخبرنا عن موقع النظام والظروف المحيطة بالألواح.': 'Tell us where your system is and about the conditions around the panels.',
  'أضف معلومات الألواح وأرفق صورة أو مقطعاً قصيراً لفحصها بصرياً.': 'Add panel details and attach a photo or short video for visual inspection.',
  'تساعدنا بيانات الفاتورة على تقدير قيمة الطاقة التي قد تفقدها.': 'Bill details help estimate the value of energy you may be losing.',
  'راجع ملخص المعلومات قبل أن يبدأ سياج بتحليل نظامك.': 'Review the details before Siyaj analyzes your system.',
  'اسمك (اختياري)': 'Your name (optional)', 'درجة حرارة الجو': 'Air temperature', 'الرطوبة النسبية': 'Relative humidity', 'عدد الألواح': 'Number of panels',
  'تراكم الغبار على الألواح': 'Dust on the panels', 'تقدير مبدئي؛ عدّله حسب ما تراه على الألواح.': 'An initial estimate; adjust it to match what you see on the panels.',
  'موقع النظام': 'System location', 'ابحث عن مدينة أو محافظة': 'Search for a city or region', 'بحث': 'Search',
  'الموقع الدقيق اختياري؛ استخدم GPS لجلب الطقس الأقرب.': 'Exact location is optional. Use GPS for nearby weather.',
  'استخدام موقعي الحالي': 'Use my current location', 'القدرة الإجمالية للنظام': 'Total system capacity', 'الشركة المصنّعة': 'Manufacturer',
  'أو اكتب: غير معروف': 'Or enter: unknown', 'ميل الألواح عن الأفقي': 'Panel tilt from horizontal', 'نوع الألواح': 'Panel type',
  'أحادية البلورة': 'Monocrystalline', 'متعددة البلورات': 'Polycrystalline', 'أغشية رقيقة': 'Thin film', 'غير معروف': 'Unknown',
  'كفاءة اللوح (اختياري)': 'Panel efficiency (optional)', 'معامل الحرارة (اختياري)': 'Temperature coefficient (optional)',
  'غالباً بين ‎-0.25 و‎-0.50 لكل درجة.': 'Usually between -0.25 and -0.50 per degree.', 'قدرة اللوح الواحد (اختياري)': 'Power per panel (optional)',
  'صورة أو فيديو للألواح': 'Panel photo or video', 'أضف صورة أو مقطعاً قصيراً': 'Add a photo or short video',
  'صورة واضحة أو فيديو من 5 إلى 10 ثوانٍ · حتى 6 ملفات، 25 ميغابايت للملف': 'A clear photo or a 5–10 second video · up to 6 files, 25 MB per file',
  'تُحفظ المرفقات في حسابك وتظهر على أجهزتك. تُرسل إطارات صور الألواح إلى AI فقط عند ضغط «ابدأ التحليل».': 'Attachments sync to your account and devices. Panel image frames are sent to AI only when you choose “Analyze system”.',
  'قيمة الفاتورة': 'Bill amount', 'الاستهلاك من الفاتورة (اختياري)': 'Bill consumption (optional)',
  'إن توفر، نستخدمه لاشتقاق تعرفة الكهرباء التقريبية.': 'If available, we use it to estimate your electricity rate.',
  'تعرفة الكهرباء (اختياري)': 'Electricity rate (optional)', 'تُستخدم إذا لم تدخل الاستهلاك.': 'Used if consumption is not provided.',
  'شهر الفاتورة': 'Bill month', 'صورة الفاتورة (اختياري)': 'Bill photo (optional)', 'أرفق صورة الفاتورة': 'Attach a bill photo',
  'تُحفظ في حسابك ولا تُرسل للتحليل البصري': 'Saved to your account and not sent for visual analysis.',
  'راجع البيانات': 'Review your details', 'اسم صاحب النظام': 'Account name', 'لم تُضف': 'Not added', 'لوح': 'panels',
  'ملف للألواح': 'panel file(s)', 'ملفات للألواح': 'panel files', 'سيحسب سياج فقد الطاقة التقديري من الحرارة والغبار والظل المرئي. قيمة المال تقديرية وتتغير حسب التعرفة المدخلة. ': 'Siyaj estimates energy loss from heat, dust, and visible shade. The cost estimate depends on your electricity rate. ',
  'سيتم إرسال صور الألواح فقط للتحليل الذكي.': 'Only panel images will be sent for AI analysis.', 'أضف صورة للألواح في الخطوة السابقة لتفعيل التحليل البصري.': 'Add a panel photo in the previous step to enable visual analysis.',
  'رحلتك مع الشمس': 'Your solar journey', 'سجل الفحوصات': 'Inspection history', 'كل عمليات الفحص المحفوظة في حسابك.': 'All inspections saved to your account.',
  'فحص جديد ': 'New inspection ', 'لا توجد فحوصات محفوظة بعد': 'No saved inspections yet', 'بعد إعداد نظامك سيظهر هنا سجل الفحوصات.': 'Your inspections will appear here after system setup.',
  'عرض': 'View', 'فقد الطاقة التقديري حينها: ': 'Estimated energy loss then: ', 'فقد التقديري ': 'Estimated loss ',
  'تفضيلاتك': 'Your preferences', 'خصّص تجربة سياج بما يناسبك.': 'Personalize your Siyaj experience.', 'التنبيهات والعرض': 'Alerts and display',
  'تنبيهات المتصفح': 'Browser notifications', 'تنبيه عند تغير مهم في الطقس': 'Alerts for significant weather changes', 'الوضع الليلي': 'Dark mode',
  'ألوان أهدأ عند الاستخدام مساءً': 'A softer display for evening use', 'التنبيه الصوتي': 'Sound alerts', 'صوت عند التنبيهات المهمة': 'Play a sound for important alerts',
  'اللغة': 'Language', 'لغة واجهة الموقع': 'Interface language', 'العربية': 'Arabic', 'بياناتك وخصوصيتك': 'Your data and privacy',
  'يحفظ سياج بيانات حسابك وإعداداتك وسجل الفحوصات ومرفقاتك في التخزين السحابي، وتظهر البيانات التي تمت مزامنتها على أجهزتك عند تسجيل الدخول بالحساب نفسه. عند طلب التحليل فقط، تُرسل صور الألواح ولقطات موزعة من الفيديو أو صورة الفاتورة إلى Anthropic لتحليلها باستخدام Claude. يمكنك مراجعة قراءة الفاتورة قبل استخدامها. إحداثيات GPS تُستخدم لحساب اتجاه الشمس والطقس والتنبيهات عند تفعيلها.': 'Siyaj saves account details, settings, inspection history and attachments in cloud storage and syncs them across your devices. Only when you request analysis, panel photos, sampled video frames or a bill image are sent to Anthropic for assessment by Claude. You can review extracted bill details before applying them. GPS coordinates are used for sun geometry, weather and alerts when enabled.',
  'تنزيل نسخة من بياناتي': 'Download my data', 'مسح بيانات حسابي': 'Clear my account data', 'رفيقك الذكي للطاقة الشمسية · إصدار تجريبي': 'Your smart solar companion · Preview',
  'صُنع بعناية لنعطي الشمس حقها': 'Made with care, under the sun', 'حسابك في سياج': 'Your Siyaj account', 'أهلاً': 'Welcome',
  'سجّل الدخول لمتابعة نظامك الشمسي.': 'Log in to keep up with your solar system.', 'استخدم بريدك الإلكتروني أو رقم هاتفك.': 'Use your email address or phone number.',
  'البريد الإلكتروني أو رقم الهاتف': 'Email address or phone number', 'كلمة المرور': 'Password', 'أدخل كلمة المرور': 'Enter your password',
  'اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف': 'Username, email or phone number',
  'دخول ': 'Log in ', 'ليس لديك حساب؟ ': 'Don’t have an account? ', 'إنشاء حساب جديد': 'Create a new account', 'أو': 'OR',
  'المتابعة باستخدام Google': 'Continue with Google', 'سجّل بياناتك للبدء مع سياج.': 'Enter your details to get started with Siyaj.',
  'البريد الإلكتروني': 'Email address', 'رقم الهاتف': 'Phone number', '8 أحرف على الأقل': 'At least 8 characters',
  'تأكيد كلمة المرور': 'Confirm password', 'أعد كتابة كلمة المرور': 'Enter your password again', 'إنشاء الحساب ': 'Create account ',
  'لديك حساب؟ ': 'Already have an account? ', 'إنشاء حساب باستخدام Google': 'Sign up with Google', 'يُحفظ الحساب والبيانات والمرفقات على الخادم وتظهر عند تسجيل الدخول من أجهزتك.': 'Your account, details, and attachments are saved on the server and appear when you sign in on your devices.',
  'اسم المستخدم': 'Username', 'مثال: maryam_1': 'Example: maryam_1', 'اسم المستخدم فريد. بيانات حسابك وفحوصاتك ومرفقاتك تتزامن بين أجهزتك.': 'Usernames are unique. Your account, inspections, and attachments sync across your devices.',
  'اسم المستخدم من 3 إلى 24 حرفاً أو رقماً، ويمكن استخدام النقطة والشرطة السفلية فقط.': 'Username must be 3–24 letters or numbers. Periods and underscores are also allowed.',
  'اسم المستخدم مستخدم بالفعل؛ اختر اسماً آخر.': 'That username is already taken. Choose another one.',
  'حالة الطقس الحالية': 'Current weather', 'تظهر بعد تحديد الموقع': 'Shown after setting a location',
  'تقدير مبدئي من الغبار الجوي، وليس قياساً مباشراً على سطح الألواح.': 'Initial estimate from airborne dust, not a direct measurement on the panels.',
  'هذا الحساب مرتبط بـ Google؛ تابع باستخدام Google.': 'This account uses Google. Continue with Google.',
  'تسجيل Google يحتاج إضافة GOOGLE_CLIENT_ID إلى ملف .env.': 'Google sign-in needs GOOGLE_CLIENT_ID added to the .env file.',
  'تم تسجيل الدخول باستخدام Google.': 'Signed in with Google.', 'هذا البريد مرتبط بحساب Google آخر.': 'This email is linked to another Google account.',
  'تعذر التحقق من حساب Google.': 'Could not verify the Google account.', 'لم يصل رمز تسجيل Google.': 'Google sign-in did not return a credential.',
  'رمز Google غير صالح أو انتهت صلاحيته.': 'The Google credential is invalid or expired.',
  'هل تريد مسح بيانات الحساب ومرفقاته من جميع أجهزتك؟': 'Delete your account data and attachments from all your devices?',
  'تحليل بصري': 'Visual inspection', 'تقدير أولي': 'Initial estimate', 'سماء صافية': 'Clear sky', 'غائم جزئياً': 'Partly cloudy',
  'ضباب': 'Fog', 'رذاذ': 'Drizzle', 'أمطار': 'Rain', 'ثلوج': 'Snow', 'عواصف رعدية': 'Thunderstorms', 'حالة متغيرة': 'Changing conditions',
  'لا يظهر غبار واضح': 'No obvious dust visible', 'غبار خفيف ظاهر': 'Light dust visible', 'غبار متوسط ظاهر': 'Moderate dust visible',
  'غبار كثيف ظاهر': 'Heavy dust visible', 'الصورة غير واضحة': 'Image is unclear', 'يحتاج إلى انتباه': 'Needs attention', 'مستوى متوسط': 'Moderate level', 'أداء مطمئن': 'Looking good',
  'انتباه': 'Attention', 'مراقبة': 'Monitor', 'جيد': 'Good', 'تم فحص بصري': 'Visual inspection', 'فحص محفوظ': 'Saved inspection',
  'تقدير الغبار مرتفعاً': 'dust estimate is high', 'تابع التغيرات في الطقس وافحص سطح الألواح بعد العواصف أو فترات الغبار.': 'Watch for weather changes and inspect panels after storms or dusty periods.',
  'حرارة مرتفعة': 'High temperature', 'في موقعك؛ تجنب لمس الألواح وقت الظهيرة.': 'at your location; avoid touching panels at midday.',
  'هبات رياح قوية تصل إلى ': 'Strong wind gusts up to ', ' كم/س؛ أجّل الصعود إلى السطح حتى تهدأ.': ' km/h; wait for calmer conditions before going onto the roof.',
  'احتمال هطول مرتفع (': 'High chance of rain (', '%)؛ راقب الألواح بعد انقضاء الطقس.': '%); check the panels after the weather passes.',
  'تم تحديث تقدير الغبار بعد التنظيف.': 'Dust estimate updated after cleaning.', 'واجهة سياج متاحة حالياً بالعربية.': 'Siyaj is currently available in Arabic.',
  'تنبيهات الغبار والرياح': 'Dust and wind push alerts', 'تنبيهات الغبار والرياح عبر الإشعارات': 'Push alerts for dusty and windy weather',
  'كل ': 'Every ', ' يوماً كحد أقصى': ' days at most', 'توقعات الغبار الجوي: Open-Meteo وCAMS.': 'Air quality forecasts: Open-Meteo and CAMS.',
  'يتم إرسال تنبيه التنظيف مرة كل 14 يوماً كحد أقصى.': 'Cleaning alerts are limited to once every 14 days.',
  'خسارة شهرية تقديرية': 'Estimated monthly loss', 'خسارة بسبب الغبار:': 'Dust loss:', 'خسارة بسبب الحرارة:': 'Heat loss:',
  'ر.ع شهرياً': 'OMR / month', 'زاوية لوحك الحالية تخليه يتجمع عليه غبار أسرع من لو كانت قريبة من 30 درجة.': 'Your current panel tilt may collect dust faster than an angle close to 30 degrees.',
  'تحتاج التنبيهات إلى إعداد Push في الخادم. راجع ملف README.': 'Push alerts need server setup. See the README.',
  'تعذر تفعيل التنبيهات؛ تحقق من الإذن والاتصال بالخادم.': 'Could not enable alerts. Check permission and server connection.',
  'التنبيهات تعمل بعد إضافة مفاتيح VAPID وتشغيل الخادم.': 'Alerts work after adding VAPID keys and starting the server.',
  'تعذر حفظ سجل التنظيف على الخادم.': 'Could not save the cleaning record on the server.',
  'تعذر حساب تفصيل خسارة الحرارة حالياً.': 'Could not calculate the heat loss breakdown right now.',
  'تنبيه غبار من سياج': 'Dust alert from Siyaj', 'تنبيه توقيت التنظيف من سياج': 'Cleaning time alert from Siyaj',
  'لم نعثر على نتائج. جرّب كتابة الاسم بالإنجليزية.': 'No results found. Try entering the name in English.',
  'تعذر البحث. تأكد من تشغيل الخادم.': 'Search failed. Make sure the local server is running.',
  'لم يتم تفعيل إذن التنبيهات.': 'Notification permission was not granted.', 'تم تفعيل التنبيهات.': 'Notifications enabled.', 'تم إيقاف التنبيهات.': 'Notifications disabled.',
  'تنبيهات هذا الجهاز فقط': 'Alerts on this device only',
  'مفعّلة على هذا الجهاز': 'Enabled on this device', 'غير مفعّلة على هذا الجهاز': 'Not enabled on this device',
  'تعذر التحقق من تنبيهات هذا الجهاز.': 'Could not check alerts on this device.',
  'تعذر إيقاف تنبيهات هذا الجهاز.': 'Could not disable alerts on this device.',
  'تعذر تسجيل الخروج؛ حاول مرة أخرى.': 'Could not log out. Please try again.',
  'تم تسجيل التنظيف وتحديث تقدير الغبار.': 'Cleaning was recorded and the dust estimate was updated.',
  'لم تتوفر بيانات كافية لحساب خسارة الحرارة؛ التقدير الحالي يشمل الغبار والظل فقط.': 'There is not enough data to calculate heat loss; this estimate includes dust and shade only.',
  'يومياً وفق تقدير الغبار والظل.': 'per day based on estimated dust and shade.',
  'تم مسح بيانات حسابك.': 'Your account data was cleared.', 'تم تنزيل نسخة البيانات.': 'Data export downloaded.', 'تم تحديد موقع النظام.': 'System location set.',
  'لم نتمكن من تحديد الموقع. تحقق من إذن الموقع في المتصفح.': 'Could not get your location. Check your browser location permission.',
  'حدّد مدينة أو استخدم GPS أولاً.': 'Choose a city or use GPS first.', 'أدخل عدد الألواح أولاً.': 'Enter the number of panels first.',
  'تأكد من درجة حرارة الجو.': 'Check the air temperature.', 'الرطوبة يجب أن تكون بين 0 و100%.': 'Humidity must be between 0 and 100%.',
  'أدخل القدرة الإجمالية للنظام.': 'Enter the total system capacity.', 'أضف قيمة الفاتورة لحساب التعرفة التقريبية.': 'Enter the bill amount to estimate the electricity rate.',
  'اكتب اسم مدينة للبحث.': 'Enter a city name to search.', 'اختر صورة أو فيديو مدعوماً.': 'Choose a supported image or video.',
  'يمكن إرفاق الفاتورة كصورة.': 'The bill can be attached as an image.', 'يمكنك إضافة 6 ملفات كحد أقصى.': 'You can add up to 6 files.',
  'تعذر حفظ الملف محلياً؛ جرّب ملفاً أصغر.': 'Could not save the file locally. Try a smaller file.',
  'اختر JPG أو PNG أو WEBP أو فيديو MP4 أو WEBM أو MOV.': 'Choose JPG, PNG, WEBP, MP4, WEBM, or MOV.', 'يجب ألا يتجاوز حجم الملف 25 ميغابايت.': 'Each file must be 25 MB or smaller.',
  'أضف صورة أو فيديو للألواح لتفعيل التحليل البصري بالذكاء الاصطناعي.': 'Add a panel photo or video to enable AI visual analysis.',
  'القدرة الإجمالية': 'Total capacity', 'الفاتورة الشهرية': 'Monthly bill', 'لم تتم إضافة بيانات بعد.': 'No system details added yet.',
  'أدخل بريداً إلكترونياً صالحاً.': 'Enter a valid email address.', 'أدخل رقم هاتف صالحاً.': 'Enter a valid phone number.',
  'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.': 'Password must be at least 8 characters.', 'كلمتا المرور غير متطابقتين.': 'The passwords do not match.',
  'هذا البريد أو رقم الهاتف مسجل مسبقاً.': 'This email or phone number is already registered.', 'تعذر إنشاء الحساب.': 'Could not create the account.',
  'لم نعثر على هذا الحساب في هذا المتصفح. أنشئ حساباً أولاً.': 'This account was not found in this browser. Create an account first.',
  'كلمة المرور غير صحيحة.': 'Incorrect password.', 'تعذر تسجيل الدخول.': 'Could not log in.', 'تم إنشاء الحساب وحفظه على الخادم.': 'Account created and saved on the server.',
  'تم تسجيل الدخول.': 'You are logged in.', 'تم تسجيل الخروج.': 'You are logged out.', 'تسجيل Google يحتاج إعداد OAuth من Google قبل تفعيله.': 'Google sign-in needs Google OAuth configuration before it can be enabled.',
  'يتطلب تسجيل الحساب متصفحاً آمناً مثل localhost.': 'Account creation requires a secure browser context such as localhost.',
  'فقد الطاقة التقديري حينها: ': 'Estimated energy loss then: ', 'فاتورة': 'Bill', 'استهلاك': 'Consumption', 'تنبيه': 'Alert',
  'تم تحديد موقع النظام.': 'System location set.', 'تم تحديث تقدير الغبار بعد التنظيف.': 'Dust estimate updated after cleaning.',
  'فقد اليوم ': 'Today’s loss: ', 'إشعاع الشمس يتغير حسب الطقس': 'Sunshine varies with the weather',
  'بانتظار بيانات نظامك': 'Waiting for your system details', 'تم التنظيف': 'Cleaned',
  'تسجيل الخروج': 'Log out', 'name@example.com أو رقم الهاتف': 'name@example.com or phone number',
  'ر.ع': 'OMR', 'ك.و.س': 'kWh', 'واط': 'W', '°م': '°C', 'كم/س': 'km/h',
  'التعرفة التي أدخلتها': 'the rate you entered', 'مشتقة من الفاتورة والاستهلاك': 'derived from your bill and consumption', 'تعرفة مرجعية قابلة للتغيير': 'editable reference rate',
  'تقريباً': 'approx.', 'قد يفقد النظام نحو ': 'The system may lose about ', ' يومياً وفق تقدير الحرارة والغبار والظل.': ' per day based on estimated heat, dust, and shade.',
  ' في موقعك؛ تجنب لمس الألواح وقت الظهيرة.': ' at your location; avoid touching panels at midday.',
  'المتصفح لا يدعم تحديد الموقع.': 'Your browser does not support location services.', 'تعذر جلب حالة الطقس.': 'Could not load weather.',
  'تعذر تحديث الطقس.': 'Could not refresh the weather.', 'تعذر جلب بيانات الطقس الآن.': 'Weather data is unavailable right now.',
  'تعذر جلب الطقس الآن. حاول مرة أخرى بعد قليل أو أدخل البيانات يدويًا.': 'Weather data is unavailable right now. Try again shortly or enter the readings manually.',
  'إحداثيات الموقع غير صالحة.': 'The location coordinates are invalid.',
  'تعذر تنفيذ التحليل الذكي.': 'Could not run AI analysis.', 'تعذر تحليل المرفق الآن.': 'Could not analyze the attachment right now.',
  'لم يصل رد قابل للقراءة من خدمة التحليل.': 'The analysis service returned an unreadable response.',
  'حرارة مرتفعة': 'High temperature', 'هبات رياح قوية تصل إلى ': 'Strong wind gusts up to ',
  'احتمال هطول مرتفع (': 'High chance of rain (', '%)؛ راقب الألواح بعد انقضاء الطقس.': '%); check the panels after the weather passes.',
  'جاري تحديد الموقع…': 'Getting location…', 'جارٍ البحث…': 'Searching…', 'تعذر البحث عن المدينة.': 'Could not search for the city.',
  'لم نعثر على نتائج. جرّب كتابة الاسم بالإنجليزية.': 'No results found. Try entering the name in English.',
  'تعذر البحث. تأكد من تشغيل الخادم.': 'Search failed. Make sure the local server is running.',
  'الرمز البريدي': 'Postal code',
  ' النتيجة الحالية تقديرية وتعتمد على البيانات التي أدخلتها.': ' This is an estimate based on the details you entered.',
  'أضف بيانات النظام أولاً': 'Add system details first', 'تقديرات أولية': 'Initial estimates',
  'يظهر تقدير الغبار مرتفعاً؛ تحقق بصرياً من الألواح ونظّفها عند الحاجة وبطريقة آمنة.': 'Dust may be high; inspect the panels and clean them safely if needed.',
  'تابع التغيرات في الطقس وافحص سطح الألواح بعد العواصف أو فترات الغبار.': 'Watch for weather changes and inspect the panels after storms or dusty periods.',
  'العربية': 'Arabic', 'English': 'English', 'PM10': 'PM10', 'غير معروف': 'Unknown',
  'البلاغات والشكاوى': 'Complaints & reports', 'تقرير النظام': 'System report',
  'تواصل مباشر مع فريق الصيانة': 'Direct contact with the maintenance team',
  'أرسل بلاغاً عن أي مشكلة في نظامك الشمسي، وسيرسل مباشرة إلى فريق الصيانة.': 'Send a complaint about any issue with your solar system and it reaches the maintenance team directly.',
  'بلاغ جديد': 'New complaint', 'اكتب بلاغك': 'Write your complaint',
  'سيُرسل البلاغ إلى فريق الصيانة مباشرة.': 'Your complaint is sent to the maintenance team directly.',
  'الاسم (اختياري)': 'Name (optional)', 'وسيلة التواصل (بريد أو هاتف)': 'Contact (email or phone)',
  'نوع البلاغ': 'Complaint type', 'الموضوع (اختياري)': 'Subject (optional)', 'تفاصيل البلاغ': 'Complaint details',
  'ضعف في الإنتاج': 'Low generation', 'غبار على الألواح': 'Dust on panels',
  'تظليل على الألواح': 'Shading on panels', 'مشكلة كهربائية': 'Electrical issue',
  'طلب صيانة': 'Maintenance request', 'أخرى': 'Other',
  'إرسال البلاغ': 'Send complaint', 'مشاركة / نسخ البلاغ': 'Share / copy complaint',
  'بلاغاتي السابقة': 'My complaints', 'ملخص جاهز للمشاركة': 'Summary ready to share',
  'تقرير شامل يمكن تنزيله PDF أو مشاركته مع شركة الصيانة.': 'A full report you can download as PDF or share with a maintenance company.',
  'تنزيل PDF': 'Download PDF', 'طباعة': 'Print', 'مشاركة': 'Share',
  'جارٍ تجهيز سياج…': 'Preparing Siyaj…', 'إعادة المحاولة': 'Try again',
  'يتم الاتصال بالخادم وتحميل بياناتك، لحظات من فضلك.': 'Contacting the server and loading your data, just a moment.',
  'تحديث الطقس والموقع': 'Update weather and location',
  'مثال: مريم': 'e.g. Mariam', 'name@example.com أو رقم الهاتف': 'name@example.com or a phone number',
  'مثال: تنظيف الألواح في الشتاء': 'e.g. panel cleaning in winter',
  'صف المشكلة ومتى لاحظتها…': 'Describe the issue and when you noticed it…',
  'صيانة الألواح': 'Panel maintenance',
  'دورة الصيانة كل 6 أشهر': 'Maintenance cycle every 6 months',
  'تمت الصيانة اليوم ✓': 'Maintenance done today ✓',
  'اسم شركة الألواح': 'Panel company name',
  'آخر صيانة للألواح': 'Last panel maintenance',
  'آخر صيانة': 'Last maintenance',
  'الصيانة القادمة': 'Next maintenance',
  'موعد الصيانة القادمة': 'Next maintenance due',
  'لم تُسجل': 'Not recorded',
  'شركة الألواح': 'Panel company',
  'الشركة': 'Company',
  'المصنع': 'Manufacturer',
  'غير محددة': 'Not set',
  'أضف تاريخ آخر صيانة': 'Add the last maintenance date',
};
const ORIGINAL_TEXT = new WeakMap();
const ORIGINAL_ATTRIBUTES = new WeakMap();
const TRANSLATION_KEYS = Object.keys(TRANSLATIONS).sort((a, b) => b.length - a.length);
const DEFAULT_STATE = {
  form: { name: '', ambientTemp: '', ambientTempManual: false, humidity: '', humidityManual: false, panels: '', dust: null, dustManual: false, airDustPercent: null, airDustManual: false, weatherCode: null, location: '', latitude: null, longitude: null, power: '', brand: '', company: '', lastMaintenanceAt: '', tilt: '', panelAzimuth: '', captureAt: '', panelType: 'monocrystalline', efficiency: '', coefficient: '-0.35', ratedPower: '', invoice: '', consumption: '', tariff: '', expectedMonthlyKwh: '', actualMonthlyKwh: '', billMonth: new Date().toISOString().slice(0, 7) },
  settings: { notifications: false, dark: false, sound: false, language: 'ar' },
  weather: null, ai: null, aiLanguage: null, aiModel: null, solarContext: null, monthlyLoss: null, result: null, history: [], complaints: [], onboarded: false, updatedAt: null, user: null,
  lastCleanedAt: null, tiltWarningSeenFor: null,
  weatherPrefill: { ambientTemp: null, humidity: null, airDustPercent: null },
};
let currentAccount = null;
let state = loadState(`${STORAGE_KEY}.guest`);
let media = [];
let currentStep = 0;
let toastTimer;
let panelSyncTimer;
let accountSyncTimer;
let appSettings = null;
let devicePushEnabled = false;
let devicePushStateKnown = false;
let devicePushBusy = false;
let claudeEnabled = null;
let aiConfigurationChecked = false;
let invoiceReview = null;
let invoiceBusy = false;
let analysisSequence = 0;
let invoiceSequence = 0;
let analysisController = null;
let invoiceController = null;
let analysisBusy = false;
let weatherSequence = 0;
let manufacturerPickerController = null;
let gpsNotice = null;
let weatherNotice = null;
let complaintConfig = { email: 'shathaalbaraa67@gmail.com', delivery: false };

// ---------- شريط التقدم العلوي: يظهر لكل طلب شبكة جارٍ ----------
let pendingRequests = 0;
let requestProgressTimer = null;
function updateRequestProgress() {
  const bar = el('app-progress');
  if (!bar) return;
  if (pendingRequests > 0) {
    clearTimeout(requestProgressTimer);
    requestProgressTimer = setTimeout(() => {
      if (pendingRequests > 0) { bar.classList.add('loading'); bar.setAttribute('aria-hidden', 'false'); }
    }, 150);
  } else {
    clearTimeout(requestProgressTimer);
    bar.classList.remove('loading');
    bar.setAttribute('aria-hidden', 'true');
  }
}
if (typeof window !== 'undefined' && window.fetch) {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (...args) => {
    pendingRequests += 1;
    updateRequestProgress();
    return nativeFetch(...args).finally(() => { pendingRequests = Math.max(0, pendingRequests - 1); updateRequestProgress(); });
  };
}

// ---------- شاشة التحميل عند تأخر الخادم ----------
let bootstrapSettled = false;
let introActive = false;
let loadingSlowTimer = null;
function showLoadingScreen(title, note) {
  const screen = el('app-loading');
  if (!screen) return;
  screen.hidden = false;
  const titleNode = el('app-loading-title');
  const noteNode = el('app-loading-note');
  const retry = el('app-loading-retry');
  if (titleNode && title) titleNode.textContent = title;
  if (noteNode) { noteNode.textContent = note || ui('يتم الاتصال بالخادم وتحميل بياناتك، لحظات من فضلك.', 'Contacting the server and loading your data, just a moment.'); noteNode.classList.remove('slow'); }
  if (retry) { retry.hidden = true; retry.onclick = () => window.location.reload(); }
  clearTimeout(loadingSlowTimer);
  loadingSlowTimer = setTimeout(() => {
    if (screen.hidden) return;
    if (noteNode) { noteNode.textContent = ui('يبدو أن الخادم يستغرق وقتاً أطول من المعتاد. تحقق من الاتصال ثم أعد المحاولة.', 'The server is taking longer than usual. Check your connection and try again.'); noteNode.classList.add('slow'); }
    if (retry) retry.hidden = false;
  }, 10000);
}
function hideLoadingScreen() {
  const screen = el('app-loading');
  if (!screen) return;
  clearTimeout(loadingSlowTimer);
  screen.hidden = true;
}

function ui(arabic, english) { return state.settings.language === 'en' ? english : arabic; }
function localCaptureTime(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function captureTimeIso(value = state.form.captureAt) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function resetAiRequests() {
  analysisSequence += 1; invoiceSequence += 1;
  analysisController?.abort(); invoiceController?.abort();
  invoiceReview = null; invoiceBusy = false; analysisBusy = false;
  const button = el('start-setup'); if (button) { button.disabled = false; button.innerHTML = ui('إعداد النظام <span>←</span>', 'Set up system <span>←</span>'); }
  const aiButton = el('analyze-panels'); if (aiButton) { aiButton.disabled = true; aiButton.textContent = ui('تحليل الألواح باستخدام Claude', 'Panel assessment with Claude'); }
}
function analysisFingerprint() {
  return JSON.stringify({ accountId: currentAccount?.id, form: state.form, weather: { timezone: state.weather?.timezone, temperature: state.weather?.current?.temperature_2m, time: state.weather?.current?.time }, language: state.settings.language, media: mediaFor('panels').map(({ id, updatedAt }) => ({ id, updatedAt })) });
}
function claudeAvailabilityMarkup() {
  const message = claudeEnabled === true ? ui('التحليل باستخدام Ai', 'Analysis with Ai') : claudeEnabled === false ? ui('التحليل باستخدام Ai غير مفعّل بعد.', 'Ai analysis is not enabled yet.') : aiConfigurationChecked ? ui('تعذر معرفة حالة التحليل باستخدام Ai؛ حاول مرة أخرى.', 'Could not check Ai analysis availability; try again.') : ui('جارٍ التحقق من خدمة Ai…', 'Checking Ai analysis…');
  return `<p class="ai-availability" role="status">${escapeHtml(message)}</p>`;
}
async function loadAiConfig() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('config');
    const config = await response.json();
    aiConfigurationChecked = true;
    claudeEnabled = !!config.claudeEnabled;
    complaintConfig = { email: config.complaintEmail || 'shathaalbaraa67@gmail.com', delivery: !!config.complaintEmailDelivery };
    document.querySelectorAll('.ai-availability').forEach((node) => { node.outerHTML = claudeAvailabilityMarkup(); });
    const billButton = el('analyze-invoice'); if (billButton) billButton.disabled = invoiceBusy || !claudeEnabled || !mediaFor('bill').length;
    const panelButton = el('analyze-panels'); if (panelButton) panelButton.disabled = analysisBusy || !claudeEnabled || !currentAccount?.id || !mediaFor('panels').length;
    return config;
  } catch { claudeEnabled = null; aiConfigurationChecked = true; document.querySelectorAll('.ai-availability').forEach((node) => { node.outerHTML = claudeAvailabilityMarkup(); }); return {}; }
}

function loadState(storageKey = STORAGE_KEY) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return normalizeState(saved);
  } catch { return structuredClone(DEFAULT_STATE); }
}
function normalizeState(saved) {
  const normalized = saved ? { ...structuredClone(DEFAULT_STATE), ...saved, form: { ...DEFAULT_STATE.form, ...(saved.form || {}) }, settings: { ...DEFAULT_STATE.settings, ...(saved.settings || {}) }, history: saved.history || [] } : structuredClone(DEFAULT_STATE);
  if (normalized.ai && !Object.hasOwn(normalized.ai, 'dustCoveragePercent')) { normalized.ai = null; normalized.aiLanguage = null; normalized.aiModel = null; }
  normalized.weatherPrefill = { ...DEFAULT_STATE.weatherPrefill, ...(saved?.weatherPrefill || {}) };
  // Old panel-dust estimates must not become readings of airborne dust.
  if (saved && !Object.hasOwn(saved.form || {}, 'airDustPercent')) {
    normalized.form.airDustPercent = airborneDustReading(normalized.weather)?.percent ?? null;
    normalized.form.airDustManual = false;
  }
  return normalized;
}
function airborneDustReading(weather) {
  for (const source of ['dust', 'pm10']) {
    const raw = weather?.air?.[source];
    if ((typeof raw !== 'number' && typeof raw !== 'string') || String(raw).trim() === '') continue;
    const concentration = Number(raw);
    if (!Number.isFinite(concentration) || concentration < 0) continue;
    // A presentation index: 200 µg/m³ maps to 100; this is not an air fraction or energy loss.
    return { source, concentration, percent: Math.min(100, Math.round(concentration / 2)) };
  }
  return null;
}
function weatherFieldWasFilled(key) {
  const marker = state.weatherPrefill?.[key];
  return !!marker && String(marker.value) === String(state.form[key])
    && String(marker.latitude) === String(state.form.latitude)
    && String(marker.longitude) === String(state.form.longitude)
    && Number.isFinite(Date.parse(marker.fetchedAt));
}
function weatherFieldCheck(key) {
  if (!Object.hasOwn(DEFAULT_STATE.weatherPrefill, key)) return '';
  return `<span class="weather-field-check" data-weather-check="${key}" role="img" aria-label="${ui('تمت التعبئة من الطقس', 'Filled from weather data')}" title="${ui('تمت التعبئة من الطقس', 'Filled from weather data')}" ${weatherFieldWasFilled(key) ? '' : 'hidden'}>✓</span>`;
}
function refreshWeatherFieldChecks() {
  document.querySelectorAll('[data-weather-check]').forEach((node) => { node.hidden = !weatherFieldWasFilled(node.dataset.weatherCheck); });
}
function clearWeatherForLocation() {
  state.weather = null; state.weatherPrefill = { ...DEFAULT_STATE.weatherPrefill };
  weatherNotice = null;
  if (!state.form.airDustManual) {
    state.form.airDustPercent = null;
    const input = el('field-airDustPercent');
    if (input) { input.value = '0'; input.setAttribute('aria-valuetext', ui('غير متاح', 'Unavailable')); }
    const output = document.querySelector('[data-output="airDustPercent"]'); if (output) output.textContent = '—';
  }
  const hint = el('air-dust-hint'); if (hint) hint.textContent = airDustHint();
  const condition = el('wizard-weather-condition'); if (condition) condition.textContent = ui('بانتظار بيانات الطقس', 'Waiting for weather data');
  refreshWeatherFieldChecks();
}
function airDustHint() {
  const explanation = ui('مؤشر نسبي من تركيز الغبار في الجو: 0–100%، ويصل إلى 100% عند 200 µg/m³. لا يمثل تراكم الغبار على الألواح أو خسارة الطاقة.', 'A relative airborne dust index: 0–100%, reaching 100% at 200 µg/m³. It does not measure panel soiling or energy loss.');
  const reading = airborneDustReading(state.weather);
  const detail = state.form.airDustManual ? ui('قيمة معدّلة يدوياً.', 'Manually adjusted value.') : reading ? `${reading.source === 'pm10' ? 'PM10' : ui('تركيز الغبار', 'Dust concentration')}: ${reading.concentration.toFixed(1)} µg/m³.` : ui('تظهر القراءة عند توفر بيانات جودة الهواء لموقعك.', 'The reading appears when air quality data is available for your location.');
  return `${explanation} ${detail}`;
}
function clearVisualAssessment() { state.ai = null; state.aiLanguage = null; state.aiModel = null; }
async function authenticatedFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  return fetch(url, { ...options, headers, credentials: 'same-origin' });
}
function accountStorageKey(accountId = currentAccount?.id) {
  return accountId ? `${STORAGE_KEY}.account.${accountId}` : `${STORAGE_KEY}.guest`;
}
function persist() {
  localStorage.setItem(accountStorageKey(), JSON.stringify({ ...state, user: null }));
  applyTheme();
  syncHeader();
  if (currentAccount) {
    clearTimeout(panelSyncTimer);
    panelSyncTimer = setTimeout(() => syncPanelData().catch(() => {}), 650);
    clearTimeout(accountSyncTimer);
    accountSyncTimer = setTimeout(() => syncAccountState().catch(() => {}), 650);
  }
}
async function syncAccountState() {
  if (!currentAccount?.id) return;
  const response = await authenticatedFetch('/api/account/state', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: { ...state, user: null } }),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'تعذر مزامنة بيانات الحساب.');
}
async function syncPanelData() {
  if (!currentAccount?.id) return;
  const response = await authenticatedFetch('/api/panel/sync', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      onboarded: !!state.onboarded, location: state.form.location, latitude: state.form.latitude, longitude: state.form.longitude,
      timezone: state.weather?.timezone || '', tilt: state.form.tilt, notifications: !!state.settings.notifications, lastCleanedAt: state.lastCleanedAt,
    }),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'تعذر مزامنة بيانات النظام.');
}

async function loadAppSettings() {
  try {
    const response = await fetch('/api/app-settings');
    if (!response.ok) return;
    appSettings = await response.json();
    if (!el('page-wizard').hidden && currentStep === 1) renderCurrentStep();
    if (!el('page-settings').hidden) renderSettings();
  } catch { appSettings = null; }
}

function tiltWarningMarkup() {
  const value = state.form.tilt;
  if (!appSettings || value === '' || value === null || value === undefined) return '';
  const tilt = Number(value);
  const min = Number(appSettings.tilt_min_degrees);
  const max = Number(appSettings.tilt_max_degrees);
  if (!Number.isFinite(tilt) || tilt >= min && tilt <= max || String(value) === String(state.tiltWarningSeenFor ?? '')) return '';
  const target = Number(appSettings.tilt_target_degrees);
  const message = state.settings.language === 'en'
    ? `Your current panel tilt may collect dust faster than an angle close to ${target} degrees.`
    : `زاوية لوحك الحالية تخليه يتجمع عليه غبار أسرع من لو كانت قريبة من ${target} درجة.`;
  return `<div class="tilt-warning" role="status">${message}</div>`;
}

// --- Animated 3D-style panel scene: sun, light and dust build-up ---
const PANEL_VISUAL_FALLBACK_TARGET = 30;
const PANEL_SCENE = {
  width: 150, length: 110, thickness: 6, hingeHeight: 16, frameWidth: 7,
  columns: 6, rows: 9, yaw: 26, pitch: 13, distance: 900, scale: 1.0, cx: 156, cy: 148,
  sunX: 306, sunY: 38,
};
const PANEL_SCENE_VIEW = (() => {
  const yaw = PANEL_SCENE.yaw * Math.PI / 180;
  const pitch = PANEL_SCENE.pitch * Math.PI / 180;
  return { cosYaw: Math.cos(yaw), sinYaw: Math.sin(yaw), cosPitch: Math.cos(pitch), sinPitch: Math.sin(pitch) };
})();
const PANEL_SCENE_SPECKS = [
  [0.10, 0.16, 1.4], [0.24, 0.38, 1.9], [0.38, 0.12, 1.3], [0.52, 0.46, 2.1],
  [0.66, 0.24, 1.6], [0.78, 0.58, 1.8], [0.90, 0.34, 1.4], [0.16, 0.68, 1.7],
  [0.34, 0.84, 1.5], [0.58, 0.72, 1.9], [0.72, 0.88, 1.6], [0.86, 0.78, 1.4],
  [0.44, 0.28, 1.2], [0.28, 0.56, 1.3],
];

function formatTiltDegrees(value) {
  const rounded = Math.round(Number(value) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
function panelVisualTiltIsPlaceholder() {
  const raw = state.form.tilt;
  return raw === '' || raw === null || raw === undefined || !Number.isFinite(Number(raw));
}
function panelVisualTilt() {
  if (!panelVisualTiltIsPlaceholder()) return Math.min(90, Math.max(0, Number(state.form.tilt)));
  const target = Number(appSettings?.tilt_target_degrees);
  return Number.isFinite(target) ? Math.min(90, Math.max(0, target)) : PANEL_VISUAL_FALLBACK_TARGET;
}
function panelVisualDustFactor(tilt) {
  const flatness = 1 - Math.min(90, Math.max(0, tilt)) / 90;
  return Math.pow(flatness, 1.5);
}
function panelProject(x, y, z) {
  const view = PANEL_SCENE_VIEW;
  const x1 = x * view.cosYaw + z * view.sinYaw;
  const z1 = -x * view.sinYaw + z * view.cosYaw;
  const screenY = -y * view.cosPitch + z1 * view.sinPitch;
  const depth = y * view.sinPitch + z1 * view.cosPitch;
  const factor = PANEL_SCENE.distance / Math.max(260, PANEL_SCENE.distance - depth);
  return [
    PANEL_SCENE.cx + x1 * factor * PANEL_SCENE.scale,
    PANEL_SCENE.cy + screenY * factor * PANEL_SCENE.scale,
  ];
}
function panelPath(points) {
  return points.map((point, index) => `${index ? 'L' : 'M'}${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join('') + 'Z';
}
function panelLine(from, to) {
  return `x1="${from[0].toFixed(1)}" y1="${from[1].toFixed(1)}" x2="${to[0].toFixed(1)}" y2="${to[1].toFixed(1)}"`;
}
function panelSceneGeometry(tilt) {
  const radians = tilt * Math.PI / 180;
  const sinT = Math.sin(radians);
  const cosT = Math.cos(radians);
  const half = PANEL_SCENE.width / 2;
  const baseY = PANEL_SCENE.hingeHeight;
  const length = PANEL_SCENE.length;
  const thickness = PANEL_SCENE.thickness;
  const frame = PANEL_SCENE.frameWidth;

  const freeY = baseY + length * sinT;
  const freeZ = -length * cosT;
  const normalY = cosT;
  const normalZ = sinT;

  const top = [[-half, baseY, 0], [half, baseY, 0], [half, freeY, freeZ], [-half, freeY, freeZ]];
  const bottom = top.map(([x, y, z]) => [x, y - thickness * normalY, z - thickness * normalZ]);

  const glassHingeY = baseY + frame * sinT;
  const glassHingeZ = -frame * cosT;
  const glassFreeY = freeY - frame * sinT;
  const glassFreeZ = freeZ + frame * cosT;
  const glassHalf = half - frame;
  const glass = [
    [-glassHalf, glassHingeY, glassHingeZ], [glassHalf, glassHingeY, glassHingeZ],
    [glassHalf, glassFreeY, glassFreeZ], [-glassHalf, glassFreeY, glassFreeZ],
  ];

  const cells = [];
  for (let column = 1; column < PANEL_SCENE.columns; column += 1) {
    const x = -glassHalf + (2 * glassHalf * column) / PANEL_SCENE.columns;
    cells.push([panelProject(x, glassHingeY, glassHingeZ), panelProject(x, glassFreeY, glassFreeZ)]);
  }
  for (let row = 1; row < PANEL_SCENE.rows; row += 1) {
    const ratio = row / PANEL_SCENE.rows;
    const y = glassHingeY + (glassFreeY - glassHingeY) * ratio;
    const z = glassHingeZ + (glassFreeZ - glassHingeZ) * ratio;
    cells.push([panelProject(-glassHalf, y, z), panelProject(glassHalf, y, z)]);
  }

  const specks = PANEL_SCENE_SPECKS.map(([u, v, radius]) => {
    const y = glassHingeY + (glassFreeY - glassHingeY) * v;
    const z = glassHingeZ + (glassFreeZ - glassHingeZ) * v;
    const point = panelProject(-glassHalf + 2 * glassHalf * u, y, z);
    return [point[0], point[1], radius];
  });

  const shadow = top.map(([x, y, z]) => panelProject(x - 18 - 0.5 * y, 0, z + 14 + 0.3 * y));

  const attachRatio = 0.62;
  const attachY = glassHingeY + (glassFreeY - glassHingeY) * attachRatio - thickness * normalY;
  const attachZ = glassHingeZ + (glassFreeZ - glassHingeZ) * attachRatio - thickness * normalZ;
  const strutTop = panelProject(0, attachY, attachZ);
  const strutBase = panelProject(0, 0, attachZ - 26);

  const topPoints = top.map(([x, y, z]) => panelProject(x, y, z));
  const bottomPoints = bottom.map(([x, y, z]) => panelProject(x, y, z));
  const glassPoints = glass.map(([x, y, z]) => panelProject(x, y, z));

  const specular = panelProject(
    -glassHalf + 2 * glassHalf * 0.76,
    glassHingeY + (glassFreeY - glassHingeY) * 0.3,
    glassHingeZ + (glassFreeZ - glassHingeZ) * 0.3,
  );

  const silhouette = topPoints.concat(bottomPoints);
  const bounds = {
    minX: Math.min(...silhouette.map((point) => point[0])),
    maxX: Math.max(...silhouette.map((point) => point[0])),
    minY: Math.min(...silhouette.map((point) => point[1])),
    maxY: Math.max(...silhouette.map((point) => point[1])),
  };

  return {
    top: topPoints,
    bottom: bottomPoints,
    glass: glassPoints,
    topPath: panelPath(topPoints),
    bottomPath: panelPath(bottomPoints),
    glassPath: panelPath(glassPoints),
    leftFacePath: panelPath([bottomPoints[0], topPoints[0], topPoints[3], bottomPoints[3]]),
    rightFacePath: panelPath([bottomPoints[1], bottomPoints[2], topPoints[2], topPoints[1]]),
    frontFacePath: panelPath([bottomPoints[0], bottomPoints[1], topPoints[1], topPoints[0]]),
    shadowPath: panelPath(shadow),
    cells,
    specks,
    strutTop,
    strutBase,
    specular,
    bounds,
    center: [
      (topPoints[0][0] + topPoints[1][0] + topPoints[2][0] + topPoints[3][0]) / 4,
      (topPoints[0][1] + topPoints[1][1] + topPoints[2][1] + topPoints[3][1]) / 4,
    ],
  };
}
function panelVisualRayPaths(tilt) {
  const geometry = panelSceneGeometry(tilt);
  const { sunX, sunY } = PANEL_SCENE;
  const [midX, midY] = geometry.center;
  const dx = midX - sunX;
  const dy = midY - sunY;
  const distance = Math.hypot(dx, dy) || 1;
  const ux = dx / distance;
  const uy = dy / distance;
  const px = -uy;
  const py = ux;
  const { bounds } = geometry;
  const hitsPanel = (x, y) => x >= bounds.minX - 3 && x <= bounds.maxX + 3 && y >= bounds.minY - 3 && y <= bounds.maxY + 3;
  return [-18, 0, 18].map((offset) => {
    const startX = sunX + ux * 26 + px * offset;
    const startY = sunY + uy * 26 + py * offset;
    let endX = sunX + ux * (distance - 24) + px * offset;
    let endY = sunY + uy * (distance - 24) + py * offset;
    for (let step = 26; step <= distance; step += 2) {
      const x = sunX + ux * step + px * offset;
      const y = sunY + uy * step + py * offset;
      if (hitsPanel(x, y)) {
        endX = x - ux * 9;
        endY = y - uy * 9;
        break;
      }
    }
    return `M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
  });
}
function panelVisualMessage(tilt) {
  const english = state.settings.language === 'en';
  const low = Number.isFinite(Number(appSettings?.tilt_min_degrees)) ? Number(appSettings.tilt_min_degrees) : 25;
  const high = Number.isFinite(Number(appSettings?.tilt_max_degrees)) ? Number(appSettings.tilt_max_degrees) : 35;
  const suggested = Number.isFinite(Number(appSettings?.tilt_target_degrees)) ? Number(appSettings.tilt_target_degrees) : PANEL_VISUAL_FALLBACK_TARGET;
  const shown = formatTiltDegrees(tilt);
  const target = formatTiltDegrees(suggested);
  if (panelVisualTiltIsPlaceholder()) {
    return {
      tone: 'neutral',
      headline: english ? `Suggested angle: ${target}°` : `الزاوية المقترحة: ${target}°`,
      detail: english ? 'Enter the panel tilt above to preview how dust builds up on the glass.' : 'أدخل ميل الألواح أعلاه لترى كيف يتغيّر تراكم الغبار على اللوح.',
    };
  }
  if (tilt < low) {
    return {
      tone: 'warn',
      headline: english ? `We suggest raising the tilt to about ${target}°` : `نقترح رفع الميل إلى ${target}° تقريباً`,
      detail: english ? `At ${shown}° the panel is almost flat, so dust settles faster and blocks the sun.` : `عند ${shown}° يكون اللوح شبه أفقي، فيتراكم الغبار أسرع ويحجب ضوء الشمس.`,
    };
  }
  if (tilt > high) {
    return {
      tone: 'warn',
      headline: english ? `We suggest lowering the tilt to about ${target}°` : `نقترح خفض الميل إلى ${target}° تقريباً`,
      detail: english ? `At ${shown}° the panel is steeper than the recommended ${formatTiltDegrees(low)}°–${formatTiltDegrees(high)}° range.` : `عند ${shown}° يكون اللوح أكثر انحداراً من المدى الموصى به (${formatTiltDegrees(low)}°–${formatTiltDegrees(high)}°).`,
    };
  }
  return {
    tone: 'good',
    headline: english ? `Your ${shown}° tilt is within the recommended range` : `زاويتك ${shown}° ضمن المدى الموصى به`,
    detail: english ? `Keep it between ${formatTiltDegrees(low)}° and ${formatTiltDegrees(high)}°: the steeper the panel, the less dust it collects.` : `أبقِ اللوح بين ${formatTiltDegrees(low)}° و${formatTiltDegrees(high)}°: كلما ارتفع الميل قلّ تراكم الغبار.`,
  };
}
function panelCellsMarkup(geometry) {
  return geometry.cells.map(([from, to]) => `<line ${panelLine(from, to)}></line>`).join('');
}
function panelSpecksMarkup(geometry) {
  return geometry.specks.map(([x, y, radius]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}"></circle>`).join('');
}
function panelTiltVisualMarkup() {
  const tilt = panelVisualTilt();
  const dust = panelVisualDustFactor(tilt);
  const geometry = panelSceneGeometry(tilt);
  const rays = panelVisualRayPaths(tilt);
  const message = panelVisualMessage(tilt);
  const angle = formatTiltDegrees(tilt);
  const half = PANEL_SCENE.width / 2;
  const pebbles = [[-70, -30, 5, 2.4], [46, -46, 4, 2], [-96, 12, 6, 2.8], [72, 26, 5, 2.2], [10, 52, 4, 1.9], [-34, 74, 6, 2.6], [118, -8, 4, 1.8], [96, 66, 5, 2.2]]
    .map(([x, z, rx, ry]) => {
      const point = panelProject(x, 0, z);
      return `<ellipse class="pv-pebble" cx="${point[0].toFixed(1)}" cy="${point[1].toFixed(1)}" rx="${rx}" ry="${ry}"></ellipse>`;
    }).join('');
  const posts = [-1, 1].map((side) => {
    const x = side * half * 0.82;
    const base = panelProject(x, 0, 0);
    const top = panelProject(x, PANEL_SCENE.hingeHeight, 0);
    return `<g class="pv-post"><ellipse class="pv-post-foot" cx="${base[0].toFixed(1)}" cy="${base[1].toFixed(1)}" rx="7" ry="2.6"></ellipse><line ${panelLine(base, top)}></line></g>`;
  }).join('');
  const motes = [[86, 96, 1.6], [120, 74, 1.3], [252, 96, 1.8], [286, 120, 1.4], [206, 132, 1.5], [156, 150, 1.7], [320, 158, 1.5], [60, 140, 1.4]]
    .map(([cx, cy, r], index) => `<circle class="pv-dust-mote pv-dust-mote-${index + 1}" cx="${cx}" cy="${cy}" r="${r}"></circle>`).join('');
  return `<figure class="panel-visual" id="panel-visual" data-lang="${state.settings.language === 'en' ? 'en' : 'ar'}">
    <div class="panel-visual-stage">
      <svg class="panel-visual-svg" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pvSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7cb0da"></stop><stop offset="52%" stop-color="#c3dce9"></stop><stop offset="100%" stop-color="#f5ecd9"></stop></linearGradient>
          <radialGradient id="pvSun" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fffdf0"></stop><stop offset="55%" stop-color="#ffe08a"></stop><stop offset="100%" stop-color="#ffb347"></stop></radialGradient>
          <radialGradient id="pvSpec" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity=".44"></stop><stop offset="40%" stop-color="#ffeec4" stop-opacity=".15"></stop><stop offset="100%" stop-color="#ffffff" stop-opacity="0"></stop></radialGradient>
          <linearGradient id="pvGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d9c8a6"></stop><stop offset="55%" stop-color="#c9b48d"></stop><stop offset="100%" stop-color="#b39c74"></stop></linearGradient>
          <linearGradient id="pvFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#eef2f6"></stop><stop offset="45%" stop-color="#c7d0d9"></stop><stop offset="100%" stop-color="#9aa5b0"></stop></linearGradient>
          <linearGradient id="pvMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#dbe2e9"></stop><stop offset="50%" stop-color="#aab4be"></stop><stop offset="100%" stop-color="#8b959f"></stop></linearGradient>
          <linearGradient id="pvGlass" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0%" stop-color="#2c5f8d"></stop><stop offset="45%" stop-color="#1c3c5c"></stop><stop offset="100%" stop-color="#27566f"></stop></linearGradient>
          <linearGradient id="pvSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0"></stop><stop offset="34%" stop-color="#ffffff" stop-opacity=".34"></stop><stop offset="48%" stop-color="#ffffff" stop-opacity=".05"></stop><stop offset="100%" stop-color="#ffffff" stop-opacity="0"></stop></linearGradient>
          <linearGradient id="pvRay" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffd98a" stop-opacity=".05"></stop><stop offset="100%" stop-color="#f5a63c" stop-opacity=".85"></stop></linearGradient>
          <clipPath id="pvGlassClip"><path id="pv-glass-clip-path" d="${geometry.glassPath}"></path></clipPath>
          <filter id="pvSoftBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.4"></feGaussianBlur></filter>
          <filter id="pvShadowBlur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"></feGaussianBlur></filter>
          <filter id="pvDustTexture" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.62 0.94" numOctaves="3" seed="11"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 0.60  0 0 0 0 0.47  0 0 0 0 0.28  0 0 0 0.95 0"></feColorMatrix></filter>
          <filter id="pvGroundGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="4"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.34  0 0 0 0 0.24  0 0 0 0.5 0"></feColorMatrix></filter>
          <marker id="pvArrowHead" markerWidth="6" markerHeight="6" refX="4.4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f0a24a"></path></marker>
        </defs>
        <rect x="0" y="0" width="360" height="240" fill="url(#pvSky)"></rect>
        <circle class="pv-sun-glow" cx="${PANEL_SCENE.sunX}" cy="${PANEL_SCENE.sunY}" r="46"></circle>
        <circle class="pv-sun-core" cx="${PANEL_SCENE.sunX}" cy="${PANEL_SCENE.sunY}" r="17" fill="url(#pvSun)"></circle>
        <ellipse class="pv-cloud" cx="74" cy="54" rx="48" ry="11" filter="url(#pvSoftBlur)"></ellipse>
        <ellipse class="pv-cloud" cx="112" cy="45" rx="30" ry="8" filter="url(#pvSoftBlur)"></ellipse>
        <ellipse class="pv-cloud pv-cloud-far" cx="228" cy="66" rx="40" ry="8" filter="url(#pvSoftBlur)"></ellipse>
        <path class="pv-hills" d="M0 88 C 44 74 78 84 120 78 C 164 71 198 84 246 77 C 290 71 324 82 360 76 L360 110 L0 110 Z" filter="url(#pvSoftBlur)"></path>
        <rect class="pv-ground" x="0" y="94" width="360" height="146" fill="url(#pvGround)"></rect>
        <rect class="pv-ground-grain" x="0" y="94" width="360" height="146" filter="url(#pvGroundGrain)" opacity=".55"></rect>
        ${pebbles}
        <path class="pv-shadow" id="panel-shadow" d="${geometry.shadowPath}" filter="url(#pvShadowBlur)"></path>
        <g class="pv-strut">
          <ellipse class="pv-strut-foot" id="panel-strut-foot" cx="${geometry.strutBase[0].toFixed(1)}" cy="${geometry.strutBase[1].toFixed(1)}" rx="6" ry="2.2"></ellipse>
          <line id="panel-strut" ${panelLine(geometry.strutBase, geometry.strutTop)}></line>
        </g>
        <path class="pv-panel-bottom" id="panel-bottom" d="${geometry.bottomPath}"></path>
        <path class="pv-panel-face" id="panel-face-right" d="${geometry.rightFacePath}"></path>
        <path class="pv-panel-face" id="panel-face-left" d="${geometry.leftFacePath}"></path>
        <path class="pv-panel-face pv-panel-face-front" id="panel-face-front" d="${geometry.frontFacePath}"></path>
        <path class="pv-panel-top" id="panel-top" d="${geometry.topPath}" fill="url(#pvFrame)"></path>
        <path class="pv-panel-glass" id="panel-glass" d="${geometry.glassPath}" fill="url(#pvGlass)"></path>
        <g clip-path="url(#pvGlassClip)">
          <g class="pv-cells" id="panel-cells">${panelCellsMarkup(geometry)}</g>
          <rect id="panel-dust" x="0" y="0" width="360" height="240" filter="url(#pvDustTexture)" opacity="${(dust * 0.55).toFixed(3)}"></rect>
          <g class="pv-specks" id="panel-dust-specks" opacity="${(dust * 0.9).toFixed(3)}">${panelSpecksMarkup(geometry)}</g>
          <circle class="pv-glass-spec" id="panel-glass-spec" cx="${geometry.specular[0].toFixed(1)}" cy="${geometry.specular[1].toFixed(1)}" r="30" fill="url(#pvSpec)"></circle>
          <rect class="pv-sheen" x="-80" y="-60" width="520" height="360" fill="url(#pvSheen)"></rect>
        </g>
        ${posts}
        <g class="pv-rays" fill="none" stroke="url(#pvRay)" stroke-width="2.2" stroke-linecap="round" marker-end="url(#pvArrowHead)">
          <path class="pv-ray pv-ray-1" id="panel-ray-1" d="${rays[0]}" stroke-dasharray="6 8"></path>
          <path class="pv-ray pv-ray-2" id="panel-ray-2" d="${rays[1]}" stroke-dasharray="6 8"></path>
          <path class="pv-ray pv-ray-3" id="panel-ray-3" d="${rays[2]}" stroke-dasharray="6 8"></path>
        </g>
        <g class="pv-dust-motes" id="panel-dust-motes" opacity="${(0.15 + dust * 0.5).toFixed(3)}">${motes}</g>
      </svg>
      <span class="panel-visual-angle"><b id="panel-angle-value">${angle}°</b><small>${ui('ميل اللوح', 'Panel tilt')}</small></span>
    </div>
    <figcaption class="panel-visual-note is-${message.tone}" id="panel-visual-note" aria-live="polite">
      <strong>${escapeHtml(message.headline)}</strong>
      <span>${escapeHtml(message.detail)}</span>
    </figcaption>
  </figure>`;
}
function updatePanelVisual() {
  const figure = el('panel-visual');
  if (!figure) return;
  const tilt = panelVisualTilt();
  const dust = panelVisualDustFactor(tilt);
  const geometry = panelSceneGeometry(tilt);
  const set = (id, attributes) => {
    const node = el(id);
    if (!node) return;
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  };
  figure.dataset.tilt = String(tilt);
  set('panel-shadow', { d: geometry.shadowPath });
  set('panel-bottom', { d: geometry.bottomPath });
  set('panel-face-right', { d: geometry.rightFacePath });
  set('panel-face-left', { d: geometry.leftFacePath });
  set('panel-face-front', { d: geometry.frontFacePath });
  set('panel-top', { d: geometry.topPath });
  set('panel-glass', { d: geometry.glassPath });
  set('pv-glass-clip-path', { d: geometry.glassPath });
  set('panel-strut', {
    x1: geometry.strutBase[0].toFixed(1), y1: geometry.strutBase[1].toFixed(1),
    x2: geometry.strutTop[0].toFixed(1), y2: geometry.strutTop[1].toFixed(1),
  });
  set('panel-strut-foot', { cx: geometry.strutBase[0].toFixed(1), cy: geometry.strutBase[1].toFixed(1) });
  set('panel-dust', { opacity: (dust * 0.55).toFixed(3) });
  set('panel-dust-motes', { opacity: (0.15 + dust * 0.5).toFixed(3) });
  set('panel-glass-spec', {
    cx: geometry.specular[0].toFixed(1),
    cy: geometry.specular[1].toFixed(1),
  });
  const cells = el('panel-cells');
  if (cells) cells.innerHTML = panelCellsMarkup(geometry);
  const specks = el('panel-dust-specks');
  if (specks) {
    specks.innerHTML = panelSpecksMarkup(geometry);
    specks.setAttribute('opacity', (dust * 0.9).toFixed(3));
  }
  panelVisualRayPaths(tilt).forEach((path, index) => el(`panel-ray-${index + 1}`)?.setAttribute('d', path));
  const angleValue = el('panel-angle-value');
  if (angleValue) angleValue.textContent = `${formatTiltDegrees(tilt)}°`;
  const note = el('panel-visual-note');
  if (note) {
    const message = panelVisualMessage(tilt);
    note.className = `panel-visual-note is-${message.tone}`;
    note.innerHTML = `<strong>${escapeHtml(message.headline)}</strong><span>${escapeHtml(message.detail)}</span>`;
  }
}
function renderPanelVisual() {
  const mount = el('panel-visual-mount');
  if (!mount) return;
  const language = state.settings.language === 'en' ? 'en' : 'ar';
  const figure = el('panel-visual');
  if (!figure || figure.dataset.lang !== language) mount.innerHTML = panelTiltVisualMarkup();
  else updatePanelVisual();
}

// --- Panel maintenance cycle (every 6 months) ---
const MAINTENANCE_CYCLE_MONTHS = 6;
const MAINTENANCE_CYCLE_DAYS = 183;
const DAY_MS = 24 * 60 * 60 * 1000;

function todayIsoDate(reference = new Date()) {
  return `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}-${String(reference.getDate()).padStart(2, '0')}`;
}
function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}
function addMonthsClamped(date, months) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}
function arabicCount(count, forms) {
  const n = Math.abs(Number(count) || 0);
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n >= 3 && n <= 10) return `${n} ${forms.few}`;
  return `${n} ${forms.many}`;
}
function maintenanceStatus(reference = new Date()) {
  const last = parseIsoDate(state.form.lastMaintenanceAt);
  if (!last) return null;
  const start = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  if (start > today) return null;
  const elapsedDays = Math.max(0, Math.round((today - start) / DAY_MS));
  let months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
  let anchor = addMonthsClamped(start, months);
  if (anchor > today) { months -= 1; anchor = addMonthsClamped(start, months); }
  const daysAfterMonths = Math.max(0, Math.round((today - anchor) / DAY_MS));
  const due = addMonthsClamped(start, MAINTENANCE_CYCLE_MONTHS);
  const daysRemaining = Math.round((due - today) / DAY_MS);
  let monthsUntilDue = (due.getFullYear() - today.getFullYear()) * 12 + (due.getMonth() - today.getMonth());
  if (addMonthsClamped(today, monthsUntilDue) > due) monthsUntilDue -= 1;
  monthsUntilDue = Math.max(0, monthsUntilDue);
  return {
    last: start, due, elapsedDays, months, days: daysAfterMonths, daysRemaining, monthsUntilDue,
    overdue: daysRemaining < 0, dueSoon: daysRemaining >= 0 && daysRemaining <= 14,
    progressPercent: Math.min(100, Math.round((Math.min(elapsedDays, MAINTENANCE_CYCLE_DAYS) / MAINTENANCE_CYCLE_DAYS) * 100)),
  };
}
function maintenanceDateLabel(date, locale) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}
function maintenanceElapsedLabel(status) {
  const english = state.settings.language === 'en';
  if (status.elapsedDays === 0) return english ? 'today' : 'اليوم';
  const parts = [];
  if (status.months > 0) parts.push(english ? `${status.months} ${status.months === 1 ? 'month' : 'months'}` : arabicCount(status.months, { one: 'شهر واحد', two: 'شهرين', few: 'أشهر', many: 'شهرًا' }));
  if (status.days > 0 || !parts.length) parts.push(english ? `${status.days} ${status.days === 1 ? 'day' : 'days'}` : arabicCount(status.days, { one: 'يوم واحد', two: 'يومين', few: 'أيام', many: 'يومًا' }));
  return (english ? 'since ' : 'قبل ') + parts.join(english ? ' and ' : ' و');
}
function maintenanceRemainingLabel(status) {
  const english = state.settings.language === 'en';
  const count = Math.abs(status.daysRemaining);
  if (status.daysRemaining === 0) return english ? 'Maintenance is due today.' : 'الصيانة مستحقة اليوم.';
  if (status.overdue) {
    return english ? `Maintenance is ${count} ${count === 1 ? 'day' : 'days'} overdue.` : `تأخرت الصيانة ${arabicCount(count, { one: 'يومًا واحدًا', two: 'يومين', few: 'أيام', many: 'يومًا' })}.`;
  }
  return english ? `${count} ${count === 1 ? 'day' : 'days'} left until the next maintenance.` : `باقي ${arabicCount(count, { one: 'يوم واحد', two: 'يومين', few: 'أيام', many: 'يومًا' })} على الصيانة القادمة.`;
}
function maintenancePillMarkup(status) {
  const english = state.settings.language === 'en';
  if (!status) return { hidden: true, className: '', text: '' };
  if (status.overdue) return { hidden: false, className: 'is-overdue', text: english ? 'Overdue' : 'متأخرة' };
  if (status.dueSoon) return { hidden: false, className: 'is-due-soon', text: english ? 'Due soon' : 'قريبة' };
  return { hidden: false, className: 'is-ok', text: english ? 'On schedule' : 'منتظمة' };
}
function renderMaintenance() {
  const container = el('maintenance-content');
  if (!container) return;
  const english = state.settings.language === 'en';
  const locale = english ? 'en-OM' : 'ar-OM';
  const status = maintenanceStatus();
  const button = el('maintenance-done');
  const pill = el('maintenance-state-pill');
  const panel = el('maintenance-panel');
  if (button) { button.disabled = false; button.textContent = english ? 'Mark maintenance done today ✓' : 'تمت الصيانة اليوم ✓'; }
  const pillState = maintenancePillMarkup(status);
  if (pill) {
    pill.hidden = pillState.hidden;
    pill.className = `maintenance-pill ${pillState.className}`.trim();
    const label = pill.querySelector('span'); if (label) label.textContent = pillState.text;
  }
  if (panel) {
    panel.classList.toggle('maintenance-empty', !status);
    panel.classList.toggle('maintenance-overdue', Boolean(status?.overdue));
    panel.classList.toggle('maintenance-due-soon', Boolean(status?.dueSoon && !status?.overdue));
  }
  if (!status) {
    container.innerHTML = `<div class="maintenance-empty-state"><div class="maintenance-empty-icon">📅</div><p>${english ? 'No maintenance date is saved yet. Add the date of your last maintenance in the system details so we can schedule the next one and count the days for you.' : 'لم يُسجَّل تاريخ آخر صيانة بعد. أضف تاريخ آخر صيانة من «تحديث بيانات النظام» لنحسب لك موعد الصيانة القادمة والوقت المتبقي كل يوم.'}</p></div>`;
    return;
  }
  const lastLabel = maintenanceDateLabel(status.last, locale);
  const dueLabel = maintenanceDateLabel(status.due, locale);
  const elapsedLabel = maintenanceElapsedLabel(status);
  const remainingLabel = maintenanceRemainingLabel(status);
  const remainingShort = english
    ? `${Math.abs(status.daysRemaining)} ${Math.abs(status.daysRemaining) === 1 ? 'day' : 'days'}`
    : arabicCount(Math.abs(status.daysRemaining), { one: 'يوم واحد', two: 'يومين', few: 'أيام', many: 'يومًا' });
  const progressCaption = english
    ? `${status.progressPercent}% of the cycle completed`
    : `اكتملت ${status.progressPercent}% من الدورة`;
  const overdueDaysShort = status.overdue
    ? (english
      ? `${Math.abs(status.daysRemaining)} ${Math.abs(status.daysRemaining) === 1 ? 'day' : 'days'}`
      : arabicCount(Math.abs(status.daysRemaining), { one: 'يوم واحد', two: 'يومين', few: 'أيام', many: 'يومًا' }))
    : '';
  const untilDueLabel = status.overdue
    ? (english ? 'Date passed' : 'انقضى الموعد')
    : status.monthsUntilDue > 0
      ? (english
        ? `in about ${status.monthsUntilDue} ${status.monthsUntilDue === 1 ? 'month' : 'months'}`
        : `بعد ${arabicCount(status.monthsUntilDue, { one: 'شهر واحد', two: 'شهرين', few: 'أشهر', many: 'شهرًا' })}`)
      : (english ? 'within this month' : 'خلال هذا الشهر');
  const overdueNote = english
    ? 'Panels can be affected if maintenance is delayed: dust and deposits build up, airflow drops, and generation declines gradually. Book a maintenance visit and clean the panels safely.'
    : 'قد تتأثر الألواح الشمسية إذا تأخرت الصيانة: يتراكم الغبار والترسبات وتقل التهوية وينخفض الإنتاج تدريجيًا. احجز صيانة ونظّف الألواح بطريقة آمنة.';
  const dueSoonNote = english
    ? 'The next maintenance is close. Booking it now keeps the panels within their cleaning cycle.'
    : 'موعد الصيانة القادمة اقترب. احجزها الآن لتبقى الألواح ضمن دورة الصيانة.';
  const onScheduleNote = english
    ? 'The panels are on schedule. The app recalculates the remaining days from the saved date every time you open it.'
    : 'الصيانة منتظمة. يحسب سياج الأيام المتبقية من التاريخ المحفوظ في كل مرة تفتح فيها التطبيق.';
  const note = status.overdue ? overdueNote : status.dueSoon ? dueSoonNote : onScheduleNote;
  container.innerHTML = `<div class="maintenance-grid">
      <div class="maintenance-stat"><span class="maintenance-stat-icon">📅</span><div class="maintenance-stat-body"><small>${english ? 'Last maintenance' : 'آخر صيانة'}</small><b>${escapeHtml(lastLabel)}</b><span>${escapeHtml(elapsedLabel)}</span></div></div>
      <div class="maintenance-stat"><span class="maintenance-stat-icon">⏳</span><div class="maintenance-stat-body"><small>${status.overdue ? (english ? 'Overdue by' : 'متأخرة منذ') : (english ? 'Time left' : 'الوقت المتبقي')}</small><b class="maintenance-remaining">${escapeHtml(overdueDaysShort || remainingShort)}</b><span>${escapeHtml(status.overdue ? (english ? 'Needs urgent attention' : 'تحتاج صيانة عاجلة') : progressCaption)}</span></div></div>
      <div class="maintenance-stat"><span class="maintenance-stat-icon">🔧</span><div class="maintenance-stat-body"><small>${english ? 'Next maintenance' : 'الصيانة القادمة'}</small><b>${escapeHtml(dueLabel)}</b><span>${escapeHtml(untilDueLabel)}</span></div></div>
    </div>
    <div class="maintenance-progress">
      <div class="maintenance-progress-head"><span>${english ? 'Cycle progress' : 'تقدم الدورة'}</span><b>${status.progressPercent}%</b></div>
      <div class="maintenance-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${status.progressPercent}" aria-label="${english ? 'Maintenance cycle progress' : 'تقدم دورة الصيانة'}"><i style="width:${status.progressPercent}%"></i></div>
      <div class="maintenance-progress-foot"><span>${escapeHtml(lastLabel)}</span><span>${escapeHtml(dueLabel)}</span></div>
    </div>
    <p class="maintenance-note"><span class="maintenance-note-icon">${status.overdue ? '⚠️' : status.dueSoon ? '⏰' : 'ℹ️'}</span>${escapeHtml(note)}</p>`;
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function el(id) { return document.getElementById(id); }
function translateText(value) {
  const source = String(value ?? '');
  const leading = source.match(/^\s*/)?.[0] || '';
  const trailing = source.match(/\s*$/)?.[0] || '';
  const exact = source.trim();
  if (TRANSLATIONS[exact]) return `${leading}${TRANSLATIONS[exact]}${trailing}`;
  let result = source;
  for (const arabic of TRANSLATION_KEYS) {
    if (arabic.length <= 2 && /[\u0600-\u06FF]/.test(arabic)) continue;
    result = result.replaceAll(arabic, TRANSLATIONS[arabic]);
  }
  result = result.replace(/°م/g, '°C');
  result = result.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
  result = result.replace(/الخطوة (\d+) من (\d+)/g, 'Step $1 of $2');
  return result;
}
function applyLanguage() {
  const english = state.settings.language === 'en';
  document.documentElement.lang = english ? 'en' : 'ar';
  document.documentElement.dir = english ? 'ltr' : 'rtl';
  document.body.classList.toggle('english', english);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!ORIGINAL_TEXT.has(node)) ORIGINAL_TEXT.set(node, node.nodeValue);
    const original = ORIGINAL_TEXT.get(node);
    node.nodeValue = english ? translateText(original) : original;
  }
  const attrNames = ['placeholder', 'aria-label', 'title', 'alt'];
  document.querySelectorAll('*').forEach((element) => {
    let originals = ORIGINAL_ATTRIBUTES.get(element);
    if (!originals) { originals = new Map(); ORIGINAL_ATTRIBUTES.set(element, originals); }
    for (const name of attrNames) {
      if (!element.hasAttribute(name)) continue;
      if (!originals.has(name)) originals.set(name, element.getAttribute(name));
      const original = originals.get(name);
      element.setAttribute(name, english ? translateText(original) : original);
    }
  });
  const toggle = el('language-toggle');
  if (toggle) { toggle.textContent = english ? 'العربية' : 'EN'; toggle.setAttribute('aria-label', english ? 'Switch to Arabic' : 'Switch to English'); }
  const languageSelect = el('setting-language');
  if (languageSelect) languageSelect.value = english ? 'en' : 'ar';
}
function showToast(message) {
  const toast = el('toast'); toast.textContent = state.settings.language === 'en' ? translateText(message) : message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3100);
}
function syncHeader() {
  el('header-location').textContent = state.form.location || 'حدّد موقع النظام';
  const authButton = el('auth-nav');
  if (authButton) authButton.textContent = state.user?.username || 'تسجيل الدخول';
  const loggedIn = !!state.user;
  document.querySelector('.main-nav').hidden = !loggedIn;
  document.querySelector('.topbar-location').hidden = !loggedIn;
  applyLanguage();
}
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}
async function dbRequest(mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, mode); const store = transaction.objectStore(DB_STORE);
    const request = action(store); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close(); transaction.onerror = () => reject(transaction.error);
  });
}
async function deleteMediaForAccount(accountId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, 'readwrite');
    const request = transaction.objectStore(DB_STORE).openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (cursor.value.accountId === accountId) cursor.delete();
      cursor.continue();
    };
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
async function moveLegacyMedia(oldAccountId, newAccountId) {
  if (!oldAccountId || !newAccountId || oldAccountId === newAccountId) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, 'readwrite');
    const request = transaction.objectStore(DB_STORE).openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (cursor.value.accountId === oldAccountId) cursor.update({ ...cursor.value, accountId: newAccountId });
      cursor.continue();
    };
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
async function loadMedia() {
  try {
    if (currentAccount) await syncAccountMedia();
    const all = (await dbRequest('readonly', (store) => store.getAll())) || [];
    media = currentAccount ? all.filter((item) => item.accountId === currentAccount.id) : [];
  }
  catch (error) {
    const all = (await dbRequest('readonly', (store) => store.getAll()).catch(() => [])) || [];
    media = currentAccount ? all.filter((item) => item.accountId === currentAccount.id) : [];
    showToast(error.message || 'تعذر مزامنة المرفقات الآن.');
  }
  renderCurrentStep();
}
async function syncAccountMedia() {
  if (!currentAccount?.id) return;
  const listResponse = await authenticatedFetch('/api/account/media');
  const listData = await listResponse.json();
  if (!listResponse.ok) throw new Error(listData.error || 'تعذر تحميل مرفقات الحساب.');
  const remote = new Map((listData.files || []).map((item) => [item.id, item]));
  const allFiles = (await dbRequest('readonly', (store) => store.getAll())) || [];
  const local = allFiles.filter((item) => item.accountId === currentAccount.id);
  const localById = new Map(local.map((item) => [item.id, item]));

  for (const item of local) {
    if (item.cloudSynced && !remote.has(item.id)) {
      await dbRequest('readwrite', (store) => store.delete(item.id));
      localById.delete(item.id);
      continue;
    }
    if (!item.cloudSynced) {
      const url = '/api/account/media/' + encodeURIComponent(item.id)
        + '?category=' + encodeURIComponent(item.category) + '&name=' + encodeURIComponent(item.name);
      const response = await authenticatedFetch(url, { method: 'POST', headers: { 'Content-Type': item.type || item.blob.type }, body: item.blob });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'تعذر رفع أحد المرفقات إلى الحساب.');
      const syncedItem = { ...item, cloudSynced: true };
      await dbRequest('readwrite', (store) => store.put(syncedItem));
      localById.set(item.id, syncedItem);
      remote.set(item.id, data.file);
    }
  }

  for (const item of remote.values()) {
    if (localById.has(item.id)) continue;
    const response = await authenticatedFetch('/api/account/media/' + encodeURIComponent(item.id));
    if (!response.ok) throw new Error('تعذر تنزيل أحد مرفقات الحساب.');
    const saved = { id: item.id, accountId: currentAccount.id, category: item.category, name: item.name, type: item.type, blob: await response.blob(), updatedAt: Date.parse(item.updated_at) || Date.now(), cloudSynced: true };
    await dbRequest('readwrite', (store) => store.put(saved));
    localById.set(item.id, saved);
  }
}
function saveFormField(target) {
  if (!target?.dataset?.field) return;
  const key = target.dataset.field;
  const value = key === 'brand' && isUnknownManufacturer(target.value) ? 'غير معروف' : target.value;
  if (!['name', 'billMonth', 'expectedMonthlyKwh', 'actualMonthlyKwh', 'invoice', 'consumption', 'tariff'].includes(key) && String(state.form[key]) !== String(value)) clearVisualAssessment();
  if (key === 'billMonth' && String(state.form.billMonth) !== String(target.value)) {
    state.form.expectedMonthlyKwh = ''; state.form.actualMonthlyKwh = ''; invoiceReview = null;
    for (const reading of ['expectedMonthlyKwh', 'actualMonthlyKwh']) { const input = el(`field-${reading}`); if (input) input.value = ''; }
    document.querySelector('.invoice-review')?.remove();
  }
  if (key === 'tilt' && String(state.form.tilt) !== String(target.value)) state.tiltWarningSeenFor = null;
  state.form[key] = value;
  if (key === 'ambientTemp') state.form.ambientTempManual = true;
  if (key === 'humidity') state.form.humidityManual = true;
  if (key === 'dust') state.form.dustManual = true;
  if (key === 'airDustPercent') state.form.airDustManual = true;
  if (Object.hasOwn(DEFAULT_STATE.weatherPrefill, key)) state.weatherPrefill[key] = null;
  if (['billMonth', 'expectedMonthlyKwh', 'actualMonthlyKwh', 'invoice', 'consumption', 'tariff', 'power', 'tilt', 'panelAzimuth', 'captureAt', 'coefficient'].includes(key)) state.monthlyLoss = null;
  if (['latitude', 'longitude', 'tilt', 'panelAzimuth', 'captureAt', 'coefficient', 'ambientTemp'].includes(key)) state.solarContext = null;
  persist();
  refreshWeatherFieldChecks();
  if (key === 'airDustPercent') {
    const hint = el('air-dust-hint'); if (hint) hint.textContent = airDustHint();
    target.setAttribute('aria-valuetext', `${target.value}%`);
  }
  if (key === 'tilt') {
    const warning = el('tilt-warning-slot');
    if (warning) warning.innerHTML = tiltWarningMarkup();
    updatePanelVisual();
  }
  if (target.type === 'range') {
    const output = document.querySelector(`[data-output="${key}"]`); if (output) output.textContent = `${target.value}%`;
  }
  if (currentStep === 3) renderCurrentStep();
}
function field(label, key, options = {}) {
  const { type = 'text', placeholder = '', suffix = '', hint = '', min, max, step, required = false, full = false, value } = options;
  const current = value ?? state.form[key] ?? '';
  const labelMarkup = `${label}${weatherFieldCheck(key)}`;
  const attrs = [`type="${type}"`, `data-field="${key}"`, `value="${escapeHtml(current)}"`];
  if (placeholder) attrs.push(`placeholder="${escapeHtml(placeholder)}"`);
  if (min !== undefined) attrs.push(`min="${min}"`); if (max !== undefined) attrs.push(`max="${max}"`); if (step !== undefined) attrs.push(`step="${step}"`);
  if (required) attrs.push('required');
  if (type === 'range') {
    const output = current === '' ? '—' : `${escapeHtml(current)}%`;
    attrs[2] = `value="${escapeHtml(current === '' ? min ?? 0 : current)}"`;
    return `<div class="field ${full ? 'full' : ''}"><label for="field-${key}">${labelMarkup}</label><div class="range-row"><input id="field-${key}" ${attrs.join(' ')} aria-valuetext="${current === '' ? ui('غير متاح', 'Unavailable') : `${escapeHtml(current)}%`}"><output data-output="${key}">${output}</output></div>${hint ? `<small class="helper-text" ${key === 'airDustPercent' ? 'id="air-dust-hint"' : ''}>${hint}</small>` : ''}</div>`;
  }
  return `<div class="field ${full ? 'full' : ''}"><label for="field-${key}">${labelMarkup}</label><div class="${suffix ? 'input-suffix' : ''}"><input id="field-${key}" ${attrs.join(' ')}>${suffix ? `<span>${suffix}</span>` : ''}</div>${hint ? `<small class="helper-text">${hint}</small>` : ''}</div>`;
}
function selectField(label, key, choices, options = {}) {
  const { full = false } = options; const current = state.form[key];
  return `<div class="field ${full ? 'full' : ''}"><label for="field-${key}">${label}</label><select id="field-${key}" data-field="${key}">${choices.map(([value, text]) => `<option value="${escapeHtml(value)}" ${current === value ? 'selected' : ''}>${escapeHtml(text)}</option>`).join('')}</select></div>`;
}
function manufacturerSearchKey(value) {
  return String(value ?? '').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[\s._-]+/g, '');
}
function isUnknownManufacturer(value) {
  return ['غيرمعروف', 'unknown'].includes(manufacturerSearchKey(value));
}
function manufacturerField() {
  const value = isUnknownManufacturer(state.form.brand) ? ui('غير معروف', 'Unknown') : state.form.brand || '';
  return `<div class="field manufacturer-picker"><label for="field-brand">الشركة المصنّعة</label><div class="manufacturer-input-row"><input id="field-brand" data-field="brand" type="text" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="manufacturer-options" aria-describedby="manufacturer-hint" autocomplete="off" placeholder="ابحث عن الشركة المصنّعة" value="${escapeHtml(value)}"><button class="manufacturer-toggle" type="button" aria-label="عرض الشركات المصنّعة" aria-controls="manufacturer-options" aria-expanded="false">⌄</button><div id="manufacturer-options" class="manufacturer-options" role="listbox" aria-label="الشركات المصنّعة" hidden></div></div><small id="manufacturer-hint" class="helper-text">ابحث بالعربية أو الإنجليزية، أو اكتب اسم الشركة. يمكنك اختيار «غير معروف».</small></div>`;
}
function bindManufacturerPicker() {
  manufacturerPickerController?.abort();
  manufacturerPickerController = null;
  const input = el('field-brand');
  if (!input) return;
  const picker = input.closest('.manufacturer-picker');
  const toggle = picker.querySelector('.manufacturer-toggle');
  const list = el('manufacturer-options');
  manufacturerPickerController = new AbortController();
  const options = { signal: manufacturerPickerController.signal };
  let matches = []; let active = -1;
  const close = () => {
    list.hidden = true; input.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant'); active = -1;
  };
  const show = (query = input.value) => {
    const key = manufacturerSearchKey(query);
    const companies = PANEL_MANUFACTURERS.filter(([name, aliases]) => !key || [name, ...aliases].some((name) => manufacturerSearchKey(name).includes(key))).map(([name]) => ({ value: name, label: name }));
    const unknown = { value: 'غير معروف', label: ui('غير معروف', 'Unknown') };
    matches = key ? [...companies, unknown] : [unknown, ...companies]; active = -1;
    list.innerHTML = `${key && !companies.length && !isUnknownManufacturer(query) ? `<p class="manufacturer-no-results" role="status">${ui('يمكنك حفظ الاسم الذي كتبته، أو اختيار «غير معروف».', 'You can keep the name you entered, or choose “Unknown”.')}</p>` : ''}${matches.map((entry, index) => `<button type="button" tabindex="-1" role="option" class="manufacturer-option" id="manufacturer-option-${index}" data-manufacturer-index="${index}" aria-selected="false"><bdi>${escapeHtml(entry.label)}</bdi></button>`).join('')}`;
    list.hidden = false; input.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-expanded', 'true'); input.removeAttribute('aria-activedescendant');
  };
  const activate = (index) => {
    active = (index + matches.length) % matches.length;
    list.querySelectorAll('[role="option"]').forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
    const option = el(`manufacturer-option-${active}`);
    input.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' });
  };
  const choose = (index) => {
    const entry = matches[index]; if (!entry) return;
    input.value = entry.label;
    saveFormField({ dataset: { field: 'brand' }, type: 'text', value: entry.value });
    input.focus(); close();
  };
  input.addEventListener('focus', () => show(), options);
  input.addEventListener('input', () => show(), options);
  input.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); if (list.hidden) show('');
      activate(active < 0 ? (event.key === 'ArrowDown' ? 0 : matches.length - 1) : active + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter') {
      event.preventDefault(); if (!list.hidden && active >= 0) choose(active); else close();
    } else if (event.key === 'Escape' || event.key === 'Tab') close();
  }, options);
  toggle.addEventListener('click', () => {
    if (!list.hidden) close(); else { input.focus(); show(''); }
  }, options);
  list.addEventListener('mousedown', (event) => { if (event.target.closest('[role="option"]')) event.preventDefault(); }, options);
  list.addEventListener('click', (event) => {
    const option = event.target.closest('[data-manufacturer-index]'); if (option) choose(Number(option.dataset.manufacturerIndex));
  }, options);
  picker.addEventListener('focusout', (event) => { if (!picker.contains(event.relatedTarget)) close(); }, options);
  document.addEventListener('pointerdown', (event) => { if (!picker.contains(event.target)) close(); }, options);
}
function renderRail() {
  el('step-rail').innerHTML = STEPS.map((step, index) => `<div class="rail-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'done' : ''}"><span class="rail-number">${index < currentStep ? '✓' : index + 1}</span><span><b>${step.short}</b><small>${step.title}</small></span></div>`).join('');
  el('step-kicker').textContent = `الخطوة ${currentStep + 1} من ${STEPS.length}`;
  el('step-back').disabled = currentStep === 0;
  el('step-back').style.opacity = currentStep === 0 ? '.45' : '1';
  el('step-next').innerHTML = currentStep === STEPS.length - 1 ? 'حفظ البيانات <span>✓</span>' : 'التالي <span>←</span>';
  el('form-hint').textContent = currentStep === 3 ? 'تقديرات سياج إرشادية' : 'تستغرق أقل من دقيقتين';
  const progress = el('wizard-progress-fill');
  if (progress) progress.style.width = `${Math.round(((currentStep + 1) / STEPS.length) * 100)}%`;
}
function mediaFor(category) { return media.filter((item) => item.category === category); }
function renderMedia(category) {
  const files = mediaFor(category);
  return `<div class="media-list">${files.map((item) => {
    const url = item.type.startsWith('image/') ? URL.createObjectURL(item.blob) : '';
    return `<span class="media-chip">${url ? `<img class="upload-preview" src="${url}" alt="">` : '▣'}<span>${escapeHtml(item.name)}</span><button type="button" data-remove-media="${escapeHtml(item.id)}" aria-label="حذف ${escapeHtml(item.name)}">×</button></span>`;
  }).join('')}</div>`;
}
function uploadBlock(category, title, detail, accept, multiple = false) {
  return `<label class="upload-zone" data-drop-zone="${category}"><input type="file" data-upload="${category}" accept="${accept}" ${multiple ? 'multiple' : ''}><span class="upload-symbol">↑</span><b>${title}</b><small>${detail}</small></label>${renderMedia(category)}`;
}
function invoiceReviewMarkup() {
  if (!invoiceReview || invoiceReview.accountId !== currentAccount?.id) return '';
  const invoice = invoiceReview.invoice;
  const entries = [
    ['totalAmount', 'قيمة الفاتورة', 'number', '.001'], ['consumptionKwh', 'استهلاك الطاقة', 'number', '.1'],
    ['energyTariffPerKwh', 'التعرفة لكل kWh', 'number', '.0001'], ['billingMonth', 'شهر الفاتورة', 'month', ''],
    ['currency', 'العملة', 'text', ''],
  ];
  const notices = [invoice.summary, ...(invoice.ambiguities || [])].filter((value) => typeof value === 'string' && value);
  const charges = [['energyCharges', ui('رسوم الطاقة', 'Energy charges')], ['fixedCharges', ui('رسوم ثابتة', 'Fixed charges')], ['taxes', ui('الضرائب', 'Taxes')], ['otherCharges', ui('رسوم أخرى', 'Other charges')]];
  return `<section class="invoice-review" aria-labelledby="invoice-review-title"><h3 id="invoice-review-title">راجع قراءة الفاتورة</h3><p>هذه قراءة آلية قابلة للخطأ. راجع الأرقام والعملة والشهر قبل استخدامها. الفاتورة وحدها لا تثبت خسارة الألواح.</p><p class="helper-text">${ui('الثقة في القراءة', 'Extraction confidence')}: ${confidenceText(invoice.confidence)}${invoice.documentReadable === false ? ` · ${ui('الفاتورة غير مقروءة بوضوح', 'The bill is not clearly readable')}` : ''}</p><p class="helper-text">${ui('الفترة الظاهرة في الفاتورة', 'Printed billing period')}: ${escapeHtml(invoice.billingStart || '—')} — ${escapeHtml(invoice.billingEnd || '—')}</p><div class="field-grid">${entries.map(([key, label, type, step]) => `<div class="field"><label for="invoice-review-${key}">${label}</label><input id="invoice-review-${key}" data-invoice-review="${key}" type="${type}" value="${escapeHtml(invoice[key] ?? '')}" ${type === 'number' ? `min="0" step="${step}"` : ''}></div>`).join('')}</div><div class="assessment-metrics">${charges.map(([key, label]) => assessmentMetric(label, assessmentValue(invoice[key], '', 3))).join('')}</div><p class="helper-text">${ui('تُستخدم فقط الحقول التي راجعتها أعلاه. إذا تركت مبلغ الفاتورة أو الاستهلاك أو التعرفة فارغاً، تُمسح قيمته السابقة. لا تُشتق تعرفة الطاقة من إجمالي الفاتورة لهذا الحساب الشهري.', 'Only the reviewed fields above are applied. Leaving amount, consumption or tariff blank clears its previous value. The monthly assessment does not derive an energy tariff from the bill total.')}</p>${notices.length ? `<ul class="assessment-notes">${notices.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : ''}<div class="invoice-review-actions"><button type="button" class="button button-primary" id="apply-invoice">استخدام البيانات المراجعة</button><button type="button" class="button button-outline" id="cancel-invoice">إلغاء</button></div></section>`;
}
function renderCurrentStep() {
  renderRail(); const target = el('step-content');
  clearFormAlert();
  if (currentStep === 0) {
    target.innerHTML = `<h2 class="step-title">${STEPS[0].title}</h2><p class="step-description">${STEPS[0].description}</p><button class="button button-outline weather-location-action" type="button" id="gps-button">⌖ استخدام موقعك الحالي</button><p class="gps-status${gpsNotice ? ` gps-${gpsNotice.type}` : ''}" id="gps-status" role="status" aria-live="polite" ${gpsNotice ? '' : 'hidden'}>${gpsNotice ? escapeHtml(gpsNoticeText(gpsNotice.code)) : ''}</p><div class="field-grid">
      ${field('اسمك (اختياري)', 'name', { placeholder: 'مثال: مريم' })}
      ${field('درجة حرارة الجو', 'ambientTemp', { type: 'number', suffix: '°م', placeholder: '35', min: '-10', max: '65', step: '0.1' })}
      ${field('الرطوبة النسبية', 'humidity', { type: 'number', suffix: '%', placeholder: '45', min: '0', max: '100' })}
      ${field('عدد الألواح', 'panels', { type: 'number', placeholder: '12', min: '1', max: '10000' })}
      ${field('الغبار في الجو', 'airDustPercent', { type: 'range', min: '0', max: '100', hint: airDustHint(), full: true })}
      <div class="field full"><span class="field-label">موقع النظام</span><div class="inline-search"><input id="city-search" class="field-input" placeholder="ابحث عن مدينة أو محافظة" value="${escapeHtml(state.form.location)}"><button class="button button-outline" type="button" id="city-search-button">بحث</button></div><div class="search-results" id="search-results"></div><small class="helper-text">الموقع الدقيق اختياري؛ استخدم GPS لجلب الطقس الأقرب.</small><div class="weather-prefill"><span>حالة الطقس الحالية</span><b id="wizard-weather-condition">${state.weather?.current ? weatherText(state.weather.current.weather_code) : 'تظهر بعد تحديد الموقع'}</b></div></div>
      </div>`;
  } else if (currentStep === 1) {
    target.innerHTML = `<h2 class="step-title">${STEPS[1].title}</h2><p class="step-description">${STEPS[1].description}</p><div class="field-grid">
      ${field('القدرة الإجمالية للنظام', 'power', { type: 'number', suffix: 'واط', placeholder: '5000', min: '1' })}
      ${manufacturerField()}
      ${field('اسم شركة الألواح', 'company', { placeholder: 'مثال: شركة النور للطاقة الشمسية', hint: ui('اكتب اسم الشركة المصنّعة أو المورّد كما يظهر في فاتورة الشراء (اختياري).', 'Enter the manufacturer or supplier name as shown on the purchase invoice (optional).') })}
      ${field('آخر صيانة للألواح', 'lastMaintenanceAt', { type: 'date', max: todayIsoDate(), hint: ui('تاريخ آخر صيانة أو تنظيف شامل. منه نحسب الصيانة القادمة كل 6 أشهر وننبّهك قبل موعدها.', 'Date of the last maintenance or deep clean. We use it to schedule the next maintenance every 6 months and remind you before it is due.') })}
      ${field('ميل الألواح عن الأفقي', 'tilt', { type: 'number', suffix: '°', placeholder: '20', min: '0', max: '90' })}
      ${field('اتجاه واجهة الألواح (اختياري)', 'panelAzimuth', { type: 'number', suffix: '°', placeholder: '180', min: '0', max: '360', step: '1', hint: '0° شمال · 90° شرق · 180° جنوب · 270° غرب. أدخل قراءة بوصلة للواجهة التي تواجه الشمس.' })}
      ${field('وقت تصوير الألواح', 'captureAt', { type: 'datetime-local', hint: 'وقت محلي تختاره؛ لا نستخرجه من الفيديو. يلزم الموقع والميل والاتجاه والوقت لحساب زاوية الشمس.', full: true })}
      <div class="field full"><button class="text-button" type="button" id="capture-now">${ui('استخدام الوقت الحالي إذا صوّرت الآن', 'Use the current time if you filmed just now')}</button></div>
      <div id="tilt-warning-slot" class="field full">${tiltWarningMarkup()}</div>
      ${selectField('نوع الألواح', 'panelType', [['monocrystalline', 'أحادية البلورة'], ['polycrystalline', 'متعددة البلورات'], ['thin-film', 'أغشية رقيقة'], ['unknown', 'غير معروف']])}
      ${field('كفاءة اللوح (اختياري)', 'efficiency', { type: 'number', suffix: '%', placeholder: '21', min: '1', max: '40', step: '.1' })}
      ${field('معامل الحرارة (اختياري)', 'coefficient', { type: 'number', suffix: '%/°م', placeholder: '-0.35', step: '.01', hint: 'غالباً بين ‎-0.25 و‎-0.50 لكل درجة.' })}
      ${field('قدرة اللوح الواحد (اختياري)', 'ratedPower', { type: 'number', suffix: 'واط', placeholder: '450', min: '1' })}
      <div class="field full"><span class="field-label">صورة أو فيديو للألواح</span>${uploadBlock('panels', 'أضف صورة أو مقطعاً قصيراً', 'صورة واضحة أو فيديو من 5 إلى 10 ثوانٍ · حتى 6 ملفات، 25 ميغابايت للملف', 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm', true)}<small class="helper-text">يفحص Claude صوراً ولقطات مختارة من المقاطع، حتى 8 صور في الطلب. لا يفحص الصوت أو كل إطارات الفيديو.</small><small class="helper-text">لا يمكن قياس حرارة السطح أو زاوية الميل الدقيقة من صورة عادية؛ يعتمد الحساب على البيانات التي تدخلها والطقس.</small><small class="helper-text">تُرسل الصور واللقطات إلى Anthropic فقط عند ضغط «تحليل الألواح باستخدام Claude».</small>${claudeAvailabilityMarkup()}</div>
      </div>`;
  } else if (currentStep === 2) {
    target.innerHTML = `<h2 class="step-title">${STEPS[2].title}</h2><p class="step-description">${STEPS[2].description}</p><div class="field-grid">
      ${field('قيمة الفاتورة', 'invoice', { type: 'number', suffix: 'ر.ع', placeholder: '25.000', min: '0', step: '.001' })}
      ${field('الاستهلاك من الفاتورة (اختياري)', 'consumption', { type: 'number', suffix: 'kWh', placeholder: '950', min: '0', step: '.1', hint: 'إن توفر، نستخدمه لاشتقاق تعرفة الكهرباء التقريبية.' })}
      ${field('تعرفة الكهرباء (اختياري)', 'tariff', { type: 'number', suffix: 'ر.ع/kWh', placeholder: 'مثال: 0.025', min: '0', step: '.001', hint: ui('أدخل سعر وحدة الطاقة فقط، دون الرسوم والضرائب؛ يلزم لحساب قيمة خسارة الشهر.', 'Enter the energy unit rate excluding fees and taxes; this is needed to value the monthly deficit.') })}
      ${field('شهر الفاتورة', 'billMonth', { type: 'month' })}
      ${field('إنتاج متوقع للشهر (اختياري)', 'expectedMonthlyKwh', { type: 'number', suffix: 'kWh', min: '0', step: '.1', hint: 'استخدم خط أساس موثوقاً للنظام. يجب أن يغطي الإنتاج المتوقع والفعلي الفترة نفسها.' })}
      ${field('إنتاج فعلي للشهر (اختياري)', 'actualMonthlyKwh', { type: 'number', suffix: 'kWh', min: '0', step: '.1', hint: 'قراءة عدّاد الإنتاج أو العاكس؛ استهلاك الفاتورة ليس إنتاج الألواح.' })}
      <p class="helper-text field full">${ui('للشهر الحالي: أدخل الإنتاج حتى نهاية أمس في الحقلين. للأشهر الماضية: أدخل إجمالي الشهر الكامل.', 'For the current month, enter generation through the end of yesterday in both fields. For past months, enter full-month totals.')}</p>
      <div class="field full"><span class="field-label">صورة الفاتورة (اختياري)</span>${uploadBlock('bill', 'أرفق صورة الفاتورة', ui('JPG أو PNG أو WEBP · حتى 25 ميغابايت', 'JPG, PNG or WEBP · up to 25 MB'), 'image/jpeg,image/png,image/webp')}<p class="helper-text">قد تتضمن الفاتورة بيانات شخصية؛ احجب ما لا يلزم. لن تُرسل إلى Anthropic إلا عند ضغط زر تحليل الفاتورة.</p>${claudeAvailabilityMarkup()}<button class="button button-outline invoice-ai-button" type="button" id="analyze-invoice" aria-busy="${invoiceBusy}" ${invoiceBusy || claudeEnabled !== true || !mediaFor('bill').length ? 'disabled' : ''}>${invoiceBusy ? 'جارٍ قراءة الفاتورة…' : 'تحليل الفاتورة باستخدام Ai'}</button>${invoiceReviewMarkup()}</div>
      </div>`;
  } else {
    const f = state.form; const attachments = mediaFor('panels').length;
    const reviewLocale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
    const reviewMaintenance = parseIsoDate(f.lastMaintenanceAt);
    const summary = [['اسم صاحب النظام', f.name || '—'], ['الموقع', f.location || 'غير محدد'], ['عدد الألواح', f.panels ? `${f.panels} لوح` : '—'], ['القدرة الإجمالية', f.power ? `${f.power} واط` : '—'], ['النوع', ({ monocrystalline: 'أحادية البلورة', polycrystalline: 'متعددة البلورات', 'thin-film': 'أغشية رقيقة', unknown: 'غير معروف' })[f.panelType]], ['شركة الألواح', f.company || '—'], ['آخر صيانة', reviewMaintenance ? maintenanceDateLabel(reviewMaintenance, reviewLocale) : 'لم تُسجل'], ['الفاتورة الشهرية', f.invoice ? `${f.invoice} ر.ع` : 'لم تُضف'], ['شهر الفاتورة', f.billMonth || '—'], ['المرفقات', attachments ? `${attachments} ملف للألواح` : 'لا توجد صورة/فيديو']];
    target.innerHTML = `<h2 class="step-title">${STEPS[3].title}</h2><p class="step-description">${STEPS[3].description}</p><div class="confirmation-grid">${summary.map(([label, value]) => `<div class="confirm-card"><small>${label}</small><b>${escapeHtml(value)}</b></div>`).join('')}</div><div class="confirmation-callout">${ui('حفظ البيانات يحسب تقدير الإدخالات والشهر. يمكنك بعد الحفظ طلب فحص Claude من الزر المخصص في الرئيسية. نسبة التغطية المرئية لا تساوي نسبة خسارة الطاقة؛ حساب خسارة الشهر يحتاج إنتاجاً فعلياً وخط أساس متوقعاً أو تقديراً من طقس الفترة.', 'Saving details calculates the input estimate and monthly assessment. After saving, request Claude from its button on the home page. Visible coverage is not energy loss; monthly losses need actual generation and an expected baseline or a period weather model.')} ${attachments ? 'تُرسل الصور واللقطات إلى Anthropic فقط عند ضغط «تحليل الألواح باستخدام Claude».' : 'أضف صورة للألواح في الخطوة السابقة لتفعيل التحليل البصري.'}</div>${claudeAvailabilityMarkup()}`;
  }
  target.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('input', () => saveFormField(input)));
  target.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('change', () => saveFormField(input)));
  target.querySelectorAll('[data-upload]').forEach((input) => input.addEventListener('change', () => handleUploads(input.dataset.upload, [...input.files])));
  target.querySelectorAll('[data-remove-media]').forEach((button) => button.addEventListener('click', () => removeMedia(button.dataset.removeMedia)));
  const gps = el('gps-button'); if (gps) gps.addEventListener('click', getLocation);
  el('analyze-invoice')?.addEventListener('click', analyzeInvoice);
  el('capture-now')?.addEventListener('click', () => { state.form.captureAt = localCaptureTime(); state.solarContext = null; state.monthlyLoss = null; persist(); renderCurrentStep(); });
  el('apply-invoice')?.addEventListener('click', applyInvoiceReview);
  el('cancel-invoice')?.addEventListener('click', () => { invoiceReview = null; renderCurrentStep(); });
  target.querySelectorAll('[data-invoice-review]').forEach((input) => input.addEventListener('input', () => { if (invoiceReview) invoiceReview.invoice[input.dataset.invoiceReview] = input.value; }));
  const citySearch = el('city-search-button'); if (citySearch) citySearch.addEventListener('click', searchCity);
  const searchInput = el('city-search'); if (searchInput) searchInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); searchCity(); } });
  target.querySelectorAll('[data-drop-zone]').forEach((zone) => {
    zone.addEventListener('dragover', (event) => { event.preventDefault(); zone.classList.add('dragging'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
    zone.addEventListener('drop', (event) => { event.preventDefault(); zone.classList.remove('dragging'); handleUploads(zone.dataset.dropZone, [...event.dataTransfer.files]); });
  });
  applyLanguage();
  bindManufacturerPicker();
}
function openWizard(step = 0) {
  currentStep = step; showPage('wizard'); renderCurrentStep(); window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showPage(page) {
  if (!state.user && page !== 'auth') page = 'auth';
  ['dashboard', 'wizard', 'history', 'reports', 'report', 'settings', 'auth'].forEach((name) => { const section = el(`page-${name}`); if (section) section.hidden = name !== page; });
  document.querySelectorAll('.nav-link').forEach((button) => button.classList.toggle('active', button.dataset.page === page));
  document.body.classList.remove('mobile-nav-open');
  document.body.classList.toggle('print-report', page === 'report');
  applyLanguage();
}
function clearFormAlert() {
  const alert = el('form-alert');
  if (!alert) return;
  alert.hidden = true; alert.textContent = '';
}
function showFormAlert(message) {
  const alert = el('form-alert');
  if (!alert) { showToast(message); return; }
  alert.textContent = state.settings.language === 'en' ? translateText(message) : message;
  alert.hidden = false;
  alert.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function showStepError(key, message) {
  const input = document.querySelector(`[data-field="${key}"]`);
  if (input) {
    const wrapper = input.closest('.field');
    if (wrapper) {
      wrapper.classList.add('invalid');
      wrapper.querySelector('.field-error')?.remove();
      const note = document.createElement('small');
      note.className = 'field-error';
      note.textContent = state.settings.language === 'en' ? translateText(message) : message;
      wrapper.appendChild(note);
    }
    try { input.focus({ preventScroll: false }); } catch { input.focus(); }
  }
  showFormAlert(message);
}
function gpsNoticeText(code) {
  const messages = {
    unsupported: ['متصفحك لا يدعم تحديد الموقع؛ ابحث عن مدينتك من حقل البحث بالأسفل.', 'Your browser does not support location; search for your city below.'],
    insecure: ['تحديد الموقع يحتاج اتصالاً آمناً (HTTPS). ابحث عن مدينتك من حقل البحث بالأسفل.', 'Location needs a secure connection (HTTPS). Search for your city below.'],
    denied: ['تم رفض إذن الموقع. فعّل الإذن من إعدادات المتصفح ثم أعد المحاولة، أو ابحث عن مدينتك.', 'Location permission was denied. Allow it in your browser settings and retry, or search for your city.'],
    unavailable: ['تعذر تحديد موقعك الآن. جرّب مرة أخرى أو ابحث عن مدينتك.', 'Could not determine your location now. Try again or search for your city.'],
    timeout: ['استغرق تحديد الموقع وقتاً طويلاً. جرّب مرة أخرى في مكان مكشوف.', 'Locating took too long. Try again in an open area.'],
    busy: ['جارٍ تحديد موقعك وتحديث الطقس…', 'Getting your location and updating weather…'],
    granted: ['تم تحديد موقعك وتحديث الطقس بنجاح.', 'Location set and weather updated successfully.'],
  };
  return messages[code] ? ui(...messages[code]) : '';
}
function renderGpsStatus() {
  const node = el('gps-status');
  if (!node) return;
  if (!gpsNotice) { node.hidden = true; node.textContent = ''; node.className = 'gps-status'; return; }
  node.hidden = false;
  node.className = `gps-status gps-${gpsNotice.type}`;
  node.textContent = gpsNoticeText(gpsNotice.code);
}
function setGpsNotice(type, code) { gpsNotice = { type, code }; renderGpsStatus(); }
function validateStep() {
  const f = state.form;
  const invalid = (key, message) => { showStepError(key, message); return false; };
  if (currentStep === 0) {
    if (!f.panels || Number(f.panels) < 1) return invalid('panels', 'أدخل عدد الألواح أولاً.');
    if (f.ambientTemp !== '' && (Number(f.ambientTemp) < -10 || Number(f.ambientTemp) > 65)) return invalid('ambientTemp', 'تأكد من درجة حرارة الجو.');
    if (f.humidity !== '' && (Number(f.humidity) < 0 || Number(f.humidity) > 100)) return invalid('humidity', 'الرطوبة يجب أن تكون بين 0 و100%.');
  }
  if (currentStep === 1 && (!f.power || Number(f.power) <= 0)) return invalid('power', 'أدخل القدرة الإجمالية للنظام.');
  if (currentStep === 1 && f.tilt !== '' && (!Number.isFinite(Number(f.tilt)) || Number(f.tilt) < 0 || Number(f.tilt) > 90)) return invalid('tilt', 'تأكد من الميل بين 0 و90 درجة.');
  if (currentStep === 1 && f.panelAzimuth !== '' && (!Number.isFinite(Number(f.panelAzimuth)) || Number(f.panelAzimuth) < 0 || Number(f.panelAzimuth) > 360)) return invalid('panelAzimuth', 'تأكد من اتجاه الألواح بين 0 و360 درجة.');
  if (currentStep === 1 && f.captureAt && !captureTimeIso()) return invalid('captureAt', 'تأكد من وقت التصوير.');
  if (currentStep === 2 && !/^\d{4}-\d{2}$/.test(f.billMonth || '')) return invalid('billMonth', 'تأكد من الشهر والأرقام قبل استخدام بيانات الفاتورة.');
  if (currentStep === 2) for (const key of ['expectedMonthlyKwh', 'actualMonthlyKwh']) { if (f[key] !== '' && (!Number.isFinite(Number(f[key])) || Number(f[key]) < 0)) return invalid(key, 'تأكد من قيمة الإنتاج المتوقّع والفعلي.'); }
  if (currentStep === 2 && f.consumption && !f.invoice) return invalid('invoice', 'أضف قيمة الفاتورة لحساب التعرفة التقريبية.');
  return true;
}
function nextStep() {
  if (!validateStep()) return;
  if (currentStep < 3) {
    if (currentStep === 1 && appSettings && state.form.tilt !== '') {
      const tilt = Number(state.form.tilt);
      if (Number.isFinite(tilt) && (tilt < Number(appSettings.tilt_min_degrees) || tilt > Number(appSettings.tilt_max_degrees))) state.tiltWarningSeenFor = String(state.form.tilt);
    }
    currentStep += 1; persist(); renderCurrentStep(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  else { state.onboarded = true; state.updatedAt = new Date().toISOString(); persist(); showPage('dashboard'); renderDashboard(); runAnalysis({ useClaude: false }); }
}
function previousStep() { if (currentStep > 0) { currentStep -= 1; renderCurrentStep(); } }
async function handleUploads(category, files) {
  const accountId = currentAccount?.id;
  if (!accountId) return showFormAlert('سجّل الدخول أولاً.');
  if (category === 'bill') { invoiceReview = null; invoiceSequence += 1; invoiceController?.abort(); invoiceBusy = false; }
  const chosen = category === 'bill' ? files.slice(0, 1) : files;
  if (category === 'panels' && mediaFor(category).length + chosen.length > 6) { showFormAlert('يمكنك إضافة 6 ملفات كحد أقصى.'); return; }
  for (const file of chosen) {
    const supportedImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const supportedVideo = ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type);
    if (!supportedImage && !supportedVideo) { showFormAlert('اختر JPG أو PNG أو WEBP أو فيديو MP4 أو WEBM أو MOV.'); continue; }
    if (category === 'bill' && !file.type.startsWith('image/')) { showFormAlert('يمكن إرفاق الفاتورة كصورة.'); continue; }
    if (file.size > 25 * 1024 * 1024) { showFormAlert('يجب ألا يتجاوز حجم الملف 25 ميغابايت.'); continue; }
    const blob = file.type.startsWith('image/') ? await compressImage(file, category === 'bill' ? 1600 : 1500) : file;
    if (accountId !== currentAccount?.id) return;
    if (category === 'bill') {
      for (const old of mediaFor('bill')) await removeMedia(old.id);
      if (mediaFor('bill').length) return;
    }
    const item = { id: crypto.randomUUID(), accountId, category, name: file.name, type: blob.type || file.type, blob, updatedAt: Date.now() };
    try { await dbRequest('readwrite', (store) => store.put(item)); media.push(item); if (category === 'panels') clearVisualAssessment(); }
    catch { showFormAlert('تعذر حفظ الملف محلياً؛ جرّب ملفاً أصغر.'); }
  }
  if (accountId !== currentAccount?.id) return;
  persist();
  if (currentAccount) await syncAccountMedia().catch((error) => showFormAlert(error.message || 'تعذر رفع المرفقات؛ حُفظت على هذا الجهاز.'));
  renderCurrentStep();
}
function compressImage(file, maxSide) {
  return new Promise((resolve) => {
    const image = new Image(); const url = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height)); const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', .8);
    };
    image.onerror = () => { URL.revokeObjectURL(url); resolve(file); }; image.src = url;
  });
}
async function removeMedia(id) {
  const selected = media.find((item) => item.id === id);
  if (selected?.category === 'bill') { invoiceReview = null; invoiceSequence += 1; invoiceController?.abort(); invoiceBusy = false; }
  if (selected?.cloudSynced && currentAccount) {
    try {
      const response = await authenticatedFetch('/api/account/media/' + encodeURIComponent(id), { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'تعذر حذف المرفق من الحساب.');
    } catch (error) { showToast(error.message || 'تعذر حذف المرفق من الحساب.'); return; }
  }
  try { await dbRequest('readwrite', (store) => store.delete(id)); } catch { /* remove visible reference anyway */ }
  media = media.filter((item) => item.id !== id); if (selected?.category === 'panels') clearVisualAssessment(); persist(); renderCurrentStep();
}
async function analyzeInvoice() {
  const item = mediaFor('bill')[0];
  if (!item || !currentAccount?.id || invoiceBusy) return;
  const accountId = currentAccount.id;
  invoiceBusy = true; const initialButton = el('analyze-invoice'); if (initialButton) { initialButton.disabled = true; initialButton.setAttribute('aria-busy', 'true'); }
  const config = await loadAiConfig();
  if (accountId !== currentAccount?.id || mediaFor('bill')[0]?.id !== item.id) return;
  if (!config.claudeEnabled) {
    invoiceBusy = false; renderCurrentStep();
    return showToast(claudeEnabled === false ? 'Claude غير مفعّل بعد. يستطيع مسؤول الموقع تفعيله بمفتاح Anthropic.' : 'تعذر معرفة حالة Claude؛ حاول مرة أخرى.');
  }
  invoiceController?.abort(); invoiceController = new AbortController();
  const sequence = ++invoiceSequence;
  const month = state.form.billMonth; const language = state.settings.language;
  invoiceBusy = true; invoiceReview = null; renderCurrentStep();
  try {
    const image = await imageToDataUrl(item.blob, 1800, .83);
    if (sequence !== invoiceSequence || accountId !== currentAccount?.id) return;
    const response = await authenticatedFetch('/api/analyze-invoice', {
      method: 'POST', signal: invoiceController.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, billMonth: month, language }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(claudeError(data, 'تعذر قراءة الفاتورة. جرّب صورة أوضح.'));
    if (sequence !== invoiceSequence || accountId !== currentAccount?.id || month !== state.form.billMonth || language !== state.settings.language || mediaFor('bill')[0]?.id !== item.id) return;
    if (!data.invoice || typeof data.invoice !== 'object') throw new Error('تعذر قراءة الفاتورة. جرّب صورة أوضح.');
    invoiceReview = { accountId, mediaId: item.id, month, invoice: { ...data.invoice }, model: data.model };
  } catch (error) { if (error.name !== 'AbortError' && sequence === invoiceSequence && accountId === currentAccount?.id) showToast(error.message || 'تعذر قراءة الفاتورة. جرّب صورة أوضح.'); }
  finally { if (sequence === invoiceSequence && accountId === currentAccount?.id) { invoiceBusy = false; if (currentStep === 2 && !el('page-wizard').hidden) renderCurrentStep(); } }
}
function applyInvoiceReview() {
  const draft = invoiceReview;
  if (!draft || draft.accountId !== currentAccount?.id || draft.mediaId !== mediaFor('bill')[0]?.id || draft.month !== state.form.billMonth) { invoiceReview = null; renderCurrentStep(); return; }
  const values = draft.invoice;
  if (String(values.currency || '').trim().toUpperCase() !== 'OMR') return showToast('حساب القيمة هنا يدعم الريال العُماني؛ أدخل تعرفة بالريال العُماني يدوياً لهذه الفاتورة.');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(values.billingMonth || '')) return showToast('تأكد من الشهر والأرقام قبل استخدام بيانات الفاتورة.');
  for (const key of ['totalAmount', 'consumptionKwh', 'energyTariffPerKwh']) {
    if (values[key] !== null && values[key] !== undefined && values[key] !== '' && (!Number.isFinite(Number(values[key])) || Number(values[key]) < 0)) return showToast('تأكد من الشهر والأرقام قبل استخدام بيانات الفاتورة.');
  }
  for (const [source, destination] of [['totalAmount', 'invoice'], ['consumptionKwh', 'consumption'], ['energyTariffPerKwh', 'tariff']]) {
    state.form[destination] = values[source] !== null && values[source] !== undefined && values[source] !== '' ? String(Number(values[source])) : '';
  }
  if (values.billingMonth !== state.form.billMonth) { state.form.expectedMonthlyKwh = ''; state.form.actualMonthlyKwh = ''; }
  state.form.billMonth = values.billingMonth; state.monthlyLoss = null;
  invoiceReview = null; persist(); renderCurrentStep(); showToast('تم استخدام بيانات الفاتورة التي راجعتها.');
}
function getLocation() {
  const accountId = currentAccount?.id;
  const button = el('gps-button');
  if (!navigator.geolocation) { setGpsNotice('error', 'unsupported'); showFormAlert(gpsNoticeText('unsupported')); return; }
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') { setGpsNotice('error', 'insecure'); showFormAlert(gpsNoticeText('insecure')); return; }
  if (!button || button.disabled) return;
  setGpsNotice('busy', 'busy');
  button.textContent = ui('جارٍ تحديد الموقع…', 'Getting location…'); button.disabled = true;
  const restoreButton = () => { if (button.isConnected) { button.textContent = ui('⌖ استخدام موقعك الحالي', '⌖ Use your current location'); button.disabled = false; } };
  navigator.geolocation.getCurrentPosition(async (position) => {
    if (accountId !== currentAccount?.id) return;
    clearVisualAssessment();
    state.solarContext = null; state.monthlyLoss = null;
    state.form.latitude = position.coords.latitude; state.form.longitude = position.coords.longitude;
    clearWeatherForLocation();
    state.form.location = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`; persist();
    refreshWeatherFieldChecks();
    if (el('city-search')) el('city-search').value = state.form.location;
    setGpsNotice('ok', 'granted');
    try { await loadWeather({ forcePrefill: true }); } finally { restoreButton(); }
  }, (error) => {
    restoreButton();
    if (accountId !== currentAccount?.id) return;
    const code = error && error.code === 1 ? 'denied' : error && error.code === 3 ? 'timeout' : 'unavailable';
    setGpsNotice('error', code); showFormAlert(gpsNoticeText(code));
  }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
}
async function searchCity() {
  const accountId = currentAccount?.id;
  const input = el('city-search'); const results = el('search-results'); const name = input?.value.trim();
  if (!name) return showToast('اكتب اسم مدينة للبحث.');
  results.innerHTML = '<small class="helper-text">جارٍ البحث…</small>';
  try {
    const response = await fetch(`/api/geocode?name=${encodeURIComponent(name)}`); const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    if (accountId !== currentAccount?.id) return;
    if (!data.results.length) { results.innerHTML = '<small class="helper-text">لم نعثر على نتائج. جرّب كتابة الاسم بالإنجليزية.</small>'; return; }
    results.innerHTML = data.results.map((place, index) => `<button type="button" class="search-result" data-place="${index}">${escapeHtml([place.name, place.admin1, place.country].filter(Boolean).join('، '))}</button>`).join('');
    results.querySelectorAll('[data-place]').forEach((button) => button.addEventListener('click', async () => {
      if (accountId !== currentAccount?.id) return;
      clearVisualAssessment();
      const place = data.results[Number(button.dataset.place)]; state.form.location = [place.name, place.admin1].filter(Boolean).join('، '); state.form.latitude = place.latitude; state.form.longitude = place.longitude;
      state.solarContext = null; state.monthlyLoss = null;
      gpsNotice = null;
      clearWeatherForLocation();
      persist(); refreshWeatherFieldChecks(); input.value = state.form.location; results.innerHTML = ''; showToast(`تم اختيار ${state.form.location}.`); await loadWeather({ forcePrefill: true });
    }));
  } catch (error) { results.innerHTML = `<small class="helper-text">${escapeHtml(error.message || 'تعذر البحث. تأكد من تشغيل الخادم.')}</small>`; }
}
async function fetchWeatherResponse(url, timeoutMs) {
  // Use a controller and timer so this also works in Safari versions without AbortSignal.timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      const error = new Error('weather_request_failed');
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('weather_response_invalid');
    return data;
  } finally { clearTimeout(timer); }
}
function assertWeatherCoordinates(latitude, longitude) {
  const validCoordinate = (value, min, max) => (typeof value === 'number' || typeof value === 'string')
    && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
  if (!validCoordinate(latitude, -90, 90) || !validCoordinate(longitude, -180, 180)) throw new Error('إحداثيات الموقع غير صالحة.');
}
function hasUsableWeatherCurrent(snapshot) {
  const validReading = (value, min, max) => (typeof value === 'number' || typeof value === 'string')
    && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
  if (!validReading(snapshot?.current?.temperature_2m, -90, 65)
    || !validReading(snapshot?.current?.relative_humidity_2m, 0, 100)
    || typeof snapshot?.timezone !== 'string' || snapshot.timezone.trim() === '') return false;
  try { new Intl.DateTimeFormat('en', { timeZone: snapshot.timezone }).format(0); return true; }
  catch { return false; }
}
async function fetchDirectAirSnapshot(latitude, longitude) {
  assertWeatherCoordinates(latitude, longitude);
  const airUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  airUrl.search = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), timezone: 'auto', timeformat: 'unixtime', current: 'pm10,dust', hourly: 'pm10,dust', forecast_days: '2' });
  try {
    const air = await fetchWeatherResponse(airUrl, 12_000);
    return airborneDustReading({ air: air.current }) ? air : null;
  } catch { return null; }
}
async function fetchDirectWeatherSnapshot(latitude, longitude) {
  assertWeatherCoordinates(latitude, longitude);
  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
  forecastUrl.search = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude), timezone: 'auto', timeformat: 'unixtime',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
    hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunshine_duration,weather_code',
    forecast_days: '7',
  });
  const [forecast, air] = await Promise.all([
    fetchWeatherResponse(forecastUrl, 12_000),
    // Air-quality availability must not discard temperature, humidity, or weather readings.
    fetchDirectAirSnapshot(latitude, longitude),
  ]);
  if (!hasUsableWeatherCurrent(forecast)) throw new Error('weather_response_invalid');
  const rawDustFlag = forecast.dust_forecast_flag ?? forecast.current?.dust_forecast_flag ?? air?.current?.dust_forecast_flag;
  return {
    current: forecast.current, hourly: forecast.hourly, daily: forecast.daily,
    air: air?.current || null, airHourly: air?.hourly || null, timezone: forecast.timezone,
    dustForecastFlag: typeof rawDustFlag === 'boolean' ? rawDustFlag : null,
    provider: 'Open-Meteo', fetchedAt: new Date().toISOString(), cached: false, cacheAgeSeconds: 0,
  };
}
async function requestWeatherSnapshot(latitude, longitude) {
  assertWeatherCoordinates(latitude, longitude);
  try {
    const snapshot = await fetchWeatherResponse(`/api/weather?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`, 20_000);
    if (!hasUsableWeatherCurrent(snapshot)) throw new Error('weather_response_invalid');
    if (!airborneDustReading(snapshot)) {
      const air = await fetchDirectAirSnapshot(latitude, longitude);
      if (air) {
        const rawDustFlag = snapshot.dustForecastFlag ?? air.current?.dust_forecast_flag;
        return { ...snapshot, air: air.current, airHourly: air.hourly || null,
          airProvider: 'Open-Meteo', airFetchedAt: new Date().toISOString(),
          dustForecastFlag: typeof rawDustFlag === 'boolean' ? rawDustFlag : null };
      }
    }
    return snapshot;
  } catch (error) {
    // A bad request is a coordinate/input issue, not a reason to request another provider path.
    if (error.status === 400) throw new Error('إحداثيات الموقع غير صالحة.');
    try { return await fetchDirectWeatherSnapshot(latitude, longitude); }
    catch { throw new Error('تعذر جلب الطقس الآن. حاول مرة أخرى بعد قليل أو أدخل البيانات يدويًا.'); }
  }
}
function renderWeatherStatus() {
  const node = el('weather-status');
  if (!node) return;
  if (weatherNotice) { node.className = `weather-status status-${weatherNotice.type}`; node.textContent = weatherNotice.message; return; }
  node.className = 'weather-status';
  if (state.weather?.fetchedAt) {
    const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(state.weather.fetchedAt));
    node.textContent = ui(`آخر تحديث للطقس ${time}${state.weather.cached ? ' (نسخة محفوظة)' : ''}.`, `Weather updated ${time}${state.weather.cached ? ' (cached)' : ''}.`);
  } else if (state.form.latitude !== null && state.form.latitude !== '' && state.form.longitude !== null && state.form.longitude !== '') {
    node.textContent = ui('لم يتم جلب الطقس بعد؛ اضغط «تحديث الطقس».', 'Weather has not been fetched yet; press “Update weather”.');
  } else {
    node.textContent = ui('حدّد موقع النظام لجلب الطقس تلقائياً.', 'Set the system location to fetch weather automatically.');
  }
}
async function loadWeather({ forcePrefill = false } = {}) {
  const { latitude, longitude } = state.form;
  const accountId = currentAccount?.id;
  if (latitude === null || longitude === null || latitude === '' || longitude === '' || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    weatherNotice = { type: 'error', message: ui('حدّد مدينة أو استخدم GPS أولاً.', 'Choose a city or use GPS first.') };
    renderWeatherStatus(); showToast(ui('حدّد مدينة أو استخدم GPS أولاً.', 'Choose a city or use GPS first.')); return;
  }
  const requestId = ++weatherSequence;
  const refreshButton = el('refresh-weather');
  if (refreshButton) { refreshButton.disabled = true; refreshButton.setAttribute('aria-busy', 'true'); }
  weatherNotice = { type: 'loading', message: ui('جارٍ تحديث الطقس…', 'Updating weather…') };
  renderWeatherStatus();
  const before = Object.fromEntries(Object.keys(DEFAULT_STATE.weatherPrefill).map((key) => [key, state.form[key]]));
  const beforeMarkers = { ...state.weatherPrefill };
  try {
    const data = await requestWeatherSnapshot(latitude, longitude);
    if (requestId !== weatherSequence || accountId !== currentAccount?.id || String(latitude) !== String(state.form.latitude) || String(longitude) !== String(state.form.longitude)) return;
    state.weather = data;
    const fetchedAt = new Date().toISOString();
    const assignWeatherField = (key, raw, manualKey, source, min, max, precision = 0) => {
      // Edits made while the request was in flight take precedence over the response.
      const changedDuringFetch = String(state.form[key]) !== String(before[key]) || state.weatherPrefill[key] !== beforeMarkers[key];
      if (changedDuringFetch || (!forcePrefill && state.form[manualKey])) return;
      const number = raw === null || raw === undefined || raw === '' ? NaN : Number(raw);
      if (!Number.isFinite(number) || number < min || number > max) {
        state.form[key] = key === 'airDustPercent' ? null : '';
        state.weatherPrefill[key] = null;
        return;
      }
      const scale = 10 ** precision;
      const value = String(Math.round(number * scale) / scale);
      if (String(state.form[key]) !== value && key === 'ambientTemp') { clearVisualAssessment(); state.solarContext = null; state.monthlyLoss = null; }
      state.form[key] = value; state.form[manualKey] = false;
      state.weatherPrefill[key] = { value, source, fetchedAt, latitude, longitude };
    };
    assignWeatherField('ambientTemp', data.current?.temperature_2m, 'ambientTempManual', 'temperature_2m', -90, 65, 1);
    assignWeatherField('humidity', data.current?.relative_humidity_2m, 'humidityManual', 'relative_humidity_2m', 0, 100);
    const dustReading = airborneDustReading(data);
    assignWeatherField('airDustPercent', dustReading?.percent, 'airDustManual', dustReading?.source, 0, 100);
    const code = data.current?.weather_code;
    state.form.weatherCode = code !== null && code !== undefined && Number.isFinite(Number(code)) ? Number(code) : null;
    weatherNotice = null;
    persist();
    if (!el('page-wizard').hidden && currentStep === 0) renderCurrentStep();
    renderDashboard();
  } catch (error) {
    if (requestId === weatherSequence && accountId === currentAccount?.id) {
      const message = error.message || ui('تعذر تحديث الطقس.', 'Could not update weather.');
      weatherNotice = { type: 'error', message: `${message} ${ui('يمكنك إعادة المحاولة أو إدخال البيانات يدوياً.', 'You can retry or enter the data manually.')}` };
      renderWeatherStatus(); showToast(message);
    }
  } finally {
    if (requestId === weatherSequence && refreshButton?.isConnected) { refreshButton.disabled = false; refreshButton.removeAttribute('aria-busy'); }
  }
}
function weatherText(code) {
  if (code === 0) return 'سماء صافية'; if ([1, 2, 3].includes(code)) return 'غائم جزئياً'; if ([45, 48].includes(code)) return 'ضباب';
  if ([51, 53, 55, 56, 57].includes(code)) return 'رذاذ'; if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'أمطار';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'ثلوج'; if ([95, 96, 99].includes(code)) return 'عواصف رعدية'; return 'حالة متغيرة';
}
function calculateLoss() {
  const f = state.form; const current = state.weather?.current || {};
  const temperatureValue = f.ambientTemp !== '' && f.ambientTemp !== null && f.ambientTemp !== undefined ? f.ambientTemp : current.temperature_2m;
  const rawAirTemp = temperatureValue !== null && temperatureValue !== undefined && temperatureValue !== '' ? Number(temperatureValue) : NaN;
  const airTemp = Number.isFinite(rawAirTemp) ? rawAirTemp : null;
  const panelOffset = Number(appSettings?.panel_temperature_offset_c);
  const heatThreshold = Number(appSettings?.heat_loss_threshold_c);
  const lossPerDegree = Number(appSettings?.heat_loss_percent_per_c);
  const heatPercent = airTemp !== null && [panelOffset, heatThreshold, lossPerDegree].every(Number.isFinite)
    ? Math.max(0, airTemp + panelOffset - heatThreshold) * lossPerDegree : null;
  // Dust and shade are estimates: dust from the visible coverage (or a scaled airborne
  // index), shade from the visible coverage. Neither is a direct electrical measurement.
  const visual = state.ai && state.aiLanguage === state.settings.language ? state.ai : null;
  const clampPercent = (value) => (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) ? null : Math.min(100, Math.max(0, Number(value)));
  const visualDust = clampPercent(visual?.dustCoveragePercent);
  const visualShade = clampPercent(visual?.shadeCoveragePercent);
  const manualPanelDust = clampPercent(f.dust);
  const airDustIndex = clampPercent(f.airDustPercent);
  const dustPercent = visualDust !== null ? visualDust
    : manualPanelDust !== null ? manualPanelDust
    : airDustIndex !== null ? Math.round(airDustIndex * 0.25) : null;
  const shadePercent = visualShade !== null ? visualShade : 0;
  const totalPercent = Math.min(100, Math.round((heatPercent || 0) + (dustPercent || 0) + shadePercent));
  const sunshineSeconds = Number(state.weather?.daily?.sunshine_duration?.[0]);
  const sunHours = sunshineSeconds > 0 ? Math.min(8.5, Math.max(3, sunshineSeconds / 3600)) : 5.2;
  const possibleKwh = Math.max(0, Number(f.power || 0) / 1000 * sunHours * .78);
  const lostKwh = possibleKwh * (totalPercent / 100);
  const consumption = Number(f.consumption || 0); const bill = Number(f.invoice || 0); const tariff = Number(f.tariff || 0);
  const price = tariff > 0 ? tariff : consumption > 0 && bill > 0 ? bill / consumption : .025;
  const priceBasis = tariff > 0 ? 'التعرفة التي أدخلتها' : consumption > 0 && bill > 0 ? 'مشتقة من الفاتورة والاستهلاك' : 'تعرفة مرجعية قابلة للتغيير';
  return { percent: totalPercent, totalPercent, heatPercent, heatEstimateUnavailable: heatPercent === null, soilingPercent: dustPercent, dustPercent, shadePercent, possibleKwh, lostKwh, lostMoney: lostKwh * price, priceBasis, sunHours, airTemp, tariffOmrPerKwh: price };
}
function applyStoredReport(result, report) {
  result.reportId = report.id;
  result.dustLossPercent = report.dust_loss_percent;
  result.dustLossOmr = report.dust_loss_omr;
  result.heatLossPercent = report.heat_loss_percent;
  result.heatLossOmr = report.heat_loss_omr;
  result.reportAmbientTempC = report.ambient_temp_c;
  result.reportTemperatureSource = report.temperature_source;
  result.monthlyProductionKwh = report.monthly_production_kwh;
  result.heatPercent = report.heat_loss_percent;
  result.heatEstimateUnavailable = report.heat_loss_percent === null || report.heat_loss_percent === undefined;
  result.soilingPercent = report.dust_loss_percent === null || report.dust_loss_percent === undefined ? null : Number(report.dust_loss_percent);
  if (report.ambient_temp_c !== null && Number.isFinite(Number(report.ambient_temp_c))) result.airTemp = Number(report.ambient_temp_c);
  const heatPct = report.heat_loss_percent === null || report.heat_loss_percent === undefined ? null : Number(report.heat_loss_percent);
  const dustPct = result.soilingPercent;
  const shadePct = Number.isFinite(Number(result.shadePercent)) ? Number(result.shadePercent) : 0;
  result.heatPercent = heatPct;
  result.dustPercent = dustPct;
  result.shadePercent = shadePct;
  result.totalPercent = Math.min(100, Math.round((heatPct || 0) + (dustPct || 0) + shadePct));
  result.percent = result.totalPercent;
  result.lostKwh = result.possibleKwh * (result.totalPercent / 100);
  result.lostMoney = result.lostKwh * result.tariffOmrPerKwh;
}
function waitForVideoEvent(video, eventName) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => finish(new Error('تعذر فتح الفيديو في هذا المتصفح؛ جرّب MP4 أو أرفق صوراً من المقطع.')), 12000);
    const success = () => finish();
    const error = () => finish(new Error('تعذر فتح الفيديو في هذا المتصفح؛ جرّب MP4 أو أرفق صوراً من المقطع.'));
    function finish(failure) { clearTimeout(timeout); video.removeEventListener(eventName, success); video.removeEventListener('error', error); failure ? reject(failure) : resolve(); }
    video.addEventListener(eventName, success, { once: true }); video.addEventListener('error', error, { once: true });
  });
}
async function framesFromVideo(blob, count, mediaId) {
  const url = URL.createObjectURL(blob); const video = document.createElement('video'); video.muted = true; video.playsInline = true; video.preload = 'metadata'; video.src = url;
  try {
    if (video.readyState < 1) await waitForVideoEvent(video, 'loadedmetadata');
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0 || !video.videoWidth || !video.videoHeight) throw new Error('تعذر فتح الفيديو في هذا المتصفح؛ جرّب MP4 أو أرفق صوراً من المقطع.');
    const times = Array.from({ length: count }, (_, index) => duration * (index + .5) / count);
    const frames = [];
    for (const time of times) {
      const seek = waitForVideoEvent(video, 'seeked');
      video.currentTime = time;
      await seek;
      const scale = Math.min(1, 1100 / Math.max(video.videoWidth, video.videoHeight)); const canvas = document.createElement('canvas');
      canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); frames.push({ image: canvas.toDataURL('image/jpeg', .68), timeSeconds: Math.round(time * 1000) / 1000, mediaId });
    }
    return frames;
  } finally { URL.revokeObjectURL(url); video.removeAttribute('src'); video.load(); }
}
async function imageToDataUrl(blob, maxSide = 1100, quality = .72) {
  const image = new Image(); const url = URL.createObjectURL(blob);
  try {
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height)); const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally { URL.revokeObjectURL(url); }
}
async function collectFrames() {
  const files = mediaFor('panels').slice(0, 6);
  const videos = files.filter((item) => item.type.startsWith('video/'));
  const pictures = files.filter((item) => item.type.startsWith('image/'));
  const images = []; const frames = []; const failures = [];
  for (const item of pictures) {
    try { images.push(await imageToDataUrl(item.blob)); } catch { failures.push(item.name); }
  }
  const budget = 8 - pictures.length;
  for (const [index, item] of videos.entries()) {
    const count = Math.floor(budget / videos.length) + (index < budget % videos.length ? 1 : 0);
    try { frames.push(...await framesFromVideo(item.blob, Math.max(1, count), item.id)); } catch { failures.push(item.name); }
  }
  if (!images.length && !frames.length) throw new Error('لا توجد لقطات قابلة للتحليل؛ أرفق صورة واضحة أو فيديو مدعوماً.');
  return { images, frames, failures };
}
function analysisFacts(result = calculateLoss()) {
  const f = state.form;
  const optional = (value) => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;
  return {
    panelCount: optional(f.panels), systemPowerWatts: optional(f.power), ambientTemperatureC: result.airTemp,
    humidityPercent: optional(f.humidity) ?? optional(state.weather?.current?.relative_humidity_2m),
    latitude: optional(f.latitude), longitude: optional(f.longitude), tilt: optional(f.tilt), panelAzimuthDegrees: optional(f.panelAzimuth),
    captureAt: captureTimeIso(), timezone: state.weather?.timezone || '', coefficient: optional(f.coefficient),
  };
}
function monthlyReportInput(result = calculateLoss()) {
  const f = state.form; const optional = (value) => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;
  return {
    month: f.billMonth, billMonth: f.billMonth, tariff: optional(f.tariff),
    expectedMonthlyKwh: optional(f.expectedMonthlyKwh), actualMonthlyKwh: optional(f.actualMonthlyKwh),
    latitude: optional(f.latitude), longitude: optional(f.longitude), ambientTempC: result.airTemp,
    monthlyProductionKwh: result.possibleKwh * 30, tariffOmrPerKwh: result.tariffOmrPerKwh,
    dustLossPercent: result.soilingPercent, location: f.location,
  };
}
function claudeError(data, fallback) {
  const messages = {
    claude_config: ['إعداد خدمة Claude غير صالح؛ يحتاج مسؤول الموقع مراجعته.', 'Claude configuration is invalid; the site administrator needs to check it.'],
    claude_not_configured: ['Claude غير مفعّل بعد. يستطيع مسؤول الموقع تفعيله بمفتاح Anthropic.', 'Claude is not enabled yet. The site administrator can enable it with an Anthropic key.'],
    claude_billing: ['يلزم تفعيل رصيد خدمة Claude لدى مسؤول الموقع.', 'The site administrator needs to activate Claude API credits.'],
    claude_auth: ['تعذر الاتصال بحساب Claude؛ يحتاج مسؤول الموقع مراجعة الربط.', 'Could not authenticate Claude; the site administrator needs to check the connection.'],
    claude_rate_limit: ['خدمة Claude مشغولة؛ انتظر قليلاً ثم أعد التحليل.', 'Claude is busy; wait a little and try again.'],
    claude_timeout: ['استغرق Claude وقتاً طويلاً؛ أعد الطلب أو أرفق صوراً أوضح.', 'Claude took too long; retry or attach clearer photos.'],
    claude_refusal: ['لم يستطع Claude تقديم هذا التحليل؛ أرفق صور الألواح أو الفاتورة فقط.', 'Claude could not provide this assessment; attach only panel or bill images.'],
    claude_invalid_output: ['لم يصل تحليل مكتمل من Claude؛ حاول مرة أخرى.', 'Claude did not return a complete assessment; try again.'],
    claude_image_size: ['الصورة كبيرة للتحليل؛ جرّب صورة أصغر أو أقل دقة.', 'The image is too large for assessment; try a smaller or lower-resolution image.'],
    claude_image_format: ['تعذر قراءة الصورة؛ استخدم JPG أو PNG أو WEBP.', 'Could not read the image; use JPG, PNG or WEBP.'],
    claude_images_required: ['أرفق صورة واضحة أو فيديو مدعوماً قبل التحليل.', 'Attach a clear image or supported video before assessment.'],
    claude_frame_time: ['تعذر قراءة توقيت لقطة الفيديو؛ أعد إرفاق المقطع.', 'Could not read a video frame timestamp; attach the clip again.'],
    claude_model: ['نموذج Claude المحدد غير متاح؛ يحتاج مسؤول الموقع مراجعة الإعداد.', 'The selected Claude model is unavailable; the site administrator needs to check it.'],
    claude_request: ['تعذر تنفيذ طلب Claude؛ جرّب صورة أوضح أو أعد الطلب.', 'Could not process the Claude request; try a clearer image or submit again.'],
    claude_unavailable: ['خدمة Claude غير متاحة الآن؛ حاول لاحقاً.', 'Claude is unavailable right now; try later.'],
    claude_network: ['تعذر الاتصال بخدمة Claude؛ حاول لاحقاً.', 'Could not connect to Claude; try later.'],
  };
  return messages[data.code] ? ui(...messages[data.code]) : state.settings.language === 'en' ? translateText(data.error || fallback) : data.error || fallback;
}
async function requestMonthlyAssessment(signal) {
  const response = await authenticatedFetch('/api/monthly-loss', {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ facts: analysisFacts(), reportInput: monthlyReportInput(), language: state.settings.language }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || ui('تعذر حساب خسارة الشهر.', 'Could not calculate monthly losses.'));
  return data;
}
async function updateMonthlyAssessment() {
  if (!currentAccount?.id) return;
  const selectedMonth = el('dashboard-bill-month').value;
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth) && selectedMonth !== state.form.billMonth) {
    state.form.billMonth = selectedMonth; state.form.expectedMonthlyKwh = ''; state.form.actualMonthlyKwh = ''; state.monthlyLoss = null; invoiceReview = null; persist();
  }
  const button = el('update-monthly-loss'); if (button) button.disabled = true;
  const accountId = currentAccount.id; const fingerprint = analysisFingerprint();
  try {
    const data = await requestMonthlyAssessment();
    if (accountId !== currentAccount?.id || fingerprint !== analysisFingerprint()) return;
    state.monthlyLoss = data.monthlyLoss || null; state.solarContext = data.solarContext || null;
    persist(); renderDashboard();
  } catch (error) { if (accountId === currentAccount?.id) showToast(error.message); }
  finally { if (button?.isConnected) button.disabled = false; }
}
async function runAnalysis({ useClaude = false } = {}) {
  if (!currentAccount?.id) return;
  analysisController?.abort(); analysisController = new AbortController();
  analysisBusy = useClaude;
  const panelButton = el('analyze-panels'); if (panelButton) panelButton.textContent = ui('تحليل الألواح باستخدام Claude', 'Panel assessment with Claude');
  const sequence = ++analysisSequence; const accountId = currentAccount.id; const fingerprint = analysisFingerprint();
  const stillCurrent = () => sequence === analysisSequence && accountId === currentAccount?.id && fingerprint === analysisFingerprint();
  const button = useClaude ? el('analyze-panels') : el('start-setup'); const original = button?.innerHTML;
  if (button) { button.disabled = true; button.innerHTML = `<span class="loading-inline"><i class="spinner"></i> ${ui('يجري التحليل…', 'Assessing…')}</span>`; }
  el('status-title').textContent = ui('سياج يراجع البيانات', 'Siyaj is reviewing your details');
  let analysisError = ''; let storedReport = null; let ai = null; let aiModel = null; let solarContext = null; let monthlyLoss = null;
  try {
    await loadAppSettings(); const config = await loadAiConfig();
    if (!stillCurrent()) return;
    const baseResult = calculateLoss();
    if (useClaude && mediaFor('panels').length && config.claudeEnabled) {
      try {
        const collected = await collectFrames();
        if (!stillCurrent()) return;
        const response = await authenticatedFetch('/api/analyze', {
          method: 'POST', signal: analysisController.signal, headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: collected.images, frames: collected.frames, language: state.settings.language, facts: analysisFacts(baseResult), reportInput: monthlyReportInput(baseResult) }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(claudeError(data, 'تعذر التحليل الذكي.'));
        ai = data.analysis; aiModel = data.model || 'Claude'; storedReport = data.report || null;
        solarContext = data.solarContext || null; monthlyLoss = data.monthlyLoss || null;
        if (collected.failures.length) analysisError = ui(`لم تُقرأ هذه المرفقات: ${collected.failures.join('، ')}. تم تحليل المرفقات المتاحة فقط.`, `These attachments could not be read: ${collected.failures.join(', ')}. Only readable attachments were assessed.`);
      } catch (error) { if (error.name === 'AbortError') return; analysisError = error.message || 'تعذر تحليل الصور.'; }
    } else if (useClaude) analysisError = config.claudeEnabled ? 'أضف صورة أو فيديو للألواح لتفعيل التحليل البصري بالذكاء الاصطناعي.' : claudeEnabled === false ? 'Claude غير مفعّل بعد. يستطيع مسؤول الموقع تفعيله بمفتاح Anthropic.' : 'تعذر معرفة حالة Claude؛ حاول مرة أخرى.';
    if (!stillCurrent()) { if (accountId === currentAccount?.id) showToast('تغيرت البيانات أثناء التحليل. أعد الطلب باستخدام البيانات الحالية.'); return; }
    if (!monthlyLoss) {
      try { const data = await requestMonthlyAssessment(analysisController.signal); solarContext = data.solarContext || solarContext; monthlyLoss = data.monthlyLoss || null; }
      catch (error) { if (error.name === 'AbortError') return; analysisError += ` ${error.message}`; }
    }
    if (!stillCurrent()) return;
    const result = calculateLoss();
    if (storedReport?.id) applyStoredReport(result, storedReport);
    else {
      try {
        const response = await authenticatedFetch('/api/panel/analysis', { method: 'POST', signal: analysisController.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(monthlyReportInput(result)) });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || 'تعذر حساب تفصيل خسارة الحرارة حالياً.');
        if (data.analysis) applyStoredReport(result, data.analysis);
      } catch (error) { if (error.name === 'AbortError') return; result.heatLossPercent = null; result.heatLossOmr = null; result.dustLossOmr = null; if (!analysisError) analysisError = error.message; }
    }
    if (!stillCurrent()) return;
    state.ai = ai; state.aiLanguage = ai ? state.settings.language : null; state.aiModel = aiModel;
    state.solarContext = solarContext; state.monthlyLoss = monthlyLoss; state.result = result; state.updatedAt = new Date().toISOString();
    const item = { ...result, id: crypto.randomUUID(), createdAt: state.updatedAt, temperature: result.airTemp, location: state.form.location || 'غير محدد', ai: !!ai, visualAssessment: ai, aiLanguage: state.aiLanguage, aiModel, solarContext, monthlyLoss };
    state.history.unshift(item); state.history = state.history.slice(0, 50);
    renderDashboard(analysisError); persist();
  } finally {
    if (sequence === analysisSequence && accountId === currentAccount?.id) {
      analysisBusy = false;
      if (button) { button.disabled = false; button.innerHTML = original || (useClaude ? ui('تحليل الألواح باستخدام Claude', 'Panel assessment with Claude') : 'إعداد النظام <span>←</span>'); }
      if (panelButton) panelButton.disabled = claudeEnabled !== true || !mediaFor('panels').length;
      if (!stillCurrent()) renderDashboard(ui('تغيرت البيانات؛ أعد التحليل إذا أردت نتيجة محدثة.', 'Details changed; run analysis again for an updated assessment.'));
    }
  }
}
function money(value) { return `${Number(value || 0).toFixed(3)} ر.ع`; }
function assessmentValue(value, suffix = '', decimals = 1) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? `${Number(value).toFixed(decimals)}${suffix}` : '—';
}
function confidenceText(value) {
  return ({ high: ui('مرتفعة', 'High'), medium: ui('متوسطة', 'Medium'), low: ui('منخفضة', 'Low'), unavailable: ui('غير متاحة', 'Unavailable') })[value] || ui('غير محددة', 'Not specified');
}
function assessmentMetric(label, value, hint = '') {
  return `<div class="assessment-metric"><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b>${hint ? `<span>${escapeHtml(hint)}</span>` : ''}</div>`;
}
function assessmentNote(key) {
  const notes = {
    missing_location: ['أضف موقع النظام لحساب اتجاه الشمس.', 'Add the system location to calculate sun direction.'],
    missing_capture_time_with_timezone: ['أضف وقت التصوير لحساب موضع الشمس.', 'Add the capture time to calculate the sun position.'],
    missing_measured_panel_tilt: ['أدخل ميل الألواح المقاس؛ لا نستخرجه بدقة من الفيديو.', 'Enter measured panel tilt; video does not establish it precisely.'],
    missing_measured_panel_azimuth: ['أدخل اتجاه الألواح من قراءة بوصلة.', 'Enter the panel direction from a compass reading.'],
    approximate_position_without_atmospheric_refraction: ['موضع الشمس حساب تقريبي من الموقع والوقت.', 'Sun position is an approximation from location and time.'],
    reduced_solar_position_accuracy_at_high_latitude: ['دقة حساب الشمس أقل عند خطوط العرض العالية.', 'Sun position accuracy is lower at high latitudes.'],
    cell_temperature_model_requires_matching_capture_time_and_nominal_wind_mounting: ['حرارة الخلايا تقدير نموذجي يفترض توافق وقت الطقس والتصوير وظروف تركيب ورياح اسمية.', 'Cell temperature is modeled and assumes matching weather and capture time, with nominal mounting and wind conditions.'],
    rgb_and_sun_direction_do_not_measure_panel_temperature: ['صورة عادية واتجاه الشمس لا يقيسان حرارة اللوح. يلزم مستشعر حرارة أو بيانات حرارية مناسبة.', 'An ordinary image and sun direction do not measure panel temperature. A temperature sensor or suitable thermal data is needed.'],
    missing_confirmed_omr_energy_tariff: ['أدخل تعرفة طاقة مؤكدة بالريال العُماني لإظهار قيمة الخسارة.', 'Enter a confirmed OMR energy tariff to show the value of the deficit.'],
    missing_timezone_using_utc_until_weather_resolves_local_timezone: ['المنطقة الزمنية غير محددة؛ قد تُستخدم UTC حتى يتوفر طقس الموقع.', 'The time zone is not set; UTC may be used until location weather is available.'],
    invalid_selected_month: ['حدّد شهراً صحيحاً.', 'Select a valid month.'],
    selected_month_has_no_completed_days: ['لا توجد أيام مكتملة في الشهر المحدد حتى الآن.', 'The selected month has no completed days yet.'],
    invoice_month_differs_from_selected_month: ['شهر الفاتورة مختلف عن شهر التحليل.', 'The bill month differs from the assessment month.'],
    bill_grid_consumption_is_not_solar_production: ['استهلاك شبكة الكهرباء في الفاتورة ليس إنتاج الألواح.', 'Grid consumption on the bill is not solar generation.'],
    visible_surface_coverage_is_not_energy_loss: ['نسبة تغطية الغبار والظل لا تساوي نسبة فقد الطاقة.', 'Dust and shade coverage is not the percentage of energy loss.'],
    monthly_model_requires_location: ['أضف موقع النظام لتقدير إنتاج الشهر من الطقس.', 'Add the system location to model monthly generation from weather.'],
    monthly_model_requires_measured_tilt_and_azimuth: ['أدخل الميل والاتجاه المقاسين لتقدير الإنتاج.', 'Enter measured tilt and facing direction to model generation.'],
    monthly_model_requires_installed_power: ['أدخل القدرة الإجمالية للنظام لتقدير الإنتاج.', 'Enter total system capacity to model generation.'],
    weather_model_is_not_metered_site_generation: ['الإنتاج المتوقع مستمد من نموذج الطقس، وليس قراءة عدّاد الموقع.', 'Expected generation comes from a weather model, not a site meter reading.'],
    incomplete_monthly_weather_no_full_period_estimate: ['بيانات الطقس غير مكتملة؛ لم يُحسب تقدير كامل للفترة.', 'Weather data is incomplete; no complete-period estimate was calculated.'],
    monthly_weather_unavailable: ['طقس الشهر غير متاح الآن؛ يمكنك إدخال الإنتاج المتوقع يدوياً.', 'Monthly weather is unavailable; you can enter expected generation manually.'],
    current_month_includes_completed_days_only_align_inverter_reading_to_end_of_yesterday: ['يشمل الشهر الحالي الأيام المكتملة حتى نهاية أمس فقط؛ أدخل قراءة العاكس للفترة نفسها.', 'The current month includes completed days through yesterday only; enter the inverter reading for that period.'],
    actual_inverter_generation_required_for_monthly_loss: ['أدخل الإنتاج الفعلي من عدّاد الألواح أو العاكس لحساب فرق الإنتاج.', 'Enter actual PV meter or inverter generation to calculate the generation deficit.'],
    generation_deficit_cannot_be_attributed_to_dust_shade_heat_without_additional_measurements: ['فرق الإنتاج لا يحدد وحده كم خسرت بسبب الغبار أو الظل أو الحرارة؛ يلزم قياس إضافي.', 'The generation deficit alone cannot separate dust, shade or heat losses; further measurements are needed.'],
    actual_generation_exceeds_reference_no_positive_deficit: ['الإنتاج الفعلي يتجاوز المرجع؛ لا يوجد فرق إنتاج موجب محسوب.', 'Actual generation exceeds the reference; no positive deficit is calculated.'],
    expected_and_actual_pv_generation_refer_to_same_selected_period: ['الإنتاج المتوقع والفعلي المدخلان يفترض أنهما يغطيان الفترة نفسها.', 'Entered expected and actual PV generation are assumed to cover the same period.'],
    expected_generation_equals_installed_kw_times_plane_of_array_kwh_per_m2_times_performance_ratio: ['الإنتاج النموذجي = قدرة النظام × الإشعاع على مستوى الألواح × معامل الأداء.', 'Modeled generation = system capacity × panel-plane irradiation × performance ratio.'],
    performance_ratio_is_aggregate_and_includes_temperature_inverter_and_other_losses: ['معامل الأداء يشمل أثر الحرارة والعاكس وخسائر أخرى؛ لا تُضاف مرة ثانية.', 'The performance ratio includes temperature, inverter and other losses; they are not added again.'],
    open_meteo_isotropic_sky_and_ground_albedo_0_2: ['يعتمد نموذج الإشعاع على Open-Meteo وافتراض انعكاس أرضي 0.2.', 'The irradiation model uses Open-Meteo and an assumed ground albedo of 0.2.'],
    default_performance_ratio_0_8_not_a_site_calibration: ['معامل الأداء المفترض 0.8، ولم تتم معايرته لنظامك.', 'The assumed performance ratio is 0.8 and is not calibrated for your system.'],
    energy_value_uses_constant_confirmed_omr_tariff_not_bill_total_or_tax: ['القيمة المحسوبة تستخدم تعرفة الطاقة المؤكدة فقط؛ لا تشمل الرسوم الثابتة أو الضرائب.', 'The calculated value uses the confirmed energy tariff only; fixed fees and taxes are excluded.'],
  };
  return notes[key] ? ui(...notes[key]) : typeof key === 'string' ? key : '';
}
function renderAnalysisDetails(snapshot = state) {
  const ai = snapshot.ai; const context = snapshot.solarContext; const monthly = snapshot.monthlyLoss;
  const visual = el('visual-assessment-content');
  const panelButton = el('analyze-panels'); panelButton.disabled = analysisBusy || claudeEnabled !== true || !currentAccount?.id || !mediaFor('panels').length;
  if (ai && snapshot.aiLanguage === state.settings.language) {
    const readings = [
      assessmentMetric(ui('تغطية الغبار المرئية', 'Visible dust coverage'), assessmentValue(ai.dustCoveragePercent, '%'), `${ui('الثقة', 'Confidence')}: ${confidenceText(ai.dustConfidence)}`),
      assessmentMetric(ui('تغطية الظل المرئية', 'Visible shade coverage'), assessmentValue(ai.shadeCoveragePercent, '%'), `${ui('الثقة', 'Confidence')}: ${confidenceText(ai.shadeConfidence)}`),
    ].join('');
    const observations = [ai.summary, ai.dustEvidence, ai.shadeEvidence, ai.tiltObservation, ai.azimuthObservation].filter((value) => typeof value === 'string' && value);
    const missing = (ai.missingMeasurements || []).filter((value) => typeof value === 'string');
    const frames = (ai.frameFindings || []).filter((value) => value && typeof value.observation === 'string').sort((a, b) => Number(a.frameIndex || 0) - Number(b.frameIndex || 0));
    visual.innerHTML = `<p class="assessment-provider">${escapeHtml(snapshot.aiModel || 'Claude')}</p>${ai.panelDetected === false ? `<p>${ui('لم يتعرف Claude على ألواح واضحة في المرفق.', 'Claude did not identify clear panels in the attachment.')}</p>` : ''}<div class="assessment-metrics">${readings}</div><ul class="assessment-notes">${observations.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul><p class="helper-text">${ui('هذه تغطية مرئية تقديرية، وليست قياساً لخسارة الطاقة أو حرارة سطح اللوح.', 'This is estimated visible coverage, not a measurement of energy loss or panel surface temperature.')}</p>${missing.length ? `<details><summary>${ui('القياسات الناقصة', 'Missing measurements')}</summary><ul class="assessment-notes">${missing.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul></details>` : ''}${frames.length ? `<details><summary>${ui('ملاحظات اللقطات بالترتيب', 'Frame observations in sequence')}</summary><ol class="frame-findings">${frames.map((frame) => `<li>${frame.timestampSeconds !== null && frame.timestampSeconds !== undefined ? `<b>${assessmentValue(frame.timestampSeconds, ui(' ثانية', ' s'))}</b> · ` : ''}${escapeHtml(frame.observation)}</li>`).join('')}</ol></details>` : ''}`;
  } else visual.innerHTML = `${claudeAvailabilityMarkup()}<p class="helper-text">${ai ? ui('النتيجة المحفوظة بلغة أخرى؛ أعد التحليل لقراءتها باللغة الحالية.', 'The saved assessment is in another language; run analysis again for the current language.') : ui('أرفق صوراً أو فيديو للألواح ثم اضغط «تحليل الألواح باستخدام Claude». تُحلل لقطات موزعة من الفيديو، وليس الصوت أو كل الإطارات.', 'Attach panel photos or a video, then choose “Panel assessment with Claude”. Frames sampled across the clip are assessed, not audio or every frame.')}</p>`;
  const solar = el('solar-assessment-content');
  const solarMetrics = context ? [
    assessmentMetric(ui('اتجاه الشمس المحسوب', 'Calculated sun azimuth'), assessmentValue(context.sun?.azimuthDegrees, '°')),
    assessmentMetric(ui('ارتفاع الشمس عن الأفق', 'Sun elevation above horizon'), assessmentValue(context.sun?.elevationDegrees, '°'), context.sun?.daylight === false ? ui('الشمس تحت الأفق', 'Sun is below the horizon') : ''),
    assessmentMetric(ui('زاوية سقوط الشمس على اللوح', 'Sun incidence angle on panel'), assessmentValue(context.panel?.incidenceAngleDegrees, '°'), ui('من الموقع والوقت والميل والاتجاه المدخل', 'From entered location, time, tilt and direction')),
    assessmentMetric(ui('حرارة الخلايا المقدرة', 'Estimated cell temperature'), assessmentValue(context.temperature?.estimatedCellTemperatureC, ui('°م', '°C')), context.temperature?.source === 'NOCT_model' ? ui('تقدير نموذجي، وليس قياساً حرارياً', 'Modeled estimate, not a thermal measurement') : ui('لا يوجد قياس حراري للسطح', 'No thermal surface measurement')),
  ].join('') : '';
  solar.innerHTML = `<h3>${ui('هندسة الشمس وحرارة اللوح', 'Sun geometry and panel temperature')}</h3>${context ? `<div class="assessment-metrics">${solarMetrics}</div><ul class="assessment-notes">${(context.limitations || []).map((key) => `<li>${escapeHtml(assessmentNote(key))}</li>`).join('')}</ul>` : `<p class="helper-text">${ui('أدخل الموقع ووقت التصوير وميل الألواح واتجاهها لحساب علاقتها بالشمس. الصورة العادية لا تقيس حرارة اللوح.', 'Enter location, capture time, measured panel tilt and facing direction to calculate sun geometry. An ordinary image does not measure panel temperature.')}</p>`}`;
  const host = el('monthly-assessment-content'); const monthInput = el('dashboard-bill-month');
  if (document.activeElement !== monthInput) monthInput.value = monthly?.month || state.form.billMonth || '';
  if (!monthly) {
    host.innerHTML = `<p class="helper-text">${ui('حدّد الشهر ثم حدّث تحليله. أضف إنتاج الألواح الفعلي من العاكس وتعرفة الكهرباء في بيانات النظام لحساب قيمة فرق الإنتاج.', 'Select a month and update its assessment. Add actual inverter generation and the electricity tariff in system details to calculate the value of the deficit.')}</p>`;
    return;
  }
  const period = monthly.period; const entered = monthly.method === 'provided_expected_generation';
  const heading = monthly.status === 'unavailable' ? ui('لا تكفي البيانات لحساب خسارة الشهر', 'Insufficient data for monthly losses') : monthly.lostKwh === null || monthly.lostKwh === undefined ? ui('الإنتاج المتوقع فقط؛ الخسارة غير محسوبة', 'Expected generation only; deficit unavailable') : entered ? ui('فرق الإنتاج مقابل الخط الأساسي الذي أدخلته', 'Generation deficit against your entered baseline') : ui('فرق الإنتاج مقابل تقدير طقس الشهر', 'Generation deficit against modeled monthly weather');
  const items = [assessmentMetric(ui('الإنتاج المتوقع', 'Expected generation'), assessmentValue(monthly.expectedKwh, ' kWh', 2)), assessmentMetric(ui('الإنتاج الفعلي المدخل', 'Entered actual generation'), assessmentValue(monthly.actualKwh, ' kWh', 2)), assessmentMetric(ui('فرق الإنتاج', 'Generation deficit'), assessmentValue(monthly.lostKwh, ' kWh', 2)), assessmentMetric(ui('قيمة الطاقة المفقودة', 'Value of generation deficit'), monthly.lossMoney !== null && monthly.lossMoney !== undefined ? `${assessmentValue(monthly.lossMoney, '', 3)} ${ui('ر.ع', 'OMR')}` : '—')].join('');
  const notes = [...new Set([...(monthly.warnings || []), ...(monthly.assumptions || [])])];
  host.innerHTML = `<h3>${heading}</h3>${period ? `<p class="assessment-period">${escapeHtml(period.startDate || '—')} — ${escapeHtml(period.endDate || '—')} · ${escapeHtml(period.daysIncluded ?? 0)} ${ui('يوماً', 'days')}${period.complete ? '' : ` · ${ui('حتى نهاية أمس', 'through yesterday')}`}</p>` : ''}<div class="assessment-metrics">${items}</div><p class="helper-text">${ui('الفاتورة تُستخدم لقراءة الاستهلاك والتعرفة؛ لا تثبت وحدها خسارة الألواح. لا نضاعف إجمالي الفاتورة في نسبة الغبار أو الظل.', 'The bill provides consumption and tariff details; it cannot establish panel losses by itself. Bill total is not multiplied by dust or shade coverage.')}</p>${notes.length ? `<details open><summary>${ui('مصادر الحساب وحدوده', 'Calculation sources and limitations')}</summary><ul class="assessment-notes">${notes.map((key) => `<li>${escapeHtml(assessmentNote(key))}</li>`).join('')}</ul></details>` : ''}`;
}
function hasLossEstimate(result) {
  return !!result && !(result.heatEstimateUnavailable === true && !(Number(result.soilingPercent) > 0));
}
// نتائج محفوظة قبل إضافة تفصيل الأسباب: نكمل حقول الغبار والظل والإجمالي من المدخلات
// الحالية مرة واحدة، ثم تصبح الواجهة والتقرير متسقين.
function ensureLossBreakdown(result) {
  if (!result || result.dustPercent !== undefined) return result;
  const fresh = calculateLoss();
  result.dustPercent = fresh.dustPercent ?? null;
  result.shadePercent = fresh.shadePercent ?? 0;
  const heat = Number(result.heatPercent) || 0;
  result.totalPercent = Math.min(100, Math.round(heat + (result.dustPercent || 0) + (result.shadePercent || 0)));
  result.percent = result.totalPercent;
  result.lostKwh = (Number(result.possibleKwh) || 0) * (result.totalPercent / 100);
  result.lostMoney = result.lostKwh * (Number(result.tariffOmrPerKwh) || 0);
  result.soilingPercent = result.dustPercent;
  return result;
}
function renderLossBreakdown(result) {
  const box = el('loss-breakdown');
  if (!box) return;
  ensureLossBreakdown(result);
  if (!result) { box.hidden = true; return; }
  const heat = result.heatPercent === null || result.heatPercent === undefined ? null : Number(result.heatPercent);
  const dust = result.dustPercent === null || result.dustPercent === undefined
    ? (result.soilingPercent === null || result.soilingPercent === undefined ? null : Number(result.soilingPercent))
    : Number(result.dustPercent);
  const shade = Number.isFinite(Number(result.shadePercent)) ? Number(result.shadePercent) : 0;
  const total = Number.isFinite(Number(result.totalPercent)) ? Number(result.totalPercent) : Math.min(100, Math.round((heat || 0) + (dust || 0) + shade));
  const hasAny = heat !== null || dust !== null || shade > 0;
  if (!hasAny) { box.hidden = true; return; }
  box.hidden = false;
  const row = (variant, label, value) => `<div class="loss-row ${variant}"><span><i></i>${escapeHtml(label)}</span><b>${value === null ? '—' : `${Math.round(value)}%`}</b></div>`;
  el('loss-components').innerHTML = [
    row('heat', ui('الحرارة', 'Heat'), heat),
    row('dust', ui('الغبار', 'Dust'), dust),
    row('shade', ui('الظل', 'Shade'), shade),
    `<div class="loss-row loss-total"><span>${ui('إجمالي التقدير', 'Estimated total')}</span><b>${total}%</b></div>`,
  ].join('');
  const instant = el('loss-instant');
  if (instant) instant.innerHTML = `<h4>${ui('الفقد اللحظي', 'Instantaneous loss')}</h4><b>${heat === null ? '—' : `${Math.round(heat)}%`}</b><p>${ui('بسبب حرارة الألواح وقت الفحص، من حرارة الجو والنموذج الحراري.', 'From panel heat at inspection time, based on air temperature and the heat model.')}</p>`;
  const monthly = result.monthlyLoss || state.monthlyLoss;
  const monthlyNode = el('loss-monthly');
  if (monthlyNode) {
    if (monthly && monthly.lostKwh !== null && monthly.lostKwh !== undefined) {
      const value = `${Number(monthly.lostKwh).toFixed(2)}<span class="unit"> kWh</span>`;
      const value2 = monthly.lossMoney !== null && monthly.lossMoney !== undefined ? ` · ${money(monthly.lossMoney)}` : '';
      monthlyNode.innerHTML = `<h4>${ui('الخسارة الشهرية', 'Monthly loss')}</h4><b>${value}</b><p>${ui('الفرق بين الإنتاج المتوقع والإنتاج الفعلي', 'Expected minus actual generation')}${value2}.</p>`;
    } else {
      monthlyNode.innerHTML = `<h4>${ui('الخسارة الشهرية', 'Monthly loss')}</h4><b>—</b><p>${ui('أضف الإنتاج المتوقع والفعلي لحساب خسارة الشهر.', 'Add expected and actual generation to calculate the monthly loss.')}</p>`;
    }
  }
  const note = el('loss-breakdown-note');
  if (note) note.textContent = ui('النسب أعلاه تقديرية: الحرارة من النموذج الحراري، والغبار والظل من التغطية المرئية أو المؤشر الجوي، وليست قياساً كهربائياً مباشراً.', 'The percentages above are estimates: heat from the heat model, dust and shade from visible coverage or the air index, not direct electrical measurements.');
}
function renderDashboard(note = '') {
  const f = state.form; const result = state.result || (f.power ? calculateLoss() : null); const current = state.weather?.current;
  ensureLossBreakdown(result);
  renderLossBreakdown(result);
  renderAnalysisDetails();
  renderMaintenance();
  renderPanelVisual();
  el('user-name').textContent = f.name ? escapeHtml(f.name) : 'يا صديق الشمس';
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  el('today-date').textContent = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  el('footer-year').textContent = new Date().getFullYear(); syncHeader();
  if (current) {
    el('metric-temp').textContent = `${Math.round(current.temperature_2m)}°`;
    el('metric-humidity').textContent = `${Math.round(current.relative_humidity_2m)}%`;
    el('gauge-temp').textContent = `${Math.round(current.temperature_2m)}°م`;
    el('weather-summary').textContent = `${weatherText(current.weather_code)} · ${Math.round(current.temperature_2m)}°م`;
    el('weather-icon').textContent = current.is_day ? '☀' : '☾';
  } else {
    el('metric-temp').textContent = f.ambientTemp ? `${f.ambientTemp}°` : '—°'; el('metric-humidity').textContent = f.humidity ? `${f.humidity}%` : '—%';
    el('gauge-temp').textContent = f.ambientTemp ? `${Math.round(f.ambientTemp)}°م` : '—°'; el('weather-summary').textContent = 'الطقس غير متاح';
  }
  const airDust = f.airDustPercent !== null && f.airDustPercent !== '' && f.airDustPercent !== undefined ? Number(f.airDustPercent) : NaN;
  const dustReading = airborneDustReading(state.weather);
  el('metric-dust').textContent = Number.isFinite(airDust) ? `${Math.round(airDust)}%` : '—%';
  el('dust-caption').textContent = f.airDustManual ? ui('مؤشر جوي معدّل يدوياً', 'Manually adjusted air index') : dustReading ? `${dustReading.source === 'pm10' ? 'PM10' : ui('غبار جوي', 'Airborne dust')} ${dustReading.concentration.toFixed(1)} µg/m³ · ${ui('مؤشر نسبي', 'Relative index')}` : ui('الغبار في الجو غير متاح', 'Airborne dust unavailable');
  if (hasLossEstimate(result)) {
    el('loss-percent').textContent = `${result.percent}%`;
    const valuePath = el('gauge-value'); const pathLength = 302; valuePath.style.strokeDashoffset = String(pathLength - pathLength * Math.min(100, result.percent) / 100);
    valuePath.style.stroke = result.percent > 30 ? 'var(--orange)' : result.percent > 15 ? '#e9824b' : '#a79370';
    el('metric-loss').textContent = `${result.lostKwh.toFixed(2)} kWh`;
    el('loss-caption').textContent = `${money(result.lostMoney)} تقريباً · ${result.priceBasis}`;
    el('status-title').textContent = result.percent >= 30 ? 'يحتاج إلى انتباه' : result.percent >= 15 ? 'مستوى متوسط' : 'أداء مطمئن';
    el('status-pill').innerHTML = `<i></i> ${result.percent >= 30 ? 'انتباه' : result.percent >= 15 ? 'مراقبة' : 'جيد'}`;
    el('status-pill').className = `status-pill ${result.percent < 15 ? 'good' : ''}`;
    el('status-summary').textContent = state.ai ? ui('فحص بصري باستخدام Claude', 'Visual assessment with Claude') : 'تقدير أولي لأداء النظام';
    const heatShare = result.heatPercent === null || result.heatPercent === undefined ? null : Math.round(result.heatPercent);
    const dustShare = result.dustPercent === null || result.dustPercent === undefined ? null : Math.round(result.dustPercent);
    const shadeShare = Number.isFinite(Number(result.shadePercent)) ? Math.round(Number(result.shadePercent)) : 0;
    const estimateDescription = heatShare === null && dustShare === null
      ? ui('يومياً؛ لا تتوفر نسب مفصلة لهذه القراءة.', 'per day; no detailed percentages are available for this reading.')
      : ui(`يومياً: الحرارة ${heatShare ?? '—'}% · الغبار ${dustShare ?? '—'}% · الظل ${shadeShare}% (إجمالي ${result.totalPercent ?? result.percent}%).`, `per day: heat ${heatShare ?? '—'}% · dust ${dustShare ?? '—'}% · shade ${shadeShare}% (total ${result.totalPercent ?? result.percent}%).`);
    el('status-description').textContent = (note ? `${note} النتيجة الحالية تقديرية وتعتمد على البيانات التي أدخلتها.` : `قد يفقد النظام نحو ${result.lostKwh.toFixed(2)} kWh ${estimateDescription}`)
      + (result.heatEstimateUnavailable ? ui(' لا تتوفر بيانات كافية لتقدير خسارة الطاقة.', ' There is not enough data to estimate energy losses.') : '');
    el('recommendation-title').textContent = dustShare >= 15 ? 'قد يكون تنظيف الألواح مفيداً' : heatShare > 10 ? 'راقب أثر الحرارة على الألواح' : 'حافظ على متابعة دورية';
    const aiRecommendation = state.aiLanguage === state.settings.language ? state.ai?.recommendations?.[0] : '';
    el('recommendation-text').textContent = aiRecommendation || (dustShare >= 15 ? 'يظهر تقدير الغبار مرتفعاً؛ تحقق بصرياً من الألواح ونظّفها عند الحاجة وبطريقة آمنة.' : heatShare > 10 ? 'حرارة الألواح قد تخفض الإنتاج وقت الذروة؛ راقب التهوية وتجنّب العمل على السطح وقت الظهيرة.' : 'تابع التغيرات في الطقس وافحص سطح الألواح بعد العواصف أو فترات الغبار.');
  } else {
    el('loss-percent').textContent = '—%'; el('metric-loss').textContent = '—'; el('loss-caption').textContent = 'أضف بيانات النظام أولاً';
    el('status-title').textContent = 'بانتظار بيانات نظامك'; el('status-pill').innerHTML = '<i></i> ابدأ التحليل'; el('status-pill').className = 'status-pill';
    el('status-summary').textContent = 'نحتاج بعض التفاصيل أولاً'; el('status-description').textContent = 'أدخل بيانات النظام وأرفق صورة أو مقطعاً للألواح للحصول على قراءة أوضح.';
  }
  const alert = el('weather-alert');
  if (current) {
    const temp = Number(current.temperature_2m); const gust = Number(current.wind_gusts_10m); const rain = Number(state.weather?.daily?.precipitation_probability_max?.[0]);
    let alertMessage = '';
    if (temp >= 43) alertMessage = `حرارة مرتفعة (${Math.round(temp)}°م) في موقعك؛ تجنب لمس الألواح وقت الظهيرة.`;
    else if (gust >= 55) alertMessage = `هبات رياح قوية تصل إلى ${Math.round(gust)} كم/س؛ أجّل الصعود إلى السطح حتى تهدأ.`;
    else if (rain >= 75) alertMessage = `احتمال هطول مرتفع (${rain}%)؛ راقب الألواح بعد انقضاء الطقس.`;
    alert.textContent = alertMessage; alert.hidden = !alertMessage;
  } else alert.hidden = true;
  el('last-updated').textContent = state.updatedAt ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(state.updatedAt)) : '—';
  const systemItems = [['القدرة', f.power ? `${f.power} واط` : '—'], ['الألواح', f.panels ? `${f.panels} لوح` : '—'], ['الشركة', f.company || 'غير محددة'], ['الموقع', f.location || 'غير محدد'], ['الميل', f.tilt ? `${f.tilt}°` : 'غير محدد'], ['آخر صيانة', f.lastMaintenanceAt ? maintenanceDateLabel(parseIsoDate(f.lastMaintenanceAt), locale) : ui('لم تُسجل', 'Not recorded')]];
  el('system-summary').innerHTML = systemItems.map(([label, value]) => `<div class="system-item"><small>${label}</small><b>${escapeHtml(value)}</b></div>`).join('');
  renderWeatherStatus();
  drawChart(result); applyLanguage();
}
function weatherConditionLabel(code, english) {
  const value = Number(code);
  const table = [
    [[0], 'صافٍ', 'Clear'],
    [[1], 'صافٍ غالبًا', 'Mainly clear'],
    [[2], 'غائم جزئيًا', 'Partly cloudy'],
    [[3], 'غائم', 'Overcast'],
    [[45, 48], 'ضباب', 'Fog'],
    [[51, 53, 55, 56, 57], 'رذاذ', 'Drizzle'],
    [[61, 63, 65, 66, 67], 'مطر', 'Rain'],
    [[71, 73, 75, 77], 'ثلج', 'Snow'],
    [[80, 81, 82], 'زخات مطر', 'Rain showers'],
    [[85, 86], 'زخات ثلج', 'Snow showers'],
    [[95, 96, 99], 'عواصف رعدية', 'Thunderstorm'],
  ];
  for (const [codes, arabic, englishWord] of table) if (codes.includes(value)) return english ? englishWord : arabic;
  return english ? 'Variable' : 'متغيّر';
}
function weeklyProductionSeries() {
  const daily = state.weather?.daily || {};
  const codes = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const rain = Array.isArray(daily.precipitation_probability_max) ? daily.precipitation_probability_max : [];
  const highs = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  return Array.from({ length: 7 }, (_, index) => {
    const code = Number(codes[index]);
    const wet = Number(rain[index]);
    const high = Number(highs[index]);
    let penalty;
    if (!Number.isFinite(code)) penalty = 12;
    else if (code === 0) penalty = 0;
    else if (code <= 2) penalty = 8;
    else if (code === 3) penalty = 26;
    else if (code <= 48) penalty = 34;
    else if (code <= 57) penalty = 40;
    else if (code <= 67) penalty = 58;
    else if (code <= 77) penalty = 66;
    else if (code <= 82) penalty = 54;
    else penalty = 72;
    if (Number.isFinite(wet) && wet > 0) penalty += Math.min(24, wet * 0.35);
    if (Number.isFinite(high) && high > 35) penalty += Math.min(16, (high - 35) * 1.6);
    return Math.max(12, Math.min(100, Math.round(100 - penalty)));
  });
}
function weeklyProductionDays(english) {
  const weekdays = english
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dateFormat = new Intl.DateTimeFormat(english ? 'en-OM' : 'ar-OM', { day: 'numeric', month: 'short' });
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
    return { today: index === 0, name: weekdays[date.getDay()], date: dateFormat.format(date) };
  });
}
function drawChart(result) {
  const english = state.settings.language === 'en';
  const days = weeklyProductionDays(english);
  const values = weeklyProductionSeries();
  const chart = el('weekly-chart');
  if (chart) {
    const codes = state.weather?.daily?.weather_code || [];
    chart.innerHTML = values.map((value, index) => {
      const day = days[index];
      const label = day.today ? (english ? 'Today' : 'اليوم') : day.name;
      const condition = weatherConditionLabel(codes[index], english);
      const caption = `${label} · ${day.date} · ${condition} · ${english ? 'expected output' : 'إنتاج متوقع'} ${value}%`;
      return `<div class="chart-day${day.today ? ' is-today' : ''}" title="${escapeHtml(caption)}" aria-label="${escapeHtml(caption)}"><div class="chart-plot"><div class="chart-bar" style="height:${value}%"><span class="chart-value">${value}%</span></div></div><span class="chart-label">${escapeHtml(label)}</span></div>`;
    }).join('');
  }
  const caption = el('chart-caption');
  if (caption) caption.textContent = hasLossEstimate(result) ? `فقد اليوم ${result.percent}% · إشعاع الشمس يتغير حسب الطقس` : 'تقديرات أولية تتحدث مع الطقس';
}
function renderHistory() {
  const host = el('history-list');
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  if (!state.history.length) { host.innerHTML = '<div class="history-empty"><div class="empty-icon">☼</div><h3>لا توجد فحوصات محفوظة بعد</h3><p>بعد إعداد نظامك سيظهر هنا سجل الفحوصات.</p><button class="button button-primary" id="history-empty-new">إعداد النظام</button></div>'; el('history-empty-new')?.addEventListener('click', () => openWizard(0)); applyLanguage(); return; }
  host.innerHTML = state.history.map((item) => `<div class="history-row"><div class="history-date"><b>${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(item.createdAt))}</b><small>${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))} · ${escapeHtml(item.location)}</small></div><div class="history-cell">الفقد التقديري <b>${hasLossEstimate(item) ? `${item.percent}%` : '—'}</b></div><div class="history-cell">${hasLossEstimate(item) ? `${Number(item.lostKwh).toFixed(2)} kWh` : '—'}</div><div><span class="history-badge">${item.ai ? 'فحص بصري' : 'تقدير أولي'}</span></div><button data-history-open="${item.id}">عرض</button></div>`).join('');
  host.querySelectorAll('[data-history-open]').forEach((button) => button.addEventListener('click', () => {
    const item = state.history.find((row) => row.id === button.dataset.historyOpen); if (!item) return;
    showPage('dashboard'); el('loss-percent').textContent = hasLossEstimate(item) ? `${item.percent}%` : '—%'; el('metric-loss').textContent = hasLossEstimate(item) ? `${Number(item.lostKwh).toFixed(2)} kWh` : '—';
    el('status-title').textContent = 'فحص محفوظ'; el('status-description').textContent = hasLossEstimate(item) ? `فقد الطاقة التقديري حينها: ${money(item.lostMoney)}.` : ui('لم تتوفر بيانات كافية لتقدير خسارة الطاقة في هذا الفحص.', 'This inspection had insufficient data to estimate energy losses.');
    renderLossBreakdown(item);
    renderAnalysisDetails({ ai: item.visualAssessment || null, aiLanguage: item.aiLanguage, aiModel: item.aiModel, solarContext: item.solarContext, monthlyLoss: item.monthlyLoss });
    applyLanguage();
  }));
  applyLanguage();
}
function renderSettings() {
  el('setting-notifications').checked = devicePushEnabled;
  el('setting-notifications').disabled = devicePushBusy || !currentAccount;
  el('setting-dark').checked = !!state.settings.dark; el('setting-sound').checked = !!state.settings.sound; el('setting-language').value = state.settings.language || 'ar';
  const cooldown = Number(appSettings?.dust_alert_cooldown_days);
  const deviceStatus = devicePushStateKnown ? (devicePushEnabled ? 'مفعّلة على هذا الجهاز' : 'غير مفعّلة على هذا الجهاز') : 'تعذر التحقق من تنبيهات هذا الجهاز.';
  el('notification-hint').textContent = `تنبيهات هذا الجهاز فقط · ${deviceStatus}${Number.isFinite(cooldown) ? ` · كل ${cooldown} يوماً كحد أقصى` : ''}`;
  applyLanguage();
}
// ---------- البلاغات والشكاوى ----------
const COMPLAINT_CATEGORIES = {
  performance: ['ضعف في الإنتاج', 'Low generation'],
  dust: ['غبار على الألواح', 'Dust on panels'],
  heat: ['حرارة مرتفعة', 'High heat'],
  shade: ['تظليل على الألواح', 'Panel shading'],
  electrical: ['مشكلة كهربائية', 'Electrical problem'],
  service: ['طلب صيانة', 'Maintenance request'],
  other: ['أخرى', 'Other'],
};
function complaintCategoryLabel(value) {
  const entry = COMPLAINT_CATEGORIES[value] || COMPLAINT_CATEGORIES.other;
  return ui(entry[0], entry[1]);
}
function renderReports() {
  const note = el('complaint-email-note');
  if (note) {
    note.textContent = complaintConfig.delivery
      ? ui(`سيُرسل البلاغ مباشرة إلى فريق الصيانة على ${complaintConfig.email}.`, `Your complaint is sent directly to the maintenance team at ${complaintConfig.email}.`)
      : ui(`سيُجهَّز البلاغ ويفتح بريدك لإرساله إلى ${complaintConfig.email}، أو يمكنك نسخه ومشاركته.`, `Your complaint is prepared and your mail app opens to send it to ${complaintConfig.email}; you can also copy and share it.`);
  }
  const name = el('complaint-name');
  if (name && !name.value) name.value = state.form.name || state.user?.username || '';
  renderComplaintHistory();
  applyLanguage();
}
function renderComplaintHistory() {
  const host = el('complaint-history');
  if (!host) return;
  const list = Array.isArray(state.complaints) ? state.complaints : [];
  if (!list.length) {
    host.innerHTML = `<div class="empty-state"><div class="empty-icon">✎</div><h3>${ui('لا توجد بلاغات بعد', 'No complaints yet')}</h3><p>${ui('عند إرسال بلاغ سيظهر هنا مع تاريخه وحالته.', 'When you send a complaint it appears here with its date and status.')}</p></div>`;
    return;
  }
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  host.innerHTML = `<div class="complaint-list">${list.map((item) => {
    const delivered = item.delivered ? ui('أُرسل إلى فريق الصيانة', 'Sent to the maintenance team') : ui('بانتظار الإرسال من بريدك', 'Pending sending from your mail');
    const when = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt));
    return `<div class="complaint-row"><div class="complaint-row-top"><b>${escapeHtml(complaintCategoryLabel(item.category))}${item.subject ? ` · ${escapeHtml(item.subject)}` : ''}</b><span class="history-badge">${escapeHtml(delivered)}</span></div><div class="complaint-row-meta">${when} · ${ui('رقم', 'No.')} ${escapeHtml(String(item.id || '').slice(0, 8))}</div><p>${escapeHtml(item.message)}</p></div>`;
  }).join('')}</div>`;
}
function openMailto(url) {
  try {
    const link = document.createElement('a');
    link.href = url; link.rel = 'noopener'; link.style.display = 'none';
    document.body.appendChild(link); link.click(); link.remove();
    return true;
  } catch { return false; }
}
function complaintMailtoFallback(payload) {
  const lines = [
    `${ui('نوع البلاغ', 'Complaint type')}: ${complaintCategoryLabel(payload.category)}`,
    payload.name ? `${ui('الاسم', 'Name')}: ${payload.name}` : '',
    `${ui('وسيلة التواصل', 'Contact')}: ${payload.contact}`,
    payload.location ? `${ui('الموقع', 'Location')}: ${payload.location}` : '',
    '', payload.message,
  ].filter((line) => line !== '');
  return `mailto:${encodeURIComponent(complaintConfig.email)}?subject=${encodeURIComponent(payload.subject || ui('بلاغ سياج', 'Siyaj complaint'))}&body=${encodeURIComponent(lines.join('\n'))}`;
}
async function submitComplaint() {
  const alertBox = el('complaint-alert');
  const success = el('complaint-success');
  const button = el('complaint-submit');
  if (alertBox) { alertBox.hidden = true; alertBox.textContent = ''; }
  if (success) { success.hidden = true; success.innerHTML = ''; }
  const payload = {
    name: (el('complaint-name')?.value || '').trim(),
    contact: (el('complaint-contact')?.value || '').trim(),
    category: el('complaint-category')?.value || 'other',
    subject: (el('complaint-subject')?.value || '').trim(),
    message: (el('complaint-message')?.value || '').trim(),
    location: state.form.location || '',
    account: currentAccount?.username || '',
  };
  const fail = (message) => { if (alertBox) { alertBox.textContent = message; alertBox.hidden = false; } };
  if (!payload.contact) return fail(ui('أدخل بريدك الإلكتروني أو رقم هاتفك للتواصل.', 'Enter your email or phone number for contact.'));
  if (payload.message.length < 10) return fail(ui('اكتب وصفاً للبلاغ (10 أحرف على الأقل).', 'Describe the complaint (at least 10 characters).'));
  if (button) { button.disabled = true; button.dataset.original = button.innerHTML; button.innerHTML = `<span class="loading-inline"><i class="spinner"></i> ${ui('جارٍ الإرسال…', 'Sending…')}</span>`; }
  let result = null;
  try {
    const response = await authenticatedFetch('/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || ui('تعذر إرسال البلاغ؛ حاول مرة أخرى.', 'Could not send the complaint; try again.'));
    result = data;
  } catch (error) {
    fail(error.message || ui('تعذر إرسال البلاغ؛ حاول مرة أخرى.', 'Could not send the complaint; try again.'));
    if (button) { button.disabled = false; if (button.dataset.original) button.innerHTML = button.dataset.original; }
    return;
  }
  const record = { id: result.id || crypto.randomUUID(), category: payload.category, subject: payload.subject, message: payload.message, contact: payload.contact, createdAt: new Date().toISOString(), delivered: !!result.delivered };
  state.complaints = [record, ...(Array.isArray(state.complaints) ? state.complaints : [])].slice(0, 30);
  persist(); renderComplaintHistory();
  if (success) {
    if (result.delivered) {
      success.innerHTML = ui(`✅ تم إرسال بلاغك إلى فريق الصيانة على ${complaintConfig.email}.`, `✅ Your complaint was sent to the maintenance team at ${complaintConfig.email}.`);
    } else {
      const mailto = result.mailto || complaintMailtoFallback(payload);
      success.innerHTML = ui('تم تجهيز بلاغك. إن لم يفتح بريدك تلقائياً فاضغط الرابط التالي، أو استخدم «مشاركة / نسخ البلاغ».', 'Your complaint is ready. If your mail app did not open automatically, use the link below, or “Share / copy complaint”.');
      success.innerHTML += ` <a href="${mailto}">${ui('فتح البريد لإرساله', 'Open mail to send')}</a>`;
      openMailto(mailto);
    }
    success.hidden = false;
  }
  if (button) { button.disabled = false; if (button.dataset.original) button.innerHTML = button.dataset.original; }
  showToast(result.delivered ? ui('تم إرسال البلاغ.', 'Complaint sent.') : ui('تم تجهيز البلاغ للإرسال.', 'Complaint prepared for sending.'));
}
async function shareComplaint() {
  const payload = {
    category: el('complaint-category')?.value || 'other',
    subject: (el('complaint-subject')?.value || '').trim(),
    message: (el('complaint-message')?.value || '').trim(),
    name: (el('complaint-name')?.value || '').trim(),
    contact: (el('complaint-contact')?.value || '').trim(),
  };
  if (payload.message.length < 10) { const alertBox = el('complaint-alert'); if (alertBox) { alertBox.textContent = ui('اكتب وصفاً للبلاغ قبل مشاركته.', 'Describe the complaint before sharing it.'); alertBox.hidden = false; } return; }
  const text = `${ui('بلاغ سياج', 'Siyaj complaint')} — ${complaintCategoryLabel(payload.category)}\n${payload.subject ? `${payload.subject}\n` : ''}${payload.message}\n${ui('التواصل', 'Contact')}: ${payload.contact || '—'}\n${ui('إلى', 'To')}: ${complaintConfig.email}`;
  if (navigator.share) { try { await navigator.share({ title: ui('بلاغ سياج', 'Siyaj complaint'), text }); return; } catch { /* fall through to copy */ } }
  try { await navigator.clipboard.writeText(text); showToast(ui('تم نسخ نص البلاغ.', 'Complaint text copied.')); }
  catch { showToast(ui('تعذر النسخ؛ حدّد النص يدوياً.', 'Copy failed; select the text manually.')); }
}

// ---------- تقرير النظام ----------
function reportSystemRows(f) {
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  const maintenance = maintenanceStatus();
  return [
    [ui('اسم صاحب النظام', 'System owner'), f.name || '—'],
    [ui('الموقع', 'Location'), f.location || ui('غير محدد', 'Not set')],
    [ui('عدد الألواح', 'Panel count'), f.panels ? `${f.panels}` : '—'],
    [ui('القدرة الإجمالية', 'Total capacity'), f.power ? `${f.power} ${ui('واط', 'W')}` : '—'],
    [ui('نوع الألواح', 'Panel type'), ({ monocrystalline: ui('أحادية البلورة', 'Monocrystalline'), polycrystalline: ui('متعددة البلورات', 'Polycrystalline'), 'thin-film': ui('أغشية رقيقة', 'Thin film'), unknown: ui('غير معروف', 'Unknown') })[f.panelType] || '—'],
    [ui('شركة الألواح', 'Panel company'), f.company || '—'],
    [ui('المصنع', 'Manufacturer'), f.brand || '—'],
    [ui('ميل الألواح', 'Panel tilt'), f.tilt !== '' && f.tilt !== null ? `${f.tilt}°` : '—'],
    [ui('اتجاه الألواح', 'Panel azimuth'), f.panelAzimuth !== '' && f.panelAzimuth !== null ? `${f.panelAzimuth}°` : '—'],
    [ui('آخر صيانة', 'Last maintenance'), maintenance ? maintenanceDateLabel(maintenance.last, locale) : ui('لم تُسجل', 'Not recorded')],
    [ui('موعد الصيانة القادمة', 'Next maintenance'), maintenance ? `${maintenanceDateLabel(maintenance.due, locale)} · ${maintenanceRemainingLabel(maintenance)}` : ui('أضف تاريخ آخر صيانة', 'Add the last maintenance date')],
    [ui('قيمة الفاتورة', 'Bill amount'), f.invoice ? `${f.invoice} ${ui('ر.ع', 'OMR')}` : '—'],
    [ui('شهر الفاتورة', 'Bill month'), f.billMonth || '—'],
  ];
}
function renderSystemReport() {
  const host = el('system-report-body');
  if (!host) return;
  const f = state.form;
  const result = state.result || (f.power ? calculateLoss() : null);
  ensureLossBreakdown(result);
  const current = state.weather?.current;
  const monthly = state.monthlyLoss;
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  const generated = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date());
  const heat = result?.heatPercent === null || result?.heatPercent === undefined ? null : Math.round(Number(result.heatPercent));
  const dust = result?.dustPercent === null || result?.dustPercent === undefined ? '—' : `${Math.round(Number(result.dustPercent))}%`;
  const shade = Number.isFinite(Number(result?.shadePercent)) ? `${Math.round(Number(result.shadePercent))}%` : '0%';
  const total = Number.isFinite(Number(result?.totalPercent)) ? Number(result.totalPercent) : '—';
  const lossDay = result && Number.isFinite(Number(result.lostKwh)) ? `${result.lostKwh.toFixed(2)} kWh` : '—';
  const lossMoney = result && Number.isFinite(Number(result.lostMoney)) ? money(result.lostMoney) : '—';
  const owner = state.user?.username || f.name || ui('مستخدم سياج', 'Siyaj user');
  const monthlyLine = monthly && monthly.lostKwh !== null && monthly.lostKwh !== undefined
    ? `${Number(monthly.lostKwh).toFixed(2)} kWh${monthly.lossMoney !== null && monthly.lossMoney !== undefined ? ` · ${money(monthly.lossMoney)}` : ''}`
    : ui('غير محسوبة (أضف الإنتاج المتوقع والفعلي)', 'Not calculated (add expected and actual generation)');
  const weatherRows = current ? [
    [ui('الحرارة', 'Temperature'), `${Math.round(current.temperature_2m)}°${ui('م', 'C')}`],
    [ui('الرطوبة', 'Humidity'), `${Math.round(current.relative_humidity_2m)}%`],
    [ui('الحالة', 'Condition'), weatherText(current.weather_code)],
    [ui('المنطقة الزمنية', 'Time zone'), state.weather?.timezone || '—'],
  ] : [[ui('الطقس', 'Weather'), ui('غير متاح', 'Unavailable')]];
  const advice = result && !result.heatEstimateUnavailable
    ? [
      heat !== null && heat >= 10 ? [ui('الحرارة', 'Heat'), ui('حرارة الألواح المرتفعة تخفض الإنتاج؛ راقب التهوية ووقت التشغيل وتجنب العمل وقت الذروة.', 'High panel heat lowers output; check ventilation and avoid working at peak heat.')] : null,
      Number(result.dustPercent) >= 15 ? [ui('الغبار', 'Dust'), ui('يظهر تراكم غبار ملحوظ؛ نظّف الألواح بأمان وكرّر الفحص.', 'Notable dust is shown; clean the panels safely and re-inspect.')] : null,
      [ui('التوصية', 'Recommendation'), ui('حافظ على فحص دوري للطقس وسطح الألواح بعد العواصف أو فترات الغبار.', 'Keep checking weather and panel surfaces after storms or dusty periods.')],
    ].filter(Boolean) : [[ui('التوصية', 'Recommendation'), ui('أدخل بيانات النظام وأرفق صورة للألواح للحصول على تقرير أدق.', 'Enter system data and attach a panel photo for a more accurate report.')]];
  host.innerHTML = `
    <div class="report-header">
      <div>
        <p class="eyebrow">${ui('سياج · رفيق الطاقة الشمسية', 'Siyaj · Solar companion')}</p>
        <h2>${ui('تقرير حالة النظام الشمسي', 'Solar system status report')}</h2>
        <p>${ui('صدر في', 'Generated on')} ${escapeHtml(generated)} · ${ui('الحساب', 'Account')}: ${escapeHtml(owner)}</p>
      </div>
      <span class="report-logo"><img src="/assets/logo.png" alt=""></span>
    </div>
    <section class="report-section">
      <h3>${ui('ملخص الأداء', 'Performance summary')}</h3>
      <div class="report-highlight">
        <div><small>${ui('نسبة الفقد التقديرية', 'Estimated loss ratio')}</small><b>${total === '—' ? '—' : `${total}%`}</b></div>
        <div><small>${ui('الطاقة المفقودة يومياً', 'Energy lost per day')}</small><b>${escapeHtml(lossDay)}</b></div>
        <div><small>${ui('القيمة التقديرية', 'Estimated value')}</small><b>${escapeHtml(lossMoney)}</b></div>
      </div>
    </section>
    <section class="report-section">
      <h3>${ui('أسباب الفقد', 'Loss breakdown')}</h3>
      <table class="report-table">
        <tr><th>${ui('المصدر', 'Source')}</th><th>${ui('النسبة التقديرية', 'Estimated share')}</th></tr>
        <tr><td>${ui('الحرارة', 'Heat')}</td><td>${heat === null ? '—' : `${heat}%`}</td></tr>
        <tr><td>${ui('الغبار', 'Dust')}</td><td>${escapeHtml(dust)}</td></tr>
        <tr><td>${ui('الظل', 'Shade')}</td><td>${shade}</td></tr>
        <tr><td><b>${ui('الإجمالي', 'Total')}</b></td><td><b>${total === '—' ? '—' : `${total}%`}</b></td></tr>
      </table>
      <p class="report-advice-note" style="margin-top:12px">${ui('الفقد اللحظي بسبب حرارة الألواح وقت الفحص: ', 'Instantaneous loss from panel heat at inspection: ')}<b>${heat === null ? '—' : `${heat}%`}</b> · ${ui('الخسارة الشهرية (متوقع − فعلي): ', 'Monthly loss (expected − actual): ')}<b>${escapeHtml(monthlyLine)}</b></p>
    </section>
    <section class="report-section">
      <h3>${ui('بيانات النظام', 'System details')}</h3>
      <table class="report-table">${reportSystemRows(f).map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</table>
    </section>
    <section class="report-section">
      <h3>${ui('الطقس وقت التقرير', 'Weather at report time')}</h3>
      <table class="report-table">${weatherRows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</table>
    </section>
    <section class="report-section">
      <h3>${ui('التوصية', 'Recommendation')}</h3>
      <div class="report-advice">${advice.map(([label, text]) => `<h4>${escapeHtml(label)}</h4><p>${escapeHtml(text)}</p>`).join('')}<p class="report-advice-note">${ui('هذا التقرير تقديري ويستند إلى البيانات المدخلة ونماذج الطقس، وليس قياساً كهربائياً مباشراً. يمكن مشاركته مع شركة الصيانة.', 'This report is an estimate based on entered data and weather models, not a direct electrical measurement. It can be shared with a maintenance company.')}</p></div>
    </section>
    <div class="report-footer"><span>${ui('سياج | رفيق الطاقة الشمسية', 'Siyaj | Solar companion')}</span></div>`;
  applyLanguage();
}
function reportPlainText() {
  const f = state.form;
  const result = state.result || (f.power ? calculateLoss() : null);
  ensureLossBreakdown(result);
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  const lines = [
    ui('تقرير حالة النظام الشمسي — سياج', 'Solar system status report — Siyaj'),
    `${ui('صدر في', 'Generated on')} ${new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}`,
    '',
    `${ui('نسبة الفقد التقديرية', 'Estimated loss ratio')}: ${result ? `${result.percent}%` : '—'}`,
    `${ui('الطاقة المفقودة يومياً', 'Energy lost per day')}: ${result && Number.isFinite(Number(result.lostKwh)) ? `${result.lostKwh.toFixed(2)} kWh` : '—'}`,
    `${ui('القيمة التقديرية', 'Estimated value')}: ${result && Number.isFinite(Number(result.lostMoney)) ? money(result.lostMoney) : '—'}`,
    '',
    `${ui('الحرارة', 'Heat')}: ${result && result.heatPercent !== null && result.heatPercent !== undefined ? `${Math.round(result.heatPercent)}%` : '—'}`,
    `${ui('الغبار', 'Dust')}: ${result && result.dustPercent !== null && result.dustPercent !== undefined ? `${Math.round(result.dustPercent)}%` : '—'}`,
    `${ui('الظل', 'Shade')}: ${result && Number.isFinite(Number(result.shadePercent)) ? `${Math.round(result.shadePercent)}%` : '0%'}`,
    '',
    ...reportSystemRows(f).map(([label, value]) => `${label}: ${value}`),
  ];
  return lines.join('\n');
}
function downloadReport() {
  renderSystemReport();
  const previous = document.body.classList.contains('print-report');
  const previousTitle = document.title;
  const stamp = new Date().toISOString().slice(0, 10);
  document.body.classList.add('print-report');
  // يستخدم المتصفح عنوان الصفحة كاسم مقترح لملف PDF عند الحفظ.
  document.title = `Siyaj-report-${stamp}`;
  const cleanup = () => {
    document.title = previousTitle;
    if (!previous) document.body.classList.remove('print-report');
  };
  window.addEventListener('afterprint', cleanup, { once: true });
  try { window.print(); } catch { showToast(ui('تعذر فتح نافذة الطباعة.', 'Could not open the print dialog.')); }
  setTimeout(cleanup, 1500);
}
async function shareReport() {
  const text = reportPlainText();
  if (navigator.share) { try { await navigator.share({ title: ui('تقرير حالة النظام الشمسي — سياج', 'Solar system status report — Siyaj'), text }); return; } catch { /* fall through to copy */ } }
  try { await navigator.clipboard.writeText(text); showToast(ui('تم نسخ التقرير؛ يمكنك لصقه في البريد أو واتساب.', 'Report copied; paste it into email or WhatsApp.')); }
  catch { showToast(ui('تعذر النسخ؛ استخدم «تنزيل PDF».', 'Copy failed; use “Download PDF”.')); }
}
function decodeVapidKey(value) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}
async function getDevicePushSubscription() {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.getRegistration('/');
  return registration?.pushManager ? registration.pushManager.getSubscription() : null;
}
async function refreshDevicePushState() {
  const accountId = currentAccount?.id;
  if (!accountId) { devicePushEnabled = false; devicePushStateKnown = true; return; }
  const subscription = await getDevicePushSubscription();
  let enabled = false;
  if (subscription && 'Notification' in window && Notification.permission === 'granted') {
    const response = await authenticatedFetch('/api/push/status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'تعذر التحقق من تنبيهات هذا الجهاز.');
    enabled = !!data.subscribed;
  }
  if (accountId !== currentAccount?.id) return;
  devicePushEnabled = enabled; devicePushStateKnown = true;
  if (!el('page-settings').hidden) renderSettings();
}
async function enablePushNotifications() {
  if (!currentAccount?.id) throw new Error('سجّل الدخول أولاً لتفعيل التنبيهات.');
  if (!('Notification' in window) || !('serviceWorker' in navigator)) throw new Error('هذا المتصفح لا يدعم تنبيهات Push.');
  const configResponse = await fetch('/api/push/config');
  const config = await configResponse.json();
  if (!configResponse.ok || !config.enabled || !config.publicKey) throw new Error('التنبيهات تعمل بعد إضافة مفاتيح VAPID وتشغيل الخادم.');
  if (Notification.permission !== 'granted' && await Notification.requestPermission() !== 'granted') throw new Error('لم يتم تفعيل إذن التنبيهات.');
  await navigator.serviceWorker.register('/sw.js');
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeVapidKey(config.publicKey) });
  const response = await authenticatedFetch('/api/push/subscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'تعذر حفظ الاشتراك بالتنبيهات.');
  devicePushEnabled = true; devicePushStateKnown = true;
}
async function disablePushNotifications() {
  const subscription = await getDevicePushSubscription();
  if (!subscription) { devicePushEnabled = false; devicePushStateKnown = true; return; }
  const response = await authenticatedFetch('/api/push/unsubscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'تعذر إيقاف تنبيهات هذا الجهاز.');
  devicePushEnabled = false; devicePushStateKnown = true;
  if (!await subscription.unsubscribe()) throw new Error('تعذر إيقاف تنبيهات هذا الجهاز.');
}
let authMode = 'login';
const ACCOUNTS_KEY = 'siyaj.localAccounts.v1';
function readAccounts() {
  let accounts;
  try { accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); } catch { accounts = []; }
  if (!Array.isArray(accounts)) accounts = [];
  let changed = false;
  const usedNames = new Set();
  for (const account of accounts) {
    if (!account.id) { account.id = crypto.randomUUID(); changed = true; }
    account.email = String(account.email || '').toLowerCase();
    account.phoneKey ||= normalizedPhone(account.phone);
    const proposed = account.username || account.name || account.email.split('@')[0] || 'user';
    let username = makeUniqueUsername(proposed, usedNames);
    if (account.username !== username) { account.username = username; changed = true; }
    const usernameKey = normalizedUsername(username);
    if (account.usernameKey !== usernameKey) { account.usernameKey = usernameKey; changed = true; }
    account.name ||= account.username;
    account.provider ||= account.googleSub ? 'google' : 'password';
    usedNames.add(usernameKey);
  }
  if (changed) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return accounts;
}
function normalizedPhone(value) { return String(value || '').replace(/[^\d+]/g, ''); }
function normalizedUsername(value) { return String(value || '').normalize('NFKC').trim().toLocaleLowerCase(); }
function makeUniqueUsername(value, usedNames) {
  let base = String(value || 'user').normalize('NFKC').trim().replace(/[^\p{L}\p{N}._-]/gu, '_').replace(/^[_\.-]+|[_\.-]+$/g, '');
  if (base.length < 3) base = `user_${base || 'siyaj'}`;
  base = base.slice(0, 24);
  let candidate = base; let suffix = 2;
  while (usedNames.has(normalizedUsername(candidate))) {
    const ending = `_${suffix++}`;
    candidate = `${base.slice(0, 24 - ending.length)}${ending}`;
  }
  return candidate;
}
function bytesToHex(bytes) { return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join(''); }
async function passwordDigest(password, saltHex) {
  if (!crypto.subtle) throw new Error('يتطلب تسجيل الحساب متصفحاً آمناً مثل localhost.');
  const salt = Uint8Array.from(saltHex.match(/.{1,2}/g) || [], (byte) => parseInt(byte, 16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
  return bytesToHex(new Uint8Array(digest));
}
function setAuthMode(mode) {
  authMode = mode;
  el('login-form').hidden = mode !== 'login' || !!state.user;
  el('signup-form').hidden = mode !== 'signup' || !!state.user;
  el('auth-tab-login').classList.toggle('active', mode === 'login');
  el('auth-tab-signup').classList.toggle('active', mode === 'signup');
  applyLanguage();
}
function renderAuth() {
  const loggedIn = !!state.user;
  el('auth-profile').hidden = !loggedIn;
  el('auth-tabs').hidden = loggedIn;
  el('login-form').hidden = loggedIn || authMode !== 'login';
  el('signup-form').hidden = loggedIn || authMode !== 'signup';
  if (loggedIn) {
    el('profile-name').textContent = state.user.username || state.user.name || state.user.email;
    el('profile-email').textContent = state.user.email;
  }
  applyLanguage();
}
async function finishServerAuth(session, seedState = null, legacyAccountId = '') {
  resetAiRequests();
  try { await moveLegacyMedia(legacyAccountId, session.user.id); } catch { /* keep server sign-in available if local files cannot be moved */ }
  currentAccount = session.user;
  const remoteResponse = await authenticatedFetch('/api/account/state');
  if (!remoteResponse.ok) throw new Error((await remoteResponse.json()).error || 'تعذر تحميل بيانات الحساب.');
  const remote = await remoteResponse.json();
  state = normalizeState(remote.state || seedState);
  state.user = { ...session.user };
  devicePushEnabled = false; devicePushStateKnown = false;
  await refreshDevicePushState().catch(() => { devicePushStateKnown = false; });
  currentStep = 0;
  media = [];
  persist();
  renderAuth();
}
async function continueAfterAuth() {
  await loadMedia();
  renderDashboard();
  if (state.onboarded) showPage('dashboard'); else openWizard(0);
  if (state.form.latitude !== null && state.form.longitude !== null) await loadWeather();
}
async function handleSignup(event) {
  event.preventDefault();
  const username = el('signup-username').value.trim();
  const email = el('signup-email').value.trim().toLowerCase();
  const phone = el('signup-phone').value.trim();
  const phoneKey = normalizedPhone(phone);
  const password = el('signup-password').value;
  const confirmPassword = el('signup-confirm').value;
  if (!/^[\p{L}\p{N}._-]{3,24}$/u.test(username)) return showToast('اسم المستخدم من 3 إلى 24 حرفاً أو رقماً، ويمكن استخدام النقطة والشرطة السفلية فقط.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('أدخل بريداً إلكترونياً صالحاً.');
  if (phoneKey.replace(/\D/g, '').length < 7) return showToast('أدخل رقم هاتف صالحاً.');
  if (password.length < 8) return showToast('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
  if (password !== confirmPassword) return showToast('كلمتا المرور غير متطابقتين.');
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, phone, password }),
    });
    const session = await response.json();
    if (!response.ok) throw new Error(session.error || 'تعذر إنشاء الحساب.');
    await finishServerAuth(session, state); const signupDev = session?.user?.role === 'developer'; showToast(signupDev ? 'Welcome dev' : ('تم إنشاء الحساب وحفظه على الخادم.'); await continueAfterAuth();
  } catch (error) { showToast(error.message || 'تعذر إنشاء الحساب.'); }
}
async function handleLogin(event) {
  event.preventDefault();
  const identifier = el('login-identifier').value.trim();
  const password = el('login-password').value;
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    let session = await response.json();
    let seedState = null;
    if (!response.ok && response.status === 401) {
      const normalized = normalizedUsername(identifier);
      const legacy = readAccounts().find((item) => item.email === identifier.toLowerCase() || item.phoneKey === normalizedPhone(identifier) || item.usernameKey === normalized);
      if (legacy?.salt && legacy?.hash) {
        const legacyHash = await passwordDigest(password, legacy.salt);
        if (legacyHash !== legacy.hash) return showToast('كلمة المرور غير صحيحة.');
        seedState = loadState(accountStorageKey(legacy.id));
        const migration = await fetch('/api/auth/signup', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: legacy.username, email: legacy.email, phone: legacy.phone, password }),
        });
        session = await migration.json();
        if (!migration.ok) throw new Error(session.error || 'تعذر نقل الحساب إلى الخادم.');
      } else if (legacy && !legacy.salt) return showToast('هذا الحساب مرتبط بـ Google؛ تابع باستخدام Google.');
      else throw new Error(session.error || 'لم نعثر على الحساب. أنشئ حساباً جديداً.');
    } else if (!response.ok) throw new Error(session.error || 'تعذر تسجيل الدخول.');
    const legacy = readAccounts().find((item) => item.email === identifier.toLowerCase() || item.phoneKey === normalizedPhone(identifier) || item.usernameKey === normalizedUsername(identifier));
    await finishServerAuth(session, seedState, legacy?.id); const loginDev = session?.user?.role === 'developer'; showToast(loginDev ? 'Welcome dev' : ('تم تسجيل الدخول ومزامنة بياناتك.'); await continueAfterAuth();
  } catch (error) { showToast(error.message || 'تعذر تسجيل الدخول.'); }
}
let googleSignInReady = false;
function renderGoogleButtons() {
  if (!googleSignInReady || !window.google?.accounts?.id) return;
  document.querySelectorAll('[data-google-signin]').forEach((container) => {
    container.replaceChildren();
    const width = Math.max(220, Math.min(360, Math.floor(container.getBoundingClientRect().width || 360)));
    window.google.accounts.id.renderButton(container, {
      type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular',
      width, locale: state.settings.language === 'en' ? 'en' : 'ar',
    });
  });
}
async function handleGoogleCredential(response) {
  try {
    const verification = await fetch('/api/auth/google', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response?.credential || '' }),
    });
    const data = await verification.json();
    if (!verification.ok) throw new Error(data.error || 'تعذر التحقق من حساب Google.');
    const legacy = readAccounts().find((item) => item.email === data.user?.email);
    const seedState = legacy ? loadState(accountStorageKey(legacy.id)) : null;
    await finishServerAuth(data, seedState, legacy?.id); showToast('تم تسجيل الدخول باستخدام Google ومزامنة بياناتك.'); await continueAfterAuth();
  } catch (error) { showToast(error.message || 'تعذر تسجيل الدخول باستخدام Google.'); }
}
async function initializeGoogleButtons() {
  try {
    const config = await loadAiConfig();
    if (!config.googleClientId) return;
    if (!window.google?.accounts?.id) {
      await new Promise((resolve) => {
        const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
        if (!script) return resolve();
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 10000);
      });
    }
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({ client_id: config.googleClientId, callback: handleGoogleCredential, auto_select: false });
    googleSignInReady = true;
    renderGoogleButtons();
  } catch { /* keep the local Google button fallback visible */ }
}
// The intro and the loading screen are always shown in the light theme. The account's
// saved dark/light preference is only applied once the intro has left the screen, so
// the theme never flips while the branding is still animating.
function applyTheme() {
  if (introActive) return;
  document.body.classList.toggle('dark', !!state.settings.dark);
}
// How long the logo rests in the centre of the intro before flying to the header,
// and how long that flight takes. INTRO_FLIGHT_MS must match the .intro-logo.moving
// transition duration in styles.css so the fade-out starts exactly when it lands.
const INTRO_HOLD_MS = 4600;
const INTRO_FLIGHT_MS = 760;
function playIntro() {
  introActive = true;
  // The logo travels from the centre of the intro to the header logo. Capture both
  // positions from the top of the page so a scrolled window can never send the logo
  // off-screen, and so it always lands exactly on the logo the user sees in the header.
  const intro = el('intro'); const logo = intro.querySelector('.intro-logo');
  const start = logo.getBoundingClientRect();
  el('app-shell').hidden = false; el('app-shell').style.animation = 'none';
  showPage('auth'); renderAuth(); syncHeader();
  initializeGoogleButtons();
  setTimeout(() => {
    window.scrollTo(0, 0);
    intro.classList.add('transitioning');
    const destination = document.querySelector('.brand img').getBoundingClientRect();
    const spacer = document.createElement('span');
    spacer.className = 'intro-logo-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    spacer.style.width = `${start.width}px`;
    spacer.style.height = `${start.height}px`;
    logo.before(spacer);
    logo.classList.add('moving'); logo.style.top = `${start.top}px`; logo.style.left = `${start.left}px`;
    logo.style.width = `${start.width}px`; logo.style.height = `${start.height}px`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      logo.style.top = `${destination.top}px`; logo.style.left = `${destination.left}px`;
      logo.style.width = `${destination.width}px`; logo.style.height = `${destination.height}px`;
    }));
    setTimeout(() => { intro.classList.add('leaving'); setTimeout(() => { intro.hidden = true; introActive = false; applyTheme(); if (!bootstrapSettled) showLoadingScreen(); }, 190); }, INTRO_FLIGHT_MS + 80);
  }, INTRO_HOLD_MS);
}
function setupEvents() {
  document.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => { const page = button.dataset.page; showPage(page); if (page === 'history') renderHistory(); if (page === 'reports') renderReports(); if (page === 'report') renderSystemReport(); if (page === 'settings') { renderSettings(); refreshDevicePushState().catch(() => { devicePushStateKnown = false; renderSettings(); }); } if (page === 'auth') renderAuth(); }));
  el('mobile-menu').addEventListener('click', () => document.body.classList.toggle('mobile-nav-open'));
  el('language-toggle').addEventListener('click', () => {
    state.settings.language = state.settings.language === 'en' ? 'ar' : 'en'; persist();
    renderDashboard(); renderCurrentStep(); renderHistory(); renderSettings(); renderAuth(); showToast(state.settings.language === 'en' ? 'Language changed to English.' : 'تم تغيير اللغة إلى العربية.');
    renderGoogleButtons();
  });
  el('auth-tab-login').addEventListener('click', () => setAuthMode('login'));
  el('auth-tab-signup').addEventListener('click', () => setAuthMode('signup'));
  el('show-signup').addEventListener('click', () => setAuthMode('signup'));
  el('show-login').addEventListener('click', () => setAuthMode('login'));
  el('login-form').addEventListener('submit', handleLogin);
  el('signup-form').addEventListener('submit', handleSignup);
  el('logout-button').addEventListener('click', async () => {
    resetAiRequests();
    const button = el('logout-button'); button.disabled = true;
    try {
      persist(); clearTimeout(panelSyncTimer); clearTimeout(accountSyncTimer);
      await syncAccountState();
      await syncPanelData();
      const endpoint = (await getDevicePushSubscription())?.endpoint || '';
      await disablePushNotifications();
      const response = await authenticatedFetch('/api/auth/logout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'تعذر تسجيل الخروج؛ حاول مرة أخرى.');
      currentAccount = null; devicePushEnabled = false; devicePushStateKnown = true;
      state = loadState(`${STORAGE_KEY}.guest`); media = []; currentStep = 0; authMode = 'login';
      applyTheme(); showPage('auth'); renderAuth(); syncHeader(); showToast('تم تسجيل الخروج.');
    } catch (error) { showToast(error.message || 'تعذر تسجيل الخروج؛ حاول مرة أخرى.'); }
    finally { button.disabled = false; }
  });
  document.querySelectorAll('[data-google-signin]').forEach((button) => {
    button.addEventListener('click', () => { if (!googleSignInReady) showToast('تسجيل Google يحتاج إضافة GOOGLE_CLIENT_ID إلى ملف .env.'); });
    button.addEventListener('keydown', (event) => { if (!googleSignInReady && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); showToast('تسجيل Google يحتاج إضافة GOOGLE_CLIENT_ID إلى ملف .env.'); } });
  });
  el('start-setup').addEventListener('click', () => openWizard(0)); el('edit-data').addEventListener('click', () => openWizard(0)); el('system-edit').addEventListener('click', () => openWizard(0));
  el('step-next').addEventListener('click', nextStep); el('step-back').addEventListener('click', previousStep); el('start-setup').addEventListener('keydown', (event) => { if (event.key === 'Enter') openWizard(0); });
  el('refresh-weather').addEventListener('click', loadWeather); el('history-new').addEventListener('click', () => openWizard(0));
  el('update-monthly-loss').addEventListener('click', updateMonthlyAssessment);
  el('analyze-panels').addEventListener('click', () => runAnalysis({ useClaude: true }));
  el('dashboard-bill-month').addEventListener('change', () => {
    const month = el('dashboard-bill-month').value;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return;
    if (month !== state.form.billMonth) { state.form.expectedMonthlyKwh = ''; state.form.actualMonthlyKwh = ''; }
    state.form.billMonth = month; state.monthlyLoss = null; invoiceReview = null; persist(); renderAnalysisDetails(); applyLanguage();
  });
  el('cleaned-button').addEventListener('click', async () => {
    if (!currentAccount?.id) { showToast('سجّل الدخول أولاً.'); return; }
    const button = el('cleaned-button'); button.disabled = true;
    const accountId = currentAccount.id;
    try {
      const response = await authenticatedFetch('/api/panel/cleaned', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await response.json();
      if (!response.ok || !Number.isFinite(Date.parse(data.lastCleanedAt || ''))) throw new Error(data.error || 'تعذر حفظ سجل التنظيف على الخادم.');
      if (accountId !== currentAccount?.id) return;
      state.lastCleanedAt = data.lastCleanedAt;
      state.form.dust = null; state.form.dustManual = false;
      // Cleaning starts a new condition; an old visual assessment is not a fresh inspection.
      state.ai = null; state.aiModel = null; state.aiLanguage = null;
      const previousReport = state.result || {};
      state.result = calculateLoss();
      state.result.reportId = null;
      if (previousReport.monthlyProductionKwh !== undefined) {
        const monthlyProduction = Number(previousReport.monthlyProductionKwh || state.result.possibleKwh * 30);
        state.result.monthlyProductionKwh = monthlyProduction;
        state.result.heatLossPercent = state.result.heatPercent;
        state.result.heatLossOmr = state.result.heatPercent === null ? null : monthlyProduction * (state.result.heatPercent / 100) * state.result.tariffOmrPerKwh;
        state.result.dustLossPercent = state.result.soilingPercent;
        state.result.dustLossOmr = null;
      }
      state.updatedAt = new Date().toISOString(); persist(); renderDashboard(); showToast(ui('تم تسجيل تنظيف الألواح.', 'Panel cleaning was recorded.'));
    } catch (error) { showToast(error.message || 'تعذر حفظ سجل التنظيف على الخادم.'); }
    finally { button.disabled = false; }
  });
  el('maintenance-done')?.addEventListener('click', () => {
    state.form.lastMaintenanceAt = todayIsoDate();
    state.updatedAt = new Date().toISOString();
    persist();
    renderDashboard();
    showToast(ui('تم تحديث تاريخ آخر صيانة إلى اليوم.', 'Last maintenance date updated to today.'));
  });
  setInterval(() => { if (document.visibilityState !== 'hidden') renderMaintenance(); }, 60 * 60 * 1000);
  el('setting-dark').addEventListener('change', () => { state.settings.dark = el('setting-dark').checked; persist(); });
  el('setting-sound').addEventListener('change', () => { state.settings.sound = el('setting-sound').checked; persist(); });
  el('setting-language').addEventListener('change', () => { state.settings.language = el('setting-language').value === 'en' ? 'en' : 'ar'; persist(); renderDashboard(); renderCurrentStep(); renderHistory(); renderSettings(); renderAuth(); renderGoogleButtons(); });
  el('setting-notifications').addEventListener('change', async () => {
    const enable = el('setting-notifications').checked;
    devicePushBusy = true; el('setting-notifications').disabled = true;
    try {
      if (enable) { await enablePushNotifications(); state.settings.notifications = true; persist(); }
      else await disablePushNotifications();
      showToast(enable ? 'تم تفعيل التنبيهات.' : 'تم إيقاف التنبيهات.');
    } catch (error) {
      await refreshDevicePushState().catch(() => { devicePushStateKnown = false; });
      showToast(error.message || (enable ? 'تعذر تفعيل التنبيهات؛ تحقق من الإذن والاتصال بالخادم.' : 'تعذر إيقاف تنبيهات هذا الجهاز.'));
    } finally { devicePushBusy = false; renderSettings(); }
  });
  el('reset-data').addEventListener('click', async () => {
    if (!confirm('هل تريد مسح بيانات الحساب ومرفقاته من جميع أجهزتك؟')) return;
    resetAiRequests();
    const user = state.user; const currentKey = accountStorageKey(); const accountId = currentAccount?.id;
    localStorage.removeItem(currentKey); state = structuredClone(DEFAULT_STATE); state.user = user; media = [];
    try { if (accountId) await deleteMediaForAccount(accountId); } catch { /* database may not be available */ }
    try { if (accountId) await authenticatedFetch('/api/panel/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }); } catch { /* local reset still completes */ }
    persist(); renderDashboard(); renderSettings(); showToast('تم مسح بيانات حسابك.');
  });
  el('export-data').addEventListener('click', () => {
    const payload = { savedAt: new Date().toISOString(), state, attachments: media.map(({ id, category, name, type }) => ({ id, category, name, type })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'siyaj-data.json'; link.click(); URL.revokeObjectURL(url); showToast('تم تنزيل نسخة البيانات.');
  });
  el('complaint-submit')?.addEventListener('click', submitComplaint);
  el('complaint-share')?.addEventListener('click', shareComplaint);
  el('report-download')?.addEventListener('click', downloadReport);
  el('report-print')?.addEventListener('click', downloadReport);
  el('report-share')?.addEventListener('click', shareReport);
  el('toast')?.addEventListener('click', () => { clearTimeout(toastTimer); el('toast').classList.remove('show'); });
}
function init() {
  state.user = null;
  introActive = true; // keep the branding screens light until the intro finishes
  setupEvents(); applyTheme(); el('footer-year').textContent = new Date().getFullYear();
  window.addEventListener('pagehide', () => {
    if (!currentAccount) return;
    fetch('/api/account/state', {
      method: 'PUT', credentials: 'same-origin', keepalive: true,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: { ...state, user: null } }),
    }).catch(() => {});
  });
  el('app-shell').hidden = true; el('intro').hidden = false; applyLanguage(); renderAuth(); playIntro(); loadAppSettings();
  restoreExistingSession().catch(() => {}).finally(() => { bootstrapSettled = true; hideLoadingScreen(); });
}
async function restoreExistingSession() {
  try {
    const response = await authenticatedFetch('/api/auth/session');
    if (!response.ok) return;
    const session = await response.json();
    const seed = localStorage.getItem(accountStorageKey(session.user.id)) ? loadState(accountStorageKey(session.user.id)) : null;
    await finishServerAuth(session, seed);
    await continueAfterAuth();
  } catch { /* show sign-in if the server cannot restore the session */ }
}
init();
