/**
 * Text for the Kerala / Punjab / Maharashtra / West Bengal result pages in every language.
 * Placeholders: {name} {date} {time} {state} {first}. Rich text: **bold** and [link](/path).
 */
import type { OtherId } from "../others/config";
import type { Locale } from "./config";

type QA = { q: string; a: string };
type LotteryCopy = { name: string; intro: [string, string]; faq: QA[] };

export type OtherText = {
  ordinals: string[];
  cons: string;
  ui: {
    liveEyebrow: string;
    eyebrow: string;
    todayTitle: string;
    dateTitle: string;
    todaySub: string;
    dateSub: string;
    waitTitle: string;
    startsIn: string;
    expected: string;
    live: string;
    auto: string;
    notAvail: string;
    latestTitle: string;
    previousTitle: string;
    todaysDraws: string;
    drawsOn: string;
    imageNote: string;
    finderTitle: string;
    finderPh: string;
    scheduleTitle: string;
    bumpersTitle: string;
    aboutTitle: string;
    verify: string;
    metaToday: string;
    metaTodayDesc: string;
    metaFirst: string;
    metaDate: string;
    metaDateDesc: string;
    dayCol: string;
    lotteryCol: string;
    wbDearTitle: string;
    wbOfficialTitle: string;
  };
  lotteries: Record<OtherId, LotteryCopy>;
};

const en: OtherText = {
  ordinals: ["1st Prize", "2nd Prize", "3rd Prize", "4th Prize", "5th Prize", "6th Prize", "7th Prize", "8th Prize", "9th Prize", "10th Prize", "11th Prize", "12th Prize"],
  cons: "Consolation Prize",
  ui: {
    liveEyebrow: "Live · {time} draw",
    eyebrow: "{state} State Lottery",
    todayTitle: "{name} Result Today – {date}",
    dateTitle: "{name} Result {date}",
    todaySub: "{name} result of {date} – complete prize list and winning numbers, updated automatically after the draw.",
    dateSub: "{name} result of {date} – complete list of winning numbers.",
    waitTitle: "Today's result is not out yet",
    startsIn: "Draw starts in",
    expected: "Result expected after {time} IST",
    live: "Live · Result being published",
    auto: "This page updates automatically – no need to refresh.",
    notAvail: "No result was published for this date.",
    latestTitle: "Latest result – {date}",
    previousTitle: "Previous {name} results",
    todaysDraws: "Today's draws",
    drawsOn: "Draws on {date}",
    imageNote: "The complete result is in the official result sheet below.",
    finderTitle: "Check your ticket",
    finderPh: "Full ticket number or last 4 digits",
    scheduleTitle: "Draw schedule",
    bumpersTitle: "Bumper draws",
    aboutTitle: "About {name}",
    verify: "Always verify with the official Government Gazette before claiming a prize.",
    metaToday: "{name} Result Today {date} – Live Winning Numbers",
    metaTodayDesc: "{name} result today {date}: {first}complete prize list, winning numbers and result image, updated live.",
    metaFirst: "1st prize {first}. ",
    metaDate: "{name} Result {date} – All Winning Numbers",
    metaDateDesc: "{name} result of {date}: {first}complete list of winning numbers.",
    dayCol: "Day",
    lotteryCol: "Lottery",
    wbDearTitle: "Today's Dear lottery results",
    wbOfficialTitle: "Official West Bengal State Lottery draws",
  },
  lotteries: {
    kerala: {
      name: "Kerala Lottery",
      intro: [
        "The **Kerala State Lotteries** department holds one draw every day at **3:00 PM** at Gorky Bhavan, Thiruvananthapuram. Each day has its own lottery – Bhagyathara (Monday), Sthree Sakthi (Tuesday), Dhanalekshmi (Wednesday), Karunya Plus (Thursday), Suvarna Keralam (Friday), Karunya (Saturday) and Samrudhi (Sunday) – with a **₹1 crore first prize** and a ₹50 ticket.",
        "Results start coming in from about 3:00 PM and the complete list with all nine prize tiers is usually ready by 4:30 PM. This page fetches it automatically; ticket numbers are shown with their series letters (for example RA 494226) and the lower prizes by their last four digits.",
      ],
      faq: [
        { q: "What time is the Kerala lottery result declared?", a: "The draw is held at 3:00 PM every day. The first prizes are known within minutes and the complete official result is normally published by 4:30 PM." },
        { q: "How do I check my Kerala lottery ticket?", a: "Match the full ticket number (series + 6 digits) for the 1st, 2nd and 3rd prizes and the consolation prize. For the 4th prize and below, match the last four digits of your ticket." },
        { q: "How do I claim a Kerala lottery prize?", a: "Prizes up to ₹5,000 can be claimed from any authorised lottery shop in Kerala. Larger prizes must be claimed at the Directorate of State Lotteries or a district lottery office with the original ticket and ID proof within 30 days." },
      ],
    },
    punjab: {
      name: "Punjab State Lottery",
      intro: [
        "**Punjab State Lotteries** run the daily **Dear 50** weekly draws at **6:30 PM** – Beast (Monday), Bronco (Tuesday), Buster (Wednesday), Chief (Thursday), Colt (Friday), Jackal (Saturday) and Ranger (Sunday) – plus monthly Dear 20, Dear 100, Dear 200 and Dear 500 draws and big festival bumpers such as the Lohri, Holi, Vaisakhi, Rakhi, Puja and Diwali bumpers.",
        "Punjab publishes its results as an official result sheet, so each draw on this page shows the first prize and the complete result image, fetched automatically after the draw.",
      ],
      faq: [
        { q: "What time is the Punjab State Dear 50 result out?", a: "The Dear 50 weekly draw is held every day at 6:30 PM and the result sheet is usually published within an hour." },
        { q: "Which Punjab lottery has the biggest prize?", a: "The festival bumpers – the Diwali Bumper offered ₹11 crore in 2025 and the Lohri Bumper ₹10 crore. Monthly draws such as Dear 200 have first prizes of around ₹1.5 crore." },
        { q: "How can I claim a Punjab lottery prize?", a: "Small prizes (up to ₹10,000) are paid by authorised sellers. Bigger prizes are claimed from the Directorate of Punjab State Lotteries with the original ticket, ID proof and the claim form." },
      ],
    },
    maharashtra: {
      name: "Maharashtra Lottery",
      intro: [
        "The **Maharashtra State Lottery** runs several small weekly draws every afternoon, usually between **4:15 PM and 5:00 PM** – Vaibhavlaxmi, Sahyadri, Gajlaxmi, Ganeshlaxmi, Akarshak and others – plus monthly lotteries and festival bumpers.",
        "All draws of the day are listed on this page with the complete prize list. Tickets are written as series-number, for example VL-08-6375; lower prizes are matched on the last four digits.",
      ],
      faq: [
        { q: "What time are Maharashtra lottery results declared?", a: "Most weekly draws are held between 4:15 PM and 5:00 PM and the results are published shortly after. Monthly and bumper draws follow their own schedule." },
        { q: "How do I check my Maharashtra lottery ticket?", a: "Match the full ticket number for the first prize and the consolation prizes; for lower prizes match the last four digits as shown in each list." },
        { q: "Is the Maharashtra lottery legal?", a: "Yes. Maharashtra is one of the states where the state government runs its own lottery. Buy tickets only from authorised sellers." },
      ],
    },
    westbengal: {
      name: "West Bengal State Lottery",
      intro: [
        "When people in West Bengal search for the **lottery result**, they usually mean the daily **Dear lottery** draws at **1 PM, 6 PM and 8 PM** that are sold across the state. This page shows those results live, updated automatically as soon as each draw is declared.",
        "The West Bengal government also runs its own State Lottery with weekly draws and festival bumpers (New Year, Holi, Nababarsha, Rathayatra, Puja and Diwali). When an official West Bengal draw is published it is listed below as well.",
      ],
      faq: [
        { q: "What is the West Bengal lottery result time?", a: "The Dear draws sold in West Bengal are held at 1 PM, 6 PM and 8 PM; results come out within 5–15 minutes of each draw." },
        { q: "Is lottery legal in West Bengal?", a: "Yes. West Bengal is one of the 13 states where lotteries are legal, and the state runs its own lottery through the Directorate of State Lotteries." },
        { q: "Where can I see old West Bengal lottery results?", a: "Use the date search on this page, or open the [old results archive](/old-results) for any past date." },
      ],
    },
  },
};

const hi: OtherText = {
  ordinals: ["पहला इनाम", "दूसरा इनाम", "तीसरा इनाम", "चौथा इनाम", "पांचवां इनाम", "छठा इनाम", "सातवां इनाम", "आठवां इनाम", "नौवां इनाम", "दसवां इनाम", "ग्यारहवां इनाम", "बारहवां इनाम"],
  cons: "सांत्वना इनाम",
  ui: {
    liveEyebrow: "लाइव · {time} ड्रॉ",
    eyebrow: "{state} राज्य लॉटरी",
    todayTitle: "{name} रिजल्ट आज – {date}",
    dateTitle: "{name} रिजल्ट {date}",
    todaySub: "{date} का {name} रिजल्ट – पूरी इनाम सूची और विजेता नंबर, ड्रॉ के बाद अपने आप अपडेट।",
    dateSub: "{date} का {name} रिजल्ट – सभी विजेता नंबरों की पूरी सूची।",
    waitTitle: "आज का रिजल्ट अभी नहीं आया है",
    startsIn: "ड्रॉ शुरू होने में",
    expected: "रिजल्ट {time} IST के बाद अपेक्षित",
    live: "लाइव · रिजल्ट प्रकाशित हो रहा है",
    auto: "यह पेज अपने आप अपडेट होता है – रिफ्रेश करने की जरूरत नहीं।",
    notAvail: "इस तारीख का कोई रिजल्ट प्रकाशित नहीं हुआ।",
    latestTitle: "ताज़ा रिजल्ट – {date}",
    previousTitle: "पिछले {name} रिजल्ट",
    todaysDraws: "आज के ड्रॉ",
    drawsOn: "{date} के ड्रॉ",
    imageNote: "पूरा रिजल्ट नीचे आधिकारिक रिजल्ट शीट में है।",
    finderTitle: "अपना टिकट जांचें",
    finderPh: "पूरा टिकट नंबर या आखिरी 4 अंक",
    scheduleTitle: "ड्रॉ शेड्यूल",
    bumpersTitle: "बंपर ड्रॉ",
    aboutTitle: "{name} के बारे में",
    verify: "इनाम क्लेम करने से पहले आधिकारिक सरकारी गजट से मिलान जरूर करें।",
    metaToday: "{name} रिजल्ट आज {date} – लाइव विजेता नंबर",
    metaTodayDesc: "{name} रिजल्ट आज {date}: {first}पूरी इनाम सूची, विजेता नंबर और रिजल्ट इमेज, लाइव अपडेट।",
    metaFirst: "पहला इनाम {first}। ",
    metaDate: "{name} रिजल्ट {date} – सभी विजेता नंबर",
    metaDateDesc: "{date} का {name} रिजल्ट: {first}सभी विजेता नंबरों की पूरी सूची।",
    dayCol: "दिन",
    lotteryCol: "लॉटरी",
    wbDearTitle: "आज के डियर लॉटरी रिजल्ट",
    wbOfficialTitle: "पश्चिम बंगाल राज्य लॉटरी के आधिकारिक ड्रॉ",
  },
  lotteries: {
    kerala: {
      name: "केरल लॉटरी",
      intro: [
        "**केरल राज्य लॉटरी** विभाग हर दिन **दोपहर 3:00 बजे** तिरुवनंतपुरम के गोर्की भवन में एक ड्रॉ करता है। हर दिन की अपनी लॉटरी है – भाग्यधारा (सोमवार), स्त्री शक्ति (मंगलवार), धनलक्ष्मी (बुधवार), करुण्य प्लस (गुरुवार), सुवर्ण केरलम (शुक्रवार), करुण्य (शनिवार) और समृद्धि (रविवार) – **₹1 करोड़ पहला इनाम** और ₹50 का टिकट।",
        "रिजल्ट लगभग 3:00 बजे से आने लगते हैं और सभी नौ इनाम श्रेणियों वाली पूरी सूची आमतौर पर 4:30 बजे तक तैयार हो जाती है। यह पेज इसे अपने आप लाता है; टिकट नंबर सीरीज़ अक्षरों के साथ (जैसे RA 494226) और छोटे इनाम आखिरी चार अंकों से दिखाए जाते हैं।",
      ],
      faq: [
        { q: "केरल लॉटरी का रिजल्ट कितने बजे आता है?", a: "ड्रॉ हर दिन दोपहर 3:00 बजे होता है। पहले इनाम कुछ ही मिनटों में पता चल जाते हैं और पूरा आधिकारिक रिजल्ट आमतौर पर 4:30 बजे तक प्रकाशित हो जाता है।" },
        { q: "केरल लॉटरी टिकट कैसे जांचें?", a: "पहले, दूसरे, तीसरे और सांत्वना इनाम के लिए पूरा टिकट नंबर (सीरीज़ + 6 अंक) मिलाएं। चौथे और उससे नीचे के इनाम के लिए टिकट के आखिरी चार अंक मिलाएं।" },
        { q: "केरल लॉटरी का इनाम कैसे क्लेम करें?", a: "₹5,000 तक के इनाम केरल की किसी भी अधिकृत लॉटरी दुकान से मिल जाते हैं। बड़े इनाम के लिए 30 दिनों के भीतर मूल टिकट और पहचान पत्र के साथ राज्य लॉटरी निदेशालय या जिला लॉटरी कार्यालय में क्लेम करें।" },
      ],
    },
    punjab: {
      name: "पंजाब राज्य लॉटरी",
      intro: [
        "**पंजाब राज्य लॉटरी** हर दिन **शाम 6:30 बजे** **डियर 50** साप्ताहिक ड्रॉ करती है – बीस्ट (सोमवार), ब्रोंको (मंगलवार), बस्टर (बुधवार), चीफ (गुरुवार), कोल्ट (शुक्रवार), जैकल (शनिवार) और रेंजर (रविवार) – साथ में मासिक डियर 20, डियर 100, डियर 200 और डियर 500 ड्रॉ और लोहड़ी, होली, वैसाखी, राखी, पूजा और दिवाली जैसे बड़े त्योहारी बंपर।",
        "पंजाब अपने रिजल्ट आधिकारिक रिजल्ट शीट के रूप में जारी करता है, इसलिए इस पेज पर हर ड्रॉ का पहला इनाम और पूरी रिजल्ट इमेज दिखती है, जो ड्रॉ के बाद अपने आप लाई जाती है।",
      ],
      faq: [
        { q: "पंजाब राज्य डियर 50 का रिजल्ट कितने बजे आता है?", a: "डियर 50 साप्ताहिक ड्रॉ हर दिन शाम 6:30 बजे होता है और रिजल्ट शीट आमतौर पर एक घंटे के भीतर जारी हो जाती है।" },
        { q: "पंजाब की किस लॉटरी में सबसे बड़ा इनाम है?", a: "त्योहारी बंपर में – 2025 में दिवाली बंपर में ₹11 करोड़ और लोहड़ी बंपर में ₹10 करोड़ का इनाम था। डियर 200 जैसे मासिक ड्रॉ में पहला इनाम लगभग ₹1.5 करोड़ होता है।" },
        { q: "पंजाब लॉटरी का इनाम कैसे क्लेम करें?", a: "छोटे इनाम (₹10,000 तक) अधिकृत विक्रेता देते हैं। बड़े इनाम के लिए मूल टिकट, पहचान पत्र और क्लेम फॉर्म के साथ पंजाब राज्य लॉटरी निदेशालय में क्लेम करें।" },
      ],
    },
    maharashtra: {
      name: "महाराष्ट्र लॉटरी",
      intro: [
        "**महाराष्ट्र राज्य लॉटरी** हर दोपहर कई छोटे साप्ताहिक ड्रॉ करती है, आमतौर पर **4:15 से 5:00 बजे** के बीच – वैभवलक्ष्मी, सह्याद्री, गजलक्ष्मी, गणेशलक्ष्मी, आकर्षक और अन्य – साथ में मासिक लॉटरी और त्योहारी बंपर।",
        "दिन के सभी ड्रॉ इस पेज पर पूरी इनाम सूची के साथ दिखाए जाते हैं। टिकट सीरीज़-नंबर के रूप में लिखे जाते हैं, जैसे VL-08-6375; छोटे इनाम आखिरी चार अंकों से मिलाए जाते हैं।",
      ],
      faq: [
        { q: "महाराष्ट्र लॉटरी रिजल्ट कितने बजे आते हैं?", a: "ज्यादातर साप्ताहिक ड्रॉ 4:15 से 5:00 बजे के बीच होते हैं और रिजल्ट उसके तुरंत बाद आते हैं। मासिक और बंपर ड्रॉ का अपना अलग शेड्यूल होता है।" },
        { q: "महाराष्ट्र लॉटरी टिकट कैसे जांचें?", a: "पहले इनाम और सांत्वना इनाम के लिए पूरा टिकट नंबर मिलाएं; छोटे इनाम के लिए हर सूची में दिखाए अनुसार आखिरी चार अंक मिलाएं।" },
        { q: "क्या महाराष्ट्र लॉटरी कानूनी है?", a: "हां। महाराष्ट्र उन राज्यों में है जहां राज्य सरकार अपनी लॉटरी चलाती है। टिकट सिर्फ अधिकृत विक्रेताओं से खरीदें।" },
      ],
    },
    westbengal: {
      name: "पश्चिम बंगाल राज्य लॉटरी",
      intro: [
        "पश्चिम बंगाल में लोग जब **लॉटरी रिजल्ट** खोजते हैं, तो उनका मतलब आमतौर पर रोज़ाना **1 PM, 6 PM और 8 PM** के **डियर लॉटरी** ड्रॉ से होता है, जो पूरे राज्य में बिकते हैं। यह पेज इन रिजल्ट को लाइव दिखाता है, हर ड्रॉ घोषित होते ही अपने आप अपडेट।",
        "पश्चिम बंगाल सरकार साप्ताहिक ड्रॉ और त्योहारी बंपर (नया साल, होली, नबबर्ष, रथयात्रा, पूजा और दिवाली) के साथ अपनी राज्य लॉटरी भी चलाती है। जब कोई आधिकारिक पश्चिम बंगाल ड्रॉ प्रकाशित होता है, तो वह भी नीचे दिखाया जाता है।",
      ],
      faq: [
        { q: "पश्चिम बंगाल लॉटरी रिजल्ट का समय क्या है?", a: "पश्चिम बंगाल में बिकने वाले डियर ड्रॉ 1 PM, 6 PM और 8 PM पर होते हैं; रिजल्ट हर ड्रॉ के 5–15 मिनट के भीतर आ जाता है।" },
        { q: "क्या पश्चिम बंगाल में लॉटरी कानूनी है?", a: "हां। पश्चिम बंगाल उन 13 राज्यों में है जहां लॉटरी कानूनी है, और राज्य लॉटरी निदेशालय के ज़रिए अपनी लॉटरी चलाता है।" },
        { q: "पश्चिम बंगाल के पुराने लॉटरी रिजल्ट कहां देखें?", a: "इस पेज पर तारीख से खोजें या किसी भी पुरानी तारीख के लिए [पुराने रिजल्ट आर्काइव](/old-results) देखें।" },
      ],
    },
  },
};

const bn: OtherText = {
  ordinals: ["প্রথম পুরস্কার", "দ্বিতীয় পুরস্কার", "তৃতীয় পুরস্কার", "চতুর্থ পুরস্কার", "পঞ্চম পুরস্কার", "ষষ্ঠ পুরস্কার", "সপ্তম পুরস্কার", "অষ্টম পুরস্কার", "নবম পুরস্কার", "দশম পুরস্কার", "একাদশ পুরস্কার", "দ্বাদশ পুরস্কার"],
  cons: "সান্ত্বনা পুরস্কার",
  ui: {
    liveEyebrow: "লাইভ · {time} ড্র",
    eyebrow: "{state} রাজ্য লটারি",
    todayTitle: "{name} রেজাল্ট আজ – {date}",
    dateTitle: "{name} রেজাল্ট {date}",
    todaySub: "{date}-এর {name} রেজাল্ট – সম্পূর্ণ পুরস্কার তালিকা ও বিজয়ী নম্বর, ড্রয়ের পর নিজে থেকেই আপডেট।",
    dateSub: "{date}-এর {name} রেজাল্ট – সব বিজয়ী নম্বরের সম্পূর্ণ তালিকা।",
    waitTitle: "আজকের রেজাল্ট এখনও বেরোয়নি",
    startsIn: "ড্র শুরু হতে বাকি",
    expected: "রেজাল্ট {time} IST-এর পরে প্রত্যাশিত",
    live: "লাইভ · রেজাল্ট প্রকাশিত হচ্ছে",
    auto: "এই পেজ নিজে থেকেই আপডেট হয় – রিফ্রেশ করার দরকার নেই।",
    notAvail: "এই তারিখের কোনো রেজাল্ট প্রকাশিত হয়নি।",
    latestTitle: "সর্বশেষ রেজাল্ট – {date}",
    previousTitle: "আগের {name} রেজাল্ট",
    todaysDraws: "আজকের ড্র",
    drawsOn: "{date}-এর ড্র",
    imageNote: "সম্পূর্ণ রেজাল্ট নিচের সরকারি রেজাল্ট শিটে রয়েছে।",
    finderTitle: "আপনার টিকিট মেলান",
    finderPh: "সম্পূর্ণ টিকিট নম্বর বা শেষ 4 সংখ্যা",
    scheduleTitle: "ড্রয়ের সময়সূচি",
    bumpersTitle: "বাম্পার ড্র",
    aboutTitle: "{name} সম্পর্কে",
    verify: "পুরস্কার দাবি করার আগে অবশ্যই সরকারি গেজেটের সঙ্গে মিলিয়ে নিন।",
    metaToday: "{name} রেজাল্ট আজ {date} – লাইভ বিজয়ী নম্বর",
    metaTodayDesc: "{name} রেজাল্ট আজ {date}: {first}সম্পূর্ণ পুরস্কার তালিকা, বিজয়ী নম্বর ও রেজাল্ট ছবি, লাইভ আপডেট।",
    metaFirst: "প্রথম পুরস্কার {first}। ",
    metaDate: "{name} রেজাল্ট {date} – সব বিজয়ী নম্বর",
    metaDateDesc: "{date}-এর {name} রেজাল্ট: {first}সব বিজয়ী নম্বরের সম্পূর্ণ তালিকা।",
    dayCol: "দিন",
    lotteryCol: "লটারি",
    wbDearTitle: "আজকের ডিয়ার লটারি রেজাল্ট",
    wbOfficialTitle: "পশ্চিমবঙ্গ রাজ্য লটারির সরকারি ড্র",
  },
  lotteries: {
    kerala: {
      name: "কেরালা লটারি",
      intro: [
        "**কেরালা রাজ্য লটারি** দপ্তর প্রতিদিন **দুপুর 3:00টায়** তিরুবনন্তপুরমের গোর্কি ভবনে একটি ড্র করে। প্রতিটি দিনের নিজস্ব লটারি আছে – ভাগ্যধারা (সোমবার), স্ত্রী শক্তি (মঙ্গলবার), ধনলক্ষ্মী (বুধবার), করুণ্য প্লাস (বৃহস্পতিবার), সুবর্ণ কেরলম (শুক্রবার), করুণ্য (শনিবার) ও সমৃদ্ধি (রবিবার) – **₹1 কোটি প্রথম পুরস্কার** ও ₹50 টিকিট।",
        "রেজাল্ট প্রায় 3:00টা থেকে আসতে শুরু করে এবং নয়টি পুরস্কার স্তরের সম্পূর্ণ তালিকা সাধারণত 4:30-এর মধ্যে তৈরি হয়ে যায়। এই পেজ তা নিজে থেকেই নিয়ে আসে; টিকিট নম্বর সিরিজ অক্ষরসহ (যেমন RA 494226) এবং ছোট পুরস্কার শেষ চার সংখ্যায় দেখানো হয়।",
      ],
      faq: [
        { q: "কেরালা লটারির রেজাল্ট কটায় বেরোয়?", a: "ড্র প্রতিদিন দুপুর 3:00টায় হয়। প্রথম পুরস্কারগুলো কয়েক মিনিটেই জানা যায় এবং সম্পূর্ণ সরকারি রেজাল্ট সাধারণত 4:30-এর মধ্যে প্রকাশিত হয়।" },
        { q: "কেরালা লটারির টিকিট কীভাবে মেলাব?", a: "প্রথম, দ্বিতীয়, তৃতীয় ও সান্ত্বনা পুরস্কারের জন্য সম্পূর্ণ টিকিট নম্বর (সিরিজ + 6 সংখ্যা) মেলান। চতুর্থ ও তার নিচের পুরস্কারের জন্য টিকিটের শেষ চার সংখ্যা মেলান।" },
        { q: "কেরালা লটারির পুরস্কার কীভাবে দাবি করব?", a: "₹5,000 পর্যন্ত পুরস্কার কেরালার যেকোনো অনুমোদিত লটারি দোকান থেকে পাওয়া যায়। বড় পুরস্কারের জন্য 30 দিনের মধ্যে আসল টিকিট ও পরিচয়পত্রসহ রাজ্য লটারি অধিদপ্তর বা জেলা লটারি অফিসে দাবি করুন।" },
      ],
    },
    punjab: {
      name: "পাঞ্জাব রাজ্য লটারি",
      intro: [
        "**পাঞ্জাব রাজ্য লটারি** প্রতিদিন **সন্ধ্যা 6:30-এ** **ডিয়ার 50** সাপ্তাহিক ড্র করে – বিস্ট (সোমবার), ব্রঙ্কো (মঙ্গলবার), বাস্টার (বুধবার), চিফ (বৃহস্পতিবার), কোল্ট (শুক্রবার), জ্যাকাল (শনিবার) ও রেঞ্জার (রবিবার) – সঙ্গে মাসিক ডিয়ার 20, ডিয়ার 100, ডিয়ার 200 ও ডিয়ার 500 ড্র এবং লোহরি, হোলি, বৈশাখী, রাখি, পুজো ও দীপাবলির মতো বড় উৎসব বাম্পার।",
        "পাঞ্জাব তাদের রেজাল্ট সরকারি রেজাল্ট শিট হিসেবে প্রকাশ করে, তাই এই পেজে প্রতিটি ড্রয়ের প্রথম পুরস্কার ও সম্পূর্ণ রেজাল্ট ছবি দেখা যায়, যা ড্রয়ের পর নিজে থেকেই আনা হয়।",
      ],
      faq: [
        { q: "পাঞ্জাব রাজ্য ডিয়ার 50-এর রেজাল্ট কটায় বেরোয়?", a: "ডিয়ার 50 সাপ্তাহিক ড্র প্রতিদিন সন্ধ্যা 6:30-এ হয় এবং রেজাল্ট শিট সাধারণত এক ঘণ্টার মধ্যে প্রকাশিত হয়।" },
        { q: "পাঞ্জাবের কোন লটারিতে সবচেয়ে বড় পুরস্কার?", a: "উৎসব বাম্পারে – 2025-এ দীপাবলি বাম্পারে ₹11 কোটি এবং লোহরি বাম্পারে ₹10 কোটি পুরস্কার ছিল। ডিয়ার 200-এর মতো মাসিক ড্রয়ে প্রথম পুরস্কার প্রায় ₹1.5 কোটি।" },
        { q: "পাঞ্জাব লটারির পুরস্কার কীভাবে দাবি করব?", a: "ছোট পুরস্কার (₹10,000 পর্যন্ত) অনুমোদিত বিক্রেতারা দেন। বড় পুরস্কারের জন্য আসল টিকিট, পরিচয়পত্র ও দাবি ফর্মসহ পাঞ্জাব রাজ্য লটারি অধিদপ্তরে দাবি করুন।" },
      ],
    },
    maharashtra: {
      name: "মহারাষ্ট্র লটারি",
      intro: [
        "**মহারাষ্ট্র রাজ্য লটারি** প্রতি বিকেলে কয়েকটি ছোট সাপ্তাহিক ড্র করে, সাধারণত **4:15 থেকে 5:00-এর** মধ্যে – বৈভবলক্ষ্মী, সহ্যাদ্রি, গজলক্ষ্মী, গণেশলক্ষ্মী, আকর্ষক ও অন্যান্য – সঙ্গে মাসিক লটারি ও উৎসব বাম্পার।",
        "দিনের সব ড্র এই পেজে সম্পূর্ণ পুরস্কার তালিকাসহ দেখানো হয়। টিকিট সিরিজ-নম্বর আকারে লেখা হয়, যেমন VL-08-6375; ছোট পুরস্কার শেষ চার সংখ্যায় মেলানো হয়।",
      ],
      faq: [
        { q: "মহারাষ্ট্র লটারির রেজাল্ট কটায় বেরোয়?", a: "বেশিরভাগ সাপ্তাহিক ড্র 4:15 থেকে 5:00-এর মধ্যে হয় এবং রেজাল্ট তার পরপরই প্রকাশিত হয়। মাসিক ও বাম্পার ড্রয়ের নিজস্ব সময়সূচি আছে।" },
        { q: "মহারাষ্ট্র লটারির টিকিট কীভাবে মেলাব?", a: "প্রথম পুরস্কার ও সান্ত্বনা পুরস্কারের জন্য সম্পূর্ণ টিকিট নম্বর মেলান; ছোট পুরস্কারের জন্য প্রতিটি তালিকায় যেমন দেখানো আছে সেভাবে শেষ চার সংখ্যা মেলান।" },
        { q: "মহারাষ্ট্র লটারি কি আইনসম্মত?", a: "হ্যাঁ। মহারাষ্ট্র সেই রাজ্যগুলোর একটি যেখানে রাজ্য সরকার নিজস্ব লটারি চালায়। শুধু অনুমোদিত বিক্রেতার কাছ থেকে টিকিট কিনুন।" },
      ],
    },
    westbengal: {
      name: "পশ্চিমবঙ্গ রাজ্য লটারি",
      intro: [
        "পশ্চিমবঙ্গে মানুষ যখন **লটারি রেজাল্ট** খোঁজেন, তখন সাধারণত বোঝানো হয় প্রতিদিনের **1 PM, 6 PM ও 8 PM**-এর **ডিয়ার লটারি** ড্র, যা গোটা রাজ্যে বিক্রি হয়। এই পেজ সেই রেজাল্ট লাইভ দেখায়, প্রতিটি ড্র ঘোষণার সঙ্গে সঙ্গে নিজে থেকেই আপডেট।",
        "পশ্চিমবঙ্গ সরকার সাপ্তাহিক ড্র ও উৎসব বাম্পার (ইংরেজি নববর্ষ, হোলি, বাংলা নববর্ষ, রথযাত্রা, পুজো ও দীপাবলি) নিয়ে নিজস্ব রাজ্য লটারিও চালায়। কোনো সরকারি পশ্চিমবঙ্গ ড্র প্রকাশিত হলে তা নিচেও দেখানো হয়।",
      ],
      faq: [
        { q: "পশ্চিমবঙ্গ লটারি রেজাল্টের সময় কী?", a: "পশ্চিমবঙ্গে বিক্রি হওয়া ডিয়ার ড্র 1 PM, 6 PM ও 8 PM-এ হয়; প্রতিটি ড্রয়ের 5–15 মিনিটের মধ্যে রেজাল্ট বেরোয়।" },
        { q: "পশ্চিমবঙ্গে লটারি কি আইনসম্মত?", a: "হ্যাঁ। পশ্চিমবঙ্গ সেই 13টি রাজ্যের একটি যেখানে লটারি আইনসম্মত, এবং রাজ্য লটারি অধিদপ্তরের মাধ্যমে রাজ্য নিজস্ব লটারি চালায়।" },
        { q: "পশ্চিমবঙ্গের পুরনো লটারি রেজাল্ট কোথায় দেখব?", a: "এই পেজে তারিখ দিয়ে খুঁজুন অথবা যেকোনো পুরনো তারিখের জন্য [পুরনো রেজাল্ট আর্কাইভ](/old-results) দেখুন।" },
      ],
    },
  },
};

const ml: OtherText = {
  ordinals: ["ഒന്നാം സമ്മാനം", "രണ്ടാം സമ്മാനം", "മൂന്നാം സമ്മാനം", "നാലാം സമ്മാനം", "അഞ്ചാം സമ്മാനം", "ആറാം സമ്മാനം", "ഏഴാം സമ്മാനം", "എട്ടാം സമ്മാനം", "ഒമ്പതാം സമ്മാനം", "പത്താം സമ്മാനം", "പതിനൊന്നാം സമ്മാനം", "പന്ത്രണ്ടാം സമ്മാനം"],
  cons: "സമാശ്വാസ സമ്മാനം",
  ui: {
    liveEyebrow: "തത്സമയം · {time} നറുക്കെടുപ്പ്",
    eyebrow: "{state} സംസ്ഥാന ലോട്ടറി",
    todayTitle: "{name} ഫലം ഇന്ന് – {date}",
    dateTitle: "{name} ഫലം {date}",
    todaySub: "{date}-ലെ {name} ഫലം – സമ്പൂർണ്ണ സമ്മാനപ്പട്ടികയും വിജയ നമ്പറുകളും, നറുക്കെടുപ്പിന് ശേഷം സ്വയം അപ്ഡേറ്റ് ആകും.",
    dateSub: "{date}-ലെ {name} ഫലം – എല്ലാ വിജയ നമ്പറുകളുടെയും സമ്പൂർണ്ണ പട്ടിക.",
    waitTitle: "ഇന്നത്തെ ഫലം ഇതുവരെ പുറത്തുവന്നിട്ടില്ല",
    startsIn: "നറുക്കെടുപ്പ് ആരംഭിക്കാൻ",
    expected: "ഫലം {time} IST-ന് ശേഷം പ്രതീക്ഷിക്കുന്നു",
    live: "തത്സമയം · ഫലം പ്രസിദ്ധീകരിക്കുന്നു",
    auto: "ഈ പേജ് സ്വയം അപ്ഡേറ്റ് ആകും – റിഫ്രഷ് ചെയ്യേണ്ടതില്ല.",
    notAvail: "ഈ തീയതിയിലെ ഫലം പ്രസിദ്ധീകരിച്ചിട്ടില്ല.",
    latestTitle: "ഏറ്റവും പുതിയ ഫലം – {date}",
    previousTitle: "മുൻ {name} ഫലങ്ങൾ",
    todaysDraws: "ഇന്നത്തെ നറുക്കെടുപ്പുകൾ",
    drawsOn: "{date}-ലെ നറുക്കെടുപ്പുകൾ",
    imageNote: "സമ്പൂർണ്ണ ഫലം താഴെയുള്ള ഔദ്യോഗിക ഫല ഷീറ്റിലുണ്ട്.",
    finderTitle: "നിങ്ങളുടെ ടിക്കറ്റ് പരിശോധിക്കുക",
    finderPh: "മുഴുവൻ ടിക്കറ്റ് നമ്പർ അല്ലെങ്കിൽ അവസാന 4 അക്കങ്ങൾ",
    scheduleTitle: "നറുക്കെടുപ്പ് സമയക്രമം",
    bumpersTitle: "ബമ്പർ നറുക്കെടുപ്പുകൾ",
    aboutTitle: "{name} – കൂടുതൽ അറിയാം",
    verify: "സമ്മാനം അവകാശപ്പെടുന്നതിന് മുമ്പ് ഔദ്യോഗിക സർക്കാർ ഗസറ്റുമായി ഒത്തുനോക്കുക.",
    metaToday: "{name} ഫലം ഇന്ന് {date} – തത്സമയ വിജയ നമ്പറുകൾ",
    metaTodayDesc: "{name} ഫലം ഇന്ന് {date}: {first}സമ്പൂർണ്ണ സമ്മാനപ്പട്ടിക, വിജയ നമ്പറുകൾ, ഫല ചിത്രം – തത്സമയം.",
    metaFirst: "ഒന്നാം സമ്മാനം {first}. ",
    metaDate: "{name} ഫലം {date} – എല്ലാ വിജയ നമ്പറുകളും",
    metaDateDesc: "{date}-ലെ {name} ഫലം: {first}എല്ലാ വിജയ നമ്പറുകളുടെയും സമ്പൂർണ്ണ പട്ടിക.",
    dayCol: "ദിവസം",
    lotteryCol: "ലോട്ടറി",
    wbDearTitle: "ഇന്നത്തെ ഡിയർ ലോട്ടറി ഫലങ്ങൾ",
    wbOfficialTitle: "പശ്ചിമ ബംഗാൾ സംസ്ഥാന ലോട്ടറിയുടെ ഔദ്യോഗിക നറുക്കെടുപ്പുകൾ",
  },
  lotteries: {
    kerala: {
      name: "കേരള ലോട്ടറി",
      intro: [
        "**കേരള സംസ്ഥാന ഭാഗ്യക്കുറി** വകുപ്പ് എല്ലാ ദിവസവും **ഉച്ചയ്ക്ക് 3:00-ന്** തിരുവനന്തപുരം ഗോർക്കി ഭവനിൽ നറുക്കെടുപ്പ് നടത്തുന്നു. ഓരോ ദിവസത്തിനും സ്വന്തം ഭാഗ്യക്കുറി – ഭാഗ്യതാര (തിങ്കൾ), സ്ത്രീ ശക്തി (ചൊവ്വ), ധനലക്ഷ്മി (ബുധൻ), കാരുണ്യ പ്ലസ് (വ്യാഴം), സുവർണ്ണ കേരളം (വെള്ളി), കാരുണ്യ (ശനി), സമൃദ്ധി (ഞായർ) – **₹1 കോടി ഒന്നാം സമ്മാനവും** ₹50 ടിക്കറ്റും.",
        "ഫലങ്ങൾ ഏകദേശം 3:00 മുതൽ വന്നുതുടങ്ങും; ഒമ്പത് സമ്മാനങ്ങളും ഉൾപ്പെട്ട സമ്പൂർണ്ണ പട്ടിക സാധാരണയായി 4:30-ഓടെ തയ്യാറാകും. ഈ പേജ് അത് സ്വയം കൊണ്ടുവരുന്നു; ടിക്കറ്റ് നമ്പറുകൾ സീരീസ് അക്ഷരങ്ങളോടെയും (ഉദാ. RA 494226) ചെറിയ സമ്മാനങ്ങൾ അവസാന നാല് അക്കങ്ങളായും കാണിക്കുന്നു.",
      ],
      faq: [
        { q: "കേരള ലോട്ടറി ഫലം എത്ര മണിക്ക് പ്രഖ്യാപിക്കും?", a: "നറുക്കെടുപ്പ് എല്ലാ ദിവസവും ഉച്ചയ്ക്ക് 3:00-ന് നടക്കുന്നു. ഒന്നാം സമ്മാനങ്ങൾ മിനിറ്റുകൾക്കുള്ളിൽ അറിയാം; സമ്പൂർണ്ണ ഔദ്യോഗിക ഫലം സാധാരണയായി 4:30-ഓടെ പ്രസിദ്ധീകരിക്കും." },
        { q: "കേരള ലോട്ടറി ടിക്കറ്റ് എങ്ങനെ പരിശോധിക്കാം?", a: "ഒന്നും രണ്ടും മൂന്നും സമ്മാനങ്ങൾക്കും സമാശ്വാസ സമ്മാനത്തിനും മുഴുവൻ ടിക്കറ്റ് നമ്പർ (സീരീസ് + 6 അക്കം) ഒത്തുനോക്കുക. നാലാം സമ്മാനം മുതൽ താഴേക്ക് ടിക്കറ്റിന്റെ അവസാന നാല് അക്കങ്ങൾ ഒത്തുനോക്കുക." },
        { q: "കേരള ലോട്ടറി സമ്മാനം എങ്ങനെ കൈപ്പറ്റാം?", a: "₹5,000 വരെയുള്ള സമ്മാനങ്ങൾ കേരളത്തിലെ ഏത് അംഗീകൃത ലോട്ടറി കടയിൽ നിന്നും ലഭിക്കും. വലിയ സമ്മാനങ്ങൾക്ക് 30 ദിവസത്തിനുള്ളിൽ യഥാർത്ഥ ടിക്കറ്റും തിരിച്ചറിയൽ രേഖയുമായി ഭാഗ്യക്കുറി ഡയറക്ടറേറ്റിലോ ജില്ലാ ലോട്ടറി ഓഫീസിലോ അപേക്ഷിക്കുക." },
      ],
    },
    punjab: {
      name: "പഞ്ചാബ് സംസ്ഥാന ലോട്ടറി",
      intro: [
        "**പഞ്ചാബ് സംസ്ഥാന ലോട്ടറി** എല്ലാ ദിവസവും **വൈകിട്ട് 6:30-ന്** **ഡിയർ 50** പ്രതിവാര നറുക്കെടുപ്പ് നടത്തുന്നു – ബീസ്റ്റ് (തിങ്കൾ), ബ്രോങ്കോ (ചൊവ്വ), ബസ്റ്റർ (ബുധൻ), ചീഫ് (വ്യാഴം), കോൾട്ട് (വെള്ളി), ജാക്കൽ (ശനി), റേഞ്ചർ (ഞായർ) – കൂടാതെ പ്രതിമാസ ഡിയർ 20, ഡിയർ 100, ഡിയർ 200, ഡിയർ 500 നറുക്കെടുപ്പുകളും ലോഹ്രി, ഹോളി, വൈശാഖി, രാഖി, പൂജ, ദീപാവലി തുടങ്ങിയ വലിയ ഉത്സവ ബമ്പറുകളും.",
        "പഞ്ചാബ് ഫലങ്ങൾ ഔദ്യോഗിക ഫല ഷീറ്റായാണ് പ്രസിദ്ധീകരിക്കുന്നത്; അതിനാൽ ഈ പേജിൽ ഓരോ നറുക്കെടുപ്പിന്റെയും ഒന്നാം സമ്മാനവും സമ്പൂർണ്ണ ഫല ചിത്രവും കാണാം – നറുക്കെടുപ്പിന് ശേഷം സ്വയം കൊണ്ടുവരുന്നു.",
      ],
      faq: [
        { q: "പഞ്ചാബ് സംസ്ഥാന ഡിയർ 50 ഫലം എപ്പോൾ വരും?", a: "ഡിയർ 50 പ്രതിവാര നറുക്കെടുപ്പ് എല്ലാ ദിവസവും വൈകിട്ട് 6:30-ന് നടക്കുന്നു; ഫല ഷീറ്റ് സാധാരണയായി ഒരു മണിക്കൂറിനുള്ളിൽ പ്രസിദ്ധീകരിക്കും." },
        { q: "പഞ്ചാബിലെ ഏത് ലോട്ടറിക്കാണ് ഏറ്റവും വലിയ സമ്മാനം?", a: "ഉത്സവ ബമ്പറുകൾക്ക് – 2025-ൽ ദീപാവലി ബമ്പറിന് ₹11 കോടിയും ലോഹ്രി ബമ്പറിന് ₹10 കോടിയും. ഡിയർ 200 പോലുള്ള പ്രതിമാസ നറുക്കെടുപ്പുകളിൽ ഒന്നാം സമ്മാനം ഏകദേശം ₹1.5 കോടി." },
        { q: "പഞ്ചാബ് ലോട്ടറി സമ്മാനം എങ്ങനെ കൈപ്പറ്റാം?", a: "ചെറിയ സമ്മാനങ്ങൾ (₹10,000 വരെ) അംഗീകൃത വിൽപ്പനക്കാർ നൽകും. വലിയ സമ്മാനങ്ങൾക്ക് യഥാർത്ഥ ടിക്കറ്റ്, തിരിച്ചറിയൽ രേഖ, ക്ലെയിം ഫോം എന്നിവയുമായി പഞ്ചാബ് സംസ്ഥാന ലോട്ടറി ഡയറക്ടറേറ്റിൽ അപേക്ഷിക്കുക." },
      ],
    },
    maharashtra: {
      name: "മഹാരാഷ്ട്ര ലോട്ടറി",
      intro: [
        "**മഹാരാഷ്ട്ര സംസ്ഥാന ലോട്ടറി** എല്ലാ ഉച്ചകഴിഞ്ഞും നിരവധി ചെറിയ പ്രതിവാര നറുക്കെടുപ്പുകൾ നടത്തുന്നു, സാധാരണയായി **4:15-നും 5:00-നും** ഇടയിൽ – വൈഭവലക്ഷ്മി, സഹ്യാദ്രി, ഗജലക്ഷ്മി, ഗണേശലക്ഷ്മി, ആകർഷക് തുടങ്ങിയവ – കൂടാതെ പ്രതിമാസ ലോട്ടറികളും ഉത്സവ ബമ്പറുകളും.",
        "ദിവസത്തെ എല്ലാ നറുക്കെടുപ്പുകളും സമ്പൂർണ്ണ സമ്മാനപ്പട്ടികയോടെ ഈ പേജിൽ കാണാം. ടിക്കറ്റുകൾ സീരീസ്-നമ്പർ രൂപത്തിലാണ്, ഉദാ. VL-08-6375; ചെറിയ സമ്മാനങ്ങൾ അവസാന നാല് അക്കങ്ങൾ വച്ച് ഒത്തുനോക്കുന്നു.",
      ],
      faq: [
        { q: "മഹാരാഷ്ട്ര ലോട്ടറി ഫലം എത്ര മണിക്ക്?", a: "മിക്ക പ്രതിവാര നറുക്കെടുപ്പുകളും 4:15-നും 5:00-നും ഇടയിലാണ്; ഫലം ഉടൻ തന്നെ പ്രസിദ്ധീകരിക്കും. പ്രതിമാസ, ബമ്പർ നറുക്കെടുപ്പുകൾക്ക് സ്വന്തം സമയക്രമമുണ്ട്." },
        { q: "മഹാരാഷ്ട്ര ലോട്ടറി ടിക്കറ്റ് എങ്ങനെ പരിശോധിക്കാം?", a: "ഒന്നാം സമ്മാനത്തിനും സമാശ്വാസ സമ്മാനങ്ങൾക്കും മുഴുവൻ ടിക്കറ്റ് നമ്പർ ഒത്തുനോക്കുക; ചെറിയ സമ്മാനങ്ങൾക്ക് ഓരോ പട്ടികയിലും കാണിച്ചിരിക്കുന്നതുപോലെ അവസാന നാല് അക്കങ്ങൾ ഒത്തുനോക്കുക." },
        { q: "മഹാരാഷ്ട്ര ലോട്ടറി നിയമപരമാണോ?", a: "അതെ. സംസ്ഥാന സർക്കാർ സ്വന്തം ലോട്ടറി നടത്തുന്ന സംസ്ഥാനങ്ങളിലൊന്നാണ് മഹാരാഷ്ട്ര. അംഗീകൃത വിൽപ്പനക്കാരിൽ നിന്ന് മാത്രം ടിക്കറ്റ് വാങ്ങുക." },
      ],
    },
    westbengal: {
      name: "പശ്ചിമ ബംഗാൾ സംസ്ഥാന ലോട്ടറി",
      intro: [
        "പശ്ചിമ ബംഗാളിൽ ആളുകൾ **ലോട്ടറി ഫലം** തിരയുമ്പോൾ സാധാരണയായി ഉദ്ദേശിക്കുന്നത് സംസ്ഥാനത്തുടനീളം വിൽക്കുന്ന ദിവസേനയുള്ള **1 PM, 6 PM, 8 PM** **ഡിയർ ലോട്ടറി** നറുക്കെടുപ്പുകളാണ്. ഈ പേജ് ആ ഫലങ്ങൾ തത്സമയം കാണിക്കുന്നു – ഓരോ നറുക്കെടുപ്പും പ്രഖ്യാപിച്ചാലുടൻ സ്വയം അപ്ഡേറ്റ്.",
        "പ്രതിവാര നറുക്കെടുപ്പുകളും ഉത്സവ ബമ്പറുകളുമായി (പുതുവർഷം, ഹോളി, ബംഗാളി പുതുവർഷം, രഥയാത്ര, പൂജ, ദീപാവലി) പശ്ചിമ ബംഗാൾ സർക്കാർ സ്വന്തം സംസ്ഥാന ലോട്ടറിയും നടത്തുന്നു. ഔദ്യോഗിക പശ്ചിമ ബംഗാൾ നറുക്കെടുപ്പ് പ്രസിദ്ധീകരിക്കുമ്പോൾ അതും താഴെ കാണിക്കും.",
      ],
      faq: [
        { q: "പശ്ചിമ ബംഗാൾ ലോട്ടറി ഫല സമയം എന്താണ്?", a: "പശ്ചിമ ബംഗാളിൽ വിൽക്കുന്ന ഡിയർ നറുക്കെടുപ്പുകൾ 1 PM, 6 PM, 8 PM സമയങ്ങളിലാണ്; ഓരോ നറുക്കെടുപ്പിനും 5–15 മിനിറ്റിനുള്ളിൽ ഫലം വരും." },
        { q: "പശ്ചിമ ബംഗാളിൽ ലോട്ടറി നിയമപരമാണോ?", a: "അതെ. ലോട്ടറി നിയമപരമായ 13 സംസ്ഥാനങ്ങളിലൊന്നാണ് പശ്ചിമ ബംഗാൾ; സംസ്ഥാന ലോട്ടറി ഡയറക്ടറേറ്റ് വഴി സ്വന്തം ലോട്ടറിയും നടത്തുന്നു." },
        { q: "പശ്ചിമ ബംഗാളിന്റെ പഴയ ലോട്ടറി ഫലങ്ങൾ എവിടെ കാണാം?", a: "ഈ പേജിൽ തീയതി ഉപയോഗിച്ച് തിരയുക, അല്ലെങ്കിൽ ഏത് പഴയ തീയതിക്കും [പഴയ ഫല ആർക്കൈവ്](/old-results) കാണുക." },
      ],
    },
  },
};

const ALL: Record<Locale, OtherText> = { en, hi, bn, ml };
export const otherText = (lang: Locale) => ALL[lang] ?? en;

/** Localised tier label from the stored English label ("4th Prize", "Consolation Prize"). */
export function tierLabel(lang: Locale, label: string) {
  const t = otherText(lang);
  if (/consolation/i.test(label)) return t.cons;
  const m = /^(\d{1,2})/.exec(label);
  return m ? (t.ordinals[Number(m[1]) - 1] ?? label) : label;
}
