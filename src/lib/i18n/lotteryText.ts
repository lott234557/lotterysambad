/**
 * Localised wording for the all-India lottery comparison (table cells, chart labels, state names).
 * Server-only data – kept out of the main dictionaries so client bundles stay small.
 */
import type { DrawKey, LotteryId, PrizeKey } from "../lotteries";
import type { Locale } from "./config";

type Row = { name: string; times: string; ticket: string; top: string; bumper: string };

export type LotteryText = {
  rows: Record<LotteryId, Row>;
  prizes: Record<PrizeKey, string>;
  draws: Record<DrawKey, string>;
  /** English state name -> localised name */
  states: Record<string, string>;
  /** Kerala weekly lottery names (optional localisation) */
  kerala?: Record<string, string>;
};

const en: LotteryText = {
  rows: {
    sambad: { name: "Lottery Sambad (Dear) – Nagaland", times: "1:00 PM · 8:00 PM", ticket: "₹6", top: "₹1 Crore", bumper: "₹3 Crore (Dear Puja Bumper)" },
    sikkim: { name: "Dear Lottery – Sikkim", times: "6:00 PM", ticket: "₹6", top: "₹1 Crore", bumper: "—" },
    kerala: { name: "Kerala State Lotteries", times: "3:00 PM", ticket: "₹50", top: "₹1 Crore", bumper: "₹30 Crore (Thiruvonam Bumper 2026)" },
    punjab: { name: "Punjab State Lotteries", times: "Bumper & monthly draws", ticket: "₹500 (bumpers)", top: "Varies by scheme", bumper: "₹11 Crore (Diwali Bumper 2025)" },
    westbengal: { name: "West Bengal State Lottery", times: "4:00 PM", ticket: "From ₹6", top: "Up to ₹1 Crore", bumper: "6 festival bumpers a year" },
    maharashtra: { name: "Maharashtra State Lottery", times: "Weekly & monthly schemes", ticket: "Varies by scheme", top: "Varies by scheme", bumper: "Festival bumpers" },
  },
  prizes: {
    thiruvonam: "Kerala Thiruvonam Bumper",
    xmas: "Kerala Christmas–New Year Bumper",
    vishu: "Kerala Vishu Bumper",
    pooja: "Kerala Pooja Bumper",
    pbDiwali: "Punjab Diwali Bumper",
    pbLohri: "Punjab Lohri Bumper",
    summer: "Kerala Summer Bumper",
    monsoon: "Kerala Monsoon Bumper",
    pbRakhi: "Punjab Rakhi Bumper",
    dearPuja: "Nagaland Dear Puja Bumper",
    sambadDaily: "Lottery Sambad daily draw",
    keralaWeekly: "Kerala weekly draw",
  },
  draws: { s1: "Lottery Sambad 1 PM", kerala: "Kerala Lottery", wb: "West Bengal Lottery", s6: "Lottery Sambad 6 PM", s8: "Lottery Sambad 8 PM" },
  states: {},
};

const hi: LotteryText = {
  rows: {
    sambad: { name: "लॉटरी संबाद (डियर) – नागालैंड", times: "1:00 PM · 8:00 PM", ticket: "₹6", top: "₹1 करोड़", bumper: "₹3 करोड़ (डियर पूजा बंपर)" },
    sikkim: { name: "डियर लॉटरी – सिक्किम", times: "6:00 PM", ticket: "₹6", top: "₹1 करोड़", bumper: "—" },
    kerala: { name: "केरल राज्य लॉटरी", times: "3:00 PM", ticket: "₹50", top: "₹1 करोड़", bumper: "₹30 करोड़ (तिरुवोणम बंपर 2026)" },
    punjab: { name: "पंजाब राज्य लॉटरी", times: "बंपर और मासिक ड्रॉ", ticket: "₹500 (बंपर)", top: "योजना के अनुसार", bumper: "₹11 करोड़ (दिवाली बंपर 2025)" },
    westbengal: { name: "पश्चिम बंगाल राज्य लॉटरी", times: "4:00 PM", ticket: "₹6 से", top: "₹1 करोड़ तक", bumper: "साल में 6 त्योहारी बंपर" },
    maharashtra: { name: "महाराष्ट्र राज्य लॉटरी", times: "साप्ताहिक और मासिक योजनाएं", ticket: "योजना के अनुसार", top: "योजना के अनुसार", bumper: "त्योहारी बंपर" },
  },
  prizes: {
    thiruvonam: "केरल तिरुवोणम बंपर",
    xmas: "केरल क्रिसमस–न्यू ईयर बंपर",
    vishu: "केरल विशु बंपर",
    pooja: "केरल पूजा बंपर",
    pbDiwali: "पंजाब दिवाली बंपर",
    pbLohri: "पंजाब लोहड़ी बंपर",
    summer: "केरल समर बंपर",
    monsoon: "केरल मानसून बंपर",
    pbRakhi: "पंजाब राखी बंपर",
    dearPuja: "नागालैंड डियर पूजा बंपर",
    sambadDaily: "लॉटरी संबाद रोज़ाना ड्रॉ",
    keralaWeekly: "केरल साप्ताहिक ड्रॉ",
  },
  draws: { s1: "लॉटरी संबाद 1 PM", kerala: "केरल लॉटरी", wb: "पश्चिम बंगाल लॉटरी", s6: "लॉटरी संबाद 6 PM", s8: "लॉटरी संबाद 8 PM" },
  states: {
    "Arunachal Pradesh": "अरुणाचल प्रदेश",
    Assam: "असम",
    Goa: "गोवा",
    Kerala: "केरल",
    "Madhya Pradesh": "मध्य प्रदेश",
    Maharashtra: "महाराष्ट्र",
    Manipur: "मणिपुर",
    Meghalaya: "मेघालय",
    Mizoram: "मिज़ोरम",
    Nagaland: "नागालैंड",
    Punjab: "पंजाब",
    Sikkim: "सिक्किम",
    "West Bengal": "पश्चिम बंगाल",
    "Andhra Pradesh": "आंध्र प्रदेश",
    Bihar: "बिहार",
    Chhattisgarh: "छत्तीसगढ़",
    Gujarat: "गुजरात",
    Haryana: "हरियाणा",
    Jharkhand: "झारखंड",
    Karnataka: "कर्नाटक",
    Odisha: "ओडिशा",
    Rajasthan: "राजस्थान",
    "Tamil Nadu": "तमिलनाडु",
    Telangana: "तेलंगाना",
    Tripura: "त्रिपुरा",
    Uttarakhand: "उत्तराखंड",
    "Uttar Pradesh": "उत्तर प्रदेश",
  },
};

const bn: LotteryText = {
  rows: {
    sambad: { name: "লটারি সংবাদ (ডিয়ার) – নাগাল্যান্ড", times: "1:00 PM · 8:00 PM", ticket: "₹6", top: "₹1 কোটি", bumper: "₹3 কোটি (ডিয়ার পুজো বাম্পার)" },
    sikkim: { name: "ডিয়ার লটারি – সিকিম", times: "6:00 PM", ticket: "₹6", top: "₹1 কোটি", bumper: "—" },
    kerala: { name: "কেরালা রাজ্য লটারি", times: "3:00 PM", ticket: "₹50", top: "₹1 কোটি", bumper: "₹30 কোটি (থিরুভোনম বাম্পার 2026)" },
    punjab: { name: "পাঞ্জাব রাজ্য লটারি", times: "বাম্পার ও মাসিক ড্র", ticket: "₹500 (বাম্পার)", top: "স্কিম অনুযায়ী", bumper: "₹11 কোটি (দীপাবলি বাম্পার 2025)" },
    westbengal: { name: "পশ্চিমবঙ্গ রাজ্য লটারি", times: "4:00 PM", ticket: "₹6 থেকে", top: "₹1 কোটি পর্যন্ত", bumper: "বছরে 6টি উৎসব বাম্পার" },
    maharashtra: { name: "মহারাষ্ট্র রাজ্য লটারি", times: "সাপ্তাহিক ও মাসিক স্কিম", ticket: "স্কিম অনুযায়ী", top: "স্কিম অনুযায়ী", bumper: "উৎসব বাম্পার" },
  },
  prizes: {
    thiruvonam: "কেরালা থিরুভোনম বাম্পার",
    xmas: "কেরালা ক্রিসমাস–নিউ ইয়ার বাম্পার",
    vishu: "কেরালা বিশু বাম্পার",
    pooja: "কেরালা পুজো বাম্পার",
    pbDiwali: "পাঞ্জাব দীপাবলি বাম্পার",
    pbLohri: "পাঞ্জাব লোহরি বাম্পার",
    summer: "কেরালা সামার বাম্পার",
    monsoon: "কেরালা মনসুন বাম্পার",
    pbRakhi: "পাঞ্জাব রাখি বাম্পার",
    dearPuja: "নাগাল্যান্ড ডিয়ার পুজো বাম্পার",
    sambadDaily: "লটারি সংবাদ দৈনিক ড্র",
    keralaWeekly: "কেরালা সাপ্তাহিক ড্র",
  },
  draws: { s1: "লটারি সংবাদ 1 PM", kerala: "কেরালা লটারি", wb: "পশ্চিমবঙ্গ লটারি", s6: "লটারি সংবাদ 6 PM", s8: "লটারি সংবাদ 8 PM" },
  states: {
    "Arunachal Pradesh": "অরুণাচল প্রদেশ",
    Assam: "অসম",
    Goa: "গোয়া",
    Kerala: "কেরালা",
    "Madhya Pradesh": "মধ্যপ্রদেশ",
    Maharashtra: "মহারাষ্ট্র",
    Manipur: "মণিপুর",
    Meghalaya: "মেঘালয়",
    Mizoram: "মিজোরাম",
    Nagaland: "নাগাল্যান্ড",
    Punjab: "পাঞ্জাব",
    Sikkim: "সিকিম",
    "West Bengal": "পশ্চিমবঙ্গ",
    "Andhra Pradesh": "অন্ধ্রপ্রদেশ",
    Bihar: "বিহার",
    Chhattisgarh: "ছত্তিশগড়",
    Gujarat: "গুজরাট",
    Haryana: "হরিয়ানা",
    Jharkhand: "ঝাড়খণ্ড",
    Karnataka: "কর্ণাটক",
    Odisha: "ওড়িশা",
    Rajasthan: "রাজস্থান",
    "Tamil Nadu": "তামিলনাড়ু",
    Telangana: "তেলেঙ্গানা",
    Tripura: "ত্রিপুরা",
    Uttarakhand: "উত্তরাখণ্ড",
    "Uttar Pradesh": "উত্তরপ্রদেশ",
  },
};

const ml: LotteryText = {
  rows: {
    sambad: { name: "ലോട്ടറി സംബാദ് (ഡിയർ) – നാഗാലാൻഡ്", times: "1:00 PM · 8:00 PM", ticket: "₹6", top: "₹1 കോടി", bumper: "₹3 കോടി (ഡിയർ പൂജ ബമ്പർ)" },
    sikkim: { name: "ഡിയർ ലോട്ടറി – സിക്കിം", times: "6:00 PM", ticket: "₹6", top: "₹1 കോടി", bumper: "—" },
    kerala: { name: "കേരള ഭാഗ്യക്കുറി", times: "3:00 PM", ticket: "₹50", top: "₹1 കോടി", bumper: "₹30 കോടി (തിരുവോണം ബമ്പർ 2026)" },
    punjab: { name: "പഞ്ചാബ് സംസ്ഥാന ലോട്ടറി", times: "ബമ്പർ, പ്രതിമാസ നറുക്കെടുപ്പുകൾ", ticket: "₹500 (ബമ്പർ)", top: "പദ്ധതി അനുസരിച്ച്", bumper: "₹11 കോടി (ദീപാവലി ബമ്പർ 2025)" },
    westbengal: { name: "പശ്ചിമ ബംഗാൾ സംസ്ഥാന ലോട്ടറി", times: "4:00 PM", ticket: "₹6 മുതൽ", top: "₹1 കോടി വരെ", bumper: "വർഷം 6 ഉത്സവ ബമ്പറുകൾ" },
    maharashtra: { name: "മഹാരാഷ്ട്ര സംസ്ഥാന ലോട്ടറി", times: "പ്രതിവാര, പ്രതിമാസ പദ്ധതികൾ", ticket: "പദ്ധതി അനുസരിച്ച്", top: "പദ്ധതി അനുസരിച്ച്", bumper: "ഉത്സവ ബമ്പറുകൾ" },
  },
  prizes: {
    thiruvonam: "കേരള തിരുവോണം ബമ്പർ",
    xmas: "കേരള ക്രിസ്മസ്–പുതുവത്സര ബമ്പർ",
    vishu: "കേരള വിഷു ബമ്പർ",
    pooja: "കേരള പൂജ ബമ്പർ",
    pbDiwali: "പഞ്ചാബ് ദീപാവലി ബമ്പർ",
    pbLohri: "പഞ്ചാബ് ലോഹ്രി ബമ്പർ",
    summer: "കേരള സമ്മർ ബമ്പർ",
    monsoon: "കേരള മൺസൂൺ ബമ്പർ",
    pbRakhi: "പഞ്ചാബ് രാഖി ബമ്പർ",
    dearPuja: "നാഗാലാൻഡ് ഡിയർ പൂജ ബമ്പർ",
    sambadDaily: "ലോട്ടറി സംബാദ് പ്രതിദിന നറുക്കെടുപ്പ്",
    keralaWeekly: "കേരള പ്രതിവാര നറുക്കെടുപ്പ്",
  },
  draws: { s1: "ലോട്ടറി സംബാദ് 1 PM", kerala: "കേരള ലോട്ടറി", wb: "പശ്ചിമ ബംഗാൾ ലോട്ടറി", s6: "ലോട്ടറി സംബാദ് 6 PM", s8: "ലോട്ടറി സംബാദ് 8 PM" },
  states: {
    "Arunachal Pradesh": "അരുണാചൽ പ്രദേശ്",
    Assam: "അസം",
    Goa: "ഗോവ",
    Kerala: "കേരളം",
    "Madhya Pradesh": "മധ്യപ്രദേശ്",
    Maharashtra: "മഹാരാഷ്ട്ര",
    Manipur: "മണിപ്പൂർ",
    Meghalaya: "മേഘാലയ",
    Mizoram: "മിസോറം",
    Nagaland: "നാഗാലാൻഡ്",
    Punjab: "പഞ്ചാബ്",
    Sikkim: "സിക്കിം",
    "West Bengal": "പശ്ചിമ ബംഗാൾ",
    "Andhra Pradesh": "ആന്ധ്രാപ്രദേശ്",
    Bihar: "ബിഹാർ",
    Chhattisgarh: "ഛത്തീസ്ഗഢ്",
    Gujarat: "ഗുജറാത്ത്",
    Haryana: "ഹരിയാന",
    Jharkhand: "ഝാർഖണ്ഡ്",
    Karnataka: "കർണാടക",
    Odisha: "ഒഡീഷ",
    Rajasthan: "രാജസ്ഥാൻ",
    "Tamil Nadu": "തമിഴ്നാട്",
    Telangana: "തെലങ്കാന",
    Tripura: "ത്രിപുര",
    Uttarakhand: "ഉത്തരാഖണ്ഡ്",
    "Uttar Pradesh": "ഉത്തർപ്രദേശ്",
  },
  kerala: {
    Bhagyathara: "ഭാഗ്യതാര",
    "Sthree Sakthi": "സ്ത്രീ ശക്തി",
    Dhanalekshmi: "ധനലക്ഷ്മി",
    "Karunya Plus": "കാരുണ്യ പ്ലസ്",
    "Suvarna Keralam": "സുവർണ്ണ കേരളം",
    Karunya: "കാരുണ്യ",
    Samrudhi: "സമൃദ്ധി",
  },
};

const ALL: Record<Locale, LotteryText> = { en, hi, bn, ml };

export const lotteryText = (lang: Locale) => ALL[lang] ?? en;

/** Localised Indian state name (falls back to English). */
export const stateName = (lang: Locale, name: string) => ALL[lang]?.states[name] ?? name;
