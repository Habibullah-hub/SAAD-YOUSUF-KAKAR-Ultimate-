const ALLOWED_ORIGIN = "https://habibullah-hub.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "apikey, authorization, x-client-info, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Vary": "Origin",
  "Content-Type": "application/json; charset=utf-8",
};
const cache = new Map<string, { expires: number; payload: unknown }>();
const WINDOW_MS = 10 * 60 * 1000;
let windowStarted = Date.now();
let windowRequests = 0;
const terms: Record<string, Record<string, string>> = {
  en: { trending:"popular trending videos", islamic:"Islamic videos Quran recitation", news:"latest world news videos", education:"educational learning videos", quran:"Quran Arabic recitation", health:"health education videos" },
  ur: { trending:"مقبول اور ٹرینڈنگ ویڈیوز", islamic:"اسلامی ویڈیوز قرآن کی تلاوت", news:"تازہ مقامی اور عالمی خبریں", education:"تعلیمی اور سیکھنے کی ویڈیوز", quran:"قرآن کی عربی تلاوت", health:"صحت اور طبی آگاہی کی ویڈیوز" },
  ar: { trending:"فيديوهات رائجة ومشهورة", islamic:"فيديوهات إسلامية تلاوة القرآن الكريم", news:"آخر الأخبار المحلية والعالمية", education:"فيديوهات تعليمية وتعلم المهارات", quran:"تلاوة القرآن الكريم", health:"التوعية الصحية والطبية" },
  ps: { trending:"مشهورې او ترېنډ ویډیوګانې", islamic:"اسلامي ویډیوګانې د قرآن تلاوت", news:"تازه سیمه ییز او نړیوال خبرونه", education:"ښوونیزې او تعلیمي ویډیوګانې", quran:"د قرآن عربي تلاوت", health:"د روغتیا او طبي پوهاوي ویډیوګانې" },
  hi: { trending:"लोकप्रिय ट्रेंडिंग वीडियो", islamic:"इस्लामी वीडियो कुरान तिलावत", news:"ताज़ा स्थानीय और विश्व समाचार वीडियो", education:"शैक्षिक और सीखने वाले वीडियो", quran:"अरबी कुरान तिलावत", health:"स्वास्थ्य जागरूकता वीडियो" },
  pa: { trending:"ਪ੍ਰਸਿੱਧ ਟ੍ਰੈਂਡਿੰਗ ਵੀਡੀਓ", islamic:"ਇਸਲਾਮੀ ਵੀਡੀਓ ਕੁਰਾਨ ਤਿਲਾਵਤ", news:"ਤਾਜ਼ਾ ਸਥਾਨਕ ਅਤੇ ਵਿਸ਼ਵ ਖ਼ਬਰਾਂ", education:"ਸਿੱਖਿਆ ਅਤੇ ਸਿੱਖਣ ਵਾਲੀਆਂ ਵੀਡੀਓ", quran:"ਅਰਬੀ ਕੁਰਾਨ ਤਿਲਾਵਤ", health:"ਸਿਹਤ ਜਾਗਰੂਕਤਾ ਵੀਡੀਓ" },
  bn: { trending:"জনপ্রিয় ট্রেন্ডিং ভিডিও", islamic:"ইসলামিক ভিডিও কুরআন তিলাওয়াত", news:"সর্বশেষ স্থানীয় ও বিশ্ব সংবাদ", education:"শিক্ষামূলক ভিডিও", quran:"আরবি কুরআন তিলাওয়াত", health:"স্বাস্থ্য সচেতনতা ভিডিও" },
  fa: { trending:"ویدیوهای محبوب و پرطرفدار", islamic:"ویدیوهای اسلامی تلاوت قرآن", news:"آخرین اخبار محلی و جهان", education:"ویدیوهای آموزشی", quran:"تلاوت عربی قرآن", health:"آموزش سلامت" },
  tr: { trending:"popüler ve trend videolar", islamic:"İslami videolar Kuran tilaveti", news:"son yerel ve dünya haberleri", education:"eğitici ve öğretici videolar", quran:"Arapça Kuran tilaveti", health:"sağlık eğitimi videoları" },
  id: { trending:"video populer dan trending", islamic:"video Islami tilawah Al Quran", news:"berita lokal dan dunia terbaru", education:"video pendidikan dan pembelajaran", quran:"tilawah Al Quran bahasa Arab", health:"video edukasi kesehatan" },
  ms: { trending:"video popular dan trending", islamic:"video Islam bacaan Al Quran", news:"berita tempatan dan dunia terkini", education:"video pendidikan dan pembelajaran", quran:"bacaan Al Quran Arab", health:"video pendidikan kesihatan" },
  fr: { trending:"vidéos populaires et tendances", islamic:"vidéos islamiques récitation du Coran", news:"dernières actualités locales et mondiales", education:"vidéos éducatives", quran:"récitation arabe du Coran", health:"vidéos de santé" },
  es: { trending:"videos populares y tendencias", islamic:"videos islámicos recitación del Corán", news:"últimas noticias locales y mundiales", education:"videos educativos", quran:"recitación árabe del Corán", health:"videos de salud" },
  de: { trending:"beliebte und aktuelle Trendvideos", islamic:"islamische Videos Koran Rezitation", news:"aktuelle lokale und weltweite Nachrichten", education:"Lernvideos und Bildung", quran:"arabische Koranrezitation", health:"Gesundheitsbildung Videos" },
  pt: { trending:"vídeos populares e em alta", islamic:"vídeos islâmicos recitação do Alcorão", news:"últimas notícias locais e mundiais", education:"vídeos educativos", quran:"recitação árabe do Alcorão", health:"vídeos de saúde" },
  ru: { trending:"популярные и трендовые видео", islamic:"исламские видео чтение Корана", news:"последние местные и мировые новости", education:"обучающие видео", quran:"чтение Корана на арабском", health:"видео о здоровье" },
  zh: { trending:"热门和流行视频", islamic:"伊斯兰视频 古兰经诵读", news:"最新本地和国际新闻", education:"教育和学习视频", quran:"阿拉伯语古兰经诵读", health:"健康教育视频" },
  ja: { trending:"人気のトレンド動画", islamic:"イスラム教の動画 クルアーン朗読", news:"最新の国内外ニュース", education:"教育と学習の動画", quran:"アラビア語クルアーン朗読", health:"健康教育動画" },
  ko: { trending:"인기 급상승 동영상", islamic:"이슬람 영상 꾸란 낭송", news:"최신 국내 및 세계 뉴스", education:"교육 및 학습 동영상", quran:"아랍어 꾸란 낭송", health:"건강 교육 영상" },
};
function reply(status: number, body: Record<string, unknown>, cacheControl = "no-store") {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Cache-Control": cacheControl } });
}
Deno.serve(async (req: Request) => {
  if (req.headers.get("Origin") !== ALLOWED_ORIGIN) return reply(403, { error: "This video feed is available only to SYK Cyber Hub." });
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return reply(405, { error: "Method not allowed." });
  const now = Date.now();
  if (now - windowStarted >= WINDOW_MS) { windowStarted = now; windowRequests = 0; }
  if (windowRequests >= 60) return reply(429, { error: "Video discovery is busy. Please try again in a few minutes." });
  const url = new URL(req.url);
  const topic = url.searchParams.get("topic") || "trending";
  if (!["trending","islamic","news","education","quran","health"].includes(topic)) return reply(400, { error: "Unsupported video category." });
  const rawLang = (url.searchParams.get("lang") || "en").toLowerCase();
  const lang = /^[a-z]{2}$/.test(rawLang) ? rawLang : "en";
  const rawRegion = (url.searchParams.get("region") || "").toUpperCase();
  const region = /^[A-Z]{2}$/.test(rawRegion) ? rawRegion : "";
  const cacheKey = [topic,lang,region].join(":");
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now) return new Response(JSON.stringify(cached.payload), { status:200, headers:{...corsHeaders,"Cache-Control":"public, max-age=600, s-maxage=600, stale-while-revalidate=300"} });
  const apiKey = Deno.env.get("YOUTUBE_API_KEY");
  if (!apiKey) return reply(503, { error: "YouTube discovery is not configured yet." });
  windowRequests++;
  const q = terms[lang]?.[topic] || terms.en[topic];
  const params = new URLSearchParams({ key:apiKey, part:"snippet", type:"video", maxResults:"8", safeSearch:"moderate", order:topic==="trending"?"viewCount":topic==="news"?"date":"relevance", q });
  if (region) params.set("regionCode",region);
  if (lang!=="en") params.set("relevanceLanguage",lang);
  try {
    const response = await fetch("https://www.googleapis.com/youtube/v3/search?"+params.toString(), {headers:{"Accept":"application/json"},signal:AbortSignal.timeout(9000)});
    if (!response.ok) {
      const err = await response.json().catch(()=>({}));
      const reason = err?.error?.errors?.[0]?.reason || "";
      if (response.status===403 && /quota/i.test(reason+" "+(err?.error?.message||""))) return reply(429,{error:"YouTube کی روزانہ مفت API حد پوری ہو گئی ہے؛ بعد میں دوبارہ کوشش کریں۔"});
      return reply(response.status===403?429:502,{error:"YouTube ابھی ویڈیوز فراہم نہیں کر سکا۔ کچھ دیر بعد دوبارہ کوشش کریں۔"});
    }
    const data = await response.json();
    const items = (Array.isArray(data.items)?data.items:[]).flatMap((item:any)=>{
      const id=item?.id?.videoId, s=item?.snippet||{};
      if(typeof id!=="string"||!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return [];
      const thumbs=s.thumbnails||{}, thumb=thumbs.high?.url||thumbs.medium?.url||thumbs.default?.url||"";
      return [{video_id:id,title:String(s.title||"YouTube video").slice(0,180),description:String(s.description||"").slice(0,500),channel_title:String(s.channelTitle||"YouTube creator").slice(0,120),published_at:s.publishedAt||null,thumbnail_url:typeof thumb==="string"&&thumb.startsWith("https://")?thumb:"",url:"https://www.youtube.com/watch?v="+id,category:topic==="trending"?"other":topic==="quran"?"islamic":topic==="health"?"education":topic,source:"youtube"}];
    });
    const payload={items,topic,language:lang,region:region||null,cached_for_seconds:600};
    cache.set(cacheKey,{expires:now+600000,payload});
    return new Response(JSON.stringify(payload),{status:200,headers:{...corsHeaders,"Cache-Control":"public, max-age=600, s-maxage=600, stale-while-revalidate=300"}});
  } catch (_) {
    return reply(502,{error:"YouTube سے رابطہ نہیں ہو سکا۔ انٹرنیٹ چیک کرکے دوبارہ کوشش کریں۔"});
  }
});
