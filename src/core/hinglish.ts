import type { RawWord } from '../types/caption';

/**
 * Natural spoken Hinglish dictionary for high-frequency Hindi words and
 * English loanwords that Whisper outputs in Devanagari script.
 */
const HINGLISH_DICT: Record<string, string> = {
  // Common English loanwords in Reels / Shorts
  'वीडियो': 'video',
  'वीडियोज़': 'videos',
  'अपलोड': 'upload',
  'कैप्शन': 'caption',
  'कैप्शंस': 'captions',
  'कैप्शन्स': 'captions',
  'टेम्पलेट': 'template',
  'टेंपलेट': 'template',
  'रील': 'Reel',
  'रील्स': 'Reels',
  'यूट्यूब': 'YouTube',
  'इंस्टाग्राम': 'Instagram',
  'शॉर्ट्स': 'Shorts',
  'टिकटॉक': 'TikTok',
  'एडिट': 'edit',
  'एडिटिंग': 'editing',
  'एडिटर': 'editor',
  'लिटरली': 'literally',
  'मिनट': 'minute',
  'सेकंड': 'second',
  'रेडी': 'ready',
  'चूज': 'choose',
  'चूज़': 'choose',
  'फ्री': 'free',
  'फ़्री': 'free',
  'ब्राउज़र': 'browser',
  'ब्राउजर': 'browser',
  'फोन': 'phone',
  'फ़ोन': 'phone',
  'मोबाइल': 'mobile',
  'स्क्रॉल': 'scroll',
  'वायरल': 'viral',
  'ग्रोथ': 'growth',
  'ग्रो': 'grow',
  'कंटेंट': 'content',
  'क्रिएटर': 'creator',
  'फॉलो': 'follow',
  'फ़ॉलो': 'follow',
  'लाइक': 'like',
  'शेयर': 'share',
  'कमेंट': 'comment',
  'सब्सक्राइब': 'subscribe',
  'लिंक': 'link',
  'बायो': 'bio',
  'ब्रांड': 'brand',
  'बिजनेस': 'business',
  'बिज़नेस': 'business',
  'क्लाइंट': 'client',
  'पॉडकास्ट': 'podcast',
  'कैमरा': 'camera',
  'ऑडियो': 'audio',
  'साउंड': 'sound',
  'स्टाइल': 'style',
  'फॉन्ट': 'font',
  'फ़ॉन्ट': 'font',
  'एक्सपोर्ट': 'export',
  'क्वालिटी': 'quality',
  'प्रॉब्लम': 'problem',
  'सॉल्यूशन': 'solution',
  'आइडिया': 'idea',
  'टिप्स': 'tips',
  'ट्रिक': 'trick',
  'हैक': 'hack',
  'स्टार्ट': 'start',
  'स्टॉप': 'stop',
  'टॉप': 'top',
  'बेस्ट': 'best',
  'प्रो': 'pro',
  'मनी': 'money',
  'प्रॉफिट': 'profit',
  'ऑनलाइन': 'online',
  'वेबसाइट': 'website',
  'ऐप': 'app',
  'टूल': 'tool',
  'एआई': 'AI',
  'टाइम': 'time',
  'क्लाउड': 'cloud',
  'सर्वर': 'server',
  'प्राइवेट': 'private',
  'सिंपल': 'simple',
  'फास्ट': 'fast',
  'फ़ास्ट': 'fast',
  'स्मार्ट': 'smart',
  'फीचर': 'feature',
  'फ़ीचर': 'feature',
  'डिज़ाइन': 'design',
  'डिजाइन': 'design',
  'स्क्रीन': 'screen',
  'बटन': 'button',
  'क्लिक': 'click',
  'सेटिंग': 'setting',
  'सेटिंग्स': 'settings',
  'म्यूजिक': 'music',
  'म्यूज़िक': 'music',
  'इफेक्ट': 'effect',
  'इफेक्ट्स': 'effects',
  'फ़िल्टर': 'filter',
  'फिल्टर': 'filter',

  // High-frequency spoken Hindi words (natural Hinglish spelling)
  'मैं': 'main',
  'मैंने': 'maine',
  'मेरा': 'mera',
  'मेरी': 'meri',
  'मेरे': 'mere',
  'मुझे': 'mujhe',
  'तुम': 'tum',
  'तुम्हें': 'tumhe',
  'तुम्हारा': 'tumhara',
  'तुम्हारी': 'tumhari',
  'तुम्हारे': 'tumhare',
  'तू': 'tu',
  'तेरा': 'tera',
  'तेरी': 'teri',
  'आप': 'aap',
  'आपका': 'aapka',
  'आपकी': 'aapki',
  'आपके': 'aapke',
  'आपको': 'aapko',
  'हम': 'hum',
  'हमारा': 'hamara',
  'हमारी': 'hamari',
  'हमारे': 'hamare',
  'हमें': 'humein',
  'ये': 'ye',
  'यह': 'ye',
  'वो': 'wo',
  'वह': 'wo',
  'इस': 'is',
  'उस': 'us',
  'इन': 'in',
  'उन': 'un',
  'क्या': 'kya',
  'क्यों': 'kyu',
  'क्योंकि': 'kyunki',
  'कैसे': 'kaise',
  'कैसा': 'kaisa',
  'कैसी': 'kaisi',
  'कब': 'kab',
  'कहाँ': 'kahan',
  'कहा': 'kaha',
  'कौन': 'kaun',
  'किस': 'kis',
  'किसे': 'kise',
  'है': 'hai',
  'हैं': 'hain',
  'हूँ': 'hoon',
  'हूं': 'hoon',
  'था': 'tha',
  'थी': 'thi',
  'थे': 'the',
  'हो': 'ho',
  'होता': 'hota',
  'होती': 'hoti',
  'होते': 'hote',
  'होगा': 'hoga',
  'होगी': 'hogi',
  'होंगे': 'honge',
  'हुआ': 'hua',
  'हुई': 'hui',
  'हुए': 'hue',
  'नहीं': 'nahi',
  'नहि': 'nahi',
  'ना': 'na',
  'मत': 'mat',
  'हाँ': 'haan',
  'हां': 'haan',
  'जी': 'ji',
  'और': 'aur',
  'या': 'ya',
  'पर': 'par',
  'लेकिन': 'lekin',
  'मगर': 'magar',
  'अगर': 'agar',
  'तो': 'toh',
  'भी': 'bhi',
  'ही': 'hi',
  'बस': 'bas',
  'सिर्फ': 'sirf',
  'सिर्फ़': 'sirf',
  'अब': 'ab',
  'अभी': 'abhi',
  'आज': 'aaj',
  'कल': 'kal',
  'एक': 'ek',
  'दो': 'do',
  'तीन': 'teen',
  'चार': 'chaar',
  'पांच': 'paanch',
  'पाँच': 'paanch',
  'सब': 'sab',
  'सभी': 'sabhi',
  'कुछ': 'kuch',
  'बहुत': 'bahut',
  'ज्यादा': 'zyada',
  'ज़्यादा': 'zyada',
  'कम': 'kam',
  'अच्छा': 'accha',
  'अच्छी': 'acchi',
  'अच्छे': 'acche',
  'बड़ा': 'bada',
  'बड़ी': 'badi',
  'बड़े': 'bade',
  'छोटा': 'chota',
  'छोटी': 'choti',
  'नया': 'naya',
  'नई': 'nayi',
  'नये': 'naye',
  'पुराना': 'purana',
  'कर': 'kar',
  'करो': 'karo',
  'करना': 'karna',
  'करते': 'karte',
  'करता': 'karta',
  'करती': 'karti',
  'करेंगे': 'karenge',
  'किया': 'kiya',
  'दिया': 'diya',
  'लिया': 'liya',
  'गया': 'gaya',
  'गई': 'gayi',
  'गए': 'gaye',
  'आया': 'aaya',
  'आई': 'aayi',
  'आए': 'aaye',
  'जाना': 'jaana',
  'आना': 'aana',
  'रहा': 'raha',
  'रही': 'rahi',
  'रहे': 'rahe',
  'देखो': 'dekho',
  'देखना': 'dekhna',
  'देखा': 'dekha',
  'सुनो': 'suno',
  'बोलो': 'bolo',
  'बताओ': 'batao',
  'जानते': 'jaante',
  'चाहिए': 'chahiye',
  'चाहते': 'chahte',
  'सकते': 'sakte',
  'सकता': 'sakta',
  'सकती': 'sakti',
  'में': 'mein',
  'से': 'se',
  'को': 'ko',
  'का': 'ka',
  'की': 'ki',
  'के': 'ke',
  'ने': 'ne',
  'कि': 'ki',
  'लिए': 'liye',
  'साथ': 'saath',
  'बिना': 'bina',
  'बाद': 'baad',
  'पहले': 'pehle',
  'ऊपर': 'upar',
  'नीचे': 'neeche',
  'अंदर': 'andar',
  'बाहर': 'bahar',
  'यहाँ': 'yahan',
  'वहाँ': 'wahan',
  'जहाँ': 'jahan',
  'लोग': 'log',
  'लोगों': 'logon',
  'भाई': 'bhai',
  'यार': 'yaar',
  'दोस्त': 'dost',
  'दोस्तों': 'doston',
  'पैसा': 'paisa',
  'पैसे': 'paise',
  'काम': 'kaam',
  'ज़िंदगी': 'zindagi',
  'जिंदगी': 'zindagi',
  'दुनिया': 'duniya',
  'तरीका': 'tarika',
  'तरीके': 'tarike',
  'बात': 'baat',
  'बातें': 'baatein',
  'चीज़': 'cheez',
  'चीज': 'cheez',
  'चीजें': 'cheezein',
  'बार': 'baar',
  'खुद': 'khud',
  'ख़ुद': 'khud',
  'बिल्कुल': 'bilkul',
  'एकदम': 'ekdam',
  'सीधा': 'seedha',
  'आसान': 'aasan',
  'रुको': 'ruko',
  'शुरू': 'shuru',
  'खत्म': 'khatam',
  'ख़त्म': 'khatam',
  'ज़रूर': 'zaroor',
  'जरूर': 'zaroor',
  'ज़रूरी': 'zaroori',
  'जरूरी': 'zaroori',
  'सही': 'sahi',
  'गलत': 'galat',
  'ग़लत': 'galat',
  'सच': 'sach',
  'जल्दी': 'jaldi',
  'धीरे': 'dheere',
  'हमेशा': 'hamesha',
  'कभी': 'kabhi',
  'हर': 'har',
  'पूरा': 'poora',
  'पूरी': 'poori',
  'वजह': 'wajah',
  'मतलब': 'matlab',
  'समझ': 'samajh',
  'सोचो': 'socho',
  'लगता': 'lagta',
  'लगती': 'lagti',
  'मिलता': 'milta',
  'मिलेगा': 'milega',
  'बनाओ': 'banao',
  'बनाया': 'banaya',
  'बनाना': 'banana',
  'आग': 'aag',
  'दिमाग': 'dimaag',
  'दिल': 'dil',
};

const INDEPENDENT_VOWELS: Record<string, string> = {
  'अ': 'a',
  'आ': 'aa',
  'इ': 'i',
  'ई': 'ee',
  'उ': 'u',
  'ऊ': 'oo',
  'ऋ': 'ri',
  'ए': 'e',
  'ऐ': 'ai',
  'ओ': 'o',
  'औ': 'au',
  'ऑ': 'o',
  'ॲ': 'a',
};

const CONSONANTS: Record<string, string> = {
  'क': 'k',
  'ख': 'kh',
  'ग': 'g',
  'घ': 'gh',
  'ङ': 'ng',
  'च': 'ch',
  'छ': 'chh',
  'ज': 'j',
  'झ': 'jh',
  'ञ': 'ny',
  'ट': 't',
  'ठ': 'th',
  'ड': 'd',
  'ढ': 'dh',
  'ण': 'n',
  'त': 't',
  'थ': 'th',
  'द': 'd',
  'ध': 'dh',
  'न': 'n',
  'प': 'p',
  'फ': 'ph',
  'ब': 'b',
  'भ': 'bh',
  'म': 'm',
  'य': 'y',
  'र': 'r',
  'ल': 'l',
  'व': 'v',
  'श': 'sh',
  'ष': 'sh',
  'स': 's',
  'ह': 'h',
  'ळ': 'l',
  // Precomposed nukta forms
  'क़': 'q',
  'ख़': 'kh',
  'ग़': 'gh',
  'ज़': 'z',
  'ड़': 'd',
  'ढ़': 'dh',
  'फ़': 'f',
  'य़': 'y',
};

const NUKTA_MAP: Record<string, string> = {
  'क': 'q',
  'ख': 'kh',
  'ग': 'gh',
  'ज': 'z',
  'ड': 'd',
  'ढ': 'dh',
  'फ': 'f',
};

const MATRAS: Record<string, string> = {
  'ा': 'a',
  'ि': 'i',
  'ी': 'i',
  'ु': 'u',
  'ू': 'u',
  'ृ': 'ri',
  'े': 'e',
  'ै': 'ai',
  'ो': 'o',
  'ौ': 'au',
  'ॉ': 'o',
  'ॅ': 'a',
};

const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

const HALANT = '्';
const NUKTA = '़';
const ANUSVARA = 'ं';
const CHANDRABINDU = 'ँ';
const VISARGA = 'ः';
const DANDA = '।';

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const ARABIC_URDU_REGEX = /[\u0600-\u06FF]/;

export function hasDevanagari(text: string): boolean {
  return DEVANAGARI_REGEX.test(text);
}

export function hasArabicOrUrdu(text: string): boolean {
  return ARABIC_URDU_REGEX.test(text);
}

export function hasIndicOrUrdu(text: string): boolean {
  return DEVANAGARI_REGEX.test(text) || ARABIC_URDU_REGEX.test(text);
}

/**
 * Common Urdu/Nastaliq words mapped to standard Hindi Devanagari.
 * Spoken Hindi and Urdu share identical spoken vocabulary (Hindustani).
 * When Whisper decodes Hindustani audio into Urdu script tokens,
 * this dictionary converts them directly into proper Devanagari script.
 */
const URDU_TO_HINDI_DICT: Record<string, string> = {
  'ایک': 'एक',
  'دو': 'दो',
  'تین': 'तीन',
  'چار': 'चार',
  'پانچ': 'पांच',
  'گھونٹ': 'घूंट',
  'گھونٹساں': 'घूंट',
  'گلاس': 'गिलास',
  'پانی': 'पानी',
  'نے': 'ने',
  'میں': 'में',
  'ہے': 'है',
  'ہیں': 'हैं',
  'ہو': 'हो',
  'ہوں': 'हूँ',
  'تھا': 'था',
  'تھی': 'थी',
  'تھے': 'थे',
  'کیا': 'क्या',
  'کیوں': 'क्यों',
  'کیسے': 'कैसे',
  'کیسا': 'कैसा',
  'کیسی': 'कैसी',
  'یہ': 'यह',
  'وہ': 'वह',
  'اس': 'इस',
  'اسے': 'इसे',
  'اسکا': 'इसका',
  'اسکی': 'इसकी',
  'اسکے': 'इसके',
  'ان': 'इन',
  'انکا': 'इनका',
  'انکی': 'इनकी',
  'انکے': 'इनके',
  'آپ': 'आप',
  'آپکا': 'आपका',
  'آپکی': 'आपकी',
  'آپکے': 'आपके',
  'آپکو': 'आपको',
  'تم': 'तुम',
  'تمہارا': 'तुम्हारा',
  'تمہاری': 'तुम्हारी',
  'تمہارے': 'तुम्हारे',
  'تمہیں': 'तुम्हें',
  'ہم': 'हम',
  'ہمارا': 'हमारा',
  'ہماری': 'हमारी',
  'ہمارے': 'हमारे',
  'ہمیں': 'हमें',
  'میرا': 'मेरा',
  'میری': 'मेरी',
  'میرے': 'मेरे',
  'مجھے': 'मुझे',
  'مجھ': 'मुझ',
  'ویڈیو': 'वीडियो',
  'اور': 'और',
  'یا': 'या',
  'نہیں': 'नहीं',
  'نہ': 'ना',
  'مت': 'मत',
  'ہاں': 'हाँ',
  'جی': 'जी',
  'بہت': 'बहुत',
  'زیادہ': 'ज्यादा',
  'کم': 'कम',
  'بات': 'बात',
  'باتیں': 'बातें',
  'لوگ': 'लोग',
  'لوگوں': 'लोगों',
  'کام': 'काम',
  'سب': 'सब',
  'سبھی': 'सभी',
  'اب': 'अब',
  'ابھی': 'अभी',
  'آج': 'आज',
  'کل': 'कल',
  'صرف': 'सिर्फ',
  'بس': 'बस',
  'دل': 'दिल',
  'دنیا': 'दुनिया',
  'وقت': 'वक्त',
  'زندگی': 'जिंदगी',
  'دوست': 'दोस्त',
  'دوستوں': 'दोस्तों',
  'بھائی': 'भाई',
  'یار': 'यार',
  'دیکھو': 'देखो',
  'دیکھنا': 'देखना',
  'دیکھا': 'देखा',
  'سنو': 'सुनो',
  'بولو': 'बोलो',
  'کہو': 'कहो',
  'کہا': 'कहा',
  'شروع': 'शुरू',
  'ختم': 'खत्म',
  'صحیح': 'सही',
  'غلط': 'गलत',
  'پہلے': 'पहले',
  'بعد': 'बाद',
  'ساتھ': 'साथ',
  'سے': 'से',
  'کو': 'को',
  'کا': 'का',
  'کی': 'की',
  'کے': 'के',
  'پر': 'पर',
  'تک': 'तक',
  'اگر': 'अगर',
  'تو': 'तो',
  'بھی': 'भी',
  'ہی': 'ही',
  'کچھ': 'कुछ',
  'کوئی': 'कोई',
  'کون': 'कौन',
  'کس': 'किस',
  'کسے': 'किसे',
  'پھر': 'फिर',
  'ضرور': 'जरूर',
  'ضروری': 'जरूरी',
  'چاہئے': 'चाहिए',
  'چاہیے': 'चाहिए',
  'سکتے': 'सकते',
  'سکتا': 'सकता',
  'سکتی': 'सकती',
  'کر': 'कर',
  'کرو': 'करो',
  'کرنا': 'करना',
  'کرتے': 'करते',
  'کرتا': 'करता',
  'کرتی': 'करती',
  'کریں گے': 'करेंगे',
  'کیا گیا': 'किया गया',
  'ہوگا': 'होगा',
  'ہوگی': 'होगी',
  'ہوں گے': 'होंगे',
  'ہوا': 'हुआ',
  'ہوئی': 'हुई',
  'ہوئے': 'हुए',
  'آیا': 'आया',
  'آئی': 'आई',
  'آئے': 'आए',
  'گیا': 'गया',
  'گئی': 'गई',
  'گئے': 'गए',
  'دیا': 'दिया',
  'لیا': 'लिया',
  'پیو': 'पियो',
  'پینا': 'पीना',
  'کھاؤ': 'खाओ',
};

const URDU_CHAR_TO_DEVANAGARI: Record<string, string> = {
  'ا': 'ा',
  'آ': 'आ',
  'ب': 'ब',
  'پ': 'प',
  'ت': 'त',
  'ٹ': 'ट',
  'ث': 'स',
  'ج': 'ज',
  'چ': 'च',
  'ح': 'ह',
  'خ': 'ख़',
  'د': 'द',
  'ڈ': 'ड',
  'ذ': 'ज़',
  'ر': 'र',
  'ڑ': 'ड़',
  'ز': 'ज़',
  'ژ': 'झ़',
  'س': 'स',
  'ش': 'श',
  'ص': 'स',
  'ض': 'ज़',
  'ط': 'त',
  'ظ': 'ज़',
  'ع': 'अ',
  'غ': 'ग़',
  'ف': 'फ़',
  'ق': 'क़',
  'ک': 'क',
  'گ': 'ग',
  'ل': 'ल',
  'م': 'म',
  'ن': 'न',
  'ں': 'ँ',
  'و': 'ो',
  'ہ': 'ह',
  'ۂ': 'ह',
  'ھ': 'ह',
  'ی': 'ी',
  'ے': 'े',
  'ئ': 'ई',
  'ء': '',
};

/**
 * Converts any Perso-Arabic / Urdu script text into clean standard Hindi Devanagari.
 */
export function urduToDevanagari(text: string): string {
  if (!text || !hasArabicOrUrdu(text)) return text;

  return text
    .split(/(\s+)/)
    .map((part) => {
      if (!hasArabicOrUrdu(part)) return part;

      const match = part.match(
        /^([^\u0600-\u06FF]*)([\u0600-\u06FF]+)([^\u0600-\u06FF]*)$/
      );
      if (!match) return part;

      const [, lead, core, trail] = match;

      // Exact high-frequency Hindustani word match
      if (URDU_TO_HINDI_DICT[core]) {
        return `${lead}${URDU_TO_HINDI_DICT[core]}${trail}`;
      }

      // Handle common aspirated digraphs (do-chashmi he compounds)
      const c = core
        .replace(/بھ/g, 'भ')
        .replace(/پھ/g, 'फ')
        .replace(/تھ/g, 'थ')
        .replace(/ٹھ/g, 'ठ')
        .replace(/جھ/g, 'झ')
        .replace(/چھ/g, 'छ')
        .replace(/دھ/g, 'ध')
        .replace(/ڈھ/g, 'ढ')
        .replace(/کھ/g, 'ख')
        .replace(/گھ/g, 'घ')
        .replace(/ڑھ/g, 'ढ़');

      let out = '';
      const chars = [...c];
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (i === 0 && ch === 'ا') {
          out += 'अ';
        } else if (URDU_CHAR_TO_DEVANAGARI[ch] !== undefined) {
          out += URDU_CHAR_TO_DEVANAGARI[ch];
        } else {
          out += ch;
        }
      }

      return `${lead}${out}${trail}`;
    })
    .join('');
}

/**
 * Phonetic Devanagari -> Natural Hinglish converter for a single token.
 */
function transliterateDevanagariWord(word: string): string {
  const dictHit = HINGLISH_DICT[word];
  if (dictHit) return dictHit;

  const chars = [...word];
  let out = '';

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (ch === DANDA) {
      out += '.';
      continue;
    }
    if (DEVANAGARI_DIGITS[ch]) {
      out += DEVANAGARI_DIGITS[ch];
      continue;
    }
    if (INDEPENDENT_VOWELS[ch]) {
      out += INDEPENDENT_VOWELS[ch];
      continue;
    }
    if (ch === ANUSVARA || ch === CHANDRABINDU) {
      const next = chars[i + 1];
      // Use 'm' before labial consonants (p, b, bh, m)
      const isLabial =
        next === 'प' || next === 'फ' || next === 'ब' || next === 'भ' || next === 'म';
      out += isLabial ? 'm' : 'n';
      continue;
    }
    if (ch === VISARGA) {
      out += 'h';
      continue;
    }

    if (CONSONANTS[ch]) {
      let base = CONSONANTS[ch];

      // Handle combining nukta (e.g. ज + ़ -> z, फ + ़ -> f)
      if (chars[i + 1] === NUKTA) {
        if (NUKTA_MAP[ch]) base = NUKTA_MAP[ch];
        i++;
      }

      // Common conjuncts (क्ष -> ksh, त्र -> tr, ज्ञ -> gy)
      if (ch === 'क' && chars[i + 1] === HALANT && chars[i + 2] === 'ष') {
        base = 'ksh';
        i += 2;
      } else if (ch === 'ज' && chars[i + 1] === HALANT && chars[i + 2] === 'ञ') {
        base = 'gy';
        i += 2;
      }

      const next = chars[i + 1];

      if (next === HALANT) {
        // Explicit virama: suppress inherent schwa
        out += base;
        i++;
      } else if (next && MATRAS[next]) {
        // Explicit vowel sign
        out += base + MATRAS[next];
        i++;
      } else {
        // Inherent schwa 'a': drop on word-final consonant for natural Hindi pronunciation
        const isLastChar = i === chars.length - 1;
        const nextIsPunct = Boolean(next && !DEVANAGARI_REGEX.test(next));
        if (isLastChar || nextIsPunct) {
          out += base;
        } else {
          out += base + 'a';
        }
      }
      continue;
    }

    // Keep Latin characters, punctuation, emojis as-is
    out += ch;
  }

  return out;
}

/**
 * Converts a Devanagari or Urdu word or phrase into clean natural Hinglish (Latin alphabet).
 * Preserves surrounding punctuation (commas, exclamation marks, quotes).
 */
export function toNaturalHinglish(text: string): string {
  if (!text || (!hasDevanagari(text) && !hasArabicOrUrdu(text))) return text;

  // If text contains any Urdu/Arabic script, normalize it to Devanagari first
  const normalizedText = hasArabicOrUrdu(text) ? urduToDevanagari(text) : text;

  return normalizedText
    .replace(/।/g, '.')
    .split(/(\s+)/)
    .map((part) => {
      if (!part.trim() || !hasDevanagari(part)) return part;
      // Separate leading/trailing punctuation so dictionary lookup matches cleanly
      const match = part.match(/^([^\u0900-\u097Fa-zA-Z0-9]*)([\u0900-\u097Fa-zA-Z0-9]+)([^\u0900-\u097Fa-zA-Z0-9]*)$/);
      if (!match) return transliterateDevanagariWord(part);
      const [, lead, core, trail] = match;
      return `${lead}${transliterateDevanagariWord(core)}${trail}`;
    })
    .join('');
}

export const DEMO_HINGLISH_WORDS: RawWord[] = [
  { word: 'Ruko', start: 0.1, end: 0.5 },
  { word: 'bhai!', start: 0.55, end: 0.95 },
  { word: 'Ye', start: 1.0, end: 1.25 },
  { word: 'viral', start: 1.3, end: 1.75 },
  { word: 'caption', start: 1.85, end: 2.25 },
  { word: 'hack', start: 2.3, end: 2.7 },
  { word: 'tumhari', start: 2.8, end: 3.25 },
  { word: 'Reels', start: 3.3, end: 3.7 },
  { word: 'growth', start: 3.75, end: 4.2 },
  { word: 'explode', start: 4.25, end: 4.75 },
  { word: 'kar', start: 4.8, end: 5.05 },
  { word: 'dega!', start: 5.1, end: 5.6 },
  { word: 'Maine', start: 5.8, end: 6.15 },
  { word: 'bas', start: 6.2, end: 6.5 },
  { word: 'video', start: 6.55, end: 6.95 },
  { word: 'upload', start: 7.0, end: 7.45 },
  { word: 'kiya,', start: 7.5, end: 7.9 },
  { word: 'aur', start: 8.0, end: 8.25 },
  { word: 'literally', start: 8.3, end: 8.8 },
  { word: 'ek', start: 8.85, end: 9.05 },
  { word: 'minute', start: 9.1, end: 9.5 },
  { word: 'mein', start: 9.55, end: 9.8 },
  { word: 'ready!', start: 9.85, end: 10.35 },
];

export const DEMO_HINDI_WORDS: RawWord[] = [
  { word: 'रुको', start: 0.1, end: 0.5 },
  { word: 'भाई!', start: 0.55, end: 0.95 },
  { word: 'ये', start: 1.0, end: 1.25 },
  { word: 'वायरल', start: 1.3, end: 1.75 },
  { word: 'कैप्शन', start: 1.85, end: 2.25 },
  { word: 'हैक', start: 2.3, end: 2.7 },
  { word: 'तुम्हारी', start: 2.8, end: 3.25 },
  { word: 'रील्स', start: 3.3, end: 3.7 },
  { word: 'ग्रोथ', start: 3.75, end: 4.2 },
  { word: 'एक्सप्लोड', start: 4.25, end: 4.75 },
  { word: 'कर', start: 4.8, end: 5.05 },
  { word: 'देगा!', start: 5.1, end: 5.6 },
  { word: 'मैंने', start: 5.8, end: 6.15 },
  { word: 'बस', start: 6.2, end: 6.5 },
  { word: 'वीडियो', start: 6.55, end: 6.95 },
  { word: 'अपलोड', start: 7.0, end: 7.45 },
  { word: 'किया,', start: 7.5, end: 7.9 },
  { word: 'और', start: 8.0, end: 8.25 },
  { word: 'लिटरली', start: 8.3, end: 8.8 },
  { word: 'एक', start: 8.85, end: 9.05 },
  { word: 'मिनट', start: 9.1, end: 9.5 },
  { word: 'में', start: 9.55, end: 9.8 },
  { word: 'रेडी!', start: 9.85, end: 10.35 },
];
